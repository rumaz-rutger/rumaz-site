begin;
select set_config('rumaz.test_owner',gen_random_uuid()::text,true),set_config('rumaz.test_other',gen_random_uuid()::text,true),set_config('rumaz.test_place',gen_random_uuid()::text,true),set_config('rumaz.test_post',gen_random_uuid()::text,true);
insert into auth.users(id,email,email_confirmed_at) values(current_setting('rumaz.test_owner')::uuid,current_setting('rumaz.test_owner')||'@example.invalid',now()),(current_setting('rumaz.test_other')::uuid,current_setting('rumaz.test_other')||'@example.invalid',now());
select set_config('request.jwt.claim.sub',current_setting('rumaz.test_owner'),true);
set local role authenticated;
insert into public.places(id,created_by,name,kind,relationship) values(current_setting('rumaz.test_place')::uuid,auth.uid(),'QA','home','own');
insert into public.place_posts(id,place_id,author_id,content) values(current_setting('rumaz.test_post')::uuid,current_setting('rumaz.test_place')::uuid,auth.uid(),'QA post');
insert into public.place_tasks(place_id,phase,content) values(current_setting('rumaz.test_place')::uuid,'aankomst','QA task');
insert into public.post_replies(post_id,content) values(current_setting('rumaz.test_post')::uuid,'QA reply');
update public.place_tasks set done=true where place_id=current_setting('rumaz.test_place')::uuid;
do $$ begin
 if not exists(select 1 from public.place_tasks where done) then raise exception 'Task not saved'; end if;
 if not exists(select 1 from public.post_replies) then raise exception 'Reply not saved'; end if;
 begin
  update public.place_tasks set place_id=gen_random_uuid();
  raise exception 'Place reassignment allowed';
 exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub',current_setting('rumaz.test_other'),true);
do $$ begin
 if exists(select 1 from public.place_tasks) or exists(select 1 from public.post_replies) then raise exception 'Outsider read'; end if;
 begin
  insert into public.place_tasks(place_id,phase,content) values(current_setting('rumaz.test_place')::uuid,'taken','intrusion');
  raise exception 'Outsider task write';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.post_replies(post_id,content) values(current_setting('rumaz.test_post')::uuid,'intrusion');
  raise exception 'Outsider reply write';
 exception when insufficient_privilege then null; end;
 if has_table_privilege('anon','public.place_tasks','SELECT') or has_table_privilege('anon','public.post_replies','SELECT') then raise exception 'Anonymous read'; end if;
end $$;
reset role;
select 'PASS: task/reply creation, task completion, immutable place, outsider read/write denied, anonymous denied' as result;
rollback;

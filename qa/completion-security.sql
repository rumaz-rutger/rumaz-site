-- Executed after completion.sql inside one transaction, rolled back including DDL.
select set_config('rumaz.qa_owner',gen_random_uuid()::text,true),set_config('rumaz.qa_outsider',gen_random_uuid()::text,true),set_config('rumaz.qa_place',gen_random_uuid()::text,true),set_config('rumaz.qa_event',gen_random_uuid()::text,true),set_config('rumaz.qa_post',gen_random_uuid()::text,true);
insert into auth.users(id,email,email_confirmed_at) values(current_setting('rumaz.qa_owner')::uuid,'qa-owner@example.invalid',now()),(current_setting('rumaz.qa_outsider')::uuid,'qa-other@example.invalid',now());
select set_config('request.jwt.claim.sub',current_setting('rumaz.qa_owner'),true);
set local role authenticated;
insert into public.places(id,created_by,name,kind,relationship) values(current_setting('rumaz.qa_place')::uuid,auth.uid(),'QA temporary','home','own');
insert into public.place_events(id,place_id,author_id,title,event_date) values(current_setting('rumaz.qa_event')::uuid,current_setting('rumaz.qa_place')::uuid,auth.uid(),'Uitje',current_date+1);
insert into public.event_attendees values(current_setting('rumaz.qa_event')::uuid,auth.uid());
insert into public.place_posts(id,place_id,author_id,content) values(current_setting('rumaz.qa_post')::uuid,current_setting('rumaz.qa_place')::uuid,auth.uid(),'Test');
insert into storage.objects(bucket_id,name) values('rumaz-photos',current_setting('rumaz.qa_place')||'/'||auth.uid()||'/test');
insert into public.post_likes values(current_setting('rumaz.qa_post')::uuid,auth.uid());
do $$ begin
 if not exists(select 1 from public.place_events) or not exists(select 1 from public.event_attendees) or not exists(select 1 from public.post_likes) then raise exception 'owner write failed';end if;
 if has_function_privilege('authenticated','public.claim_notifications()','EXECUTE') then raise exception 'client worker access';end if;
end $$;
select set_config('request.jwt.claim.sub',current_setting('rumaz.qa_outsider'),true);
do $$ begin
 if exists(select 1 from storage.objects where bucket_id='rumaz-photos') then raise exception 'outsider photo read';end if;
 if exists(select 1 from public.place_events) or exists(select 1 from public.event_attendees) or exists(select 1 from public.post_likes) then raise exception 'outsider read';end if;
 begin insert into storage.objects(bucket_id,name) values('rumaz-photos',current_setting('rumaz.qa_place')||'/'||auth.uid()||'/intrusion');raise exception 'outsider photo write';exception when insufficient_privilege then null;end;
 begin insert into public.event_attendees values(current_setting('rumaz.qa_event')::uuid,auth.uid());raise exception 'outsider attendance';exception when insufficient_privilege then null;end;
 begin insert into public.post_likes values(current_setting('rumaz.qa_post')::uuid,auth.uid());raise exception 'outsider like';exception when insufficient_privilege then null;end;
end $$;
reset role;
select 'PASS: schema, owner events/attendance/likes, outsider isolation including photo metadata, client queue access denied' as result;
rollback;

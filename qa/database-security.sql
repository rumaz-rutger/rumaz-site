begin;
select set_config('rumaz.test_owner',gen_random_uuid()::text,true);
select set_config('rumaz.test_member',gen_random_uuid()::text,true);
select set_config('rumaz.test_other',gen_random_uuid()::text,true);
select set_config('rumaz.test_place',gen_random_uuid()::text,true);
insert into auth.users(id,email,email_confirmed_at) values
(current_setting('rumaz.test_owner')::uuid,'owner-'||current_setting('rumaz.test_owner')||'@example.invalid',now()),
(current_setting('rumaz.test_member')::uuid,'member-'||current_setting('rumaz.test_member')||'@example.invalid',now()),
(current_setting('rumaz.test_other')::uuid,'other-'||current_setting('rumaz.test_other')||'@example.invalid',now());
select set_config('request.jwt.claim.sub',current_setting('rumaz.test_owner'),true);
set local role authenticated;
insert into public.places(id,created_by,name,kind,relationship)
values(current_setting('rumaz.test_place')::uuid,auth.uid(),'Temporary security test','home','own');
do $$ begin
 if (select count(*) from public.places where id=current_setting('rumaz.test_place')::uuid)<>1 then raise exception 'Owner cannot read place'; end if;
 if not exists(select 1 from public.place_memberships where place_id=current_setting('rumaz.test_place')::uuid and user_id=auth.uid() and role='admin') then raise exception 'Owner membership missing'; end if;
end $$;
reset role;
insert into public.place_memberships(place_id,user_id,role) values(current_setting('rumaz.test_place')::uuid,current_setting('rumaz.test_member')::uuid,'member');
select set_config('request.jwt.claim.sub',current_setting('rumaz.test_other'),true);
set local role authenticated;
do $$ begin
 if exists(select 1 from public.places where id=current_setting('rumaz.test_place')::uuid) then raise exception 'Outsider can read place'; end if;
 begin
  perform public.request_stay(current_setting('rumaz.test_place')::uuid,current_date+10,current_date+12);
  raise exception 'Outsider can book';
 exception when insufficient_privilege then null; end;
 if has_table_privilege('authenticated','public.notification_outbox','SELECT') then raise exception 'Client can read mail outbox'; end if;
 if has_function_privilege('anon','public.request_stay(uuid,date,date,text)','EXECUTE') then raise exception 'Anon can book'; end if;
end $$;
select set_config('request.jwt.claim.sub',current_setting('rumaz.test_member'),true);
select set_config('rumaz.test_booking',public.request_stay(current_setting('rumaz.test_place')::uuid,current_date+10,current_date+12)::text,true);
do $$ begin
 begin
  perform public.decide_stay(current_setting('rumaz.test_booking')::uuid,true);
  raise exception 'Member can approve';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ begin
 if (select count(*) from public.notification_outbox where booking_id=current_setting('rumaz.test_booking')::uuid and type='booking_request' and user_id=current_setting('rumaz.test_owner')::uuid)<>1 then raise exception 'Request notification missing'; end if;
end $$;
select set_config('request.jwt.claim.sub',current_setting('rumaz.test_owner'),true);
set local role authenticated;
select public.decide_stay(current_setting('rumaz.test_booking')::uuid,true);
do $$ begin
 begin
  perform public.request_stay(current_setting('rumaz.test_place')::uuid,current_date+11,current_date+13);
  raise exception 'Overlap allowed';
 exception when exclusion_violation then null; end;
 begin
  perform public.decide_stay(current_setting('rumaz.test_booking')::uuid,true);
  raise exception 'Repeated decision allowed';
 exception when check_violation then null; end;
end $$;
reset role;
do $$ begin
 if (select count(*) from public.notification_outbox where booking_id=current_setting('rumaz.test_booking')::uuid and type='booking_approved')<>1 then raise exception 'Decision notification missing or duplicated'; end if;
end $$;
update public.place_memberships set state='removed' where place_id=current_setting('rumaz.test_place')::uuid and user_id=current_setting('rumaz.test_member')::uuid;
select set_config('request.jwt.claim.sub',current_setting('rumaz.test_member'),true);
set local role authenticated;
do $$ begin
 if exists(select 1 from public.places where id=current_setting('rumaz.test_place')::uuid) then raise exception 'Removed member retains access'; end if;
end $$;
reset role;
select 'PASS: owner create/read; outsider isolation; anonymous RPC denial; member cannot approve; request outbox; approval outbox; overlap rejected; repeat decision rejected; removed member denied' as result;
rollback;

begin;
select set_config('test.owner',gen_random_uuid()::text,true),set_config('test.guest',gen_random_uuid()::text,true),set_config('test.other',gen_random_uuid()::text,true),set_config('test.place',gen_random_uuid()::text,true);
insert into auth.users(id,email,email_confirmed_at) values(current_setting('test.owner')::uuid,'owner@example.invalid',now()),(current_setting('test.guest')::uuid,'guest@example.invalid',now()),(current_setting('test.other')::uuid,'other@example.invalid',now());
select set_config('request.jwt.claim.sub',current_setting('test.owner'),true);
set local role authenticated;
insert into public.places(id,created_by,name,kind,relationship) values(current_setting('test.place')::uuid,auth.uid(),'Invitation test','home','own');
select set_config('test.invitation',public.create_invitation(current_setting('test.place')::uuid,'guest@example.invalid')::text,true);
select set_config('request.jwt.claim.sub',current_setting('test.other'),true);
do $$ begin
 begin
  perform public.accept_invitation(current_setting('test.invitation')::jsonb->>'token');
  raise exception 'Wrong recipient accepted';
 exception when invalid_parameter_value then null; end;
 begin
  perform public.create_invitation(current_setting('test.place')::uuid,'other@example.invalid');
  raise exception 'Outsider invited';
 exception when insufficient_privilege then null; end;
 if has_table_privilege('authenticated','public.place_invitations','SELECT') then raise exception 'Invitation data exposed'; end if;
end $$;
select set_config('request.jwt.claim.sub',current_setting('test.guest'),true);
select public.accept_invitation(current_setting('test.invitation')::jsonb->>'token');
do $$ begin
 if not exists(select 1 from public.places where id=current_setting('test.place')::uuid) then raise exception 'Access missing after acceptance'; end if;
 begin
  perform public.accept_invitation(current_setting('test.invitation')::jsonb->>'token');
  raise exception 'Replay accepted';
 exception when invalid_parameter_value then null; end;
 begin
  perform public.create_invitation(current_setting('test.place')::uuid,'other@example.invalid');
  raise exception 'Member invited';
 exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub',current_setting('test.owner'),true);
do $$ begin
 begin
  perform public.create_invitation(current_setting('test.place')::uuid,'other@example.invalid','admin');
  raise exception 'Admin invitation allowed';
 exception when invalid_parameter_value then null; end;
end $$;
select set_config('test.revoked',public.create_invitation(current_setting('test.place')::uuid,'other@example.invalid')::text,true);
select public.revoke_invitation((current_setting('test.revoked')::jsonb->>'id')::uuid);
select set_config('request.jwt.claim.sub',current_setting('test.other'),true);
do $$ begin
 begin
  perform public.accept_invitation(current_setting('test.revoked')::jsonb->>'token');
  raise exception 'Revoked invitation accepted';
 exception when invalid_parameter_value then null; end;
end $$;
reset role;
update public.place_invitations set revoked_at=null,expires_at=now()-interval '1 minute' where id=(current_setting('test.revoked')::jsonb->>'id')::uuid;
set local role authenticated;
do $$ begin
 begin
  perform public.accept_invitation(current_setting('test.revoked')::jsonb->>'token');
  raise exception 'Expired invitation accepted';
 exception when invalid_parameter_value then null; end;
end $$;
reset role;
select 'PASS: correct recipient accepted; wrong recipient/nonadmin/replay/admin-role/revoked/expired rejected; invitation table private' as result;
rollback;

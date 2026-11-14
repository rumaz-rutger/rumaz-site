begin;
select set_config('rumaz.owner',gen_random_uuid()::text,true);
select set_config('rumaz.other',gen_random_uuid()::text,true);
select set_config('rumaz.place',gen_random_uuid()::text,true);
insert into auth.users(id,email,email_confirmed_at) values
(current_setting('rumaz.owner')::uuid,'onboarding-owner@example.invalid',now()),
(current_setting('rumaz.other')::uuid,'onboarding-other@example.invalid',now());
select set_config('request.jwt.claim.sub',current_setting('rumaz.owner'),true);
set local role authenticated;
select public.create_place(current_setting('rumaz.place')::uuid,'Testplek','home','own','Teststad','Familie','[{"id":"homeCity","value":"Teststad"}]','Handleiding','Eerste bericht');
select public.create_place(current_setting('rumaz.place')::uuid,'Testplek','home','own','Teststad','Familie','[]','Handleiding','Eerste bericht');
do $$begin
 if (select count(*) from public.place_posts where place_id=current_setting('rumaz.place')::uuid)<>1 then raise exception 'Duplicate post on retry';end if;
 if (select count(*) from public.place_guides where place_id=current_setting('rumaz.place')::uuid)<>1 then raise exception 'Guide missing or duplicated';end if;
 if (select details->0->>'value' from public.places where id=current_setting('rumaz.place')::uuid)<>'Teststad' then raise exception 'Details not preserved';end if;
 insert into public.profiles(id,display_name)values(auth.uid(),'Test Owner');
 begin
  perform public.create_place(gen_random_uuid(),'Broken place','home','own','','Family','[]',repeat('x',901),'Note');
  raise exception 'Long guide accepted';
 exception when invalid_parameter_value then null;end;
 if exists(select 1 from public.places where name='Broken place')then raise exception 'Partial place persisted';end if;
end $$;
select set_config('request.jwt.claim.sub',current_setting('rumaz.other'),true);
do $$begin
 if exists(select 1 from public.places)then raise exception 'Outsider sees places';end if;
 if exists(select 1 from public.profiles)then raise exception 'Outsider sees names';end if;
 if has_function_privilege('anon','public.create_place(uuid,text,text,text,text,text,jsonb,text,text)','EXECUTE')then raise exception 'Anon allowed';end if;
end $$;
reset role;
insert into public.place_memberships(place_id,user_id,role) values(current_setting('rumaz.place')::uuid,current_setting('rumaz.other')::uuid,'member');
set local role authenticated;
do $$begin
 if not exists(select 1 from public.profiles where display_name='Test Owner')then raise exception 'Member cannot see shared name';end if;
end $$;
rollback;

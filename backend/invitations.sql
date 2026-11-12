create table public.place_invitations (
 id uuid primary key default gen_random_uuid(),
 place_id uuid not null references public.places(id) on delete cascade,
 invited_by uuid not null references auth.users(id),
 email text not null check(length(email)<=254),
 role text not null check(role in ('member','guest')),
 token_hash text unique not null,
 expires_at timestamptz not null default now()+interval '7 days',
 accepted_at timestamptz,
 accepted_by uuid references auth.users(id),
 revoked_at timestamptz,
 created_at timestamptz not null default now()
);
alter table public.place_invitations enable row level security;
revoke all on public.place_invitations from anon,authenticated;
create index invitations_place_idx on public.place_invitations(place_id);
create index invitations_inviter_idx on public.place_invitations(invited_by);
create index invitations_acceptor_idx on public.place_invitations(accepted_by);

create function rumaz_private.create_invitation(p_place_id uuid,p_email text,p_role text default 'member')
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_token text; v_id uuid; v_email text:=lower(btrim(p_email));
begin
 perform 1 from public.places where id=p_place_id for update;
 if not rumaz_private.is_place_admin(p_place_id) or not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null) then
 raise exception 'Not authorized' using errcode='42501'; end if;
 if v_email is null or length(v_email)>254 or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' or p_role is null or p_role not in ('member','guest') then
 raise exception 'Invalid invitation' using errcode='22023'; end if;
 if (select count(*) from public.place_invitations where invited_by=auth.uid() and created_at>now()-interval '1 hour')>=20 then raise exception 'Invitation limit reached' using errcode='54000'; end if;
 update public.place_invitations set revoked_at=now() where place_id=p_place_id and email=v_email and accepted_at is null and revoked_at is null;
 v_token:=encode(extensions.gen_random_bytes(32),'hex');
 insert into public.place_invitations(place_id,invited_by,email,role,token_hash)
 values(p_place_id,auth.uid(),v_email,p_role,encode(extensions.digest(v_token,'sha256'),'hex')) returning id into v_id;
 insert into public.audit_events(actor_id,place_id,event_type,object_id) values(auth.uid(),p_place_id,'invitation_created',v_id);
 return jsonb_build_object('id',v_id,'token',v_token,'expires_at',now()+interval '7 days');
end $$;

create function rumaz_private.accept_invitation(p_token text)
returns uuid language plpgsql security definer set search_path='' as $$
declare v public.place_invitations%rowtype; v_email text; v_place uuid;
begin
 if auth.uid() is null then raise exception 'Not authorized' using errcode='42501'; end if;
 select lower(email) into v_email from auth.users where id=auth.uid() and email_confirmed_at is not null;
 if v_email is null or p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception 'Invalid invitation' using errcode='22023'; end if;
 select place_id into v_place from public.place_invitations where token_hash=encode(extensions.digest(p_token,'sha256'),'hex');
 perform 1 from public.places where id=v_place for update;
 select * into v from public.place_invitations where token_hash=encode(extensions.digest(p_token,'sha256'),'hex') for update;
 if not found or v.email<>v_email or v.accepted_at is not null or v.revoked_at is not null or v.expires_at<=now() then raise exception 'Invalid invitation' using errcode='22023'; end if;
 if not exists(select 1 from public.place_memberships where place_id=v.place_id and user_id=v.invited_by and role='admin' and state='active') then raise exception 'Invalid invitation' using errcode='22023'; end if;
 -- Existing active members retain their role; an invitation never upgrades privileges.
 insert into public.place_memberships(place_id,user_id,role,state) values(v.place_id,auth.uid(),v.role,'active')
 on conflict(place_id,user_id) do update set role=excluded.role,state='active' where public.place_memberships.state<>'active';
 update public.place_invitations set accepted_at=now(),accepted_by=auth.uid() where id=v.id;
 insert into public.audit_events(actor_id,place_id,event_type,object_id) values(auth.uid(),v.place_id,'invitation_accepted',v.id);
 return v.place_id;
end $$;
create function rumaz_private.revoke_invitation(p_invitation_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare v_place uuid;
begin
 select place_id into v_place from public.place_invitations where id=p_invitation_id;
 perform 1 from public.places where id=v_place for update;
 if v_place is null or not rumaz_private.is_place_admin(v_place) then raise exception 'Not authorized' using errcode='42501'; end if;
 update public.place_invitations set revoked_at=now() where id=p_invitation_id and accepted_at is null and revoked_at is null;
end $$;
create function public.create_invitation(p_place_id uuid,p_email text,p_role text default 'member')
returns jsonb language sql security invoker set search_path='' as $$ select rumaz_private.create_invitation(p_place_id,p_email,p_role); $$;
create function public.accept_invitation(p_token text)
returns uuid language sql security invoker set search_path='' as $$ select rumaz_private.accept_invitation(p_token); $$;
create function public.revoke_invitation(p_invitation_id uuid)
returns void language sql security invoker set search_path='' as $$ select rumaz_private.revoke_invitation(p_invitation_id); $$;
revoke all on function rumaz_private.create_invitation(uuid,text,text),rumaz_private.accept_invitation(text),rumaz_private.revoke_invitation(uuid),public.create_invitation(uuid,text,text),public.accept_invitation(text),public.revoke_invitation(uuid) from public,anon;
grant execute on function rumaz_private.create_invitation(uuid,text,text),rumaz_private.accept_invitation(text),rumaz_private.revoke_invitation(uuid),public.create_invitation(uuid,text,text),public.accept_invitation(text),public.revoke_invitation(uuid) to authenticated;

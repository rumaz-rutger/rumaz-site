-- Rumaz 3.0 - STAGING ONLY. Review with DBA/security before running.
-- No automatic migrations. Never execute on production without explicit approval.
create extension if not exists pgcrypto with schema extensions;
create schema if not exists rumaz_private;
revoke all on schema rumaz_private from public, anon;
grant usage on schema rumaz_private to authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now()
);
create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id),
  name text not null check (length(name) between 1 and 120),
  kind text not null check (kind in ('home','chalet','camper','caravan','static','boat','other')),
  relationship text not null check (relationship in ('own','shared','rent')),
  location_label text,
  provenance_url text,
  source_status text not null default 'user_provided' check (source_status in ('user_provided','source_verified','unknown')),
  created_at timestamptz not null default now()
);
create table if not exists public.place_memberships (
  place_id uuid not null references public.places(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','member','guest')),
  state text not null default 'active' check (state in ('active','invited','removed')),
  created_at timestamptz not null default now(),
  primary key(place_id,user_id)
);
create table if not exists public.place_settings (
  place_id uuid primary key references public.places(id) on delete cascade,
  require_approval boolean not null default true,
  show_activities boolean not null default false
);
create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  requester_id uuid not null references auth.users(id),
  arrives_on date not null,
  leaves_on date not null,
  note text not null default '' check(length(note)<=500),
  status text not null check(status in ('pending','approved','rejected','cancelled')) default 'pending',
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint booking_order check(leaves_on>arrives_on)
);
create index if not exists booking_approved_overlap_idx on public.booking_requests (place_id, arrives_on, leaves_on) where status='approved';
create table if not exists public.place_posts (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  author_id uuid not null references auth.users(id),
  content text not null check (length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);
create table if not exists public.place_tips (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  author_id uuid not null references auth.users(id),
  title text not null,
  source_url text,
  note text,
  created_at timestamptz not null default now()
);
create table if not exists public.place_guides (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  author_id uuid not null references auth.users(id),
  title text not null,
  body text not null,
  is_confidential boolean not null default false,
  created_at timestamptz not null default now()
);
-- No sensitive access codes in place_guides! Use a separately designed encrypted vault later.
create table if not exists public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  type text not null check(type in ('booking_request','booking_approved','booking_rejected','welcome')),
  user_id uuid not null references auth.users(id),
  place_id uuid references public.places(id) on delete cascade,
  booking_id uuid references public.booking_requests(id) on delete cascade,
  dedupe_key text unique,
  state text not null default 'queued' check(state in ('queued','sending','sent','failed')),
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  place_id uuid references public.places(id) on delete cascade,
  event_type text not null,
  object_id uuid,
  created_at timestamptz not null default now()
);

create or replace function rumaz_private.is_place_member(p_place_id uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.place_memberships m where m.place_id=p_place_id and m.user_id=(select auth.uid()) and m.state='active');
$$;
create or replace function rumaz_private.is_place_admin(p_place_id uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.place_memberships m where m.place_id=p_place_id and m.user_id=(select auth.uid()) and m.role='admin' and m.state='active');
$$;
revoke all on function rumaz_private.is_place_member(uuid),rumaz_private.is_place_admin(uuid) from public;
grant execute on function rumaz_private.is_place_member(uuid),rumaz_private.is_place_admin(uuid) to authenticated;

create or replace function rumaz_private.make_place_owner()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.place_memberships(place_id,user_id,role,state) values(new.id,new.created_by,'admin','active');
 insert into public.place_settings(place_id) values(new.id) on conflict do nothing;
 return new;
end $$;
drop trigger if exists place_create_owner on public.places;
create trigger place_create_owner after insert on public.places for each row execute function rumaz_private.make_place_owner();

alter table public.profiles enable row level security;
alter table public.places enable row level security;
alter table public.place_memberships enable row level security;
alter table public.place_settings enable row level security;
alter table public.booking_requests enable row level security;
alter table public.place_posts enable row level security;
alter table public.place_tips enable row level security;
alter table public.place_guides enable row level security;
alter table public.notification_outbox enable row level security;
alter table public.audit_events enable row level security;
-- Existing policies are intentionally not dropped: deploy migrations through review, not over production.
create policy "own profile select" on public.profiles for select to authenticated using (id=(select auth.uid()));
create policy "own profile update" on public.profiles for update to authenticated using (id=(select auth.uid())) with check(id=(select auth.uid()));
create policy "own profile insert" on public.profiles for insert to authenticated with check(id=(select auth.uid()));
create policy "visible places" on public.places for select to authenticated using(rumaz_private.is_place_member(id));
create policy "create own places" on public.places for insert to authenticated with check(created_by=(select auth.uid()));
create policy "admin update places" on public.places for update to authenticated using(rumaz_private.is_place_admin(id)) with check(rumaz_private.is_place_admin(id));
create policy "memberships visible to same place" on public.place_memberships for select to authenticated using(rumaz_private.is_place_member(place_id));
create policy "settings visible" on public.place_settings for select to authenticated using(rumaz_private.is_place_member(place_id));
create policy "settings admin update" on public.place_settings for update to authenticated using(rumaz_private.is_place_admin(place_id)) with check(rumaz_private.is_place_admin(place_id));
create policy "bookings visible" on public.booking_requests for select to authenticated using(rumaz_private.is_place_member(place_id));
create policy "posts visible" on public.place_posts for select to authenticated using(rumaz_private.is_place_member(place_id));
create policy "posts add" on public.place_posts for insert to authenticated with check(rumaz_private.is_place_member(place_id) and author_id=(select auth.uid()));
create policy "posts owner edit" on public.place_posts for update to authenticated using(author_id=(select auth.uid()) and rumaz_private.is_place_member(place_id)) with check(author_id=(select auth.uid()) and rumaz_private.is_place_member(place_id));
create policy "tips visible" on public.place_tips for select to authenticated using(rumaz_private.is_place_member(place_id));
create policy "tips add" on public.place_tips for insert to authenticated with check(rumaz_private.is_place_member(place_id) and author_id=(select auth.uid()));
create policy "guides visible no confidential by default" on public.place_guides for select to authenticated using(rumaz_private.is_place_member(place_id) and is_confidential=false);
create policy "guides add nonconfidential" on public.place_guides for insert to authenticated with check(rumaz_private.is_place_admin(place_id) and author_id=(select auth.uid()) and is_confidential=false);
-- No client write policies for booking_requests, notification_outbox or audit_events.

-- All booking writes via audited, authenticated RPCs with SERIALIZED place-row lock.
create or replace function rumaz_private.request_stay(p_place_id uuid, p_arrival date,p_departure date,p_note text default '')
returns uuid language plpgsql security definer set search_path='' as $$
declare req_id uuid; appr boolean; final_status text;
begin
 if (select auth.uid()) is null or not rumaz_private.is_place_member(p_place_id) then raise exception 'Not authorized' using errcode='42501'; end if;
 if p_arrival is null or p_departure is null or p_arrival < (now() at time zone 'Europe/Amsterdam')::date or p_departure<=p_arrival then raise exception 'Invalid date range' using errcode='22007'; end if;
 perform 1 from public.places where id=p_place_id for update;
 if not found then raise exception 'Place does not exist' using errcode='22023'; end if;
 if not rumaz_private.is_place_member(p_place_id) then raise exception 'Not authorized' using errcode='42501'; end if;
 if exists(select 1 from public.booking_requests b where b.place_id=p_place_id and b.status='approved' and p_arrival<b.leaves_on and p_departure>b.arrives_on) then raise exception 'Dates not available' using errcode='23P01'; end if;
 select require_approval into appr from public.place_settings where place_id=p_place_id;
 final_status:=case when coalesce(appr,true) then 'pending' else 'approved' end;
 insert into public.booking_requests(place_id,requester_id,arrives_on,leaves_on,status,note)
 values(p_place_id,(select auth.uid()),p_arrival,p_departure,final_status,left(coalesce(p_note,''),500)) returning id into req_id;
 insert into public.audit_events(actor_id,place_id,event_type,object_id) values((select auth.uid()),p_place_id,'booking_requested',req_id);
 if final_status='pending' then
  insert into public.notification_outbox(type,user_id,place_id,booking_id,dedupe_key)
  select 'booking_request',m.user_id,p_place_id,req_id,'booking_request:'||req_id||':'||m.user_id
  from public.place_memberships m where m.place_id=p_place_id and m.role='admin' and m.state='active'
  on conflict(dedupe_key) do nothing;
 else
  insert into public.notification_outbox(type,user_id,place_id,booking_id,dedupe_key)
  values('booking_approved',auth.uid(),p_place_id,req_id,'booking_autoapproved:'||req_id)
  on conflict(dedupe_key) do nothing;
 end if;
 return req_id;
end $$;
create or replace function rumaz_private.decide_stay(p_booking_id uuid,p_approve boolean)
returns text language plpgsql security definer set search_path='' as $$
declare b public.booking_requests%rowtype; v_status text;
begin
 select * into b from public.booking_requests where id=p_booking_id;
 if not found then raise exception 'Unknown request' using errcode='22023'; end if;
 if not rumaz_private.is_place_admin(b.place_id) then raise exception 'Not authorized' using errcode='42501'; end if;
 perform 1 from public.places where id=b.place_id for update;
 if not rumaz_private.is_place_admin(b.place_id) then raise exception 'Not authorized' using errcode='42501'; end if;
 select * into b from public.booking_requests where id=p_booking_id for update;
 if p_approve is null then raise exception 'Decision required' using errcode='22023'; end if;
 if b.status<>'pending' then raise exception 'Request already handled' using errcode='23514'; end if;
 if p_approve and exists(select 1 from public.booking_requests x where x.place_id=b.place_id and x.id<>b.id and x.status='approved' and b.arrives_on<x.leaves_on and b.leaves_on>x.arrives_on) then raise exception 'Dates not available' using errcode='23P01'; end if;
 v_status:=case when p_approve then 'approved' else 'rejected' end;
 update public.booking_requests set status=v_status,reviewed_by=(select auth.uid()),reviewed_at=now() where id=p_booking_id;
 insert into public.notification_outbox(type,user_id,place_id,booking_id,dedupe_key) values
 (case when p_approve then 'booking_approved' else 'booking_rejected' end,b.requester_id,b.place_id,b.id,'booking_decision:'||b.id) on conflict(dedupe_key) do nothing;
 insert into public.audit_events(actor_id,place_id,event_type,object_id) values((select auth.uid()),b.place_id,'booking_'||v_status,b.id);
 return v_status;
end $$;
revoke all on function rumaz_private.request_stay(uuid,date,date,text),rumaz_private.decide_stay(uuid,boolean) from public;
grant execute on function rumaz_private.request_stay(uuid,date,date,text),rumaz_private.decide_stay(uuid,boolean) to authenticated;

-- Follow-up before running: review invitation token flow, private vault, deletion/export, cancellation rights,
-- email outbox worker, signup rate limiting, owner claim evidence, and timing/timeout for cross-client UX.

-- Explicit table privileges; policy alone is not a privilege grant.
revoke all on all tables in schema public from anon, authenticated;
grant select on public.profiles, public.places, public.place_memberships, public.place_settings,
 public.booking_requests, public.place_posts, public.place_tips, public.place_guides to authenticated;
grant insert on public.profiles, public.places, public.place_posts, public.place_tips, public.place_guides to authenticated;
grant update(display_name) on public.profiles to authenticated;
grant update(name,kind,relationship,location_label,provenance_url) on public.places to authenticated;
grant update(require_approval,show_activities) on public.place_settings to authenticated;
grant update(content) on public.place_posts to authenticated;
revoke all on function rumaz_private.make_place_owner() from public, anon, authenticated;

-- Public API wrappers inherit caller privileges; privileged implementations validate the actor.
create function public.request_stay(p_place_id uuid,p_arrival date,p_departure date,p_note text default '')
returns uuid language sql security invoker set search_path='' as $$
 select rumaz_private.request_stay(p_place_id,p_arrival,p_departure,p_note);
$$;
create function public.decide_stay(p_booking_id uuid,p_approve boolean)
returns text language sql security invoker set search_path='' as $$
 select rumaz_private.decide_stay(p_booking_id,p_approve);
$$;
revoke all on function public.request_stay(uuid,date,date,text),public.decide_stay(uuid,boolean) from public,anon;
grant execute on function public.request_stay(uuid,date,date,text),public.decide_stay(uuid,boolean) to authenticated;

create index memberships_user_active_idx on public.place_memberships(user_id,place_id) where state='active';
create index places_created_by_idx on public.places(created_by);
create index memberships_user_idx on public.place_memberships(user_id);
create index bookings_requester_idx on public.booking_requests(requester_id);
create index bookings_reviewer_idx on public.booking_requests(reviewed_by);
create index bookings_place_idx on public.booking_requests(place_id,arrives_on);
create index posts_place_idx on public.place_posts(place_id,created_at);
create index posts_author_idx on public.place_posts(author_id);
create index tips_place_idx on public.place_tips(place_id);
create index tips_author_idx on public.place_tips(author_id);
create index guides_place_idx on public.place_guides(place_id);
create index guides_author_idx on public.place_guides(author_id);
create index outbox_user_idx on public.notification_outbox(user_id);
create index outbox_place_idx on public.notification_outbox(place_id);
create index outbox_booking_idx on public.notification_outbox(booking_id);
create index audit_actor_idx on public.audit_events(actor_id);
create index audit_place_idx on public.audit_events(place_id);

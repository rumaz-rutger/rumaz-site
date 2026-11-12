-- Apply once AFTER the four supplied schema files. No production data is removed.
begin;
create function public.claim_notifications() returns setof public.notification_outbox
language sql security invoker set search_path='' as $$
 update public.notification_outbox set state='sending'
 where id in(select id from public.notification_outbox where state='queued' order by created_at for update skip locked limit 1) returning *;
$$;
revoke all on function public.claim_notifications() from public,anon,authenticated;
grant execute on function public.claim_notifications() to service_role;
grant select,update on public.notification_outbox to service_role;
-- Sending/failed rows require operator review; never blindly retry a possibly delivered mail.
create table public.place_events (
 id uuid primary key default gen_random_uuid(), place_id uuid not null references public.places on delete cascade,
 author_id uuid not null references auth.users, title text not null check(length(title) between 1 and 100),
 event_date date not null, event_time time, audience text not null default 'Iedereen in de kring' check(length(audience)<=100), created_at timestamptz default now()
);
alter table public.place_events enable row level security;
create policy events_read on public.place_events for select to authenticated using(rumaz_private.is_place_member(place_id));
create policy events_add on public.place_events for insert to authenticated with check(rumaz_private.is_place_member(place_id) and author_id=auth.uid());
grant select,insert on public.place_events to authenticated;
create index events_place_idx on public.place_events(place_id);
create index events_author_idx on public.place_events(author_id);
create table public.post_likes(post_id uuid references public.place_posts on delete cascade,user_id uuid references auth.users on delete cascade,primary key(post_id,user_id));
alter table public.post_likes enable row level security;
create policy likes_read on public.post_likes for select to authenticated using(exists(select 1 from public.place_posts p where p.id=post_id and rumaz_private.is_place_member(p.place_id)));
create policy likes_add on public.post_likes for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from public.place_posts p where p.id=post_id and rumaz_private.is_place_member(p.place_id)));
create policy likes_remove on public.post_likes for delete to authenticated using(user_id=auth.uid());
grant select,insert,delete on public.post_likes to authenticated;
create index likes_user_idx on public.post_likes(user_id);
create table public.event_attendees(event_id uuid references public.place_events on delete cascade,user_id uuid references auth.users on delete cascade,primary key(event_id,user_id));
alter table public.event_attendees enable row level security;
create policy attendance_read on public.event_attendees for select to authenticated using(exists(select 1 from public.place_events e where e.id=event_id and rumaz_private.is_place_member(e.place_id)));
create policy attendance_add on public.event_attendees for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from public.place_events e where e.id=event_id and rumaz_private.is_place_member(e.place_id)));
create policy attendance_remove on public.event_attendees for delete to authenticated using(user_id=auth.uid());
grant select,insert,delete on public.event_attendees to authenticated;
create index attendees_user_idx on public.event_attendees(user_id);
alter table public.place_posts add column photo_path text;
grant update(photo_path) on public.place_posts to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('rumaz-photos','rumaz-photos',false,2097152,array['image/jpeg','image/png','image/webp']);
create policy rumaz_photo_read on storage.objects for select to authenticated using(bucket_id='rumaz-photos' and exists(select 1 from public.places p where p.id::text=(storage.foldername(objects.name))[1] and rumaz_private.is_place_member(p.id)));
create policy rumaz_photo_add on storage.objects for insert to authenticated with check(bucket_id='rumaz-photos' and (storage.foldername(objects.name))[2]=auth.uid()::text and exists(select 1 from public.places p where p.id::text=(storage.foldername(objects.name))[1] and rumaz_private.is_place_member(p.id)));
create policy rumaz_photo_remove on storage.objects for delete to authenticated using(bucket_id='rumaz-photos' and (storage.foldername(objects.name))[2]=auth.uid()::text and exists(select 1 from public.places p where p.id::text=(storage.foldername(objects.name))[1] and rumaz_private.is_place_member(p.id)));
commit;

create table public.place_tasks (
 id uuid primary key default gen_random_uuid(),
 place_id uuid not null references public.places(id) on delete cascade,
 author_id uuid not null default auth.uid() references auth.users(id),
 phase text not null check(phase in ('aankomst','verblijf','vertrek','taken')),
 content text not null check(length(btrim(content)) between 1 and 130),
 done boolean not null default false,
 created_at timestamptz not null default now()
);
create table public.post_replies (
 id uuid primary key default gen_random_uuid(),
 post_id uuid not null references public.place_posts(id) on delete cascade,
 author_id uuid not null default auth.uid() references auth.users(id),
 content text not null check(length(btrim(content)) between 1 and 800),
 created_at timestamptz not null default now()
);
alter table public.place_tasks enable row level security;
alter table public.post_replies enable row level security;
revoke all on public.place_tasks,public.post_replies from anon,authenticated;
grant select,insert on public.place_tasks,public.post_replies to authenticated;
grant update(done) on public.place_tasks to authenticated;
grant update(content) on public.post_replies to authenticated;
create policy tasks_read on public.place_tasks for select to authenticated using(rumaz_private.is_place_member(place_id));
create policy tasks_add on public.place_tasks for insert to authenticated with check(author_id=(select auth.uid()) and rumaz_private.is_place_member(place_id));
create policy tasks_check on public.place_tasks for update to authenticated using(rumaz_private.is_place_member(place_id)) with check(rumaz_private.is_place_member(place_id));
create policy replies_read on public.post_replies for select to authenticated using(exists(select 1 from public.place_posts p where p.id=post_id));
create policy replies_add on public.post_replies for insert to authenticated with check(author_id=(select auth.uid()) and exists(select 1 from public.place_posts p where p.id=post_id));
create policy replies_edit on public.post_replies for update to authenticated using(author_id=(select auth.uid()) and exists(select 1 from public.place_posts p where p.id=post_id)) with check(author_id=(select auth.uid()) and exists(select 1 from public.place_posts p where p.id=post_id));
create index tasks_place_idx on public.place_tasks(place_id,created_at);
create index tasks_author_idx on public.place_tasks(author_id);
create index replies_post_idx on public.post_replies(post_id,created_at);
create index replies_author_idx on public.post_replies(author_id);

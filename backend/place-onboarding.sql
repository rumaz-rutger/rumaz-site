-- Add only the fields already collected by the RC5 place form.
alter table public.places add column circle_label text not null default 'Familie en vrienden' check(length(circle_label)<=120);
alter table public.places add column details jsonb not null default '[]'::jsonb check(jsonb_typeof(details)='array' and octet_length(details::text)<=16000);
grant update(circle_label,details) on public.places to authenticated;
create policy shared_profile_names on public.profiles for select to authenticated using(exists(
 select 1 from public.place_memberships mine join public.place_memberships theirs using(place_id)
 where mine.user_id=(select auth.uid()) and theirs.user_id=profiles.id and mine.state='active' and theirs.state='active'
));
create function public.create_place(p_id uuid,p_name text,p_kind text,p_relationship text,p_location text,p_circle text,p_fields jsonb,p_guide text default '',p_note text default '')
returns uuid language plpgsql security invoker set search_path='' as $$
declare found_id uuid;
begin
 if auth.uid() is null then raise insufficient_privilege using message='Authentication required'; end if;
 if p_id is null then raise invalid_parameter_value using message='Place ID required'; end if;
 -- Stable client ID makes retries safe after an ambiguous network response.
 select id into found_id from public.places where id=p_id and created_by=auth.uid();
 if found_id is not null then return found_id; end if;
 insert into public.places(id,created_by,name,kind,relationship,location_label,circle_label,details)
 values(p_id,auth.uid(),p_name,p_kind,p_relationship,left(p_location,500),p_circle,p_fields);
 if length(btrim(p_guide))>0 then
  if length(p_guide)>900 then raise invalid_parameter_value using message='Guide too long'; end if;
  insert into public.place_guides(place_id,author_id,title,body) values(p_id,auth.uid(),'Eerste instructie',p_guide);
 end if;
 if length(btrim(p_note))>0 then
  insert into public.place_posts(place_id,author_id,content) values(p_id,auth.uid(),p_note);
 end if;
 return p_id;
end $$;
revoke all on function public.create_place(uuid,text,text,text,text,text,jsonb,text,text) from public,anon;
grant execute on function public.create_place(uuid,text,text,text,text,text,jsonb,text,text) to authenticated;

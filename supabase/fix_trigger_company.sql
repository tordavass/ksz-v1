create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role, company_id)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'role', 'student')::public.user_role,
    (new.raw_user_meta_data->>'company_id')::uuid  -- Cast to UUID if present, else NULL
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

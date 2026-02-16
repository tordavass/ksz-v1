-- Update the handle_new_user function to copy 'is_dual_role' from metadata
-- This ensures that when a new Business Owner registers via the contract, 
-- and selects "I am the contact person", the flag is correctly set in their profile.

COMMIT; -- Ensure previous transaction is closed if any (though usually not needed in script runner)

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
      id, 
      full_name, 
      avatar_url, 
      role,
      is_dual_role -- Added field
  )
  values (
      new.id, 
      new.raw_user_meta_data->>'full_name', 
      new.raw_user_meta_data->>'avatar_url', 
      (new.raw_user_meta_data->>'role')::user_role,
      COALESCE((new.raw_user_meta_data->>'is_dual_role')::boolean, false) -- Handle validation/default
  );
  return new;
end;
$$ language plpgsql security definer;

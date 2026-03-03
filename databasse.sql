-- Create default shelves function
create or replace function create_default_shelves()
returns trigger as $$
begin
  insert into public.shelves (user_id, shelf_name, is_default)
  values
    (new.id, 'Want to Read', true),
    (new.id, 'Currently Reading', true),
    (new.id, 'Read', true);
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to fire function on new user signup
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function create_default_shelves();

-- Fix function permissions
alter function create_default_shelves() security definer set search_path = public;
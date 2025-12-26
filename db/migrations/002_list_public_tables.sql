create or replace function list_public_tables()
returns table(table_name text)
language sql stable
as $$
  select table_name from information_schema.tables
  where table_schema = 'public'
  order by table_name;
$$;

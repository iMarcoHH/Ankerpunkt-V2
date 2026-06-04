-- Wiederkehrende Einträge
create table if not exists recurring_entries (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  type          text not null check (type in ('income','expense')),
  amount        numeric(12,2) not null check (amount > 0),
  description   text not null,
  category      text not null,
  day_of_month  int not null check (day_of_month between 1 and 28),
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

alter table recurring_entries enable row level security;
create policy "Users own their recurring entries"
  on recurring_entries for all using (auth.uid() = user_id);

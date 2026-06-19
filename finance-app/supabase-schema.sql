create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null check (role in ('joao', 'esposa', 'casal')),
  created_at timestamptz not null default now()
);

create table if not exists bank_connections (
  id uuid primary key default gen_random_uuid(),
  owner_role text not null check (owner_role in ('joao', 'esposa', 'casal')),
  bank_name text not null,
  pluggy_item_id text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bank_accounts (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid references bank_connections(id) on delete cascade,
  owner_role text not null check (owner_role in ('joao', 'esposa', 'casal')),
  bank_name text not null,
  pluggy_account_id text,
  name text,
  type text,
  balance numeric,
  currency_code text default 'BRL',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references bank_accounts(id) on delete cascade,
  owner_role text not null check (owner_role in ('joao', 'esposa', 'casal')),
  pluggy_transaction_id text unique,
  description text not null,
  amount numeric not null,
  date date not null,
  category text default 'Revisar',
  source text default 'Pluggy',
  needs_review boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transactions_owner_date_idx on transactions(owner_role, date desc);
create index if not exists bank_accounts_owner_idx on bank_accounts(owner_role);

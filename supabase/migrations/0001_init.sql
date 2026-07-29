-- Table : un commerce connecté par utilisateur (V1 : un seul par compte)
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id text not null,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id)
);

alter table businesses enable row level security;

create policy "Users can view their own business"
  on businesses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own business"
  on businesses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own business"
  on businesses for update
  using (auth.uid() = user_id);

-- Table : avis synchronisés depuis Google (Places API renvoie jusqu'à 5 avis récents)
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  google_review_id text not null,
  author_name text not null,
  rating int not null,
  review_text text,
  review_time timestamptz not null,
  replied boolean not null default false,
  created_at timestamptz not null default now(),
  unique (business_id, google_review_id)
);

alter table reviews enable row level security;

create policy "Users can view reviews of their own business"
  on reviews for select
  using (
    exists (
      select 1 from businesses
      where businesses.id = reviews.business_id
      and businesses.user_id = auth.uid()
    )
  );

create policy "Users can update reviews of their own business"
  on reviews for update
  using (
    exists (
      select 1 from businesses
      where businesses.id = reviews.business_id
      and businesses.user_id = auth.uid()
    )
  );

create policy "Users can insert reviews for their own business"
  on reviews for insert
  with check (
    exists (
      select 1 from businesses
      where businesses.id = reviews.business_id
      and businesses.user_id = auth.uid()
    )
  );

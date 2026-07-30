-- Relevés successifs de la note et du nombre d'avis d'un commerce.
-- Permet de détecter un nouvel avis (le compteur augmente) et une baisse
-- de note, sans avoir accès au texte des avis.
create table if not exists snapshots (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  rating numeric,
  review_count int,
  captured_at timestamptz not null default now()
);

create index if not exists snapshots_business_captured_idx
  on snapshots (business_id, captured_at desc);

alter table snapshots enable row level security;

create policy "Users can view snapshots of their own business"
  on snapshots for select
  using (
    exists (
      select 1 from businesses
      where businesses.id = snapshots.business_id
      and businesses.user_id = auth.uid()
    )
  );

create policy "Users can insert snapshots for their own business"
  on snapshots for insert
  with check (
    exists (
      select 1 from businesses
      where businesses.id = snapshots.business_id
      and businesses.user_id = auth.uid()
    )
  );

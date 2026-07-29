-- Une ligne de facturation par utilisateur, créée automatiquement à l'inscription
create table if not exists accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'trial', -- 'trial' | 'starter' | 'pro' | 'none'
  subscription_status text not null default 'trialing', -- 'trialing' | 'active' | 'past_due' | 'canceled'
  trial_ends_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);

alter table accounts enable row level security;

create policy "Users can view their own account"
  on accounts for select
  using (auth.uid() = user_id);

-- Les mises à jour de statut viennent uniquement du webhook Stripe (clé
-- service_role, qui contourne RLS) — pas de policy update pour les clients.

-- Trigger : crée automatiquement la ligne accounts dès qu'un utilisateur
-- s'inscrit via Supabase Auth.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.accounts (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

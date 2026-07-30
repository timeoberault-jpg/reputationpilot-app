-- Compteur simple de requêtes par adresse IP, pour empêcher qu'un bot
-- appelle l'outil d'audit public en boucle et fasse grimper la facture
-- Google Places.
create table if not exists rate_limit_hits (
  id uuid primary key default gen_random_uuid(),
  ip text not null,
  route text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_hits_lookup_idx
  on rate_limit_hits (ip, route, created_at desc);

-- Aucune policy : cette table n'est manipulée que par le serveur via la
-- clé service_role, jamais depuis le navigateur.
alter table rate_limit_hits enable row level security;

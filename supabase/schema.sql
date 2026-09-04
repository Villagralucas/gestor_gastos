-- Esquema de Balance para Supabase (PostgreSQL).
--
-- Version sin cuentas: no hay tabla de usuarios ni columnas `user_id`, porque
-- por ahora la app la usa una sola persona. Cuando se agregue login, cada tabla
-- suma una columna que apunta a `auth.users` y se prenden las politicas de RLS;
-- las tablas en si no cambian.
--
-- Se corre desde el SQL Editor del panel de Supabase.

create table categories (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- Los montos van en `numeric` y nunca en coma flotante: 0.1 + 0.2 en float da
-- 0.30000000000000004, y sumando movimientos el balance deja de cerrar.
create table transactions (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete restrict,
  title       text not null,
  amount      numeric(12,2) not null check (amount > 0),
  type        text not null check (type in ('income', 'expense')),
  date        date not null,
  created_at  timestamptz not null default now()
);

-- La consulta de siempre es "los movimientos de este mes, por fecha".
create index on transactions (date desc);

-- Un presupuesto por mes, guardando siempre el dia 1. El `unique` es lo que
-- despues habilita el `on conflict ... do update` al guardarlo.
create table budgets (
  id     uuid primary key default gen_random_uuid(),
  month  date not null unique,
  amount numeric(12,2) not null check (amount >= 0)
);

create table savings_goals (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  target_amount numeric(12,2) not null check (target_amount >= 0),
  created_at    timestamptz not null default now()
);

-- El total ahorrado no se guarda: se suma de los aportes. Asi nunca queda
-- desincronizado y ademas se sabe cuando entro cada peso.
create table savings_contributions (
  id      uuid primary key default gen_random_uuid(),
  goal_id uuid not null references savings_goals(id) on delete cascade,
  amount  numeric(12,2) not null,
  date    date not null
);

-- Las mismas nueve categorias que ya usaba la version en localStorage.
insert into categories (name) values
  ('Comida'), ('Transporte'), ('Servicios'), ('Casa'),
  ('Salud'), ('Ocio'), ('Trabajo'), ('Reservas'), ('Otros');

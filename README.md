# Balance

Gestor de gastos personal: cargás lo que entra y lo que sale, seguís el
presupuesto del mes y avanzás con un objetivo de ahorro. Los datos se guardan
en una base Postgres en Supabase, así que no se pierden al cambiar de navegador
ni al limpiar el historial.

## Qué hace

- **Movimientos** — ingresos y gastos con concepto, monto, categoría y fecha,
  que se cargan, editan y borran desde una tabla con filtros por tipo.
- **Balance del mes** — cuánto entró, cuánto salió y cómo venís contra el mes
  anterior.
- **Presupuesto mensual** — definís cuánto querés gastar y ves cuánto te queda.
- **Objetivo de ahorro** — una meta con nombre y una barra con el progreso.
- **Gastos por categoría** — el ranking del mes, para ver dónde se va la plata.
- **Tendencia** — gráfico de ingresos contra gastos de los últimos 3, 6 o 12
  meses.
- **Export e import** — te bajás un `.json` con todo y lo volvés a subir.

## Cómo levantarlo

Necesitás Node 20 o superior y un proyecto de Supabase.

```bash
npm install
```

Copiá `.env.example` como `.env.local` y completá las dos variables con la URL
y la *publishable key* de tu proyecto, que están en **Project Settings → API
Keys**. Sin ese archivo la app no arranca.

Las tablas se crean corriendo [`supabase/schema.sql`](supabase/schema.sql) en el
**SQL Editor** del panel. Ese script deja además cargadas las nueve categorías.

```bash
npm run dev
```

La landing queda en `http://localhost:3000` y el tablero en `/dashboard`.

## Cómo se guardan los datos

Todo vive en Postgres, en seis tablas: `categories`, `transactions`, `budgets`,
`savings_goals` y `savings_contributions`. Dos decisiones que conviene conocer
antes de tocar el esquema:

- **Los montos son `numeric`, nunca coma flotante.** En float, `0.1 + 0.2` da
  `0.30000000000000004`, y sumando movimientos el balance deja de cerrar.
- **El total ahorrado no se guarda.** Se suman los aportes de
  `savings_contributions`, así nunca queda desincronizado y además se sabe
  cuándo entró cada peso.

Del lado del navegador, [`src/lib/storage.js`](src/lib/storage.js) es el único
que habla con la base. Mantiene una copia en memoria y la expone como store
externo, así que ningún componente sabe de dónde salen los datos. Las
escrituras son optimistas: la pantalla se actualiza al instante y, si la base
rechaza el cambio, se revierte sola y avisa.

## Todavía no tiene cuentas

La app es de un solo usuario y las tablas no tienen Row Level Security, así que
cualquiera con la clave publicable puede leer y escribir todo. Eso es inofensivo
corriendo en `localhost`, pero **la app no se publica hasta que tenga login**.
El esquema ya está preparado para eso: se agrega una columna que apunte a
`auth.users` y se activan las políticas.

## Stack

Next.js 16 con App Router, React 19, Tailwind CSS 4 y componentes de shadcn/ui
sobre Radix. Los gráficos son de Recharts, la tabla de TanStack Table y la base
de Supabase.

## Estructura

```
src/app/page.js              landing
src/app/dashboard/page.jsx   tablero, y donde vive el estado
src/components/              componentes de la app
src/components/ui/           primitivas de shadcn/ui
src/lib/supabase.js          cliente de Supabase
src/lib/storage.js           lectura y escritura contra la base
src/lib/transactions.js      totales, filtros y cálculos del mes
supabase/schema.sql          las tablas, para crearlas de cero
```

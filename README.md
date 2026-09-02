# Balance

Gestor de gastos personal que corre entero en el navegador. Sin cuentas, sin
servidores y sin base de datos: los movimientos se guardan en el `localStorage`
y no salen de tu máquina.

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
- **Export e import** — te bajás un `.json` con todo y lo volvés a subir en
  otra computadora.

## Cómo levantarlo

Necesitás Node 20 o superior.

```bash
npm install
npm run dev
```

La landing queda en `http://localhost:3000` y el tablero en `/dashboard`.

## Dónde se guardan los datos

Todo vive bajo la clave `balance:data` del `localStorage` del navegador, en un
solo objeto con los movimientos y los ajustes. Eso tiene dos consecuencias que
conviene tener claras:

- Los datos son de **ese navegador en esa computadora**. No se sincronizan.
- Si limpiás los datos de navegación, se borran.

Para eso está el botón **Exportar**, que baja un archivo con todo, y el de
**Importar**, que lo vuelve a cargar validando que tenga la forma correcta.

## Stack

Next.js 16 con App Router, React 19, Tailwind CSS 4 y componentes de
shadcn/ui sobre Radix. Los gráficos son de Recharts y la tabla de TanStack
Table.

## Estructura

```
src/app/page.js              landing
src/app/dashboard/page.jsx   tablero, y donde vive el estado
src/components/              componentes de la app
src/components/ui/           primitivas de shadcn/ui
src/lib/storage.js           persistencia en localStorage, export e import
src/lib/transactions.js      totales, filtros y cálculos del mes
```

import { cn } from "@/lib/utils";

/**
 * Miniatura del tablero para el hero de la landing.
 *
 * Es una maqueta: no lee datos ni calcula nada, solo muestra como se ve la app
 * para que alguien que todavia no entro entienda que va a encontrar adentro.
 * Se dibuja con HTML en vez de usar una captura para que no se pixele en
 * pantallas grandes y para que acompañe el tema claro y oscuro.
 *
 * Va marcada como decorativa: los numeros son de mentira y no aportan nada a
 * quien navega con lector de pantalla.
 */

const cards = [
  { label: "Balance del mes", value: "$ 364.500", trend: "+12%" },
  { label: "Ingresos", value: "$ 1.130.000" },
  { label: "Gastos", value: "$ 765.500" },
  { label: "Ahorro", value: "$ 420.000", progress: 35 },
];

/** Ingresos y gastos de seis meses, en el viewBox de 240x70 del grafico. */
const incomeLine = "0,52 48,47 96,40 144,28 192,24 240,12";
const expenseLine = "0,62 48,58 96,54 144,47 192,45 240,38";

export function HeroPreview({ className }) {
  return (
    <div aria-hidden="true" className={cn("select-none", className)}>
      <div className="rounded-xl border border-border/60 bg-card/85 p-3 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between px-0.5 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-muted-foreground/25" />
            <span className="size-2 rounded-full bg-muted-foreground/25" />
            <span className="size-2 rounded-full bg-muted-foreground/25" />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">
            Septiembre 2026
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {cards.map((card) => (
            <div
              className="rounded-lg border border-border/50 bg-background/50 p-2.5"
              key={card.label}
            >
              <div className="flex items-center justify-between gap-1">
                <p className="truncate text-[10px] leading-none text-muted-foreground">
                  {card.label}
                </p>
                {card.trend ? (
                  <span className="rounded-full border border-border/60 px-1 text-[9px] leading-4 text-income">
                    {card.trend}
                  </span>
                ) : null}
              </div>

              <p className="mt-1.5 text-sm font-semibold tabular-nums">
                {card.value}
              </p>

              {card.progress ? (
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-income"
                    style={{ width: `${card.progress}%` }}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-2 rounded-lg border border-border/50 bg-background/50 p-3">
          <p className="text-[10px] font-medium leading-none text-muted-foreground">
            Ingresos y gastos
          </p>

          <svg
            className="mt-2 h-16 w-full"
            preserveAspectRatio="none"
            viewBox="0 0 240 70"
          >
            <polygon
              fill="var(--income)"
              opacity="0.18"
              points={`${incomeLine} 240,70 0,70`}
            />
            <polygon
              fill="var(--expense)"
              opacity="0.18"
              points={`${expenseLine} 240,70 0,70`}
            />
            <polyline
              fill="none"
              points={incomeLine}
              stroke="var(--income)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            <polyline
              fill="none"
              points={expenseLine}
              stroke="var(--expense)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

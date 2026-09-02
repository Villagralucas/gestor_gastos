import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  Download,
  HardDriveDownload,
  Lock,
  PiggyBank,
  Tags,
  WalletCards,
} from "lucide-react";
import { SiteBackground } from "@/components/site-background";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Balance | Controlá tus gastos y tu ahorro",
  description:
    "Balance es un gestor de gastos personal: registrá tus movimientos, seguí tu presupuesto mensual y avanzá con tu objetivo de ahorro. Todo guardado en tu navegador, sin cuentas.",
};

const features = [
  {
    icon: WalletCards,
    title: "Ingresos y gastos",
    description:
      "Cargá cada movimiento con concepto, monto y fecha. El balance del mes se actualiza solo.",
  },
  {
    icon: Tags,
    title: "Categorías",
    description:
      "Comida, transporte, servicios, casa, salud, ocio y más. Filtrá y buscá sin perder tiempo.",
  },
  {
    icon: CalendarDays,
    title: "Presupuesto mensual",
    description:
      "Definí cuánto querés gastar por mes y mirá cuánto te queda disponible en tiempo real.",
  },
  {
    icon: PiggyBank,
    title: "Objetivo de ahorro",
    description:
      "Poné un objetivo con nombre, sumá lo que vas guardando y seguí el progreso.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Gráfico de tendencia",
    description:
      "Compará ingresos contra gastos mes a mes y detectá dónde se te va la plata.",
  },
  {
    icon: Download,
    title: "Tus datos, tuyos",
    description:
      "Todo queda en tu navegador. Bajate un archivo con todo cuando quieras y volvé a subirlo en otra compu.",
  },
];

const steps = [
  {
    number: "01",
    title: "Abrí el tablero",
    description:
      "Entrás de una, sin registro ni configuración. El mes arranca vacío esperándote.",
  },
  {
    number: "02",
    title: "Cargá tus movimientos",
    description:
      "Anotá gastos e ingresos a medida que pasan. Toma segundos y el tablero se arma solo.",
  },
  {
    number: "03",
    title: "Seguí tu mes",
    description:
      "Mirá el presupuesto, el ahorro y la tendencia. Exportá un backup cuando quieras.",
  },
];

const highlights = [
  "Entrás directo, sin registro",
  "Tu primer gasto en segundos",
  "Sin cuentas ni contraseñas",
  "Pensado para pesos argentinos",
];

export default function HomePage() {
  return (
    <div className="min-h-screen text-foreground" data-snap="sections" id="inicio">
      <SiteBackground
        sections={[
          { id: "inicio", src: "/fondo-edificio.jpg", position: "center" },
          {
            id: "funciones",
            src: "/fondo-torres.jpg",
            position: "center",
          },
          {
            id: "pasos",
            src: "/fondo-cielo.jpg",
            // La foto es apaisada y el edificio esta a la izquierda: si se
            // centra, en pantalla ancha queda solo cielo.
            position: "left center",
          },
          { id: "datos", src: "/fondo-vidrio.jpg", position: "center" },
        ]}
      />

      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link className="flex items-center gap-3" href="/">
            <div className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
              <WalletCards className="size-5" aria-hidden="true" />
            </div>
            <div className="leading-tight">
              <p className="font-semibold">Balance</p>
              <p className="text-xs text-muted-foreground">Gestor de gastos</p>
            </div>
          </Link>

          <nav className="flex items-center gap-2" aria-label="Accesos">
            <Button asChild variant="ghost">
              <Link href="#funciones">Funciones</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">
                Entrar al tablero
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative flex min-h-screen items-center overflow-hidden border-b border-border/60">
          <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 py-24 sm:px-6">
            <div className="max-w-3xl">
              <h1 className="text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
                Tus gastos, tu presupuesto y tu ahorro en{" "}
                <span className="text-primary">un solo tablero</span>.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                Balance te muestra cuánto entra, cuánto sale y cuánto te queda
                del presupuesto del mes. Sin planillas y sin fórmulas rotas.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/dashboard">
                    Entrar al tablero
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="#funciones">Ver qué incluye</Link>
                </Button>
              </div>

              <ul className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                {highlights.map((item) => (
                  <li className="flex items-center gap-2" key={item}>
                    <Check
                      className="size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section
          className="flex min-h-screen items-center border-b border-border/60 py-24"
          id="funciones"
        >
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Todo lo que necesitás para no perder el hilo
              </h2>
              <p className="mt-4 text-muted-foreground">
                Nada de módulos que no vas a usar. Solo las piezas que hacen
                falta para entender tu mes.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <article
                  className="rounded-lg border bg-card/50 p-6 backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-card/80"
                  key={feature.title}
                >
                  <div className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
                    <feature.icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="flex min-h-screen items-center border-b border-border/60 py-24"
          id="pasos"
        >
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Empezás en tres pasos
              </h2>
              <p className="mt-4 text-muted-foreground">
                De cero a tener tu primer mes ordenado, sin configurar nada raro.
              </p>
            </div>

            <ol className="mt-12 grid gap-4 md:grid-cols-3">
              {steps.map((step) => (
                <li
                  className="rounded-lg border bg-card/50 p-6 backdrop-blur-sm"
                  key={step.number}
                >
                  <span className="text-sm font-semibold text-primary">
                    {step.number}
                  </span>
                  <h3 className="mt-3 font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="flex min-h-screen items-center py-24" id="datos">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="grid gap-8 rounded-lg border bg-card/50 p-8 backdrop-blur-sm sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex items-center gap-2 text-primary">
                  <HardDriveDownload className="size-4" aria-hidden="true" />
                  <span className="text-sm font-medium uppercase tracking-wide">
                    Tus datos no salen de tu compu
                  </span>
                </div>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                  Sin cuentas, sin servidores, sin letra chica
                </h2>
                <p className="mt-4 max-w-2xl text-muted-foreground">
                  Balance guarda todo en tu navegador. Cuando quieras un backup
                  o quieras seguir en otra compu, exportás un archivo y lo
                  volvés a importar del otro lado.
                </p>
              </div>

              <Button asChild size="lg">
                <Link href="/dashboard">
                  Entrar al tablero
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <p className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Lock className="size-4" aria-hidden="true" />
              Nada se sube a ningún lado: tus movimientos no salen de tu navegador.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

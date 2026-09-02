import Link from "next/link";
import { Globe, WalletCards } from "lucide-react";

/**
 * Redes sociales del proyecto. Mientras este vacio no se dibuja nada.
 * Para activarlas, agregar objetos con la forma:
 *   { label: "Instagram", href: "https://...", icon: Instagram }
 * importando el icono correspondiente de lucide-react.
 */
const socialLinks = [];

const linkGroups = [
  [
    {
      title: "Producto",
      links: [
        { label: "Funciones", href: "#funciones" },
        { label: "Tus datos", href: "#datos" },
        { label: "Volver al inicio", href: "#inicio" },
      ],
    },
  ],
  [
    {
      title: "Empezar",
      links: [
        { label: "Entrar al tablero", href: "/dashboard" },
        { label: "Cómo funciona", href: "#pasos" },
      ],
    },
  ],
  [
    {
      title: "Recursos",
      links: [
        { label: "Next.js", href: "https://nextjs.org", external: true },
        {
          label: "Tailwind CSS",
          href: "https://tailwindcss.com",
          external: true,
        },
      ],
    },
    {
      title: "Ayuda",
      links: [
        { label: "Cómo empezar", href: "#pasos" },
        { label: "Exportar e importar", href: "#datos" },
      ],
    },
  ],
  [
    {
      title: "Construido con",
      links: [
        { label: "React", href: "https://react.dev", external: true },
        { label: "Recharts", href: "https://recharts.org", external: true },
        {
          label: "Radix UI",
          href: "https://www.radix-ui.com",
          external: true,
        },
        { label: "date-fns", href: "https://date-fns.org", external: true },
      ],
    },
  ],
];

const categories = [
  "Comida",
  "Transporte",
  "Servicios",
  "Casa",
  "Salud",
  "Ocio",
  "Trabajo",
  "Reservas",
  "Otros",
];

const bottomLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Funciones", href: "#funciones" },
  { label: "Cómo empezar", href: "#pasos" },
  { label: "Tus datos", href: "#datos" },
  { label: "Tablero", href: "/dashboard" },
];

function FooterLink({ link }) {
  const className =
    "text-sm text-muted-foreground transition-colors hover:text-foreground";

  if (link.external) {
    return (
      <a
        className={className}
        href={link.href}
        rel="noreferrer"
        target="_blank"
      >
        {link.label}
      </a>
    );
  }

  return (
    <Link className={className} href={link.href}>
      {link.label}
    </Link>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border/60 bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_repeat(4,minmax(0,1fr))] lg:gap-8">
          <div>
            <Link className="flex w-fit items-center gap-3" href="/">
              <div className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground">
                <WalletCards className="size-5" aria-hidden="true" />
              </div>
              <span className="text-xl font-semibold tracking-tight">
                Balance
              </span>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-6 text-muted-foreground">
              Tus ingresos, tus gastos y tu objetivo de ahorro en un solo
              tablero, sin vueltas.
            </p>

            {socialLinks.length > 0 ? (
              <ul className="mt-6 flex flex-wrap items-center gap-4">
                {socialLinks.map((social) => (
                  <li key={social.label}>
                    <a
                      aria-label={social.label}
                      className="block text-muted-foreground transition-colors hover:text-foreground"
                      href={social.href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <social.icon className="size-5" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {linkGroups.map((column, columnIndex) => (
            <div className="grid content-start gap-10" key={columnIndex}>
              {column.map((group) => (
                <nav aria-label={group.title} key={group.title}>
                  <p className="text-sm font-semibold text-foreground">
                    {group.title}
                  </p>
                  <ul className="mt-4 grid gap-3">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <FooterLink link={link} />
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}

              {columnIndex === linkGroups.length - 1 ? (
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Categorías
                  </p>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    {categories.join(" · ")}
                  </p>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-border/60 pt-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                {bottomLinks.map((link, index) => (
                  <li
                    className={
                      index === 0
                        ? ""
                        : "border-l border-border/60 pl-4 leading-none"
                    }
                    key={link.label}
                  >
                    <Link
                      className="text-foreground transition-colors hover:text-primary"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-xs text-muted-foreground">
                © {year} Balance. Proyecto personal de gestión de gastos.
              </p>
            </div>

            <p className="inline-flex items-center gap-2 self-start text-sm text-muted-foreground lg:self-auto">
              <Globe className="size-4" aria-hidden="true" />
              Español (AR) · Pesos argentinos
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

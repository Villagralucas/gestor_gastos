import { Outfit } from "next/font/google";

import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";

/**
 * `next/font` descarga Outfit durante el build y la sirve desde nuestro propio
 * dominio: no hay pedido a Google cuando alguien abre la app.
 *
 * Expone la familia como la variable `--font-outfit`, que globals.css engancha
 * al token `--font-sans` de Tailwind. De ahi la toma `html { @apply font-sans }`
 * y baja a toda la app.
 */
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata = {
  title: "Balance | Gestor de gastos",
  description: "Gestor de gastos personal hecho con Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={outfit.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * next-themes escribe la clase `dark` en <html> antes de que pinte la pagina,
 * asi no hay un flash de tema claro al entrar.
 *
 * Por eso <html> lleva `suppressHydrationWarning` en el layout: el servidor no
 * puede saber que tema tiene guardado el navegador, y esa diferencia en el
 * atributo `class` es esperada.
 */
export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

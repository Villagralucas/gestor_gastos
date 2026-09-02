"use client";

import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          tooltip="Cambiar tema"
          type="button"
        >
          {/*
            Que se ve se decide por CSS (`dark:`), no por estado de React.
            En el primer render el cliente todavia no sabe que tema hay
            guardado, asi que leerlo aca haria parpadear el boton y romper la
            hidratacion. La clase `dark` en <html> ya la puso next-themes antes
            de pintar, y de eso se agarran estas reglas.
          */}
          <IconSun className="hidden dark:block" />
          <IconMoon className="block dark:hidden" />
          <span className="hidden dark:inline">Tema claro</span>
          <span className="inline dark:hidden">Tema oscuro</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

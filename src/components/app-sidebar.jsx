"use client";

import Link from "next/link";
import {
  IconChartBar,
  IconCirclePlusFilled,
  IconLayoutDashboard,
  IconPigMoney,
  IconWallet,
} from "@tabler/icons-react";

import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const icons = {
  dashboard: IconLayoutDashboard,
  movements: IconChartBar,
  savings: IconPigMoney,
};

export function AppSidebar({ activePanel, items, onCreate, ...props }) {
  const { isMobile, setOpenMobile } = useSidebar();

  function handleSelect(action) {
    action();

    // En mobile el menu tapa la pantalla: si no lo cerramos no ves el scroll.
    if (isMobile) {
      setOpenMobile(false);
    }
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:!p-1.5"
              asChild
            >
              {/* Vuelve a la portada. Antes apuntaba a "#inicio", que solo
                  existe en la landing: desde el dashboard no hacia nada. */}
              <Link href="/">
                <IconWallet className="!size-5" />
                <span className="text-base font-semibold">Balance</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton
                  className="min-w-8 bg-sidebar-primary text-sidebar-primary-foreground duration-200 ease-linear hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground active:bg-sidebar-primary/90 active:text-sidebar-primary-foreground"
                  onClick={() => handleSelect(onCreate)}
                  tooltip="Agregar movimiento"
                >
                  <IconCirclePlusFilled />
                  <span>Agregar movimiento</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <SidebarMenu>
              {items.map((item) => {
                const Icon = icons[item.id] ?? IconLayoutDashboard;

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      // Hover y activo comparten el mismo gris de fondo, asi
                      // que el activo se distingue por el color del texto.
                      className="data-[active=true]:text-sidebar-primary"
                      isActive={activePanel === item.id}
                      onClick={() => handleSelect(item.onClick)}
                      tooltip={item.label}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <ThemeToggle />
        <div className="px-2 pb-1 text-xs text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
          Tus datos quedan en este navegador.
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

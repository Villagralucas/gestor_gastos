"use client";

import { useRef } from "react";
import {
  IconCalendar,
  IconDownload,
  IconSettings,
  IconUpload,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { dateFromInput, inputFromDate } from "@/lib/transactions";

const monthFormatter = new Intl.DateTimeFormat("es-AR", {
  month: "long",
  year: "numeric",
});

export function SiteHeader({
  onExport,
  onImport,
  onOpenSettings,
  onSelectedDateChange,
  selectedDate,
}) {
  const fileRef = useRef(null);

  function pickFile(event) {
    const [file] = event.target.files ?? [];

    if (file) {
      onImport(file);
    }

    // Se limpia para poder volver a elegir el mismo archivo.
    event.target.value = "";
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="ghost" className="font-medium capitalize">
              <IconCalendar />
              {monthFormatter.format(dateFromInput(selectedDate))}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto" align="start">
            <Calendar
              mode="single"
              selected={dateFromInput(selectedDate)}
              onSelect={(date) => {
                if (date) {
                  onSelectedDateChange(inputFromDate(date));
                }
              }}
            />
          </PopoverContent>
        </Popover>

        <div className="ml-auto flex items-center gap-1 lg:gap-2">
          <Button onClick={onExport} size="sm" variant="ghost">
            <IconDownload />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button
            onClick={() => fileRef.current?.click()}
            size="sm"
            variant="ghost"
          >
            <IconUpload />
            <span className="hidden sm:inline">Importar</span>
          </Button>
          <Button
            onClick={onOpenSettings}
            size="icon"
            variant="ghost"
            className="size-8"
          >
            <IconSettings />
            <span className="sr-only">Ajustes</span>
          </Button>
          <input
            accept="application/json,.json"
            aria-hidden="true"
            className="sr-only"
            onChange={pickFile}
            ref={fileRef}
            tabIndex={-1}
            type="file"
          />
        </div>
      </div>
    </header>
  );
}

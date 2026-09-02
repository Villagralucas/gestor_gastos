"use client";

import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        root: "relative w-fit",
        months: "flex flex-col gap-4",
        month: "space-y-4",
        month_caption: "relative flex h-8 items-center justify-center px-10",
        caption_label: "text-sm font-medium capitalize",
        nav: "pointer-events-none absolute inset-x-0 top-3 flex items-center justify-between px-3",
        button_previous:
          "pointer-events-auto grid size-8 place-items-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        button_next:
          "pointer-events-auto grid size-8 place-items-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        month_grid: "w-full border-collapse",
        weekdays: "grid grid-cols-7",
        weekday:
          "grid h-8 place-items-center text-[0.8rem] font-normal text-muted-foreground",
        weeks: "grid gap-1",
        week: "grid grid-cols-7 gap-1",
        day: "grid size-9 place-items-center rounded-md p-0 text-center text-sm",
        day_button:
          "grid size-9 place-items-center rounded-md text-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
        selected:
          "[&_button]:bg-primary [&_button]:text-primary-foreground [&_button]:hover:bg-primary [&_button]:hover:text-primary-foreground",
        today: "[&_button]:border [&_button]:border-primary [&_button]:text-primary",
        outside: "[&_button]:text-muted-foreground/35",
        disabled: "[&_button]:text-muted-foreground/30",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon =
            orientation === "left"
              ? ChevronLeft
              : orientation === "right"
                ? ChevronRight
                : orientation === "up"
                  ? ChevronUp
                  : ChevronDown;

          return <Icon className="size-4" aria-hidden="true" />;
        },
      }}
      {...props}
    />
  );
}

export { Calendar };

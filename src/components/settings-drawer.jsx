"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/lib/formatters";

export function SettingsDrawer({ onOpenChange, onSave, open, settings }) {
  const isMobile = useIsMobile();
  const [draft, setDraft] = React.useState(settings);
  const [wasOpen, setWasOpen] = React.useState(open);

  // `open` puede cambiar desde afuera (sidebar, header), sin pasar por
  // handleOpenChange. Sincronizamos el borrador cuando se abre, venga de donde
  // venga: ajustar estado durante el render es el patron que recomienda React.
  if (open !== wasOpen) {
    setWasOpen(open);

    if (open) {
      setDraft(settings);
    }
  }

  function handleOpenChange(nextOpen) {
    onOpenChange(nextOpen);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const monthlyBudget = Math.max(Number(draft.monthlyBudget) || 0, 0);
    const savedAmount = Math.max(Number(draft.savedAmount) || 0, 0);
    const savingsGoal = Math.max(Number(draft.savingsGoal) || 0, 0);

    onSave({
      savingsTitle: draft.savingsTitle.trim() || "Mi objetivo",
      monthlyBudget,
      savedAmount,
      savingsGoal,
    });
    onOpenChange(false);
  }

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Ajustes</DrawerTitle>
          <DrawerDescription>
            Tu presupuesto del mes y tu objetivo de ahorro.
          </DrawerDescription>
        </DrawerHeader>
        <form
          className="flex flex-col gap-4 overflow-y-auto px-4 text-sm"
          id="ajustes"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-3">
            <Label htmlFor="presupuesto">Presupuesto mensual</Label>
            <Input
              id="presupuesto"
              type="number"
              min="0"
              step="any"
              value={draft.monthlyBudget}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  monthlyBudget: event.target.value,
                }))
              }
            />
            <p className="text-muted-foreground text-xs">
              Cuánto querés gastar por mes. Hoy:{" "}
              {formatCurrency(Number(draft.monthlyBudget) || 0)}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Label htmlFor="objetivo">Estoy ahorrando para</Label>
            <Input
              id="objetivo"
              value={draft.savingsTitle}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  savingsTitle: event.target.value,
                }))
              }
              placeholder="Ej: vacaciones, notebook, moto"
            />
          </div>

          <div className="flex flex-col gap-3">
            <Label htmlFor="meta">Meta de ahorro</Label>
            <Input
              id="meta"
              type="number"
              min="0"
              step="any"
              value={draft.savingsGoal}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  savingsGoal: event.target.value,
                }))
              }
            />
            <p className="text-muted-foreground text-xs">
              Cuánto querés juntar en total. Dejalo en 0 si todavía no tenés un
              número.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Label htmlFor="ahorro">Ahorro guardado</Label>
            <Input
              id="ahorro"
              type="number"
              min="0"
              step="any"
              value={draft.savedAmount}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  savedAmount: event.target.value,
                }))
              }
            />
          </div>
        </form>
        <DrawerFooter>
          <Button type="submit" form="ajustes">
            Guardar
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

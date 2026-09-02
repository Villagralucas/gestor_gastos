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
import { CategorySelect } from "@/components/dashboard/category-select";
import { TypeToggle } from "@/components/dashboard/type-option";
import { useIsMobile } from "@/hooks/use-mobile";
import { createEmptyForm, normalizeForm } from "@/lib/transactions";

export function AddTransactionDrawer({ onOpenChange, onSubmit, open }) {
  const isMobile = useIsMobile();
  const [form, setForm] = React.useState(createEmptyForm);
  const [error, setError] = React.useState("");
  const [wasOpen, setWasOpen] = React.useState(open);

  // Cada vez que se abre arranca limpio, con la fecha de hoy. Se mira `open`
  // en vez del handler porque el drawer tambien se abre desde el sidebar.
  if (open !== wasOpen) {
    setWasOpen(open);

    if (open) {
      setForm(createEmptyForm());
      setError("");
    }
  }

  function handleOpenChange(nextOpen) {
    onOpenChange(nextOpen);
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const values = normalizeForm(form);

    if (!values) {
      setError("Completá concepto, un monto mayor a cero y fecha.");
      return;
    }

    onSubmit(values);
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
          <DrawerTitle>Nuevo movimiento</DrawerTitle>
          <DrawerDescription>Registrá una compra o un ingreso.</DrawerDescription>
        </DrawerHeader>
        <form
          className="flex flex-col gap-4 overflow-y-auto px-4 text-sm"
          id="nuevo-movimiento"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-3">
            <Label htmlFor="nuevo-concepto">Concepto</Label>
            <Input
              id="nuevo-concepto"
              name="title"
              value={form.title}
              onChange={updateField}
              placeholder="Ej: alquiler, sueldo, nafta"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="nuevo-monto">Monto</Label>
              <Input
                id="nuevo-monto"
                name="amount"
                type="number"
                min="1"
                value={form.amount}
                onChange={updateField}
                placeholder="0"
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="nueva-fecha">Fecha</Label>
              <Input
                id="nueva-fecha"
                name="date"
                type="date"
                value={form.date}
                onChange={updateField}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Label>Tipo</Label>
            <TypeToggle value={form.type} onChange={updateField} />
          </div>

          <div className="flex flex-col gap-3">
            <Label htmlFor="nueva-categoria">Categoría</Label>
            <CategorySelect
              id="nueva-categoria"
              name="category"
              value={form.category}
              onChange={updateField}
            />
          </div>

          {error ? <p className="text-expense">{error}</p> : null}
        </form>
        <DrawerFooter>
          <Button type="submit" form="nuevo-movimiento">
            Agregar movimiento
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

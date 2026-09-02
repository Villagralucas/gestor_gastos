"use client";

import * as React from "react";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCirclePlus,
  IconDotsVertical,
  IconLayoutColumns,
  IconTrash,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { CategorySelect } from "@/components/dashboard/category-select";
import { TypeToggle } from "@/components/dashboard/type-option";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { formFromTransaction, normalizeForm } from "@/lib/transactions";
import { cn } from "@/lib/utils";

function TypeBadge({ type }) {
  const isIncome = type === "income";

  return (
    <Badge
      variant="outline"
      className={cn(
        "px-1.5",
        isIncome ? "text-income" : "text-expense",
      )}
    >
      {isIncome ? <IconTrendingUp /> : <IconTrendingDown />}
      {isIncome ? "Ingreso" : "Gasto"}
    </Badge>
  );
}

function createColumns({ onDelete, onUpdate }) {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Seleccionar todo"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Seleccionar fila"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: "Concepto",
      cell: ({ row }) => (
        <TransactionDrawer onUpdate={onUpdate} transaction={row.original} />
      ),
      enableHiding: false,
    },
    {
      accessorKey: "category",
      header: "Categoría",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.category}
        </Badge>
      ),
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => <TypeBadge type={row.original.type} />,
    },
    {
      accessorKey: "date",
      header: "Fecha",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDate(row.original.date)}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: () => <div className="w-full text-right">Monto</div>,
      cell: ({ row }) => {
        const isIncome = row.original.type === "income";

        return (
          <div
            className={cn(
              "text-right font-medium tabular-nums",
              isIncome ? "text-income" : "text-expense",
            )}
          >
            {isIncome ? "+" : "-"}
            {formatCurrency(row.original.amount)}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
              variant="ghost"
            >
              <IconDotsVertical />
              <span className="sr-only">Abrir acciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem
              onSelect={() => onDelete(row.original)}
              variant="destructive"
            >
              <IconTrash />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableHiding: false,
    },
  ];
}

export function DataTable({ data, onCreate, onDelete, onUpdate }) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [sorting, setSorting] = React.useState([{ id: "date", desc: true }]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [tab, setTab] = React.useState("all");

  const columns = React.useMemo(
    () => createColumns({ onDelete, onUpdate }),
    [onDelete, onUpdate],
  );

  const rows = React.useMemo(
    () => (tab === "all" ? data : data.filter((item) => item.type === tab)),
    [data, tab],
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, columnVisibility, rowSelection, pagination },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const counts = React.useMemo(
    () => ({
      all: data.length,
      income: data.filter((item) => item.type === "income").length,
      expense: data.filter((item) => item.type === "expense").length,
    }),
    [data],
  );

  return (
    <Tabs
      value={tab}
      onValueChange={setTab}
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="filtro-movimientos" className="sr-only">
          Filtrar movimientos
        </Label>
        <Select value={tab} onValueChange={setTab}>
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="filtro-movimientos"
          >
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="income">Ingresos</SelectItem>
            <SelectItem value="expense">Gastos</SelectItem>
          </SelectContent>
        </Select>

        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="all">
            Todos <Badge variant="secondary">{counts.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value="income">
            Ingresos <Badge variant="secondary">{counts.income}</Badge>
          </TabsTrigger>
          <TabsTrigger value="expense">
            Gastos <Badge variant="secondary">{counts.expense}</Badge>
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Columnas</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id === "category"
                      ? "Categoría"
                      : column.id === "type"
                      ? "Tipo"
                      : column.id === "date"
                      ? "Fecha"
                      : column.id === "amount"
                      ? "Monto"
                      : column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" onClick={onCreate}>
            <IconCirclePlus />
            <span className="hidden lg:inline">Agregar movimiento</span>
          </Button>
        </div>
      </div>

      <TabsContent
        value={tab}
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Todavía no cargaste movimientos en este mes.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} de{" "}
            {table.getFilteredRowModel().rows.length} fila(s) seleccionadas.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="filas-por-pagina" className="text-sm font-medium">
                Filas por página
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger size="sm" className="w-20" id="filas-por-pagina">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount() || 1}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Primera página</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Página anterior</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Página siguiente</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Última página</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

function TransactionDrawer({ onUpdate, transaction }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(() => formFromTransaction(transaction));
  const [error, setError] = React.useState("");

  function handleOpenChange(nextOpen) {
    setOpen(nextOpen);

    // Al abrir, el borrador arranca de cero con lo que hay guardado.
    if (nextOpen) {
      setForm(formFromTransaction(transaction));
      setError("");
    }
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

    onUpdate(transaction.id, values);
    setOpen(false);
  }

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {transaction.title}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{transaction.title}</DrawerTitle>
          <DrawerDescription>
            Editá el movimiento y guardá los cambios.
          </DrawerDescription>
        </DrawerHeader>
        <form
          className="flex flex-col gap-4 overflow-y-auto px-4 text-sm"
          id="editar-movimiento"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-3">
            <Label htmlFor="concepto">Concepto</Label>
            <Input
              id="concepto"
              name="title"
              value={form.title}
              onChange={updateField}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="monto">Monto</Label>
              <Input
                id="monto"
                name="amount"
                type="number"
                min="1"
                value={form.amount}
                onChange={updateField}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
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
            <Label htmlFor="categoria">Categoría</Label>
            <CategorySelect
              id="categoria"
              name="category"
              value={form.category}
              onChange={updateField}
            />
          </div>

          {error ? <p className="text-expense">{error}</p> : null}
        </form>
        <DrawerFooter>
          <Button type="submit" form="editar-movimiento">
            Guardar cambios
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

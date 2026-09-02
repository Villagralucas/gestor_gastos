"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatCurrency } from "@/lib/formatters";
import { getMonthlyTrend } from "@/lib/transactions";

export const description = "Ingresos contra gastos, mes a mes";

const chartConfig = {
  income: {
    label: "Ingresos",
    color: "var(--income)",
  },
  expense: {
    label: "Gastos",
    color: "var(--expense)",
  },
};

const ranges = {
  "12m": { months: 12, label: "Último año" },
  "6m": { months: 6, label: "Últimos 6 meses" },
  "3m": { months: 3, label: "Últimos 3 meses" },
};

export function ChartAreaInteractive({ selectedDate, transactions }) {
  const isMobile = useIsMobile();
  const [range, setRange] = React.useState("6m");

  // En pantalla chica no entran 12 columnas, arrancamos mas corto.
  const activeRange = isMobile && range === "12m" ? "6m" : range;
  const { label, months } = ranges[activeRange];

  const data = React.useMemo(
    () => getMonthlyTrend(transactions, selectedDate, months),
    [months, selectedDate, transactions],
  );

  function handleRangeChange(value) {
    if (value) {
      setRange(value);
    }
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Ingresos y gastos</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Cómo venís mes a mes — {label.toLowerCase()}
          </span>
          <span className="@[540px]/card:hidden">{label}</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={activeRange}
            onValueChange={handleRangeChange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="12m">Último año</ToggleGroupItem>
            <ToggleGroupItem value="6m">Últimos 6 meses</ToggleGroupItem>
            <ToggleGroupItem value="3m">Últimos 3 meses</ToggleGroupItem>
          </ToggleGroup>
          <Select value={activeRange} onValueChange={handleRangeChange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Elegir período"
            >
              <SelectValue placeholder="Últimos 6 meses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="12m" className="rounded-lg">
                Último año
              </SelectItem>
              <SelectItem value="6m" className="rounded-lg">
                Últimos 6 meses
              </SelectItem>
              <SelectItem value="3m" className="rounded-lg">
                Últimos 3 meses
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-income)"
                  stopOpacity={0.9}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-income)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-expense)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-expense)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={16}
              className="capitalize"
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value, name) => (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-muted-foreground">
                        {chartConfig[name]?.label ?? name}
                      </span>
                      <span className="font-medium tabular-nums">
                        {formatCurrency(value)}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Area
              dataKey="income"
              type="natural"
              fill="url(#fillIncome)"
              stroke="var(--color-income)"
            />
            <Area
              dataKey="expense"
              type="natural"
              fill="url(#fillExpense)"
              stroke="var(--color-expense)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { getCategoryBreakdown } from "@/lib/transactions";

/**
 * Ranking de gastos del mes por categoria.
 *
 * Las barras se miden contra la categoria mas grande (no contra el total), asi
 * la mas alta llena el ancho y las chicas siguen siendo visibles. Como todas se
 * escalan igual, comparar largos sigue siendo comparar plata. Es una sola serie
 * y cada fila lleva su monto al lado, asi que no hace falta leyenda ni tooltip.
 */
export function CategoryBreakdown({ totalExpense, transactions }) {
  const breakdown = getCategoryBreakdown(transactions, totalExpense);
  const topAmount = breakdown[0]?.amount ?? 0;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Gastos por categoría</CardTitle>
        <CardDescription>En qué se te fue la plata este mes</CardDescription>
      </CardHeader>
      <CardContent>
        {breakdown.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            Todavía no cargaste gastos este mes.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {breakdown.map(({ amount, category, percent }) => (
              <li className="flex flex-col gap-1.5" key={category}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-medium">{category}</span>
                  <span className="text-muted-foreground shrink-0 tabular-nums">
                    {formatCurrency(amount)}
                    <span className="ml-2">{percent}%</span>
                  </span>
                </div>
                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-expense h-full rounded-full"
                    style={{
                      width: `${topAmount > 0 ? (amount / topAmount) * 100 : 0}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

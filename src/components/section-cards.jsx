"use client";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";

/**
 * Variacion contra el mes anterior. Devuelve null cuando el mes anterior fue
 * cero, porque ahi el porcentaje no dice nada (todo seria +infinito).
 */
function getChange(current, previous) {
  if (!previous) {
    return null;
  }

  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}

function TrendBadge({ change, goodWhenDown = false }) {
  if (change === null) {
    return null;
  }

  const isUp = change >= 0;
  const isGood = goodWhenDown ? !isUp : isUp;

  return (
    <Badge variant="outline" className={isGood ? "text-income" : "text-expense"}>
      {isUp ? <IconTrendingUp /> : <IconTrendingDown />}
      {isUp ? "+" : ""}
      {change}%
    </Badge>
  );
}

export function SectionCards({
  monthlyBudget,
  previousTotals,
  savedAmount,
  savingsGoal,
  savingsTitle,
  totals,
}) {
  const incomeChange = getChange(totals.income, previousTotals.income);
  const expenseChange = getChange(totals.expense, previousTotals.expense);
  const balanceChange = getChange(totals.balance, previousTotals.balance);
  const budgetLeft = monthlyBudget - totals.expense;
  const overBudget = budgetLeft < 0;

  // Sin meta cargada no hay barra: mostrar 0% de nada confunde mas que ayudar.
  const savingsProgress =
    savingsGoal > 0
      ? Math.min(Math.round((savedAmount / savingsGoal) * 100), 100)
      : null;
  const savingsLeft = Math.max(savingsGoal - savedAmount, 0);

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Balance del mes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(totals.balance)}
          </CardTitle>
          <CardAction>
            <TrendBadge change={balanceChange} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {totals.balance >= 0 ? (
              <>
                Cerrás en verde <IconTrendingUp className="size-4" />
              </>
            ) : (
              <>
                Gastaste más de lo que entró{" "}
                <IconTrendingDown className="size-4" />
              </>
            )}
          </div>
          <div className="text-muted-foreground">
            Ingresos menos gastos del mes
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ingresos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(totals.income)}
          </CardTitle>
          <CardAction>
            <TrendBadge change={incomeChange} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Lo que entró este mes
          </div>
          <div className="text-muted-foreground">
            {incomeChange === null
              ? "Sin mes anterior para comparar"
              : "Comparado con el mes pasado"}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Gastos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(totals.expense)}
          </CardTitle>
          <CardAction>
            <TrendBadge change={expenseChange} goodWhenDown />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {overBudget ? "Te pasaste del presupuesto" : "Dentro del presupuesto"}
          </div>
          <div className="text-muted-foreground">
            {overBudget
              ? `${formatCurrency(Math.abs(budgetLeft))} por encima`
              : `Te quedan ${formatCurrency(budgetLeft)}`}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ahorro guardado</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(savedAmount)}
          </CardTitle>
          {savingsProgress !== null && (
            <CardAction>
              <Badge variant="outline" className="tabular-nums">
                {savingsProgress}%
              </Badge>
            </CardAction>
          )}
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {savingsTitle}
          </div>
          {savingsProgress === null ? (
            <div className="text-muted-foreground">
              Lo que llevás apartado hasta hoy
            </div>
          ) : (
            <>
              <div
                aria-label={`Progreso de ${savingsTitle}`}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={savingsProgress}
                className="bg-muted h-2 w-full overflow-hidden rounded-full"
                role="progressbar"
              >
                <div
                  className="bg-income h-full rounded-full"
                  style={{ width: `${savingsProgress}%` }}
                />
              </div>
              <div className="text-muted-foreground">
                {savingsLeft > 0
                  ? `Te faltan ${formatCurrency(savingsLeft)} para ${formatCurrency(savingsGoal)}`
                  : `Llegaste a tu meta de ${formatCurrency(savingsGoal)}`}
              </div>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export const categories = [
  "Comida",
  "Transporte",
  "Servicios",
  "Casa",
  "Salud",
  "Ocio",
  "Trabajo",
  "Reservas",
  "Otros",
];

export function getCurrentDate() {
  return inputFromDate(new Date());
}

export function dateFromInput(value) {
  return new Date(`${value}T00:00:00`);
}

export function inputFromDate(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function createEmptyForm(overrides = {}) {
  return {
    title: "",
    amount: "",
    type: "expense",
    category: categories[0],
    date: getCurrentDate(),
    ...overrides,
  };
}

/** Devuelve el form listo para editar un movimiento existente. */
export function formFromTransaction(transaction) {
  return {
    title: transaction.title,
    amount: String(transaction.amount),
    type: transaction.type,
    category: transaction.category,
    date: transaction.date,
  };
}

/**
 * Valida y normaliza lo que carga el usuario. Devuelve `null` si falta algo,
 * asi el que llama decide que hacer con el error.
 */
export function normalizeForm(form) {
  const title = form.title.trim();
  const amount = Number(form.amount);

  if (!title || !Number.isFinite(amount) || amount <= 0 || !form.date) {
    return null;
  }

  return {
    title,
    amount,
    type: form.type,
    category: form.category,
    date: form.date,
  };
}

export function filterByMonth(transactions, month) {
  return transactions.filter((transaction) =>
    transaction.date.startsWith(month),
  );
}

export function getTotals(transactions) {
  return transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === "income") {
        acc.income += transaction.amount;
      } else {
        acc.expense += transaction.amount;
      }
      acc.balance = acc.income - acc.expense;
      return acc;
    },
    { income: 0, expense: 0, balance: 0 },
  );
}

export function getCategoryBreakdown(transactions, totalExpense) {
  const grouped = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((acc, transaction) => {
      acc[transaction.category] =
        (acc[transaction.category] ?? 0) + transaction.amount;
      return acc;
    }, {});

  return Object.entries(grouped)
    .map(([category, amount]) => ({
      category,
      amount,
      percent:
        totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

/** Serie de los ultimos `months` meses terminando en el mes seleccionado. */
export function getMonthlyTrend(transactions, selectedDate, months = 6) {
  const selected = dateFromInput(selectedDate);

  return Array.from({ length: months }, (_, index) => {
    const date = new Date(
      selected.getFullYear(),
      selected.getMonth() - (months - 1 - index),
      1,
    );
    const key = inputFromDate(date).slice(0, 7);
    const label = new Intl.DateTimeFormat("es-AR", { month: "short" }).format(
      date,
    );

    const monthTotals = transactions.reduce(
      (acc, transaction) => {
        if (!transaction.date.startsWith(key)) {
          return acc;
        }

        if (transaction.type === "income") {
          acc.income += transaction.amount;
        } else {
          acc.expense += transaction.amount;
        }

        return acc;
      },
      { income: 0, expense: 0 },
    );

    return {
      ...monthTotals,
      balance: monthTotals.income - monthTotals.expense,
      label,
    };
  });
}

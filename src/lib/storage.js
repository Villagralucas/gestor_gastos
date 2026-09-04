"use client";

import { supabase } from "@/lib/supabase";

/**
 * El estado de la app, respaldado en Supabase.
 *
 * Se mantiene una copia en memoria con la misma forma que tenia cuando todo
 * vivia en el localStorage, y se expone como store externo para leerla con
 * `useSyncExternalStore`. Los componentes no saben de donde salen los datos.
 *
 * Cada escritura es optimista: primero se toca la copia en memoria, asi la
 * pantalla responde al instante como antes, y despues viaja a la base. Si la
 * base la rechaza se vuelve al estado anterior y la funcion tira el error para
 * que quien llamo muestre el aviso.
 */

const FORMAT = "balance/v1";

const defaultSettings = {
  savingsTitle: "Mi objetivo",
  savedAmount: 0,
  savingsGoal: 0,
  monthlyBudget: 180000,
};

function createEmptyData(status = "loading") {
  return { status, transactions: [], settings: { ...defaultSettings } };
}

// En el server siempre la misma referencia, para que la hidratacion no falle.
const serverSnapshot = createEmptyData();
const listeners = new Set();

let snapshot = createEmptyData();
let loadPromise = null;

/** Fila de `savings_goals` en uso, y mapa nombre -> id de categorias. */
let goalId = null;
let categoryIds = new Map();

export function subscribeToData(listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getDataSnapshot() {
  return snapshot;
}

export function getServerDataSnapshot() {
  return serverSnapshot;
}

function publish(next) {
  snapshot = next;

  for (const listener of listeners) {
    listener();
  }
}

/** Carga inicial. Se puede llamar muchas veces: la consulta sale una sola. */
export function initData() {
  if (!loadPromise) {
    loadPromise = fetchAll();
  }

  return loadPromise;
}

async function fetchAll() {
  const [categories, transactions, budgets, goals] = await Promise.all([
    supabase.from("categories").select("id,name"),
    supabase
      .from("transactions")
      .select("id,title,amount,type,date,categories(name)")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("budgets")
      .select("amount")
      .order("month", { ascending: false })
      .limit(1),
    supabase
      .from("savings_goals")
      .select("id,title,target_amount,savings_contributions(amount)")
      .order("created_at")
      .limit(1),
  ]);

  const failed = [categories, transactions, budgets, goals].find(
    (result) => result.error,
  );

  if (failed) {
    publish({ ...snapshot, status: "error" });
    throw new Error(failed.error.message);
  }

  categoryIds = new Map(categories.data.map((row) => [row.name, row.id]));

  const goal = goals.data[0] ?? null;
  goalId = goal?.id ?? null;

  publish({
    status: "ready",
    transactions: transactions.data.map(toTransaction),
    settings: {
      savingsTitle: goal?.title ?? defaultSettings.savingsTitle,
      savingsGoal: Number(goal?.target_amount ?? 0),
      savedAmount: sumContributions(goal),
      monthlyBudget: Number(
        budgets.data[0]?.amount ?? defaultSettings.monthlyBudget,
      ),
    },
  });
}

/** La fila viene con la categoria anidada; los componentes esperan el nombre. */
function toTransaction(row) {
  return {
    id: row.id,
    title: row.title,
    amount: Number(row.amount),
    type: row.type,
    date: row.date,
    category: row.categories?.name ?? "Otros",
  };
}

/** El total ahorrado no se guarda: se suma de los aportes. */
function sumContributions(goal) {
  if (!goal?.savings_contributions) {
    return 0;
  }

  return goal.savings_contributions.reduce(
    (total, row) => total + Number(row.amount),
    0,
  );
}

function requireCategoryId(name) {
  const id = categoryIds.get(name);

  if (!id) {
    throw new Error(`La categoría "${name}" no existe en la base.`);
  }

  return id;
}

export async function addTransaction(values) {
  const categoryId = requireCategoryId(values.category);
  const previous = snapshot;

  // Id provisorio para poder dibujarlo antes de que conteste la base.
  const draftId = crypto.randomUUID();

  publish({
    ...previous,
    transactions: [{ id: draftId, ...values }, ...previous.transactions],
  });

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      title: values.title,
      amount: values.amount,
      type: values.type,
      date: values.date,
      category_id: categoryId,
    })
    .select("id")
    .single();

  if (error) {
    publish(previous);
    throw new Error(error.message);
  }

  publish({
    ...snapshot,
    transactions: snapshot.transactions.map((transaction) =>
      transaction.id === draftId ? { ...transaction, id: data.id } : transaction,
    ),
  });
}

export async function updateTransaction(id, values) {
  const categoryId = requireCategoryId(values.category);
  const previous = snapshot;

  publish({
    ...previous,
    transactions: previous.transactions.map((transaction) =>
      transaction.id === id ? { ...transaction, ...values } : transaction,
    ),
  });

  const { error } = await supabase
    .from("transactions")
    .update({
      title: values.title,
      amount: values.amount,
      type: values.type,
      date: values.date,
      category_id: categoryId,
    })
    .eq("id", id);

  if (error) {
    publish(previous);
    throw new Error(error.message);
  }
}

export async function removeTransaction(id) {
  const previous = snapshot;

  publish({
    ...previous,
    transactions: previous.transactions.filter(
      (transaction) => transaction.id !== id,
    ),
  });

  const { error } = await supabase.from("transactions").delete().eq("id", id);

  if (error) {
    publish(previous);
    throw new Error(error.message);
  }
}

/**
 * Guarda los ajustes. Cada campo vive en un lado distinto de la base, asi que
 * solo se toca lo que vino en el parche.
 */
export async function saveSettings(patch) {
  const previous = snapshot;
  const settings = { ...previous.settings, ...patch };

  publish({ ...previous, settings });

  try {
    if (patch.monthlyBudget !== undefined) {
      await saveBudget(patch.monthlyBudget);
    }

    if (patch.savingsTitle !== undefined || patch.savingsGoal !== undefined) {
      await saveGoal(settings);
    }

    if (patch.savedAmount !== undefined) {
      await saveContribution(
        patch.savedAmount - previous.settings.savedAmount,
        settings,
      );
    }
  } catch (error) {
    publish(previous);
    throw error;
  }
}

/**
 * La base guarda un presupuesto por mes, pero la pantalla todavia maneja uno
 * solo. Hasta que eso cambie se escribe el del mes corriente, que es el que se
 * vuelve a leer al arrancar por ser el mas reciente.
 */
async function saveBudget(amount) {
  const now = new Date();
  const month = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    "01",
  ].join("-");

  const { error } = await supabase
    .from("budgets")
    .upsert({ month, amount }, { onConflict: "month" });

  if (error) {
    throw new Error(error.message);
  }
}

/** Crea el objetivo la primera vez y lo actualiza despues. */
async function saveGoal(settings) {
  const row = {
    title: settings.savingsTitle,
    target_amount: settings.savingsGoal,
  };

  if (goalId) {
    const { error } = await supabase
      .from("savings_goals")
      .update(row)
      .eq("id", goalId);

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  const { data, error } = await supabase
    .from("savings_goals")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  goalId = data.id;
}

/**
 * La pantalla pide un total, pero la base guarda aportes. Se anota la
 * diferencia contra lo que habia, que puede ser negativa si corrigio de mas.
 */
async function saveContribution(delta, settings) {
  if (delta === 0) {
    return;
  }

  if (!goalId) {
    await saveGoal(settings);
  }

  const { error } = await supabase.from("savings_contributions").insert({
    goal_id: goalId,
    amount: delta,
    date: new Date().toISOString().slice(0, 10),
  });

  if (error) {
    throw new Error(error.message);
  }
}

/** Pisa todo con lo que traiga un archivo importado. */
export async function replaceAll(data) {
  const previous = snapshot;

  publish({ ...previous, ...data, status: "ready" });

  try {
    const { error: failedDelete } = await supabase
      .from("transactions")
      .delete()
      .not("id", "is", null);

    if (failedDelete) {
      throw new Error(failedDelete.message);
    }

    if (data.transactions.length > 0) {
      const { error } = await supabase.from("transactions").insert(
        data.transactions.map((transaction) => ({
          title: transaction.title,
          amount: transaction.amount,
          type: transaction.type,
          date: transaction.date,
          category_id: requireCategoryId(transaction.category),
        })),
      );

      if (error) {
        throw new Error(error.message);
      }
    }

    await saveBudget(data.settings.monthlyBudget);
    await saveGoal(data.settings);
    await saveContribution(
      data.settings.savedAmount - previous.settings.savedAmount,
      data.settings,
    );
  } catch (error) {
    publish(previous);
    throw error;
  }

  // Se relee todo para quedarse con los ids que asigno la base.
  loadPromise = null;
  await initData();
}

/** Nombre tipo `balance-2026-09-04.json`. */
function buildExportName(date = new Date()) {
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

  return `balance-${stamp}.json`;
}

/** Baja un .json con todo. Devuelve el nombre del archivo. */
export function downloadData({ transactions, settings }) {
  const name = buildExportName();
  const payload = JSON.stringify(
    {
      format: FORMAT,
      exportedAt: new Date().toISOString(),
      transactions,
      settings,
    },
    null,
    2,
  );
  const url = URL.createObjectURL(
    new Blob([payload], { type: "application/json" }),
  );
  const link = document.createElement("a");

  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  return name;
}

/**
 * Lee un archivo elegido por el usuario. Tira error con un mensaje mostrable
 * si no es un export de Balance.
 */
export async function readImportedFile(file) {
  let parsed;

  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new Error("El archivo no es un JSON valido.");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !Array.isArray(parsed.transactions)
  ) {
    throw new Error("El archivo no parece un export de Balance.");
  }

  return normalizeData(parsed);
}

/** Deja los datos con la forma que espera la app, descartando lo que no sirve. */
function normalizeData(raw) {
  const transactions = Array.isArray(raw?.transactions)
    ? raw.transactions.map(normalizeTransaction).filter(Boolean)
    : [];

  const settings = raw?.settings ?? {};

  return {
    transactions,
    settings: {
      savingsTitle:
        typeof settings.savingsTitle === "string" && settings.savingsTitle.trim()
          ? settings.savingsTitle
          : defaultSettings.savingsTitle,
      savedAmount: positiveNumber(
        settings.savedAmount,
        defaultSettings.savedAmount,
      ),
      savingsGoal: positiveNumber(
        settings.savingsGoal,
        defaultSettings.savingsGoal,
      ),
      monthlyBudget: positiveNumber(
        settings.monthlyBudget,
        defaultSettings.monthlyBudget,
      ),
    },
  };
}

function normalizeTransaction(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const amount = Number(raw.amount);
  const isValid =
    typeof raw.title === "string" &&
    raw.title.trim().length > 0 &&
    Number.isFinite(amount) &&
    amount > 0 &&
    (raw.type === "income" || raw.type === "expense") &&
    typeof raw.category === "string" &&
    typeof raw.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(raw.date);

  if (!isValid) {
    return null;
  }

  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : crypto.randomUUID(),
    title: raw.title.trim(),
    amount,
    type: raw.type,
    category: raw.category,
    date: raw.date,
  };
}

/** Numero mayor o igual a cero, o el default. */
function positiveNumber(value, fallback) {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

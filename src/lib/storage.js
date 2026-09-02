/**
 * Guardado local: todo vive en el localStorage del navegador, sin backend.
 *
 * Se escribe un solo blob bajo `balance:data` para que exportar sea copiar
 * ese objeto tal cual, e importar sea validarlo y pisarlo.
 */

const STORAGE_KEY = "balance:data";
const FORMAT = "balance/v1";

const defaultSettings = {
  savingsTitle: "Mi objetivo",
  savedAmount: 0,
  // 0 = sin meta: la tarjeta de ahorro muestra el total y no la barra.
  savingsGoal: 0,
  monthlyBudget: 180000,
};

function createEmptyData() {
  return { transactions: [], settings: { ...defaultSettings } };
}

/**
 * El localStorage es un sistema externo a React, asi que lo exponemos como un
 * store con `subscribe` / `getSnapshot` para leerlo con `useSyncExternalStore`.
 * Asi no hace falta copiarlo a un useState dentro de un efecto.
 */
const serverSnapshot = createEmptyData();
const listeners = new Set();
let snapshot = null;

export function subscribeToData(listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getDataSnapshot() {
  if (snapshot === null) {
    snapshot = loadData();
  }

  return snapshot;
}

/** En el server (y durante la hidratacion) siempre la misma referencia vacia. */
export function getServerDataSnapshot() {
  return serverSnapshot;
}

/** Unico punto de escritura: guarda en el navegador y avisa a los que miran. */
export function setData(updater) {
  const next =
    typeof updater === "function" ? updater(getDataSnapshot()) : updater;

  snapshot = next;
  saveData(next);

  for (const listener of listeners) {
    listener();
  }
}

function loadData() {
  if (typeof window === "undefined") {
    return createEmptyData();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return createEmptyData();
    }

    return normalizeData(JSON.parse(raw));
  } catch {
    // Si quedo basura de una version vieja arrancamos limpio en vez de romper.
    return createEmptyData();
  }
}

function saveData(data) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Puede fallar si el navegador esta en modo privado o sin espacio.
  }
}

/** Nombre tipo `balance-2026-08-26.json`. */
function buildExportName(date = new Date()) {
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

  return `balance-${stamp}.json`;
}

function buildExportPayload(data) {
  return JSON.stringify(
    { format: FORMAT, exportedAt: new Date().toISOString(), ...data },
    null,
    2,
  );
}

/** Baja un .json con todo. Devuelve el nombre del archivo. */
export function downloadData(data) {
  const name = buildExportName();
  const blob = new Blob([buildExportPayload(data)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
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

  if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.transactions)) {
    throw new Error("El archivo no parece un export de Balance.");
  }

  return normalizeData(parsed);
}

/**
 * Deja los datos con la forma que espera la app, descartando lo que no sirve.
 * Vale tanto para lo que sale del localStorage como para un archivo importado.
 */
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

/**
 * Numero mayor o igual a cero, o el default. Los archivos importados y los
 * datos viejos pueden traer strings, negativos o campos que todavia no existian.
 */
function positiveNumber(value, fallback) {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
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

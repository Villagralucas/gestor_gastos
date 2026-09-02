"use client";

import * as React from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { AddTransactionDrawer } from "@/components/add-transaction-drawer";
import { CategoryBreakdown } from "@/components/category-breakdown";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SettingsDrawer } from "@/components/settings-drawer";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/formatters";
import {
  downloadData,
  getDataSnapshot,
  getServerDataSnapshot,
  readImportedFile,
  setData,
  subscribeToData,
} from "@/lib/storage";
import {
  dateFromInput,
  filterByMonth,
  getCurrentDate,
  getTotals,
  inputFromDate,
} from "@/lib/transactions";

/** Clave `AAAA-MM` del mes anterior al seleccionado. */
function getPreviousMonthKey(selectedDate) {
  const selected = dateFromInput(selectedDate);
  const previous = new Date(selected.getFullYear(), selected.getMonth() - 1, 1);

  return inputFromDate(previous).slice(0, 7);
}

export default function Page() {
  const { toast } = useToast();
  const data = React.useSyncExternalStore(
    subscribeToData,
    getDataSnapshot,
    getServerDataSnapshot,
  );

  const cardsRef = React.useRef(null);
  const tableRef = React.useRef(null);
  const [activePanel, setActivePanel] = React.useState("dashboard");
  const [selectedDate, setSelectedDate] = React.useState(getCurrentDate);
  const [isAdding, setIsAdding] = React.useState(false);
  const [isEditingSettings, setIsEditingSettings] = React.useState(false);

  const { settings, transactions } = data;

  const monthTransactions = React.useMemo(
    () => filterByMonth(transactions, selectedDate.slice(0, 7)),
    [selectedDate, transactions],
  );

  const previousTransactions = React.useMemo(
    () => filterByMonth(transactions, getPreviousMonthKey(selectedDate)),
    [selectedDate, transactions],
  );

  const totals = React.useMemo(
    () => getTotals(monthTransactions),
    [monthTransactions],
  );

  const previousTotals = React.useMemo(
    () => getTotals(previousTransactions),
    [previousTransactions],
  );

  const addTransaction = React.useCallback((values) => {
    setData((current) => ({
      ...current,
      transactions: [
        { id: crypto.randomUUID(), ...values },
        ...current.transactions,
      ],
    }));
  }, []);

  const updateTransaction = React.useCallback((id, values) => {
    setData((current) => ({
      ...current,
      transactions: current.transactions.map((transaction) =>
        transaction.id === id ? { ...transaction, ...values } : transaction,
      ),
    }));
  }, []);

  const removeTransaction = React.useCallback(
    (transaction) => {
      const confirmed = window.confirm(
        `Eliminar "${transaction.title}" por ${formatCurrency(transaction.amount)}?`,
      );

      if (!confirmed) {
        return;
      }

      setData((current) => ({
        ...current,
        transactions: current.transactions.filter(
          (item) => item.id !== transaction.id,
        ),
      }));

      toast({
        variant: "success",
        title: "Movimiento eliminado",
        description: transaction.title,
      });
    },
    [toast],
  );

  function saveSettings(patch) {
    setData((current) => ({
      ...current,
      settings: { ...current.settings, ...patch },
    }));
  }

  function exportData() {
    const name = downloadData(data);

    toast({
      variant: "success",
      title: "Datos exportados",
      description: `Se descargó ${name}.`,
    });
  }

  async function importData(file) {
    try {
      const imported = await readImportedFile(file);

      setData(imported);

      toast({
        variant: "success",
        title: "Datos importados",
        description: `${imported.transactions.length} movimientos cargados.`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "No se pudo importar",
        description: error.message,
      });
    }
  }

  function scrollToPanel(ref, panel) {
    setActivePanel(panel);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      onClick: () => scrollToPanel(cardsRef, "dashboard"),
    },
    {
      id: "movements",
      label: "Movimientos",
      onClick: () => scrollToPanel(tableRef, "movements"),
    },
    {
      id: "savings",
      label: "Ahorro y presupuesto",
      onClick: () => setIsEditingSettings(true),
    },
  ];

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar
        activePanel={activePanel}
        items={navigationItems}
        onCreate={() => setIsAdding(true)}
        variant="inset"
      />
      <SidebarInset>
        <SiteHeader
          onExport={exportData}
          onImport={importData}
          onOpenSettings={() => setIsEditingSettings(true)}
          onSelectedDateChange={setSelectedDate}
          selectedDate={selectedDate}
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div ref={cardsRef}>
                <SectionCards
                  monthlyBudget={settings.monthlyBudget}
                  previousTotals={previousTotals}
                  savedAmount={settings.savedAmount}
                  savingsGoal={settings.savingsGoal}
                  savingsTitle={settings.savingsTitle}
                  totals={totals}
                />
              </div>
              <div className="grid gap-4 px-4 md:gap-6 lg:px-6 @5xl/main:grid-cols-3">
                <div className="@5xl/main:col-span-2">
                  <ChartAreaInteractive
                    selectedDate={selectedDate}
                    transactions={transactions}
                  />
                </div>
                <CategoryBreakdown
                  totalExpense={totals.expense}
                  transactions={monthTransactions}
                />
              </div>
              <div ref={tableRef}>
                <DataTable
                  data={monthTransactions}
                  onCreate={() => setIsAdding(true)}
                  onDelete={removeTransaction}
                  onUpdate={updateTransaction}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      <AddTransactionDrawer
        onOpenChange={setIsAdding}
        onSubmit={addTransaction}
        open={isAdding}
      />
      <SettingsDrawer
        onOpenChange={setIsEditingSettings}
        onSave={saveSettings}
        open={isEditingSettings}
        settings={settings}
      />
    </SidebarProvider>
  );
}

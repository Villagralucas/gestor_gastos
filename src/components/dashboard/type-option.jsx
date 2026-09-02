import { cn } from "@/lib/utils";

/** Radio con pinta de tab, para elegir gasto o ingreso. */
export function TypeOption({ checked, children, ...props }) {
  return (
    <label
      className={cn(
        "flex h-9 items-center justify-center rounded-sm text-sm font-medium text-muted-foreground transition-colors",
        checked && "bg-background text-foreground shadow-sm",
      )}
    >
      <input className="sr-only" type="radio" checked={checked} {...props} />
      {children}
    </label>
  );
}

export function TypeToggle({ name = "type", onChange, value }) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-md bg-muted p-1">
      <TypeOption
        checked={value === "expense"}
        name={name}
        value="expense"
        onChange={onChange}
      >
        Gasto
      </TypeOption>
      <TypeOption
        checked={value === "income"}
        name={name}
        value="income"
        onChange={onChange}
      >
        Ingreso
      </TypeOption>
    </div>
  );
}

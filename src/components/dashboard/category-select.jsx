import { categories } from "@/lib/transactions";
import { cn } from "@/lib/utils";

export function CategorySelect({ className, ...props }) {
  return (
    <select
      className={cn(
        "h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        className,
      )}
      {...props}
    >
      {categories.map((category) => (
        <option key={category}>{category}</option>
      ))}
    </select>
  );
}

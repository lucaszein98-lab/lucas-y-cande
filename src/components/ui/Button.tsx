import { cn } from "@/lib/format";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "gold" | "sea";
export function Button({ variant = "primary", size = "md", loading, className, children, ...rest }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" | "lg"; loading?: boolean }) {
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition active:scale-[.98] disabled:opacity-50",
        size === "sm" && "px-3 py-1.5 text-sm", size === "md" && "px-4 py-2.5 text-sm", size === "lg" && "px-6 py-3.5 text-base",
        variant === "primary" && "bg-noche text-white hover:bg-noche-700",
        variant === "secondary" && "border border-noche-100 bg-white text-noche hover:border-noche-300",
        variant === "ghost" && "text-noche hover:bg-noche-100/60",
        variant === "danger" && "bg-malva text-white hover:opacity-90",
        variant === "gold" && "bg-vela text-white hover:bg-vela-600",
        variant === "sea" && "bg-mar text-white hover:bg-mar-600",
        className,
      )}>
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

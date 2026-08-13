import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-500",
  secondary: "bg-slate-700 text-slate-100 hover:bg-slate-600",
  ghost: "bg-transparent text-slate-300 hover:bg-slate-800",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

type BadgeProps = {
  children: ReactNode;
  tone?: "neutral" | "success" | "error" | "warning";
  className?: string;
};

const badgeToneClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "border-slate-600 bg-slate-800 text-slate-200",
  success: "border-emerald-700/80 bg-emerald-950/60 text-emerald-300",
  error: "border-rose-700/80 bg-rose-950/60 text-rose-300",
  warning: "border-amber-700/80 bg-amber-950/60 text-amber-300",
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`cogent-badge inline-flex items-center justify-center whitespace-nowrap rounded-full border font-medium ${badgeToneClasses[tone]} ${className}`}
      style={{
        padding: 4,
        fontSize: 8,
        lineHeight: 1,
        boxSizing: "border-box",
      }}
    >
      {children}
    </span>
  );
}

type PanelProps = {
  title: ReactNode;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
};

export function Panel({ title, children, className = "", action }: PanelProps) {
  return (
    <section
      className={`flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 ${className}`}
    >
      <header className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
        {action}
      </header>
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </section>
  );
}

import React from "react";
import { cn } from "@/lib/utils";

export function PageShell({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1600px] p-8 flex flex-col gap-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Section({
  title,
  description,
  children,
  className,
  ...props
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
} & React.ComponentProps<"section">) {
  return (
    <section className={cn("flex flex-col gap-4 w-full", className)} {...props}>
      {(title || description) && (
        <div className="flex flex-col gap-1">
          {title && <h3 className="text-lg font-bold text-foreground">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="w-full">{children}</div>
    </section>
  );
}

export function SidebarItem({
  children,
  active,
  className,
  ...props
}: {
  active?: boolean;
} & React.ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "w-full text-left px-4 py-3 rounded-xl transition-colors font-medium text-sm outline-none",
        active
          ? "bg-secondary text-foreground font-semibold"
          : "text-muted-foreground hover:bg-secondary/55 hover:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

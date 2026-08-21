'use client';
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4", className)}>
      <div className="space-y-1 min-w-0">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap">{children}</div>}
    </div>
  );
}

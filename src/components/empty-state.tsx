'use client';
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

/**
 * Enterprise Empty State Component
 * 
 * Professional empty state with:
 * - Proper icon sizing (size-14) with muted treatment
 * - typo-card-title for heading
 * - typo-body for description
 * - Consistent spacing and centered layout
 */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}>
      {Icon && (
        <div className="size-14 rounded-full bg-muted/50 flex items-center justify-center mb-5">
          <Icon className="size-7 text-muted-foreground/60" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="typo-card-title">{title}</h3>
      {description && (
        <p className="typo-body text-muted-foreground mt-2 max-w-md leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <Button 
          className="mt-6 shadow-sm hover:shadow transition-shadow" 
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

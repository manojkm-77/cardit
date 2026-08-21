'use client';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface CardSideTabsProps {
  value: 'front' | 'back';
  onChange: (side: 'front' | 'back') => void;
  className?: string;
}

/** Shared Front/Back switcher used by every card surface. */
export function CardSideTabs({ value, onChange, className }: CardSideTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onChange(next as 'front' | 'back')}
      className={cn("w-fit", className)}
    >
      <TabsList>
        <TabsTrigger value="front" className="px-4">Front</TabsTrigger>
        <TabsTrigger value="back" className="px-4">Back</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

'use client';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatasetSelector } from "@/components/dataset-selector";
import { useCarditStore } from "@/lib/store";
import { Search, ChevronRight, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerificationToolbarProps {
  title: string;
  description?: string;
  onReviewBatch: () => void;
  filterMode: 'ALL' | 'PENDING';
  onToggleFilter: () => void;
  showPendingFilter?: boolean;
  showDatasetSelector?: boolean;
  className?: string;
}

export function VerificationToolbar({
  title, 
  description, 
  onReviewBatch,
  filterMode, 
  onToggleFilter,
  showPendingFilter = true, 
  showDatasetSelector = true,
  className
}: VerificationToolbarProps) {
  const { state, setSearchQuery, datasetCounters } = useCarditStore();

  return (
    <Card className={cn("", className)}>
      <div className="p-4 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {showDatasetSelector && <DatasetSelector />}
            
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/50 rounded-md px-3 py-1.5 border border-border">
              <span>Total: <strong className="text-foreground">{datasetCounters.total}</strong></span>
              <span className="text-border">|</span>
              <span>Pending: <strong className="text-foreground">{datasetCounters.pending}</strong></span>
              <span className="text-border">|</span>
              <span>Verified: <strong className="text-foreground">{datasetCounters.verified}</strong></span>
              <span className="text-border">|</span>
              <span className="text-foreground font-bold">{datasetCounters.verificationPercent}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[180px] sm:min-w-[240px] max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, admission no, father name, class, mobile..."
              value={state.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex items-center gap-2">
            {showPendingFilter && (
              <Button 
                variant={filterMode === 'PENDING' ? 'default' : 'outline'} 
                size="sm" 
                onClick={onToggleFilter}
              >
                <Filter className="size-4" />
                {filterMode === 'PENDING' ? 'Showing Pending' : 'Filter Pending'}
              </Button>
            )}
            
            {datasetCounters.total > 0 && (
              <Button 
                size="sm" 
                onClick={onReviewBatch}
              >
                Review Batch 
                <ChevronRight className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}


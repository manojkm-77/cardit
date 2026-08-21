'use client';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DatasetStatus, JobStatus, StudentStatus } from "@/lib/types";
import { DATASET_STATUS_LABELS, JOB_STATUS_LABELS } from "@/lib/constants";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

/**
 * Enterprise Status Badge System
 * 
 * Uses ONLY semantic shadcn tokens - no custom colors
 * Variants map to design intent:
 * - default: Success/completed states (Verified, Approved, Printed)
 * - secondary: In-progress/processing states (Pending, Queued, Printing)
 * - outline: Inactive/draft states (Draft, Archived)
 * - destructive: Error/rejection states (Rejected, Failed)
 */

const statusMap: Record<StudentStatus, BadgeVariant> = {
  'Draft': 'outline',
  'Pending': 'secondary',
  'Verified': 'default',
  'Approved': 'default',
  'Queued': 'secondary',
  'Printing': 'secondary',
  'Printed': 'default',
  'Delivered': 'default',
  'Archived': 'outline',
  'Rejected': 'destructive',
};

interface StatusBadgeProps {
  status: StudentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge 
      variant={statusMap[status] || 'outline'} 
      className={cn("capitalize font-medium shadow-sm", className)}
    >
      {status}
    </Badge>
  );
}

const datasetStatusMap: Record<DatasetStatus, BadgeVariant> = {
  'draft': 'outline',
  'uploaded': 'secondary',
  'verified': 'default',
  'locked': 'default',
  'archived': 'outline',
};

export function DatasetStatusBadge({ status, className }: { status: DatasetStatus; className?: string }) {
  return (
    <Badge 
      variant={datasetStatusMap[status] || 'outline'} 
      className={cn("font-medium shadow-sm", className)}
    >
      {DATASET_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

const jobStatusMap: Record<JobStatus, BadgeVariant> = {
  'pending': 'outline',
  'processing': 'secondary',
  'completed': 'default',
  'failed': 'destructive',
};

export function JobStatusBadge({ status, className }: { status: JobStatus; className?: string }) {
  return (
    <Badge 
      variant={jobStatusMap[status] || 'outline'} 
      className={cn("capitalize font-medium shadow-sm", className)}
    >
      {JOB_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

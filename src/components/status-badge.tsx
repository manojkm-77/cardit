'use client';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DatasetStatus, JobStatus, StudentStatus } from "@/lib/types";
import { DATASET_STATUS_LABELS, JOB_STATUS_LABELS } from "@/lib/constants";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

const statusMap: Record<StudentStatus, BadgeVariant> = {
  'Draft': 'outline',
  'Pending': 'secondary',
  'Verified': 'default',
  'Approved': 'default',
  'Queued': 'secondary',
  'Printing': 'secondary',
  'Printed': 'default',
  'Delivered': 'secondary',
  'Archived': 'outline',
  'Rejected': 'destructive',
};

interface StatusBadgeProps {
  status: StudentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant={statusMap[status] || 'outline'} className={cn("capitalize", className)}>
      {status}
    </Badge>
  );
}

const datasetStatusMap: Record<DatasetStatus, BadgeVariant> = {
  'draft': 'outline',
  'uploaded': 'secondary',
  'verified': 'default',
  'locked': 'secondary',
  'archived': 'outline',
};

export function DatasetStatusBadge({ status, className }: { status: DatasetStatus; className?: string }) {
  return (
    <Badge variant={datasetStatusMap[status] || 'outline'} className={className}>
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
    <Badge variant={jobStatusMap[status] || 'outline'} className={className}>
      {JOB_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

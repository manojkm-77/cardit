// Shared, presentation-level constants for CardIT.io domain enums.
// Anything that needs a human label for a domain value reads it from here so
// role/status wording stays identical across the platform.
import { DatasetStatus, JobStatus, JobType, UserRole } from '@/lib/types';

export const USER_ROLES: UserRole[] = [
  'Super Admin',
  'School Admin',
  'Data Entry Operator',
  'Verifier',
  'Print Operator',
];

/** Compact labels used in dense surfaces (nav, table cells, badges). */
export const ROLE_LABELS: Record<UserRole, string> = {
  'Super Admin': 'Super Admin',
  'School Admin': 'School Admin',
  'Data Entry Operator': 'Data Entry',
  Verifier: 'Verifier',
  'Print Operator': 'Print Operator',
};

export const DATASET_STATUS_LABELS: Record<DatasetStatus, string> = {
  draft: 'Draft',
  uploaded: 'Uploaded',
  verified: 'Verified',
  locked: 'Locked',
  archived: 'Archived',
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  pdf_generation: 'PDF Generation',
  bulk_import: 'Bulk Import',
  face_crop: 'Face Crop',
  qr_generation: 'QR Generation',
  photo_match: 'Photo Match',
  excel_import: 'Excel Import',
};

export function roleLabel(role: UserRole): string {
  return ROLE_LABELS[role] ?? role;
}

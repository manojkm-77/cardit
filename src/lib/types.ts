// Data Models & Interfaces for CardIT.io

export type UserRole = 'Super Admin' | 'School Admin' | 'Data Entry Operator' | 'Verifier' | 'Print Operator';

export type StudentStatus = 
  | 'Draft' 
  | 'Pending' 
  | 'Verified' 
  | 'Approved' 
  | 'Queued' 
  | 'Printing' 
  | 'Printed' 
  | 'Delivered' 
  | 'Archived' 
  | 'Rejected';

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'phone' | 'photo';

export type DatasetStatus = 'draft' | 'uploaded' | 'verified' | 'locked' | 'archived';

export type JobType =
  | 'pdf_generation'
  | 'bulk_import'
  | 'face_crop'
  | 'qr_generation'
  | 'photo_match'
  | 'excel_import';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type CropData = {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId?: string;
  avatarUrl?: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  logoUrl?: string;
  address: string;
  affiliationNo?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface AcademicYear {
  id: string;
  schoolId: string;
  name: string; // e.g. "2026-27"
  isCurrent: boolean;
  startDate?: string;
  endDate?: string;
}

export interface Dataset {
  id: string;
  schoolId: string;
  academicYearId: string;
  name: string; // e.g. "Class 1 Dataset"
  code?: string;
  totalStudents: number;
  verifiedCount?: number;
  printedCount?: number;
  status: DatasetStatus;
  excelUploaded: boolean;
  photosUploaded: boolean;
  isMerged: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface DatasetField {
  id: string;
  datasetId: string;
  fieldName: string;
  fieldKey: string;
  fieldType: FieldType;
  isRequired: boolean;
  isSystem: boolean;
  visibility: boolean;
  sortOrder: number;
  options?: string[];
}

export interface Student {
  id: string;
  datasetId: string;
  schoolId?: string;
  admissionNo: string;
  name: string;
  fatherName: string;
  className: string;
  section?: string;
  photoUrl?: string;
  originalPhotoUrl?: string;
  photoCrop?: CropData;
  photoRotation?: number;
  photoUpdatedAt?: string;
  photoMatched?: boolean;
  photoCropped?: boolean;
  status: StudentStatus;
  rejectionReason?: string;
  qrUuid?: string;
  dynamicData: Record<string, string>;
  verifiedAt?: string;
  verifiedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  printedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ElementType = 'text' | 'dynamic_field' | 'qr_code' | 'barcode' | 'photo' | 'shape' | 'signature' | 'logo';

export interface TemplateElement {
  id: string;
  type: ElementType;
  label: string;
  content?: string;
  fieldKey?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontColor?: string;
  fontWeight?: string;
  fontFamily?: string;
  align?: 'left' | 'center' | 'right';
  borderRadius?: number | string;
  backgroundColor?: string;
  strokeWidth?: number;
  strokeColor?: string;
  zIndex: number;
}

export interface CardTemplate {
  id: string;
  schoolId: string;
  name: string;
  type?: string;
  widthMm?: number;
  heightMm?: number;
  accentColor?: string;
  isDefault?: boolean;
  cardType?: 'ID Card' | 'Library Card' | 'Transport Card' | 'Hall Ticket' | 'Fee Receipt';
  orientation: 'landscape' | 'portrait';
  frontElements: TemplateElement[];
  backElements: TemplateElement[];
  bgFrontColor: string;
  bgBackColor: string;
  bgFrontImage?: string;
  bgBackImage?: string;
}

export interface AuditLog {
  id: string;
  schoolId?: string;
  timestamp: string;
  userId?: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
}

export interface JobQueueItem {
  id: string;
  title: string;
  type: JobType;
  datasetId: string;
  progress: number;
  status: JobStatus;
  details: string;
  createdAt: string;
}


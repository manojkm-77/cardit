'use client';

import { useState, useEffect } from 'react';
import { 
  School, AcademicYear, Dataset, DatasetField, Student, 
  CardTemplate, AuditLog, User, UserRole, JobQueueItem, StudentStatus 
} from './types';
import { 
  INITIAL_SCHOOLS, INITIAL_ACADEMIC_YEARS, INITIAL_DATASETS, 
  INITIAL_DATASET_FIELDS, INITIAL_STUDENTS, INITIAL_CARD_TEMPLATES, 
  INITIAL_AUDIT_LOGS, INITIAL_USERS, INITIAL_JOBS 
} from './initialData';

const STORAGE_KEY = 'cardit_platform_state_v1';

/**
 * Collision-free client-side id generator. `Date.now()` alone repeats when two
 * records are created inside the same millisecond, which produced duplicate
 * audit-log keys; the random suffix removes that.
 */
const createId = (prefix: string): string => {
  const random =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
};

interface PlatformState {
  currentSchoolId: string;
  currentAcademicYearId: string;
  currentDatasetId: string;
  currentUserRole: UserRole;
  currentUserId: string;
  schools: School[];
  academicYears: AcademicYear[];
  datasets: Dataset[];
  datasetFields: DatasetField[];
  students: Student[];
  cardTemplates: CardTemplate[];
  auditLogs: AuditLog[];
  users: User[];
  jobQueue: JobQueueItem[];
  searchQuery: string;
  statusFilter: string;
}

const cloneDefaultState = (): PlatformState => JSON.parse(JSON.stringify(defaultState));

const defaultState: PlatformState = {
  currentSchoolId: 'school-gkb',
  currentAcademicYearId: 'ay-2026',
  currentDatasetId: 'ds-c1',
  currentUserRole: 'School Admin',
  currentUserId: 'usr-1',
  schools: INITIAL_SCHOOLS,
  academicYears: INITIAL_ACADEMIC_YEARS,
  datasets: INITIAL_DATASETS,
  datasetFields: INITIAL_DATASET_FIELDS,
  students: INITIAL_STUDENTS,
  cardTemplates: INITIAL_CARD_TEMPLATES,
  auditLogs: INITIAL_AUDIT_LOGS,
  users: INITIAL_USERS,
  jobQueue: INITIAL_JOBS,
  searchQuery: '',
  statusFilter: 'ALL'
};

/** Draft of an audit entry; the user/school context is filled in from state. */
interface LogDraft {
  action: string;
  entity: string;
  entityId: string;
  details: string;
  oldValue?: string;
  newValue?: string;
}

const buildLog = (prev: PlatformState, draft: LogDraft): AuditLog => {
  const currentUser = prev.users.find((u) => u.id === prev.currentUserId);
  return {
    id: createId('log'),
    schoolId: prev.currentSchoolId,
    userId: prev.currentUserId,
    userName: currentUser ? currentUser.name : 'User',
    userRole: prev.currentUserRole,
    ipAddress: '127.0.0.1',
    timestamp: new Date().toISOString(),
    ...draft,
  };
};

const VERIFIED_STATUSES: StudentStatus[] = ['Verified', 'Approved', 'Printed'];

/** Single implementation of dataset roll-up counters. */
const recountDatasets = (
  students: Student[],
  datasets: Dataset[],
  datasetId: string,
  now: string
): Dataset[] => {
  const scoped = students.filter((s) => s.datasetId === datasetId);
  const verifiedCount = scoped.filter((s) => VERIFIED_STATUSES.includes(s.status)).length;
  const printedCount = scoped.filter((s) => s.status === 'Printed').length;
  return datasets.map((d) =>
    d.id === datasetId
      ? { ...d, totalStudents: scoped.length, verifiedCount, printedCount, updatedAt: now }
      : d
  );
};

export function useCarditStore() {
  const [state, setState] = useState<PlatformState>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from LocalStorage on mount
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Hydrating external storage state on mount is the intended sync source.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error('Failed to load state from storage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save state to LocalStorage on change
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to storage', e);
    }
  }, [state, isLoaded]);

  // Actions
  const setCurrentSchool = (schoolId: string) => {
    setState((prev) => ({ ...prev, currentSchoolId: schoolId }));
  };

  const setCurrentAcademicYear = (ayId: string) => {
    setState((prev) => ({ ...prev, currentAcademicYearId: ayId }));
  };

  const setCurrentDataset = (datasetId: string) => {
    setState((prev) => ({ ...prev, currentDatasetId: datasetId }));
  };

  const setCurrentUserRole = (role: UserRole) => {
    setState((prev) => ({ ...prev, currentUserRole: role }));
  };

  const setSearchQuery = (query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query }));
  };

  const setStatusFilter = (filter: string) => {
    setState((prev) => ({ ...prev, statusFilter: filter }));
  };

  /**
   * Applies a state transform and its audit entries in one atomic update.
   * Reading `prev` inside the updater (instead of the render-scoped `state`)
   * is what keeps rapid successive actions from operating on stale students.
   */
  const commit = (
    transform: (prev: PlatformState) => { next: PlatformState; logs?: LogDraft[] } | null
  ) => {
    setState((prev) => {
      const result = transform(prev);
      if (!result) return prev;
      const drafts = result.logs ?? [];
      if (drafts.length === 0) return result.next;
      const entries = drafts.map((draft) => buildLog(prev, draft));
      return { ...result.next, auditLogs: [...entries.reverse(), ...result.next.auditLogs] };
    });
  };

  const logAction = (action: string, entity: string, entityId: string, details: string, oldValue?: string, newValue?: string) => {
    commit((prev) => ({
      next: prev,
      logs: [{ action, entity, entityId, details, oldValue, newValue }],
    }));
  };

  const updateStudent = (studentId: string, updates: Partial<Student>) => {
    commit((prev) => {
      const existing = prev.students.find((s) => s.id === studentId);
      if (!existing) return null;

      const now = new Date().toISOString();
      const students = prev.students.map((s) =>
        s.id === studentId ? { ...s, ...updates, updatedAt: now } : s
      );

      return {
        next: {
          ...prev,
          students,
          datasets: recountDatasets(students, prev.datasets, existing.datasetId, now),
        },
        logs: [
          {
            action: 'UPDATE_STUDENT',
            entity: 'Student',
            entityId: studentId,
            details: `Updated student record ${existing.name} (${existing.admissionNo})`,
          },
        ],
      };
    });
  };

  const applyStatusChange = (studentId: string, status: StudentStatus, action: string) => {
    commit((prev) => {
      const existing = prev.students.find((s) => s.id === studentId);
      if (!existing) return null;
      // Already in the target state: skip so repeated clicks cannot append
      // duplicate audit entries for the same transition.
      if (existing.status === status) return null;

      const now = new Date().toISOString();
      const currentUser = prev.users.find((u) => u.id === prev.currentUserId);
      const currentUserName = currentUser ? currentUser.name : prev.currentUserId;

      const updates: Partial<Student> = { status, updatedAt: now };
      if (status === 'Verified') {
        updates.verifiedAt = now;
        updates.verifiedBy = currentUserName;
      } else if (status === 'Approved') {
        updates.approvedAt = now;
        updates.approvedBy = currentUserName;
      }

      const students = prev.students.map((s) => (s.id === studentId ? { ...s, ...updates } : s));

      return {
        next: {
          ...prev,
          students,
          datasets: recountDatasets(students, prev.datasets, existing.datasetId, now),
        },
        logs: [
          {
            action,
            entity: 'Student',
            entityId: studentId,
            details: `${status} student ${existing.name} (${existing.admissionNo})`,
            oldValue: existing.status,
            newValue: status,
          },
        ],
      };
    });
  };

  const verifyStudent = (studentId: string) => {
    applyStatusChange(studentId, 'Verified', 'VERIFY_STUDENT');
  };

  const approveStudent = (studentId: string) => {
    applyStatusChange(studentId, 'Approved', 'APPROVE_STUDENT');
  };

  const verifyAllInDataset = (datasetId: string) => {
    commit((prev) => {
      const now = new Date().toISOString();
      const currentUser = prev.users.find((u) => u.id === prev.currentUserId);
      const currentUserName = currentUser ? currentUser.name : prev.currentUserId;

      const eligible = prev.students.filter(
        (s) => s.datasetId === datasetId && s.status !== 'Printed' && s.status !== 'Approved' && s.status !== 'Verified'
      );
      if (eligible.length === 0) return null;

      const eligibleIds = new Set(eligible.map((s) => s.id));
      const students = prev.students.map((s) =>
        eligibleIds.has(s.id)
          ? { ...s, status: 'Verified' as StudentStatus, verifiedAt: now, verifiedBy: currentUserName, updatedAt: now }
          : s
      );

      return {
        next: {
          ...prev,
          students,
          datasets: recountDatasets(students, prev.datasets, datasetId, now),
        },
        logs: [
          {
            action: 'VERIFY_ALL',
            entity: 'Dataset',
            entityId: datasetId,
            details: `Bulk verified ${eligible.length} eligible student${eligible.length === 1 ? '' : 's'} in dataset ${datasetId}`,
            newValue: 'Verified',
          },
        ],
      };
    });
  };

  const lockDataset = (datasetId: string) => {
    commit((prev) => {
      const existing = prev.datasets.find((d) => d.id === datasetId);
      if (!existing || existing.status === 'locked') return null;
      const now = new Date().toISOString();
      return {
        next: {
          ...prev,
          datasets: prev.datasets.map((d) => (d.id === datasetId ? { ...d, status: 'locked', updatedAt: now } : d)),
        },
        logs: [
          {
            action: 'LOCK_DATASET',
            entity: 'Dataset',
            entityId: datasetId,
            details: `Locked dataset ${existing.name} against further edits`,
            oldValue: existing.status,
            newValue: 'locked',
          },
        ],
      };
    });
  };

  const mergeDataset = (datasetId: string) => {
    commit((prev) => {
      const existing = prev.datasets.find((d) => d.id === datasetId);
      if (!existing) return null;
      const now = new Date().toISOString();
      return {
        next: {
          ...prev,
          datasets: prev.datasets.map((d) =>
            d.id === datasetId
              ? { ...d, isMerged: true, excelUploaded: true, photosUploaded: true, updatedAt: now }
              : d
          ),
        },
        logs: [
          {
            action: 'MERGE_DATASET',
            entity: 'Dataset',
            entityId: datasetId,
            details: `Merged Excel student data and photo ZIP archive for dataset ${existing.name}`,
          },
        ],
      };
    });
  };

  const archiveDataset = (datasetId: string) => {
    commit((prev) => {
      const existing = prev.datasets.find((d) => d.id === datasetId);
      if (!existing || existing.status === 'archived') return null;
      const now = new Date().toISOString();
      return {
        next: {
          ...prev,
          datasets: prev.datasets.map((d) => (d.id === datasetId ? { ...d, status: 'archived', updatedAt: now } : d)),
        },
        logs: [
          {
            action: 'ARCHIVE_DATASET',
            entity: 'Dataset',
            entityId: datasetId,
            details: `Archived dataset ${existing.name}`,
            oldValue: existing.status,
            newValue: 'archived',
          },
        ],
      };
    });
  };

  const addDatasetField = (field: Omit<DatasetField, 'id'>) => {
    const newField: DatasetField = { ...field, id: createId('f') };
    commit((prev) => ({
      next: { ...prev, datasetFields: [...prev.datasetFields, newField] },
      logs: [
        {
          action: 'ADD_FIELD',
          entity: 'DatasetField',
          entityId: newField.id,
          details: `Added dynamic field '${field.fieldName}' to dataset ${field.datasetId}`,
          newValue: field.fieldKey,
        },
      ],
    }));
    return newField.id;
  };

  const updateDatasetField = (fieldId: string, updates: Partial<DatasetField>) => {
    commit((prev) => {
      const existing = prev.datasetFields.find((f) => f.id === fieldId);
      if (!existing) return null;
      return {
        next: {
          ...prev,
          datasetFields: prev.datasetFields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
        },
        logs: [
          {
            action: 'UPDATE_FIELD',
            entity: 'DatasetField',
            entityId: fieldId,
            details: `Updated dynamic field '${existing.fieldName}'`,
          },
        ],
      };
    });
  };

  const deleteDatasetField = (fieldId: string) => {
    commit((prev) => {
      const existing = prev.datasetFields.find((f) => f.id === fieldId);
      if (!existing) return null;
      return {
        next: { ...prev, datasetFields: prev.datasetFields.filter((f) => f.id !== fieldId) },
        logs: [
          {
            action: 'DELETE_FIELD',
            entity: 'DatasetField',
            entityId: fieldId,
            details: `Deleted dynamic field '${existing.fieldName}'`,
            oldValue: existing.fieldKey,
          },
        ],
      };
    });
  };

  const updateCardTemplate = (templateId: string, updates: Partial<CardTemplate>) => {
    commit((prev) => {
      const existing = prev.cardTemplates.find((t) => t.id === templateId);
      if (!existing) return null;
      return {
        next: {
          ...prev,
          cardTemplates: prev.cardTemplates.map((t) => (t.id === templateId ? { ...t, ...updates } : t)),
        },
        logs: [
          {
            action: 'UPDATE_TEMPLATE',
            entity: 'CardTemplate',
            entityId: templateId,
            details: `Updated card template '${existing.name}'`,
          },
        ],
      };
    });
  };

  const enqueueJob = (job: Omit<JobQueueItem, 'id' | 'createdAt'>) => {
    const newJob: JobQueueItem = {
      ...job,
      id: createId('job'),
      createdAt: new Date().toISOString(),
    };
    commit((prev) => ({
      next: { ...prev, jobQueue: [newJob, ...prev.jobQueue] },
      logs: [
        {
          action: 'ENQUEUE_JOB',
          entity: 'JobQueueItem',
          entityId: newJob.id,
          details: `Queued background job: ${newJob.title}`,
          newValue: newJob.status,
        },
      ],
    }));
    return newJob.id;
  };

  const updateJob = (jobId: string, updates: Partial<JobQueueItem>) => {
    commit((prev) => {
      const existing = prev.jobQueue.find((j) => j.id === jobId);
      if (!existing) return null;
      const next = {
        ...prev,
        jobQueue: prev.jobQueue.map((j) => (j.id === jobId ? { ...j, ...updates } : j)),
      };
      if (!updates.status || updates.status === existing.status) return { next };
      return {
        next,
        logs: [
          {
            action: 'UPDATE_JOB',
            entity: 'JobQueueItem',
            entityId: jobId,
            details: `Job '${existing.title}' moved to ${updates.status}`,
            oldValue: existing.status,
            newValue: updates.status,
          },
        ],
      };
    });
  };

  const removeJob = (jobId: string) => {
    commit((prev) => {
      const existing = prev.jobQueue.find((j) => j.id === jobId);
      if (!existing) return null;
      return {
        next: { ...prev, jobQueue: prev.jobQueue.filter((j) => j.id !== jobId) },
        logs: [
          {
            action: 'REMOVE_JOB',
            entity: 'JobQueueItem',
            entityId: jobId,
            details: `Removed background job: ${existing.title}`,
            oldValue: existing.status,
          },
        ],
      };
    });
  };

  const resetToDefaults = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setState(cloneDefaultState());
  };

  // Helper getters
  const currentSchool = state.schools.find((s) => s.id === state.currentSchoolId) || state.schools[0];
  const currentAcademicYear = state.academicYears.find((ay) => ay.id === state.currentAcademicYearId) || state.academicYears[0];
  const currentDataset = state.datasets.find((d) => d.id === state.currentDatasetId) || state.datasets[0];
  const currentTemplate = state.cardTemplates.find((t) => t.schoolId === state.currentSchoolId) || state.cardTemplates[0];

  const currentDatasetFields = state.datasetFields.filter((f) => f.datasetId === state.currentDatasetId || f.isSystem);

  const datasetStudents = state.students.filter((s) => {
    if (state.currentDatasetId === 'ALL') return true;
    return s.datasetId === state.currentDatasetId;
  });

  const filteredStudents = datasetStudents.filter((s) => {
    // Status filter
    if (state.statusFilter !== 'ALL') {
      if (state.statusFilter === 'NO_PHOTO' && s.photoUrl) return false;
      if (state.statusFilter === 'MISSING_DATA' && s.fatherName && s.dynamicData.mobile && s.dynamicData.dob) return false;
      if (state.statusFilter === 'PENDING' && s.status !== 'Pending') return false;
      if (state.statusFilter === 'VERIFIED' && s.status !== 'Verified' && s.status !== 'Approved') return false;
      if (state.statusFilter === 'PRINTED' && s.status !== 'Printed') return false;
      if (['Draft', 'Pending', 'Verified', 'Approved', 'Printing', 'Printed', 'Delivered', 'Archived', 'Rejected'].includes(state.statusFilter) && s.status !== state.statusFilter) return false;
    }

    // Search query filter
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchAdm = s.admissionNo.toLowerCase().includes(q);
      const matchFather = s.fatherName.toLowerCase().includes(q);
      const matchClass = s.className.toLowerCase().includes(q);
      const matchMobile = (s.dynamicData.mobile || '').toLowerCase().includes(q);
      return matchName || matchAdm || matchFather || matchClass || matchMobile;
    }

    return true;
  });

  const total = datasetStudents.length;
  const verified = datasetStudents.filter((s) => s.status === 'Verified' || s.status === 'Approved').length;

  const datasetCounters = {
    total,
    noPhoto: datasetStudents.filter((s) => !s.photoUrl).length,
    missingData: datasetStudents.filter((s) => !s.fatherName || !s.dynamicData.mobile || !s.dynamicData.dob).length,
    pending: datasetStudents.filter((s) => s.status === 'Pending').length,
    verified,
    inPrintQueue: datasetStudents.filter((s) => s.status === 'Queued' || s.status === 'Printing').length,
    printed: datasetStudents.filter((s) => s.status === 'Printed').length,
    verificationPercent: total === 0 ? 0 : Math.max(0, Math.min(100, Math.round((verified / total) * 100)))
  };

  return {
    state,
    isLoaded,
    currentSchool,
    currentAcademicYear,
    currentDataset,
    currentTemplate,
    currentDatasetFields,
    datasetStudents,
    filteredStudents,
    datasetCounters,
    logAction,
    setCurrentSchool,
    setCurrentAcademicYear,
    setCurrentDataset,
    setCurrentUserRole,
    setSearchQuery,
    setStatusFilter,
    updateStudent,
    verifyStudent,
    approveStudent,
    verifyAllInDataset,
    lockDataset,
    mergeDataset,
    archiveDataset,
    addDatasetField,
    updateDatasetField,
    deleteDatasetField,
    updateCardTemplate,
    enqueueJob,
    updateJob,
    removeJob,
    resetToDefaults
  };
}


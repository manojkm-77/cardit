'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Student, CropData } from '@/lib/types';

interface UseStudentReviewOptions {
  students: Student[];
  onUpdateStudent: (id: string, updates: Partial<Student>) => void;
  onVerifyStudent: (id: string) => void;
  onApproveStudent: (id: string) => void;
}

/** Photo action awaiting confirmation in the review dialog. */
export type PendingPhotoAction = 'reset' | 'remove' | null;

export interface StudentReviewWorkflow {
  reviewIndex: number | null;
  activeStudent: Student | null;
  formData: Partial<Student>;
  cardSide: 'front' | 'back';
  photoChecklist: { visible: boolean; centered: boolean; background: boolean; sharp: boolean };
  photoError: string | null;
  cropperStudent: Student | null;
  pendingPhotoAction: PendingPhotoAction;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  setCardSide: (side: 'front' | 'back') => void;
  openAt: (index: number) => void;
  close: () => void;
  closeCropper: () => void;
  goNext: () => void;
  goPrev: () => void;
  updateForm: (updates: Partial<Student>) => void;
  updateDynamicField: (key: string, value: string) => void;
  save: () => void;
  saveAndNext: () => void;
  verifyCurrent: () => void;
  approveCurrent: () => void;
  uploadPhoto: (file: File) => void;
  rotatePhoto: () => void;
  requestResetPhoto: () => void;
  requestRemovePhoto: () => void;
  cancelPendingPhotoAction: () => void;
  confirmPendingPhotoAction: () => void;
  openCropper: () => void;
  applyCrop: (cropData: CropData) => void;
  setPhotoError: (error: string | null) => void;
  setPhotoChecklist: (checklist: { visible: boolean; centered: boolean; background: boolean; sharp: boolean }) => void;
}

export function useStudentReview({ students, onUpdateStudent, onVerifyStudent, onApproveStudent }: UseStudentReviewOptions): StudentReviewWorkflow {
  const [reviewIndex, setReviewIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Student>>({});
  const [cardSide, setCardSide] = useState<'front' | 'back'>('front');
  const [photoChecklist, setPhotoChecklist] = useState({ visible: true, centered: true, background: true, sharp: true });
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [cropperStudent, setCropperStudent] = useState<Student | null>(null);
  const [pendingPhotoAction, setPendingPhotoAction] = useState<PendingPhotoAction>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeStudent = reviewIndex !== null ? students[reviewIndex] ?? null : null;

  useEffect(() => {
    if (activeStudent) {
      // Sync local form state when the active student changes.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: activeStudent.name,
        fatherName: activeStudent.fatherName,
        className: activeStudent.className,
        admissionNo: activeStudent.admissionNo,
        photoUrl: activeStudent.photoUrl,
        originalPhotoUrl: activeStudent.originalPhotoUrl || activeStudent.photoUrl,
        photoCrop: activeStudent.photoCrop,
        photoRotation: activeStudent.photoRotation || 0,
        dynamicData: { ...activeStudent.dynamicData },
      });
      setPhotoError(null);
    }
  // Intentionally keyed by id so typing edits in formData are not overwritten on re-render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStudent?.id]);

  const openAt = useCallback((index: number) => {
    if (index >= 0 && index < students.length) {
      setReviewIndex(index);
    }
  }, [students.length]);

  const close = useCallback(() => {
    setReviewIndex(null);
    setCropperStudent(null);
    setPendingPhotoAction(null);
  }, []);

  const closeCropper = useCallback(() => setCropperStudent(null), []);

  const goNext = useCallback(() => {
    if (reviewIndex !== null && reviewIndex < students.length - 1) {
      setReviewIndex(reviewIndex + 1);
    }
  }, [reviewIndex, students.length]);

  const goPrev = useCallback(() => {
    if (reviewIndex !== null && reviewIndex > 0) {
      setReviewIndex(reviewIndex - 1);
    }
  }, [reviewIndex]);

  const updateForm = useCallback((updates: Partial<Student>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const updateDynamicField = useCallback((key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      dynamicData: { ...prev.dynamicData, [key]: value },
    }));
  }, []);

  const save = useCallback(() => {
    if (activeStudent) {
      onUpdateStudent(activeStudent.id, formData);
    }
  }, [activeStudent, formData, onUpdateStudent]);

  const saveAndNext = useCallback(() => {
    save();
    goNext();
  }, [save, goNext]);

  const handleVerifyCurrent = useCallback((std: Student) => {
    if (!photoChecklist.visible || !photoChecklist.centered || !photoChecklist.background || !photoChecklist.sharp) {
      setPhotoError('Complete photo quality checklist before verifying.');
      return;
    }
    save();
    onVerifyStudent(std.id);
  }, [photoChecklist, save, onVerifyStudent]);

  const handleApproveCurrent = useCallback((std: Student) => {
    if (!formData.photoUrl && !std.photoUrl) {
      setPhotoError('Photo required before approval.');
      return;
    }
    save();
    onApproveStudent(std.id);
  }, [formData.photoUrl, save, onApproveStudent]);

  const verifyCurrent = useCallback(() => {
    if (activeStudent) handleVerifyCurrent(activeStudent);
  }, [activeStudent, handleVerifyCurrent]);

  const approveCurrent = useCallback(() => {
    if (activeStudent) handleApproveCurrent(activeStudent);
  }, [activeStudent, handleApproveCurrent]);

  const uploadPhoto = useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setPhotoError('Image exceeds 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setFormData(prev => ({
        ...prev,
        photoUrl: url,
        originalPhotoUrl: prev.originalPhotoUrl || url,
        photoRotation: 0,
        photoCrop: undefined,
      }));
      if (activeStudent) {
        setCropperStudent({ ...activeStudent, photoUrl: url });
      }
    };
    reader.readAsDataURL(file);
  }, [activeStudent]);

  const rotatePhoto = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      photoRotation: ((prev.photoRotation || 0) + 90) % 360,
    }));
  }, []);

  const requestResetPhoto = useCallback(() => {
    if (formData.originalPhotoUrl) setPendingPhotoAction('reset');
  }, [formData.originalPhotoUrl]);

  const requestRemovePhoto = useCallback(() => {
    setPendingPhotoAction('remove');
  }, []);

  const cancelPendingPhotoAction = useCallback(() => setPendingPhotoAction(null), []);

  const confirmPendingPhotoAction = useCallback(() => {
    setFormData(prev => {
      if (pendingPhotoAction === 'reset') {
        return { ...prev, photoUrl: prev.originalPhotoUrl, photoRotation: 0, photoCrop: undefined };
      }
      if (pendingPhotoAction === 'remove') {
        return { ...prev, photoUrl: undefined };
      }
      return prev;
    });
    setPendingPhotoAction(null);
  }, [pendingPhotoAction]);

  const openCropper = useCallback(() => {
    if (activeStudent) {
      setCropperStudent({ ...activeStudent, photoUrl: formData.photoUrl });
    }
  }, [activeStudent, formData.photoUrl]);

  const applyCrop = useCallback((cropData: CropData) => {
    setFormData(prev => ({ ...prev, photoCrop: cropData }));
    if (activeStudent) {
      onUpdateStudent(activeStudent.id, {
        photoCrop: cropData,
        photoUpdatedAt: new Date().toISOString(),
      });
    }
    setCropperStudent(null);
  }, [activeStudent, onUpdateStudent]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (reviewIndex === null) return;
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      const std = students[reviewIndex];
      if (!std) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goPrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goNext();
          break;
        case 'v':
        case 'V':
          e.preventDefault();
          handleVerifyCurrent(std);
          break;
        case 'a':
        case 'A':
          e.preventDefault();
          handleApproveCurrent(std);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [reviewIndex, students, formData, photoChecklist, goPrev, goNext, handleVerifyCurrent, handleApproveCurrent]);

  return {
    reviewIndex,
    activeStudent,
    formData,
    cardSide,
    photoChecklist,
    photoError,
    cropperStudent,
    pendingPhotoAction,
    fileInputRef,
    setCardSide,
    openAt,
    close,
    closeCropper,
    goNext,
    goPrev,
    updateForm,
    updateDynamicField,
    save,
    saveAndNext,
    verifyCurrent,
    approveCurrent,
    uploadPhoto,
    rotatePhoto,
    requestResetPhoto,
    requestRemovePhoto,
    cancelPendingPhotoAction,
    confirmPendingPhotoAction,
    openCropper,
    applyCrop,
    setPhotoError,
    setPhotoChecklist,
  };
}



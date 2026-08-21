'use client';

import React, { useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Student } from '@/lib/types';
import { useCarditStore } from '@/lib/store';
import { Header } from '@/components/Header';
import { CardPreview } from '@/components/CardPreview';
import { FaceCropperModal } from '@/components/FaceCropperModal';
import { useStudentReview } from '@/components/use-student-review';
import { EmptyState } from '@/components/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Camera, Crop, ChevronLeft, ChevronRight, Save, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';

function LiveEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStudentId = searchParams.get('studentId');

  const {
    isLoaded,
    currentSchool,
    currentTemplate,
    currentDatasetFields,
    datasetStudents,
    updateStudent,
    verifyStudent,
    approveStudent,
  } = useCarditStore();

  const initialIndex = useMemo(() => {
    const idx = datasetStudents.findIndex((s) => s.id === initialStudentId);
    return idx !== -1 ? idx : 0;
  }, [datasetStudents, initialStudentId]);

  const workflow = useStudentReview({
    students: datasetStudents,
    onUpdateStudent: updateStudent,
    onVerifyStudent: verifyStudent,
    onApproveStudent: approveStudent,
  });

  useEffect(() => {
    if (datasetStudents.length > 0 && workflow.reviewIndex === null) {
      workflow.openAt(initialIndex);
    }
  }, [datasetStudents.length, workflow.reviewIndex, workflow, initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (workflow.reviewIndex === null) return;
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        workflow.save();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        workflow.goNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [workflow]);

  const currentStudent = workflow.activeStudent;

  const liveStudent: Student | null = currentStudent
    ? {
        ...currentStudent,
        name: workflow.formData.name || currentStudent.name,
        admissionNo: workflow.formData.admissionNo || currentStudent.admissionNo,
        fatherName: workflow.formData.fatherName || currentStudent.fatherName,
        className: workflow.formData.className || currentStudent.className,
        photoUrl: workflow.formData.photoUrl !== undefined ? workflow.formData.photoUrl : currentStudent.photoUrl,
        dynamicData: { ...(workflow.formData.dynamicData || {}) },
      }
    : null;

  if (isLoaded && datasetStudents.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6">
          <EmptyState
            icon={AlertCircle}
            title="No Students in Selected Dataset"
            description="Please select another dataset or import student records."
            action={{ label: 'Back to Dashboard', onClick: () => (router.push('/')) }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />

      {!isLoaded ? (
        <div className="flex-1 max-w-[1600px] w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-6 h-[540px]" />
          <Skeleton className="lg:col-span-6 h-[540px]" />
        </div>
      ) : liveStudent ? (
        <div className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-24">
          <Card className="lg:col-span-6 p-6 flex flex-col items-center justify-between min-h-[460px] sm:min-h-[540px]">
            <div className="w-full flex items-center justify-between pb-4 border-b border-border">
              <Link href="/" title="Back" className="inline-flex">
                <Button variant="ghost" size="icon-sm" aria-label="Back to Dashboard">
                  <ArrowLeft className="size-4" />
                </Button>
              </Link>
              <span className="font-semibold text-sm text-foreground">Live Card Render Workspace</span>
              <div className="flex items-center bg-muted p-0.5 rounded-lg border border-border">
                <Button variant={workflow.cardSide === 'front' ? 'default' : 'ghost'} size="sm" onClick={() => workflow.setCardSide('front')}>
                  Front Side
                </Button>
                <Button variant={workflow.cardSide === 'back' ? 'default' : 'ghost'} size="sm" onClick={() => workflow.setCardSide('back')}>
                  Back Side
                </Button>
              </div>
            </div>

            <div className="my-auto py-6 flex items-center justify-center">
              <CardPreview template={currentTemplate} student={liveStudent} school={currentSchool} side={workflow.cardSide} scale={1.4} />
            </div>

            <div className="w-full pt-4 border-t border-border flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Camera className="size-4 text-primary" />
                <span>Photo Status: {liveStudent.photoUrl ? 'Uploaded & Matched' : 'Missing Photo'}</span>
              </div>
              <Button variant="outline" size="sm" onClick={workflow.openCropper}>
                <Crop className="size-3.5 text-primary" /> Crop / Change Photo
              </Button>
            </div>
          </Card>

          <Card className="lg:col-span-6 p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  Student Record Editor
                  <Badge variant="secondary" className="font-mono">
                    ({workflow.reviewIndex !== null ? workflow.reviewIndex + 1 : 0} of {datasetStudents.length})
                  </Badge>
                </h2>
                <p className="text-sm text-muted-foreground">Instant real-time sync with left card canvas</p>
              </div>
              <Badge variant="outline" className="font-mono">{liveStudent.admissionNo}</Badge>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Core Student Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Student Full Name *</Label>
                  <Input id="name" value={workflow.formData.name || ''} onChange={(e) => workflow.updateForm({ name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="adm">Admission Number *</Label>
                  <Input id="adm" className="font-mono" value={workflow.formData.admissionNo || ''} onChange={(e) => workflow.updateForm({ admissionNo: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="father">Father Name *</Label>
                  <Input id="father" value={workflow.formData.fatherName || ''} onChange={(e) => workflow.updateForm({ fatherName: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="class">Class & Section *</Label>
                  <Input id="class" value={workflow.formData.className || ''} onChange={(e) => workflow.updateForm({ className: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-border">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Dynamic Dataset Fields</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentDatasetFields
                  .filter((f) => !f.isSystem)
                  .map((field) => (
                    <div key={field.id} className={`space-y-1.5 ${field.fieldKey === 'address' ? 'sm:col-span-2' : ''}`}>
                      <Label>
                        {field.fieldName}
                        {field.isRequired && <span className="text-destructive"> *</span>}
                      </Label>
                      {field.fieldType === 'select' && field.options ? (
                        <Select value={(workflow.formData.dynamicData?.[field.fieldKey] as string) || ''} onValueChange={(v) => { if (v !== null) workflow.updateDynamicField(field.fieldKey, v); }}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={`Select ${field.fieldName}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={field.fieldType === 'date' ? 'date' : 'text'}
                          value={(workflow.formData.dynamicData?.[field.fieldKey] as string) || ''}
                          onChange={(e) => workflow.updateDynamicField(field.fieldKey, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {liveStudent && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur border-t border-border px-6 py-3">
          <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={workflow.reviewIndex === 0} onClick={workflow.goPrev}>
                <ChevronLeft className="size-4" /> Previous
              </Button>
              <span className="text-sm font-mono font-medium text-muted-foreground px-3">
                {workflow.reviewIndex !== null ? workflow.reviewIndex + 1 : 0} / {datasetStudents.length}
              </span>
              <Button variant="outline" size="sm" disabled={workflow.reviewIndex !== null && workflow.reviewIndex >= datasetStudents.length - 1} onClick={workflow.goNext}>
                Next <ChevronRight className="size-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={workflow.save}>
                <Save className="size-4" /> Save (S)
              </Button>
              <Button size="sm" onClick={workflow.saveAndNext}>
                <Save className="size-4" /> Save & Next
              </Button>
              <Button size="sm" onClick={workflow.verifyCurrent}>
                <CheckCircle2 className="size-4" /> Verify (V)
              </Button>
              <Button variant="secondary" size="sm" onClick={workflow.approveCurrent}>
                <ShieldCheck className="size-4" /> Approve (A)
              </Button>
            </div>
          </div>
        </div>
      )}

      <FaceCropperModal
        student={workflow.cropperStudent}
        isOpen={!!workflow.cropperStudent}
        onClose={workflow.closeCropper}
        onCropApplied={workflow.applyCrop}
      />
    </div>
  );
}

export default function LiveEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-sans">
          <div className="text-center text-muted-foreground font-medium">Loading ID Card Editor...</div>
        </div>
      }
    >
      <LiveEditorContent />
    </Suspense>
  );
}

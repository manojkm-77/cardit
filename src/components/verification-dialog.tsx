'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardPreview } from "@/components/CardPreview";
import { CardSideTabs } from "@/components/card-side-tabs";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FaceCropperModal } from "@/components/FaceCropperModal";
import { StudentReviewWorkflow } from "@/components/use-student-review";
import { CardTemplate, School } from "@/lib/types";
import { Save, ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Upload, Crop, RotateCw, Undo2, Trash2, AlertCircle, X } from "lucide-react";

interface VerificationDialogProps {
  workflow: StudentReviewWorkflow;
  template: CardTemplate;
  school: School;
  studentsCount: number;
}

const PHOTO_CHECKS = [
  { key: 'visible', label: 'Face visible & clear' },
  { key: 'centered', label: 'Face centered' },
  { key: 'background', label: 'Clean background' },
  { key: 'sharp', label: 'Sharp & focused' },
] as const;

export function VerificationDialog({ workflow, template, school, studentsCount }: VerificationDialogProps) {
  const {
    activeStudent,
    formData,
    reviewIndex,
    cardSide,
    photoChecklist,
    photoError,
    cropperStudent,
    pendingPhotoAction,
    fileInputRef,
    setCardSide,
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
  } = workflow;

  if (!activeStudent) return null;

  const isFirst = reviewIndex === 0;
  const isLast = reviewIndex === studentsCount - 1;

  // Core record fields and dynamic dataset fields share one renderer so the
  // form stays on a single grid rhythm.
  const fields: { id: string; label: string; value: string; onChange: (value: string) => void }[] = [
    { id: 'name', label: 'Name', value: formData.name || '', onChange: (value) => updateForm({ name: value }) },
    { id: 'fatherName', label: 'Father Name', value: formData.fatherName || '', onChange: (value) => updateForm({ fatherName: value }) },
    { id: 'className', label: 'Class', value: formData.className || '', onChange: (value) => updateForm({ className: value }) },
    { id: 'admissionNo', label: 'Admission No', value: formData.admissionNo || '', onChange: (value) => updateForm({ admissionNo: value }) },
    { id: 'dob', label: 'Date of Birth', value: formData.dynamicData?.dob || '', onChange: (value) => updateDynamicField('dob', value) },
    { id: 'mobile', label: 'Mobile', value: formData.dynamicData?.mobile || '', onChange: (value) => updateDynamicField('mobile', value) },
    { id: 'address', label: 'Address', value: formData.dynamicData?.address || '', onChange: (value) => updateDynamicField('address', value) },
    { id: 'bloodGroup', label: 'Blood Group', value: formData.dynamicData?.bloodGroup || '', onChange: (value) => updateDynamicField('bloodGroup', value) },
    { id: 'satsNo', label: 'SATS No', value: formData.dynamicData?.satsNo || '', onChange: (value) => updateDynamicField('satsNo', value) },
  ];

  return (
    <>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadPhoto(file);
          e.target.value = '';
        }}
      />

      <Dialog open={!!activeStudent} onOpenChange={(open) => { if (!open) close(); }}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[1360px] w-[95vw] h-[90vh] flex flex-col overflow-hidden p-0"
        >
          <DialogHeader className="flex flex-row items-center justify-between gap-4 px-6 py-4 border-b shrink-0">
            <div className="flex flex-col">
              <DialogTitle className="typo-card-title">{activeStudent.name}</DialogTitle>
              <p className="text-sm font-medium text-primary font-mono">
                {activeStudent.admissionNo}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={saveAndNext}>
                <Save className="size-4" />
                Save &amp; Next
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={close} aria-label="Close review">
                <X className="size-4" />
              </Button>
            </div>
          </DialogHeader>

          {photoError && (
            <div className="mx-6 mt-2 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{photoError}</span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setPhotoError(null)}
                className="ml-auto text-destructive hover:text-destructive"
                aria-label="Dismiss message"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-center rounded-xl border bg-card p-4">
                  <CardPreview
                    template={template}
                    student={activeStudent}
                    school={school}
                    side={cardSide}
                    scale={0.88}
                  />
                </div>
                <div className="flex justify-center">
                  <CardSideTabs value={cardSide} onChange={setCardSide} />
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="size-3.5" />
                    Change
                  </Button>
                  <Button variant="outline" size="sm" onClick={openCropper}>
                    <Crop className="size-3.5" />
                    Crop
                  </Button>
                  <Button variant="outline" size="sm" onClick={rotatePhoto}>
                    <RotateCw className="size-3.5" />
                    Rotate
                  </Button>
                  <Button variant="outline" size="sm" onClick={requestResetPhoto}>
                    <Undo2 className="size-3.5" />
                    Reset
                  </Button>
                  <Button variant="outline" size="sm" onClick={requestRemovePhoto}>
                    <Trash2 className="size-3.5" />
                    Remove
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {fields.map((field) => (
                    <div key={field.id} className="space-y-1.5">
                      <Label htmlFor={`field-${field.id}`} className="typo-meta-label">
                        {field.label}
                      </Label>
                      <Input
                        id={`field-${field.id}`}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <Card>
                  <CardHeader className="pb-0">
                    <CardTitle className="text-sm">Photo Quality Checklist</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3">
                    {PHOTO_CHECKS.map((item) => (
                      <Label
                        key={item.key}
                        htmlFor={`check-${item.key}`}
                        className="cursor-pointer text-sm font-medium"
                      >
                        <Checkbox
                          id={`check-${item.key}`}
                          checked={photoChecklist[item.key]}
                          onCheckedChange={(checked) =>
                            setPhotoChecklist({
                              ...photoChecklist,
                              [item.key]: checked === true,
                            })
                          }
                        />
                        {item.label}
                      </Label>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <DialogFooter className="shrink-0 flex-row items-center justify-between gap-4 px-6 py-3 sm:justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goPrev} disabled={isFirst}>
                <ArrowLeft className="size-4" />
                Prev
              </Button>
              <span className="text-xs font-medium text-muted-foreground">
                {reviewIndex !== null ? reviewIndex + 1 : '-'} / {studentsCount}
              </span>
              <Button variant="outline" size="sm" onClick={goNext} disabled={isLast}>
                Next
                <ArrowRight className="size-4" />
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={save}>
                <Save className="size-4" />
                Save
              </Button>
              <Button variant="secondary" size="sm" onClick={verifyCurrent}>
                <CheckCircle2 className="size-4" />
                Verify (V)
              </Button>
              <Button size="sm" onClick={approveCurrent}>
                <ShieldCheck className="size-4" />
                Approve (A)
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingPhotoAction !== null}
        onOpenChange={(open) => { if (!open) cancelPendingPhotoAction(); }}
        title={pendingPhotoAction === 'remove' ? 'Remove photo?' : 'Restore original photo?'}
        description={
          pendingPhotoAction === 'remove'
            ? 'The student record will have no photo until a new one is uploaded. Approval requires a photo.'
            : 'Discards the current crop and rotation and restores the originally uploaded image.'
        }
        confirmLabel={pendingPhotoAction === 'remove' ? 'Remove photo' : 'Restore'}
        destructive={pendingPhotoAction === 'remove'}
        onConfirm={confirmPendingPhotoAction}
      />

      <FaceCropperModal
        student={cropperStudent}
        isOpen={!!cropperStudent}
        onClose={closeCropper}
        onCropApplied={applyCrop}
      />
    </>
  );
}

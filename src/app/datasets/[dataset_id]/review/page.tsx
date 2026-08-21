'use client';

import { use } from 'react';
import { Header } from '@/components/Header';
import { useCarditStore } from '@/lib/store';
import { Student } from '@/lib/types';
import { useStudentReview } from '@/components/use-student-review';
import { StudentVerificationCard } from '@/components/student-verification-card';
import { VerificationDialog } from '@/components/verification-dialog';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { LockKeyhole, SearchX, Search, ChevronRight } from 'lucide-react';

export default function DatasetReviewPage({ params }: { params: Promise<{ dataset_id: string }> }) {
  const resolvedParams = use(params);
  const datasetId = resolvedParams.dataset_id;

  const {
    state,
    isLoaded,
    currentSchool,
    currentAcademicYear,
    currentTemplate,
    setSearchQuery,
    verifyStudent,
    approveStudent,
    updateStudent,
  } = useCarditStore();

  const dataset = state.datasets.find((d) => d.id === datasetId) || state.datasets[0];
  const datasetStudents = state.students.filter((s) => s.datasetId === dataset.id);

  const filteredStudents = datasetStudents.filter((s) => {
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

  const isMerged = dataset.isMerged ?? (dataset.id !== 'ds-c2');

  const workflow = useStudentReview({
    students: filteredStudents,
    onUpdateStudent: updateStudent,
    onVerifyStudent: verifyStudent,
    onApproveStudent: approveStudent,
  });

  const handleVerify = (std: Student) => verifyStudent(std.id);
  const handleApprove = (std: Student) => approveStudent(std.id);

  if (!isMerged) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <Header />

        <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-8 flex items-center justify-center">
          <Card className="p-12 text-center space-y-4 w-full">
            <div className="size-14 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground mx-auto">
              <LockKeyhole className="size-7" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold tracking-tight">Dataset Gated</h1>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Dataset <strong className="text-foreground">{dataset.name}</strong> requires Excel student data and photo ZIP archive to be merged before workspace access.
              </p>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans pb-32">
      <Header />

      <main className="flex-1 w-full max-w-[1540px] mx-auto p-4 sm:p-8 space-y-6">
        {!isLoaded ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56 w-full" />)}
          </div>
        ) : (
          <>
            <Card className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader
                  title={`${dataset.name} Review`}
                  description={`${currentSchool.name} · ${currentAcademicYear.name}`}
                />
                <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground bg-muted/50 rounded-md px-3 py-1.5 border border-border">
                  <span>Total: <strong className="text-foreground">{datasetStudents.length}</strong></span>
                  <span className="text-border">•</span>
                  <span>Pending: <strong className="text-foreground">{datasetStudents.filter((s) => s.status === 'Pending').length}</strong></span>
                  <span className="text-border">•</span>
                  <span>Verified: <strong className="text-foreground">{datasetStudents.filter((s) => s.status === 'Verified' || s.status === 'Approved').length}</strong></span>
                </div>
              </div>

              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Find any student by name, admission no, father name, class, mobile..."
                  value={state.searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </Card>

            {filteredStudents.length === 0 ? (
              <Card>
                <EmptyState
                  icon={SearchX}
                  title="No students found"
                  description="Try adjusting your search query."
                  action={{ label: 'Clear search', onClick: () => setSearchQuery('') }}
                />
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {filteredStudents.map((std, idx) => (
                  <StudentVerificationCard
                    key={std.id}
                    student={std}
                    onViewIdCard={() => workflow.openAt(idx)}
                    onVerify={() => handleVerify(std)}
                    onApprove={() => handleApprove(std)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {isLoaded && filteredStudents.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4">
          <Card className="px-4 py-2.5 flex items-center justify-between gap-3 bg-card/95 backdrop-blur">
            <span className="text-sm font-medium text-foreground">{dataset.name} · {datasetStudents.length} Records</span>
            <Button size="sm" onClick={() => workflow.openAt(0)}>
              Review Batch <ChevronRight className="size-4" />
            </Button>
          </Card>
        </div>
      )}

      <VerificationDialog workflow={workflow} template={currentTemplate} school={currentSchool} studentsCount={filteredStudents.length} />
    </div>
  );
}
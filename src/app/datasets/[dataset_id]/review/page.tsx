'use client';

import { use } from 'react';
import { Header } from '@/components/Header';
import { useCarditStore } from '@/lib/store';
import { Student } from '@/lib/types';
import { useStudentReview } from '@/components/use-student-review';
import { StudentVerificationCard } from '@/components/student-verification-card';
import { VerificationDialog } from '@/components/verification-dialog';
import { EmptyState } from '@/components/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { LockKeyhole, SearchX, Search, ChevronRight } from 'lucide-react';

/**
 * Enterprise Dataset Review Page
 * 
 * Consistent with main workspace:
 * - rounded-xl cards with proper shadows
 * - typo-section-title for headers
 * - Enterprise spacing (gap-6, py-8)
 * - Floating action bar pattern
 */
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
          <Card className="rounded-xl shadow-lg">
            <CardContent className="p-12 text-center space-y-5">
              <div className="size-16 rounded-full bg-muted/50 border-2 border-border flex items-center justify-center text-muted-foreground mx-auto">
                <LockKeyhole className="size-8" strokeWidth={1.5} />
              </div>
              <div className="space-y-2">
                <h1 className="typo-section-title">Dataset Gated</h1>
                <p className="typo-body text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Dataset <strong className="font-semibold text-foreground">{dataset.name}</strong> requires Excel student data and photo ZIP archive to be merged before workspace access.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const verified = filteredStudents.filter((s) => s.status === 'Verified' || s.status === 'Approved').length;
  const pending = filteredStudents.filter((s) => s.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-32">
        {!isLoaded ? (
          <>
            <Skeleton className="h-48 w-full rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72 w-full rounded-xl" />)}
            </div>
          </>
        ) : (
          <>
            <Card className="rounded-xl shadow-sm">
              <CardContent className="p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                  <div className="space-y-1.5">
                    <h1 className="typo-section-title">{dataset.name} Review</h1>
                    <p className="typo-body text-muted-foreground">
                      {currentSchool.name} · {currentAcademicYear.name}
                    </p>
                  </div>
                  
                  {/* Counter Stats */}
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-muted/50 border border-border/60 shadow-sm">
                    <div className="flex items-baseline gap-1.5">
                      <span className="typo-meta-label text-muted-foreground">Total</span>
                      <span className="text-base font-bold text-foreground">{datasetStudents.length}</span>
                    </div>
                    <div className="w-px h-4 bg-border" />
                    <div className="flex items-baseline gap-1.5">
                      <span className="typo-meta-label text-muted-foreground">Pending</span>
                      <span className="text-base font-bold text-foreground">{pending}</span>
                    </div>
                    <div className="w-px h-4 bg-border" />
                    <div className="flex items-baseline gap-1.5">
                      <span className="typo-meta-label text-muted-foreground">Verified</span>
                      <span className="text-base font-bold text-foreground">{verified}</span>
                    </div>
                  </div>
                </div>

                {/* Search */}
                <div className="relative max-w-lg">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Find any student by name, admission no, father name, class, mobile..."
                    value={state.searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 shadow-sm border-border/60 hover:border-border transition-colors"
                  />
                </div>
              </CardContent>
            </Card>

            {filteredStudents.length === 0 ? (
              <Card className="rounded-xl">
                <EmptyState
                  icon={SearchX}
                  title="No students found"
                  description="Try adjusting your search query to see more results."
                  action={{ label: 'Clear search', onClick: () => setSearchQuery('') }}
                />
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      {/* Floating Action Bar */}
      {isLoaded && filteredStudents.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4">
          <Card className="rounded-xl px-5 py-3.5 flex items-center justify-between gap-3 bg-card/95 backdrop-blur-xl border-border shadow-lg">
            <span className="text-sm font-semibold text-foreground">
              {dataset.name} · {datasetStudents.length} Records
            </span>
            <Button 
              size="sm" 
              onClick={() => workflow.openAt(0)}
              className="shadow-sm hover:shadow transition-shadow"
            >
              Review Batch 
              <ChevronRight className="size-4" />
            </Button>
          </Card>
        </div>
      )}

      <VerificationDialog workflow={workflow} template={currentTemplate} school={currentSchool} studentsCount={filteredStudents.length} />
    </div>
  );
}
'use client';

import { Header } from "@/components/Header";
import { VerificationToolbar } from "@/components/verification-toolbar";
import { StudentVerificationCard } from "@/components/student-verification-card";
import { VerificationDialog } from "@/components/verification-dialog";
import { useStudentReview } from "@/components/use-student-review";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCarditStore } from "@/lib/store";
import { SearchX, Activity, ChevronRight } from "lucide-react";

export default function BulkDashboardPage() {
  const {
    state,
    isLoaded,
    currentSchool,
    currentAcademicYear,
    currentTemplate,
    filteredStudents,
    datasetCounters,
    setStatusFilter,
    setSearchQuery,
    updateStudent,
    verifyStudent,
    approveStudent,
  } = useCarditStore();

  const workflow = useStudentReview({
    students: filteredStudents,
    onUpdateStudent: updateStudent,
    onVerifyStudent: verifyStudent,
    onApproveStudent: approveStudent,
  });

  const handleReviewBatch = () => {
    if (filteredStudents.length > 0) workflow.openAt(0);
  };

  const handleVerify = (stdId: string) => {
    verifyStudent(stdId);
  };

  const handleApprove = (stdId: string) => {
    approveStudent(stdId);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans pb-24">
      <Header />
      <main className="flex-1 w-full max-w-[1520px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {!isLoaded ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full" />
            ))}
          </div>
        ) : (
          <>
            <VerificationToolbar
              title="Student Verification Workspace"
              description={`${currentSchool.name} · ${currentAcademicYear.name}`}
              onReviewBatch={handleReviewBatch}
              filterMode={state.statusFilter === 'PENDING' ? 'PENDING' : 'ALL'}
              onToggleFilter={() => setStatusFilter(state.statusFilter === 'PENDING' ? 'ALL' : 'PENDING')}
            />

            {filteredStudents.length === 0 ? (
              <Card>
                <EmptyState
                  icon={SearchX}
                  title="No students found"
                  description="Try adjusting your search or filters."
                  action={{
                    label: "Clear filters",
                    onClick: () => {
                      setSearchQuery('');
                      setStatusFilter('ALL');
                    },
                  }}
                />
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredStudents.map((std, idx) => (
                  <StudentVerificationCard
                    key={std.id}
                    student={std}
                    onViewIdCard={() => workflow.openAt(idx)}
                    onVerify={() => handleVerify(std.id)}
                    onApprove={() => handleApprove(std.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {isLoaded && datasetCounters.total > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4">
          <Card className="px-4 py-3 flex items-center justify-between gap-3 bg-card/95 backdrop-blur">
            <div className="flex items-center gap-2.5">
              <div className="size-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
                <Activity className="size-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{datasetCounters.verified} of {datasetCounters.total} Verified</span>
                <span className="text-xs text-muted-foreground">{datasetCounters.pending} pending</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant={state.statusFilter === 'PENDING' ? 'default' : 'outline'}
                onClick={() => setStatusFilter(state.statusFilter === 'PENDING' ? 'ALL' : 'PENDING')}
              >
                {state.statusFilter === 'PENDING' ? 'Showing Pending' : 'Filter Pending'}
              </Button>
              <Button
                size="sm"
                onClick={() => { if (filteredStudents.length > 0) workflow.openAt(0); }}
              >
                Review Batch <ChevronRight className="size-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      <VerificationDialog
        workflow={workflow}
        template={currentTemplate}
        school={currentSchool}
        studentsCount={filteredStudents.length}
      />
    </div>
  );
}


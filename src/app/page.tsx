'use client';

import { Header } from "@/components/Header";
import { VerificationToolbar } from "@/components/verification-toolbar";
import { StudentVerificationCard } from "@/components/student-verification-card";
import { VerificationDialog } from "@/components/verification-dialog";
import { useStudentReview } from "@/components/use-student-review";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useCarditStore } from "@/lib/store";
import { SearchX } from "lucide-react";

export default function BulkDashboardPage() {
  const {
    state,
    isLoaded,
    currentSchool,
    currentAcademicYear,
    currentTemplate,
    filteredStudents,
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
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {!isLoaded ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
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
                  description="Try adjusting your search or filters to see more results."
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

      <VerificationDialog
        workflow={workflow}
        template={currentTemplate}
        school={currentSchool}
        studentsCount={filteredStudents.length}
      />
    </div>
  );
}


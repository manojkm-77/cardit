'use client';
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { StudentActions } from "@/components/student-actions";
import { StudentMetadata } from "@/components/student-metadata";
import { Student } from "@/lib/types";
import { UserX } from "lucide-react";

interface StudentVerificationCardProps {
  student: Student;
  onViewIdCard: () => void;
  onVerify: () => void;
  onApprove: () => void;
}

export function StudentVerificationCard({ student, onViewIdCard, onVerify, onApprove }: StudentVerificationCardProps) {
  const isVerified = student.status === 'Verified' || student.status === 'Approved' || student.status === 'Printed' || student.status === 'Delivered';
  const isApproved = student.status === 'Approved' || student.status === 'Printed' || student.status === 'Delivered';

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-5">
          <div className="relative w-32 h-40 shrink-0 rounded-lg overflow-hidden bg-muted border border-border">
            {student.photoUrl ? (
              <Image src={student.photoUrl} alt={student.name} fill className="object-cover" sizes="128px" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                <UserX className="w-8 h-8 mb-1" />
                <span className="text-xs font-medium">No Photo</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-foreground truncate">{student.name}</h3>
                <p className="text-sm font-medium text-primary mt-0.5 font-mono">{student.admissionNo}</p>
              </div>
              <StatusBadge status={student.status} className="shrink-0" />
            </div>
            <div className="mt-3">
              <StudentActions
                verified={isVerified}
                approved={isApproved}
                onView={onViewIdCard}
                onVerify={onVerify}
                onApprove={onApprove}
              />
            </div>
          </div>
        </div>
        <div className="mt-5 pt-5 border-t border-border">
          <StudentMetadata student={student} />
        </div>
      </CardContent>
    </Card>
  );
}



'use client';
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { StudentActions } from "@/components/student-actions";
import { StudentMetadata } from "@/components/student-metadata";
import { Student } from "@/lib/types";
import { UserX } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentVerificationCardProps {
  student: Student;
  onViewIdCard: () => void;
  onVerify: () => void;
  onApprove: () => void;
  className?: string;
}

/**
 * Student Verification Card - matches reference exactly
 * Layout: Photo | Name/ID/Actions | Metadata Grid
 */
export function StudentVerificationCard({ 
  student, 
  onViewIdCard, 
  onVerify, 
  onApprove,
  className 
}: StudentVerificationCardProps) {
  const isVerified = student.status === 'Verified' || student.status === 'Approved' || student.status === 'Printed' || student.status === 'Delivered';
  const isApproved = student.status === 'Approved' || student.status === 'Printed' || student.status === 'Delivered';

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-3 sm:p-6">
        {/* Top section: Photo + Name/ID/Actions */}
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Photo */}
          <div className="relative w-20 h-24 sm:w-32 sm:h-40 shrink-0 rounded-lg overflow-hidden bg-muted border border-border">
            {student.photoUrl ? (
              <Image 
                src={student.photoUrl} 
                alt={student.name} 
                fill 
                className="object-cover" 
                sizes="128px"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                <UserX className="w-8 h-8 mb-1" />
                <span className="text-xs font-medium">No Photo</span>
              </div>
            )}
          </div>

          {/* Name, ID, Actions */}
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h3 className="text-lg font-bold text-foreground">{student.name}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{student.admissionNo}</p>
            </div>

            <StudentActions
              verified={isVerified}
              approved={isApproved}
              onView={onViewIdCard}
              onVerify={onVerify}
              onApprove={onApprove}
            />
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="mt-4 pt-4 border-t border-border">
          <StudentMetadata student={student} />
        </div>
      </CardContent>
    </Card>
  );
}



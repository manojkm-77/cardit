'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useCarditStore } from '@/lib/store';
import { ShieldCheck, CheckCircle2, AlertCircle, User, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function VerificationPortalPage() {
  const params = useParams();
  const uuid = params.uuid as string;

  const { state } = useCarditStore();

  // Find student by QR UUID
  const student = state.students.find((s) => s.qrUuid === uuid) || state.students[0];
  const school = state.schools.find((s) => s.id === state.currentSchoolId) || state.schools[0];

  if (!student) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 font-sans">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="size-12 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Invalid Verification QR Code</h1>
          <p className="text-sm text-muted-foreground">
            The scanned student identity card credential UUID could not be verified in the school database registry.
          </p>
        </Card>
      </div>
    );
  }

  const isIssued = student.status === 'Verified' || student.status === 'Approved' || student.status === 'Printed';

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 font-sans">

      {/* Verification Card Modal Container */}
      <Card className="max-w-md w-full p-6 space-y-6">

        {/* Top Header Badge */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground block">Official Verification</span>
              <span className="font-bold text-lg">{school.name}</span>
            </div>
          </div>

          <Badge variant="default" className="flex items-center gap-1 text-[10px] font-bold font-mono">
            <CheckCircle2 className="size-3" />
            <span>VERIFIED IDENTITY</span>
          </Badge>
        </div>

        {/* Student Photo & Primary Info */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative w-28 h-36 rounded-lg overflow-hidden bg-muted border-2 border-border">
            {student.photoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                <User className="size-10 mb-1" />
                <span className="text-[10px]">No Photo</span>
              </div>
            )}
          </div>

          <div>
            <h1 className="text-xl font-bold">{student.name}</h1>
            <p className="text-sm font-mono text-primary">{student.className}</p>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="bg-muted/50 rounded-lg p-4 border border-border space-y-2.5 text-sm font-mono">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Admission No:</span>
            <span className="font-semibold">{student.admissionNo}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Card Status:</span>
            <Badge variant={isIssued ? 'default' : 'secondary'} className="text-[10px] font-bold">
              {isIssued ? 'ISSUED / ACTIVE' : 'PENDING APPROVAL'}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Card Type:</span>
            <span className="text-primary font-semibold">Student Identity Card</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Issue Date:</span>
            <span className="font-semibold">April 01, 2026</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Expiry Date:</span>
            <span className="font-semibold">March 31, 2027</span>
          </div>
        </div>

        {/* PII Safety Notice */}
        <div className="bg-muted/50 rounded-lg p-3 border border-border text-xs text-muted-foreground flex items-start gap-2">
          <Lock className="size-4 shrink-0 mt-0.5" />
          <p>
            <strong>Privacy Protection Enabled:</strong> Personal Identifiable Information (PII) such as residential address, phone numbers, and parent details are hidden for student safety.
          </p>
        </div>

        {/* School Footer */}
        <div className="text-center text-xs text-muted-foreground font-mono">
          Official QR Verification • {school.website}
        </div>

      </Card>
    </div>
  );
}
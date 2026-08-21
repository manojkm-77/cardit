'use client';
import { Student } from "@/lib/types";

interface StudentMetadataProps {
  student: Student;
}

export function StudentMetadata({ student }: StudentMetadataProps) {
  const fields = [
    { label: "Father Name", value: student.fatherName },
    { label: "Date of Birth", value: student.dynamicData?.dob },
    { label: "Class", value: student.className },
    { label: "Address", value: student.dynamicData?.address },
    { label: "Mobile", value: student.dynamicData?.mobile },
    { label: "SATS No", value: student.dynamicData?.satsNo },
  ];
  return (
    <div className="grid grid-cols-2 gap-6">
      {fields.map((f) => (
        <div key={f.label}>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{f.label}</p>
          <p className="mt-0.5 font-medium text-foreground">{f.value || '—'}</p>
        </div>
      ))}
    </div>
  );
}

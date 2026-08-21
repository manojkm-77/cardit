'use client';
import { useCarditStore } from "@/lib/store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function DatasetSelector() {
  const { state, setCurrentDataset } = useCarditStore();
  const datasets = state.datasets.filter(d => d.schoolId === state.currentSchoolId && d.academicYearId === state.currentAcademicYearId);
  return (
    <Select value={state.currentDatasetId} onValueChange={(v) => { if (v !== null) setCurrentDataset(v); }}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="All Datasets" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">All Datasets ({state.students.length})</SelectItem>
        {datasets.map(ds => (
          <SelectItem key={ds.id} value={ds.id}>{ds.name} ({ds.totalStudents})</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}


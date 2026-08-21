'use client';
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle2, Printer } from "lucide-react";

interface StudentActionsProps {
  verified?: boolean;
  approved?: boolean;
  onView: () => void;
  onVerify: () => void;
  onApprove: () => void;
}

export function StudentActions({ verified, approved, onView, onVerify, onApprove }: StudentActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={onView}>
        <Eye className="size-4" />
        View ID
      </Button>
      
      <Button 
        variant={verified ? "default" : "outline"} 
        size="sm" 
        onClick={onVerify}
      >
        <CheckCircle2 className="size-4" />
        {verified ? "Verified" : "Verify"}
      </Button>
      
      <Button 
        variant={approved ? "default" : "secondary"} 
        size="sm" 
        onClick={onApprove}
      >
        {approved ? <CheckCircle2 className="size-4" /> : <Printer className="size-4" />}
        {approved ? "Approved" : "Approve"}
      </Button>
    </div>
  );
}

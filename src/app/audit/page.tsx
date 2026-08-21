'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { useCarditStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable, DataTableColumnHeader, type DataTableColumn } from '@/components/ui/data-table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ShieldAlert, MoreHorizontal, FileText } from 'lucide-react';
import { AuditLog } from '@/lib/types';

/**
 * Enterprise Audit Trail Page
 * 
 * Premium data table implementation with:
 * - typo-page-title for main heading
 * - Refined table styling with proper spacing
 * - Sheet detail panel with enterprise layout
 * - Professional badge and typography usage
 */
export default function AuditTrailPage() {
  const { state, currentSchool } = useCarditStore();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const columns: DataTableColumn<AuditLog>[] = [
    { 
      id: 'timestamp', 
      header: <DataTableColumnHeader title="Timestamp" />, 
      cell: (log) => (
        <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
          {new Date(log.timestamp).toLocaleString()}
        </span>
      ) 
    },
    { 
      id: 'user', 
      header: <DataTableColumnHeader title="User & Role" />, 
      cell: (log) => (
        <div className="space-y-1.5">
          <p className="font-semibold text-sm">{log.userName}</p>
          <Badge variant="secondary" className="font-mono text-xs shadow-sm">{log.userRole}</Badge>
        </div>
      ) 
    },
    { 
      id: 'action', 
      header: <DataTableColumnHeader title="Action" />, 
      cell: (log) => <span className="font-semibold text-sm">{log.action}</span> 
    },
    { 
      id: 'entity', 
      header: <DataTableColumnHeader title="Entity Scope" />, 
      cell: (log) => (
        <span className="typo-body text-muted-foreground">
          {log.entity} <span className="font-mono text-xs">({log.entityId})</span>
        </span>
      ) 
    },
    { 
      id: 'details', 
      header: <DataTableColumnHeader title="Details" />, 
      cell: (log) => <span className="max-w-xs truncate block typo-body">{log.details}</span> 
    },
    { 
      id: 'old', 
      header: <DataTableColumnHeader title="Old Value" />, 
      cell: (log) => <span className="typo-body text-muted-foreground">{log.oldValue || '—'}</span> 
    },
    { 
      id: 'new', 
      header: <DataTableColumnHeader title="New Value" />, 
      cell: (log) => <span className="typo-body font-medium text-foreground">{log.newValue || '—'}</span> 
    },
    { 
      id: 'ip', 
      header: <DataTableColumnHeader title="IP Address" />, 
      cell: (log) => <span className="font-mono text-xs text-muted-foreground">{log.ipAddress || '—'}</span> 
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 w-full max-w-[1800px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="typo-page-title">Audit Trail & Mutation Logs</h1>
          <p className="typo-body text-muted-foreground">
            Immutable audit log records for {currentSchool.name} showing old/new values, IP addresses, and user roles
          </p>
        </div>

        {/* Data Table Card */}
        <Card className="rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={state.auditLogs}
            rowKey={(log) => log.id}
            emptyTitle="No audit logs"
            emptyDescription="Actions you perform will be recorded here."
            onView={(log) => setSelectedLog(log)}
            rowActions={(log) => (
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedLog(log)}>
                    <FileText className="size-4" /> 
                    View details
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
          </div>
        </Card>

        {/* Detail Sheet */}
        <Sheet open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
          <SheetContent className="sm:max-w-lg">
            <SheetHeader className="space-y-3 pb-6">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <ShieldAlert className="size-5" />
                </div>
                <div>
                  <SheetTitle className="typo-card-title">Audit Log Details</SheetTitle>
                  <SheetDescription className="typo-body">Immutable mutation record</SheetDescription>
                </div>
              </div>
            </SheetHeader>
            
            {selectedLog && (
              <div className="space-y-6 typo-body">
                <div className="space-y-2">
                  <p className="typo-meta-label">Action</p>
                  <p className="font-semibold text-base">{selectedLog.action}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="typo-meta-label">User</p>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{selectedLog.userName}</span>
                    <Badge variant="secondary" className="font-mono shadow-sm">{selectedLog.userRole}</Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="typo-meta-label">Entity</p>
                  <p className="font-mono text-sm bg-muted/50 px-3 py-2 rounded-lg border border-border/60">
                    {selectedLog.entity} ({selectedLog.entityId})
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="typo-meta-label">Details</p>
                  <p className="text-muted-foreground leading-relaxed">{selectedLog.details}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border/60">
                  <div className="space-y-2">
                    <p className="typo-meta-label">Old Value</p>
                    <p className="text-muted-foreground break-words">{selectedLog.oldValue || '—'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="typo-meta-label">New Value</p>
                    <p className="font-medium break-words">{selectedLog.newValue || '—'}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="typo-meta-label">Timestamp</p>
                  <p className="font-mono text-sm">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="typo-meta-label">IP Address</p>
                  <p className="font-mono text-sm">{selectedLog.ipAddress || '—'}</p>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </main>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { PageHeader } from '@/components/page-header';
import { useCarditStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable, DataTableColumnHeader, type DataTableColumn } from '@/components/ui/data-table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ShieldAlert, MoreHorizontal, FileText } from 'lucide-react';
import { AuditLog } from '@/lib/types';

export default function AuditTrailPage() {
  const { state, currentSchool } = useCarditStore();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const columns: DataTableColumn<AuditLog>[] = [
    { id: 'timestamp', header: <DataTableColumnHeader title="Timestamp" />, cell: (log) => <span className="whitespace-nowrap font-mono text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span> },
    { id: 'user', header: <DataTableColumnHeader title="User & Role" />, cell: (log) => (
        <div>
          <p className="font-semibold">{log.userName}</p>
          <Badge variant="secondary" className="font-mono mt-0.5">{log.userRole}</Badge>
        </div>
      ) },
    { id: 'action', header: <DataTableColumnHeader title="Action" />, cell: (log) => <span className="font-semibold">{log.action}</span> },
    { id: 'entity', header: <DataTableColumnHeader title="Entity Scope" />, cell: (log) => <span className="font-medium text-muted-foreground">{log.entity} ({log.entityId})</span> },
    { id: 'details', header: <DataTableColumnHeader title="Details" />, cell: (log) => <span className="max-w-xs truncate block">{log.details}</span> },
    { id: 'old', header: <DataTableColumnHeader title="Old Value" />, cell: (log) => <span className="text-muted-foreground">{log.oldValue || '—'}</span> },
    { id: 'new', header: <DataTableColumnHeader title="New Value" />, cell: (log) => <span className="text-foreground">{log.newValue || '—'}</span> },
    { id: 'ip', header: <DataTableColumnHeader title="IP Address" />, cell: (log) => <span className="font-mono text-muted-foreground">{log.ipAddress || '—'}</span> },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 space-y-6">
        <PageHeader title="Immutable Audit Trail & Mutation Logs" description={`Audit log records for ${currentSchool.name} showing old/new values, IP addresses, and user roles`} />
        <Card>
          <DataTable
            columns={columns}
            data={state.auditLogs}
            rowKey={(log) => log.id}
            emptyTitle="No audit logs"
            emptyDescription="Actions you perform will be recorded here."
            onView={(log) => setSelectedLog(log)}
            rowActions={(log) => (
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}><MoreHorizontal className="size-4" /></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedLog(log)}><FileText className="size-4" /> View details</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
        </Card>

        <Sheet open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2"><ShieldAlert className="size-4" /> Audit Log Details</SheetTitle>
              <SheetDescription>Immutable mutation record</SheetDescription>
            </SheetHeader>
            {selectedLog && (
              <div className="space-y-4 text-sm">
                <div className="space-y-1"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Action</p><p className="font-semibold">{selectedLog.action}</p></div>
                <div className="space-y-1"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">User</p><p>{selectedLog.userName} · <Badge variant="secondary" className="font-mono">{selectedLog.userRole}</Badge></p></div>
                <div className="space-y-1"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Entity</p><p className="font-mono">{selectedLog.entity} ({selectedLog.entityId})</p></div>
                <div className="space-y-1"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Details</p><p className="text-muted-foreground">{selectedLog.details}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Old Value</p><p className="text-muted-foreground">{selectedLog.oldValue || '—'}</p></div>
                  <div className="space-y-1"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">New Value</p><p>{selectedLog.newValue || '—'}</p></div>
                </div>
                <div className="space-y-1"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Timestamp</p><p className="font-mono">{new Date(selectedLog.timestamp).toLocaleString()}</p></div>
                <div className="space-y-1"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">IP Address</p><p className="font-mono">{selectedLog.ipAddress || '—'}</p></div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </main>
    </div>
  );
}

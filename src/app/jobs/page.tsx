'use client';

import { Header } from '@/components/Header';
import { PageHeader } from '@/components/page-header';
import { useCarditStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/empty-state';
import { Sparkles, Activity, CheckCircle2, RefreshCw, Clock, AlertCircle } from 'lucide-react';

export default function WorkerQueuePage() {
  const { state, currentDataset, enqueueJob } = useCarditStore();

  const handleSimulateJob = () => {
    enqueueJob({
      title: `Batch Photo Crop & QR Generation (${currentDataset.name})`,
      type: 'face_crop',
      datasetId: currentDataset.id,
      progress: 100,
      status: 'completed',
      details: 'Cropped 242 student photos to 3:4 aspect ratio. Rendered 242 dynamic verification QR codes.'
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />

      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 space-y-6">
        <PageHeader
          title="Background Jobs & RQ Worker Queue"
          description="Redis + RQ background worker queue monitoring for bulk PDF generation, photo matching, and CSV exports"
        >
          <Button size="sm" onClick={handleSimulateJob}>
            <Sparkles />
            Enqueue Batch Photo & QR Worker Job
          </Button>
        </PageHeader>

        {/* Worker Metrics Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Active RQ Workers</span>
              <div className="text-2xl font-bold font-mono">4 Workers Online</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Jobs Processed Today</span>
              <div className="text-2xl font-bold font-mono">142 Jobs</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Average Job Latency</span>
              <div className="text-2xl font-bold font-mono">4.2s / 2k Batch</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Redis Connection Pool</span>
              <div className="text-2xl font-bold font-mono">Healthy (20/100)</div>
            </CardContent>
          </Card>
        </div>

        {/* Job Queue List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Recent Worker Jobs Queue ({state.jobQueue.length} Jobs)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.jobQueue.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="No jobs in queue"
                description="Enqueue a background job to see it here."
              />
            ) : (
              state.jobQueue.map((job) => (
                <div
                  key={job.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border border-border bg-card"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {job.status === 'completed' && <CheckCircle2 className="size-4 text-primary" />}
                      {job.status === 'processing' && <RefreshCw className="size-4 text-primary animate-spin" />}
                      {job.status === 'pending' && <Clock className="size-4 text-muted-foreground" />}
                      {job.status === 'failed' && <AlertCircle className="size-4 text-destructive" />}
                      <span className="text-sm font-semibold">{job.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{job.details}</p>
                    <span className="text-xs text-muted-foreground">{new Date(job.createdAt).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <Progress value={job.progress} className="w-32" />
                    <Badge variant={job.status === 'completed' ? 'default' : 'secondary'}>{job.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


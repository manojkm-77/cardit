'use client';

import { Header } from '@/components/Header';
import { useCarditStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/empty-state';
import { Sparkles, Activity, CheckCircle2, RefreshCw, Clock, AlertCircle } from 'lucide-react';

/**
 * Enterprise Background Jobs Queue Page
 * 
 * Professional worker queue interface with:
 * - typo-page-title for main heading
 * - Refined metric cards with shadow-sm
 * - Clean job list with proper spacing
 * - Status badges using semantic colors
 */
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

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          <div className="space-y-2">
            <h1 className="typo-page-title">Background Jobs & Worker Queue</h1>
            <p className="typo-body text-muted-foreground">
              Redis + RQ background worker queue monitoring for bulk PDF generation, photo matching, and CSV exports
            </p>
          </div>
          <Button 
            size="sm" 
            onClick={handleSimulateJob}
            className="shadow-sm hover:shadow transition-shadow shrink-0"
          >
            <Sparkles className="size-4" />
            Enqueue Batch Job
          </Button>
        </div>

        {/* Worker Metrics Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <Card className="rounded-xl shadow-sm">
            <CardContent className="p-5 space-y-2">
              <span className="typo-meta-label">Active RQ Workers</span>
              <div className="text-2xl font-extrabold font-mono text-foreground">4 Workers</div>
              <div className="typo-caption">Online & Processing</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardContent className="p-5 space-y-2">
              <span className="typo-meta-label">Jobs Processed Today</span>
              <div className="text-2xl font-extrabold font-mono text-foreground">142</div>
              <div className="typo-caption">Completed Jobs</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardContent className="p-5 space-y-2">
              <span className="typo-meta-label">Average Job Latency</span>
              <div className="text-2xl font-extrabold font-mono text-foreground">4.2s</div>
              <div className="typo-caption">Per 2k Batch</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardContent className="p-5 space-y-2">
              <span className="typo-meta-label">Redis Connection Pool</span>
              <div className="text-2xl font-extrabold font-mono text-foreground">20/100</div>
              <div className="typo-caption">Healthy Pool</div>
            </CardContent>
          </Card>
        </div>

        {/* Job Queue List */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="typo-card-title">
              Recent Worker Jobs Queue
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({state.jobQueue.length} {state.jobQueue.length === 1 ? 'Job' : 'Jobs'})
              </span>
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
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border border-border bg-card shadow-sm hover:shadow transition-shadow"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2.5">
                      {job.status === 'completed' && <CheckCircle2 className="size-5 text-primary shrink-0" />}
                      {job.status === 'processing' && <RefreshCw className="size-5 text-primary animate-spin shrink-0" />}
                      {job.status === 'pending' && <Clock className="size-5 text-muted-foreground shrink-0" />}
                      {job.status === 'failed' && <AlertCircle className="size-5 text-destructive shrink-0" />}
                      <span className="typo-body-strong">{job.title}</span>
                    </div>
                    <p className="typo-body text-muted-foreground">{job.details}</p>
                    <span className="typo-caption">
                      {new Date(job.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 shrink-0 w-full sm:w-auto">
                    <div className="flex flex-col items-end gap-2 min-w-24 sm:min-w-32 flex-1 sm:flex-none">
                      <Progress value={job.progress} className="h-2" />
                      <span className="text-xs font-mono text-muted-foreground">{job.progress}%</span>
                    </div>
                    <Badge 
                      variant={job.status === 'completed' ? 'default' : job.status === 'failed' ? 'destructive' : 'secondary'}
                      className="shadow-sm capitalize"
                    >
                      {job.status}
                    </Badge>
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


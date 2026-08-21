'use client';

import React, { useState } from 'react';
import { useCarditStore } from '../lib/store';
import { FileSpreadsheet, FileArchive, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose }) => {
  const { currentDataset, enqueueJob, mergeDataset } = useCarditStore();
  const [activeTab, setActiveTab] = useState<'excel' | 'zip'>('excel');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [matchResult, setMatchResult] = useState<{
    totalRecords: number;
    matchedPhotos: number;
    croppedPhotos: number;
  } | null>(null);

  const handleStartImport = () => {
    setIsProcessing(true);
    setProgress(15);

    // Simulate async Redis/RQ worker background task execution
    setTimeout(() => setProgress(45), 600);
    setTimeout(() => setProgress(80), 1200);
    setTimeout(() => {
      setProgress(100);
      setIsProcessing(false);
      
      const total = activeTab === 'excel' ? 242 : 215;
      const matched = activeTab === 'excel' ? 215 : 205;
      
      setMatchResult({
        totalRecords: total,
        matchedPhotos: matched,
        croppedPhotos: matched
      });

      // Mark dataset as merged
      mergeDataset(currentDataset.id);

      // Enqueue job in worker queue
      enqueueJob({
        title: activeTab === 'excel' ? `Excel Bulk Import (${currentDataset.name})` : `Photo ZIP Auto-Match & Face Crop (${currentDataset.name})`,
        type: activeTab === 'excel' ? 'excel_import' : 'photo_match',
        datasetId: currentDataset.id,
        progress: 100,
        status: 'completed',
        details: `Successfully processed ${total} records. ${matched} student photos auto-matched & cropped.`
      });
    }, 1800);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Data & Photo Importer</DialogTitle>
          <DialogDescription>Upload an Excel sheet or Student Photo ZIP to import & auto-match.</DialogDescription>
          <Badge variant="secondary" className="w-fit">Dataset: {currentDataset.name}</Badge>
        </DialogHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'excel' | 'zip')}>
          <TabsList className="w-full">
            <TabsTrigger
              value="excel"
              className="flex items-center gap-2 data-active:bg-primary data-active:text-primary-foreground dark:data-active:bg-primary dark:data-active:text-primary-foreground text-muted-foreground"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>1. Upload Student Excel (.xlsx / .csv)</span>
            </TabsTrigger>
            <TabsTrigger
              value="zip"
              className="flex items-center gap-2 data-active:bg-primary data-active:text-primary-foreground dark:data-active:bg-primary dark:data-active:text-primary-foreground text-muted-foreground"
            >
              <FileArchive className="w-[18px] h-[18px]" />
              <span>2. Upload Student Photos (.zip)</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Excel Upload */}
          <TabsContent value="excel" className="mt-4 space-y-4">
            <div
              onClick={() => {
                const fakeFile = new File([''], 'Class1_Students_2026.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                setExcelFile(fakeFile);
              }}
              className="border-2 border-dashed border-border hover:border-primary bg-muted/50 rounded-xl p-8 text-center cursor-pointer transition-all group"
            >
              <FileSpreadsheet className="w-12 h-12 mx-auto text-muted-foreground mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-semibold text-foreground">
                {excelFile ? excelFile.name : 'Click to select or drag & drop Class1_Students_2026.xlsx'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports Excel 97-2026 (.xlsx, .xls, .csv). Schema will auto-map to <span className="text-primary">dataset_fields</span>.
              </p>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 border border-border text-xs space-y-1.5 text-muted-foreground">
              <div className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Auto Header Detection Engine</span>
              </div>
              <p>
                Headers like <code className="text-primary">Student Name</code>, <code className="text-primary">Adm No</code>, <code className="text-primary">Father Name</code>, <code className="text-primary">DOB</code>, <code className="text-primary">Mobile</code> will be automatically matched.
              </p>
            </div>
          </TabsContent>

          {/* Tab 2: ZIP Photo Upload */}
          <TabsContent value="zip" className="mt-4 space-y-4">
            <div
              onClick={() => {
                const fakeZip = new File([''], 'Class1_Student_Photos.zip', { type: 'application/zip' });
                setZipFile(fakeZip);
              }}
              className="border-2 border-dashed border-border hover:border-primary bg-muted/50 rounded-xl p-8 text-center cursor-pointer transition-all group"
            >
              <FileArchive className="w-12 h-12 mx-auto text-muted-foreground mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-semibold text-foreground">
                {zipFile ? zipFile.name : 'Click to select or drag & drop Class1_Student_Photos.zip'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Name format inside ZIP: <code className="text-primary">GKB-2026-0101.jpg</code> or <code className="text-primary">Aarav_Sharma.jpg</code>
              </p>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 border border-border text-xs space-y-1.5 text-muted-foreground">
              <div className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Automated Face Detection & Smart Crop</span>
              </div>
              <p>
                Photos will be centered around detected faces, cropped to a 3:4 aspect ratio, resized to 600x800, and optimized for ultra-sharp card printing.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Progress Bar */}
        {isProcessing && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground font-semibold">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                Processing RQ Background Worker Job...
              </span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Match Results */}
        {matchResult && (
          <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 text-primary text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-primary text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Import & Auto-Matching Completed!</span>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-1 text-center font-mono">
              <div className="bg-muted/50 p-2 rounded border border-border">
                <span className="text-muted-foreground block text-[10px]">TOTAL RECORDS</span>
                <span className="text-lg font-bold text-foreground">{matchResult.totalRecords}</span>
              </div>
              <div className="bg-muted/50 p-2 rounded border border-border">
                <span className="text-muted-foreground block text-[10px]">PHOTOS MATCHED</span>
                <span className="text-lg font-bold text-primary">{matchResult.matchedPhotos}</span>
              </div>
              <div className="bg-muted/50 p-2 rounded border border-border">
                <span className="text-muted-foreground block text-[10px]">AUTO-CROPPED</span>
                <span className="text-lg font-bold text-primary">{matchResult.croppedPhotos}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-border flex justify-end gap-3">
          <DialogClose render={<Button variant="ghost" />} onClick={onClose}>
            Cancel
          </DialogClose>
          
          <Button
            variant="default"
            disabled={isProcessing || (!excelFile && !zipFile)}
            onClick={handleStartImport}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isProcessing ? 'Processing Queue...' : 'Run Auto-Matching Engine'}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

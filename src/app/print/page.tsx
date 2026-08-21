'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { CardPreview } from '@/components/CardPreview';
import { useCarditStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sparkles, Download, RefreshCw } from 'lucide-react';
import { Header } from '@/components/Header';

export default function PrintSheetGeneratorPage() {
  const { currentSchool, currentDataset, currentTemplate, datasetStudents, enqueueJob } = useCarditStore();

  const [paperSize, setPaperSize] = useState<'A4' | 'A3'>('A4');
  const [sheetSide, setSheetSide] = useState<'front' | 'back'>('front');
  const [showBleed, setShowBleed] = useState(true);
  const [showCropMarks, setShowCropMarks] = useState(true);
  const [showRegistrationMarks, setShowRegistrationMarks] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);

  const cardsPerPage = paperSize === 'A4' ? 5 : 12;
  const sampleSheetStudents = datasetStudents.slice(0, cardsPerPage);
  const totalSheets = Math.ceil(datasetStudents.length / cardsPerPage);

  const handleGeneratePDF = () => {
    setIsGenerating(true);
    setDownloadReady(false);

    enqueueJob({
      title: `${paperSize} Commercial Duplex PDF Generation (${currentDataset.name})`,
      type: 'pdf_generation',
      datasetId: currentDataset.id,
      progress: 100,
      status: 'completed',
      details: `Generated ${totalSheets} ${paperSize} Front & Back PDF sheets with registration targets and 3mm bleed.`
    });

    setTimeout(() => {
      setIsGenerating(false);
      setDownloadReady(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />
      <div className="flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-8 space-y-4 sm:space-y-6">
        <PageHeader
          title="Commercial Print Sheet Generator"
          description="Duplex printable sheets with crop marks (+), registration targets (⊕), 3mm bleed & 2mm safe zone line"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Button variant={paperSize === 'A4' ? 'default' : 'outline'} size="sm" onClick={() => setPaperSize('A4')} className="text-xs sm:text-sm">
              A4 (5-up)
            </Button>
            <Button variant={paperSize === 'A3' ? 'default' : 'outline'} size="sm" onClick={() => setPaperSize('A3')} className="text-xs sm:text-sm">
              A3 (12-up)
            </Button>
          </div>
          <Button size="sm" onClick={handleGeneratePDF} disabled={isGenerating} className="text-xs sm:text-sm">
            {isGenerating ? <RefreshCw className="animate-spin" /> : <Sparkles />}
            {isGenerating ? 'Rendering...' : `Generate ${paperSize} PDFs`}
          </Button>
        </PageHeader>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          <div className="lg:col-span-8">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle className="text-xs font-mono text-muted-foreground">
                    <span className="text-foreground font-bold">{paperSize} Sheet Layout</span>
                    <span className="mx-1">• Page 1 of {totalSheets}</span>
                    <span>({cardsPerPage} cards per page)</span>
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant={sheetSide === 'front' ? 'default' : 'outline'} size="sm" onClick={() => setSheetSide('front')} className="text-xs sm:text-sm">
                      Front ({paperSize})
                    </Button>
                    <Button variant={sheetSide === 'back' ? 'default' : 'outline'} size="sm" onClick={() => setSheetSide('back')} className="text-xs sm:text-sm">
                      Back ({paperSize})
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative w-full bg-card border border-border rounded-lg p-6 shadow-sm transition-all">
                  {showRegistrationMarks && (
                    <>
                      <div className="absolute top-2 left-2 font-mono text-foreground font-bold text-lg select-none">⊕</div>
                      <div className="absolute top-2 right-2 font-mono text-foreground font-bold text-lg select-none">⊕</div>
                      <div className="absolute bottom-2 left-2 font-mono text-foreground font-bold text-lg select-none">⊕</div>
                      <div className="absolute bottom-2 right-2 font-mono text-foreground font-bold text-lg select-none">⊕</div>
                    </>
                  )}

                  <div className="mb-4 pb-2 border-b border-border flex justify-between text-[9px] font-mono text-muted-foreground uppercase">
                    <span>{currentSchool.name} • {currentDataset.name}</span>
                    <span>JOB: {paperSize}_{sheetSide.toUpperCase()}_SHEET_1.PDF</span>
                  </div>

                  <div className={`grid gap-4 sm:gap-6 ${paperSize === 'A4' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
                    {sampleSheetStudents.map((student, idx) => (
                      <div key={student.id} className="relative">
                        {showCropMarks && (
                          <>
                            <div className="absolute -top-3 -left-3 font-mono text-xs font-bold text-foreground select-none">+</div>
                            <div className="absolute -top-3 -right-3 font-mono text-xs font-bold text-foreground select-none">+</div>
                            <div className="absolute -bottom-3 -left-3 font-mono text-xs font-bold text-foreground select-none">+</div>
                            <div className="absolute -bottom-3 -right-3 font-mono text-xs font-bold text-foreground select-none">+</div>
                          </>
                        )}

                        <CardPreview
                          template={currentTemplate}
                          student={student}
                          school={currentSchool}
                          side={sheetSide}
                          scale={paperSize === 'A4' ? 0.62 : 0.48}
                          showBleed={showBleed}
                        />

                        <div className="absolute -bottom-4 left-0 right-0 text-[10px] font-mono text-muted-foreground text-center">
                          Pos {idx + 1}: {student.admissionNo}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full pt-3 mt-4 border-t border-border flex justify-between text-xs font-mono text-muted-foreground">
                  <span>Duplex Alignment: <strong className="text-foreground">100% Mirror Aligned</strong></span>
                  <span>Crop Marks: 4 per card • Bleed: 3mm • Safe Zone: 2mm</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Print Specification & Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bleed" className="text-xs font-semibold cursor-pointer">Show 3mm Bleed Guidelines</Label>
                  <Checkbox id="bleed" checked={showBleed} onCheckedChange={setShowBleed} />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="cropmarks" className="text-xs font-semibold cursor-pointer">Include Four Corner Crop Marks (+)</Label>
                  <Checkbox id="cropmarks" checked={showCropMarks} onCheckedChange={setShowCropMarks} />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="regmarks" className="text-xs font-semibold cursor-pointer">Include Registration Marks (⊕)</Label>
                  <Checkbox id="regmarks" checked={showRegistrationMarks} onCheckedChange={setShowRegistrationMarks} />
                </div>
              </CardContent>
            </Card>

            {downloadReady && (
              <Card>
                <CardContent className="pt-6 space-y-2">
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => alert(`Downloading ${paperSize}_FRONT_SHEETS.pdf`)}
                  >
                    <Download />
                    Download {paperSize}_FRONT.pdf
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => alert(`Downloading ${paperSize}_BACK_SHEETS.pdf`)}
                  >
                    <Download />
                    Download {paperSize}_BACK.pdf
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
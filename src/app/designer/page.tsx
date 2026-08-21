'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { CardPreview } from '@/components/CardPreview';
import { useCarditStore } from '@/lib/store';
import { CardTemplate, TemplateElement, ElementType } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import {
  Type,
  QrCode,
  Barcode,
  Square,
  FileSignature,
  Save,
  Trash2,
  Code,
  CheckCircle2,
  Layers
} from 'lucide-react';

/**
 * Enterprise Template Designer Page
 * 
 * Professional SaaS builder interface with:
 * - Three-panel layout: left toolbar, center canvas, right inspector
 * - typo-page-title and semantic card patterns
 * - rounded-xl cards with shadow-sm throughout
 * - Clean accordion-based property inspector
 */
export default function TemplateDesignerPage() {
  const { currentSchool, currentTemplate, updateCardTemplate, datasetStudents } = useCarditStore();
  const sampleStudent = datasetStudents[0];

  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [templateState, setTemplateState] = useState<CardTemplate>(currentTemplate);
  const [jsonView, setJsonView] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentElements = activeSide === 'front' ? templateState.frontElements : templateState.backElements;
  const selectedElement = currentElements.find((el) => el.id === selectedElementId);

  const updateElement = (id: string, updates: Partial<TemplateElement>) => {
    setTemplateState((prev) => {
      const updateList = (elements: TemplateElement[]) =>
        elements.map((el) => (el.id === id ? { ...el, ...updates } : el));

      return {
        ...prev,
        frontElements: activeSide === 'front' ? updateList(prev.frontElements) : prev.frontElements,
        backElements: activeSide === 'back' ? updateList(prev.backElements) : prev.backElements
      };
    });
  };

  const handleAddElement = (type: ElementType) => {
    const newEl: TemplateElement = {
      id: `el-${Date.now()}`,
      type,
      label: `New ${type}`,
      content: type === 'text' ? 'New Text Object' : undefined,
      fieldKey: type === 'dynamic_field' ? 'name' : undefined,
      x: 30,
      y: 30,
      width: 40,
      height: 12,
      fontSize: 11,
      fontColor: '#ffffff',
      fontWeight: '600',
      zIndex: 15
    };

    setTemplateState((prev) => ({
      ...prev,
      frontElements: activeSide === 'front' ? [...prev.frontElements, newEl] : prev.frontElements,
      backElements: activeSide === 'back' ? [...prev.backElements, newEl] : prev.backElements
    }));

    setSelectedElementId(newEl.id);
  };

  const handleDeleteElement = (id: string) => {
    setTemplateState((prev) => ({
      ...prev,
      frontElements: prev.frontElements.filter((el) => el.id !== id),
      backElements: prev.backElements.filter((el) => el.id !== id)
    }));
    setSelectedElementId(null);
  };

  const handleSaveTemplate = () => {
    updateCardTemplate(templateState.id, templateState);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 w-full max-w-[1800px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5 sm:space-y-6">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          <div className="space-y-2">
            <h1 className="typo-page-title">Canvas Template Designer</h1>
            <p className="typo-body text-muted-foreground">
              Editing {templateState.name} for {currentSchool.name}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setJsonView(!jsonView)}
              className="shadow-sm hover:shadow transition-shadow"
            >
              <Code className="size-4" /> 
              {jsonView ? 'Hide JSON' : 'View JSON'}
            </Button>
            <Button 
              size="sm" 
              onClick={handleSaveTemplate}
              className="shadow-sm hover:shadow transition-shadow"
            >
              {saveSuccess ? <CheckCircle2 className="size-4" /> : <Save className="size-4" />}
              {saveSuccess ? 'Saved!' : 'Save Template'}
            </Button>
          </div>
        </div>

        {/* Three-panel layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-3 space-y-5">
            <Card className="rounded-xl shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="typo-card-title">Add Object</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { type: 'text', icon: Type, label: 'Text' },
                  { type: 'dynamic_field', icon: Type, label: 'Dynamic Field' },
                  { type: 'qr_code', icon: QrCode, label: 'QR Code' },
                  { type: 'barcode', icon: Barcode, label: 'Barcode' },
                  { type: 'shape', icon: Square, label: 'Shape' },
                  { type: 'signature', icon: FileSignature, label: 'Signature' }
                ].map(({ type, icon: Icon, label }) => (
                  <Button 
                    key={type}
                    variant="outline" 
                    className="w-full justify-start shadow-sm hover:shadow transition-shadow" 
                    onClick={() => handleAddElement(type as ElementType)}
                  >
                    <Icon className="size-4" /> {label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="typo-card-title flex items-center gap-2">
                  <Layers className="size-5" /> 
                  Canvas Layers
                  <span className="text-sm font-normal text-muted-foreground">({currentElements.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {currentElements.map((el) => (
                    <button
                      key={el.id}
                      onClick={() => setSelectedElementId(el.id)}
                      className={`w-full text-left px-3.5 py-3 rounded-lg border typo-body-strong transition-all ${
                        selectedElementId === el.id 
                          ? 'bg-secondary text-secondary-foreground border-border shadow-sm' 
                          : 'bg-background text-muted-foreground hover:bg-muted/50 border-border/60'
                      }`}
                    >
                      <span className="truncate block">{el.label}</span>
                      <span className="typo-caption block uppercase">{el.type}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CANVAS */}
          <div className="lg:col-span-6 order-first lg:order-none">
            <Card className="rounded-xl shadow-sm p-4 sm:p-8 flex flex-col items-center justify-center min-h-[360px] sm:min-h-[500px] relative">
              <div className="absolute top-3 sm:top-4 left-3 sm:left-5 typo-caption hidden sm:block">
                Canvas Workspace • Click elements to inspect
              </div>
              
              {/* Front/Back toggle */}
              <div className="absolute top-3 sm:top-4 right-3 sm:right-5 flex items-center bg-muted/80 p-0.5 sm:p-1 rounded-lg border border-border shadow-sm">
                <Button 
                  variant={activeSide === 'front' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => setActiveSide('front')}
                  className="shadow-none"
                >
                  Front
                </Button>
                <Button 
                  variant={activeSide === 'back' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => setActiveSide('back')}
                  className="shadow-none"
                >
                  Back
                </Button>
              </div>
              
              <div className="pt-10 sm:pt-8">
                <div className="sm:hidden">
                  <CardPreview
                    template={templateState}
                    student={sampleStudent}
                    school={currentSchool}
                    side={activeSide}
                    scale={0.85}
                    isEditable
                    selectedElementId={selectedElementId || undefined}
                    onClickElement={(el) => setSelectedElementId(el.id)}
                  />
                </div>
                <div className="hidden sm:block lg:hidden">
                  <CardPreview
                    template={templateState}
                    student={sampleStudent}
                    school={currentSchool}
                    side={activeSide}
                    scale={1.2}
                    isEditable
                    selectedElementId={selectedElementId || undefined}
                    onClickElement={(el) => setSelectedElementId(el.id)}
                  />
                </div>
                <div className="hidden lg:block">
                  <CardPreview
                    template={templateState}
                    student={sampleStudent}
                    school={currentSchool}
                    side={activeSide}
                    scale={1.4}
                    isEditable
                    selectedElementId={selectedElementId || undefined}
                    onClickElement={(el) => setSelectedElementId(el.id)}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT INSPECTOR */}
          <div className="lg:col-span-3 space-y-5">
            <Card className="rounded-xl shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="typo-card-title">Element Inspector</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedElement ? (
                  <Accordion defaultValue={['properties']} type="multiple">
                    <AccordionItem value="properties">
                      <AccordionTrigger className="typo-body-strong">Properties</AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <Label className="typo-meta-label">Label</Label>
                          <Input 
                            value={selectedElement.label} 
                            onChange={(e) => updateElement(selectedElement.id, { label: e.target.value })} 
                            className="shadow-sm"
                          />
                        </div>
                        
                        {selectedElement.type === 'text' && (
                          <div className="space-y-2">
                            <Label className="typo-meta-label">Text Content</Label>
                            <Textarea
                              rows={2}
                              value={selectedElement.content || ''}
                              onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                              className="shadow-sm"
                            />
                          </div>
                        )}
                        
                        {selectedElement.type === 'dynamic_field' && (
                          <div className="space-y-2">
                            <Label className="typo-meta-label">Field Binding</Label>
                            <Select 
                              value={selectedElement.fieldKey || 'name'} 
                              onValueChange={(v) => updateElement(selectedElement.id, { fieldKey: v ?? undefined })}
                            >
                              <SelectTrigger className="w-full shadow-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="name">Student Name</SelectItem>
                                <SelectItem value="admissionNo">Admission No</SelectItem>
                                <SelectItem value="className">Class & Section</SelectItem>
                                <SelectItem value="fatherName">Father Name</SelectItem>
                                <SelectItem value="dob">Date of Birth</SelectItem>
                                <SelectItem value="bloodGroup">Blood Group</SelectItem>
                                <SelectItem value="mobile">Mobile Number</SelectItem>
                                <SelectItem value="address">Address</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="typo-meta-label">X Pos (%)</Label>
                            <Input 
                              type="number" 
                              value={selectedElement.x} 
                              onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) })} 
                              className="shadow-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="typo-meta-label">Y Pos (%)</Label>
                            <Input 
                              type="number" 
                              value={selectedElement.y} 
                              onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) })} 
                              className="shadow-sm"
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="advanced">
                      <AccordionTrigger className="typo-body-strong">Position & Size</AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="typo-meta-label">Width (%)</Label>
                            <Input 
                              type="number" 
                              value={selectedElement.width} 
                              onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })} 
                              className="shadow-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="typo-meta-label">Height (%)</Label>
                            <Input 
                              type="number" 
                              value={selectedElement.height} 
                              onChange={(e) => updateElement(selectedElement.id, { height: Number(e.target.value) })} 
                              className="shadow-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="typo-meta-label">Font Size</Label>
                          <Input 
                            type="number" 
                            value={selectedElement.fontSize || 10} 
                            onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })} 
                            className="shadow-sm"
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : (
                  <div className="text-center py-16">
                    <p className="typo-body text-muted-foreground">
                      Select an object on the canvas or layer list to inspect properties.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedElement && (
              <Card className="rounded-xl border-destructive/30 shadow-sm">
                <CardContent className="p-5">
                  <Button 
                    variant="destructive" 
                    className="w-full shadow-sm hover:shadow transition-shadow" 
                    onClick={() => handleDeleteElement(selectedElement.id)}
                  >
                    <Trash2 className="size-4" /> Delete Object
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* JSON View */}
        {jsonView && (
          <Card className="rounded-xl shadow-sm">
            <CardContent className="p-6 font-mono">
              <h3 className="typo-card-title mb-4">
                Raw Template Canvas JSON Schema
              </h3>
              <pre className="bg-muted/50 p-5 rounded-lg text-xs text-foreground overflow-x-auto max-h-96 border border-border/60">
                {JSON.stringify(templateState, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { CardPreview } from '@/components/CardPreview';
import { useCarditStore } from '@/lib/store';
import { CardTemplate, TemplateElement, ElementType } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
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
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 space-y-6">
        {/* Top bar */}
        <PageHeader
          title="JSON Canvas Template Designer"
          description={`Editing ${templateState.name} for ${currentSchool.name}`}
        >
          <Button variant="outline" size="sm" onClick={() => setJsonView(!jsonView)}>
            <Code className="size-4" /> {jsonView ? 'Hide Raw JSON' : 'View Raw JSON'}
          </Button>
          <Button size="sm" onClick={handleSaveTemplate}>
            {saveSuccess ? <CheckCircle2 className="size-4" /> : <Save className="size-4" />}
            {saveSuccess ? 'Saved to DB!' : 'Save Template'}
          </Button>
        </PageHeader>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SIDEBAR: Add object palette + layer tree */}
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Add Object</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => handleAddElement('text')}>
                  <Type className="size-4" /> Text
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => handleAddElement('dynamic_field')}>
                  <Type className="size-4" /> Dynamic Field
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => handleAddElement('qr_code')}>
                  <QrCode className="size-4" /> QR Code
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => handleAddElement('barcode')}>
                  <Barcode className="size-4" /> Barcode
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => handleAddElement('shape')}>
                  <Square className="size-4" /> Shape
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => handleAddElement('signature')}>
                  <FileSignature className="size-4" /> Signature
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layers className="size-4" /> Canvas Layers ({currentElements.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto">
                  {currentElements.map((el) => (
                    <button
                      key={el.id}
                      onClick={() => setSelectedElementId(el.id)}
                      className={`text-left px-3 py-2 rounded-md border text-sm font-medium transition-colors ${selectedElementId === el.id ? 'bg-secondary text-secondary-foreground border-border' : 'bg-background text-muted-foreground hover:bg-muted border-border'}`}
                    >
                      <span className="truncate">{el.label}</span>
                      <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">{el.type}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CANVAS */}
          <div className="lg:col-span-6">
            <Card className="p-8 flex flex-col items-center justify-center min-h-[500px] relative">
              <div className="absolute top-3 left-4 text-xs font-mono text-muted-foreground">
                Canvas Workspace • Click elements to inspect and update positioning
              </div>
              {/* Front/Back toggle */}
              <div className="absolute top-3 right-4 flex items-center bg-muted p-0.5 rounded-lg border border-border">
                <Button variant={activeSide === 'front' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveSide('front')}>
                  Front
                </Button>
                <Button variant={activeSide === 'back' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveSide('back')}>
                  Back
                </Button>
              </div>
              <div className="pt-8">
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
            </Card>
          </div>

          {/* RIGHT INSPECTOR */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Element Inspector</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedElement ? (
                  <Accordion defaultValue={['properties']}>
                    <AccordionItem value="properties">
                      <AccordionTrigger className="text-sm">Properties</AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="space-y-1.5">
                          <Label>Label</Label>
                          <Input value={selectedElement.label} onChange={(e) => updateElement(selectedElement.id, { label: e.target.value })} />
                        </div>
                        {selectedElement.type === 'text' && (
                          <div className="space-y-1.5">
                            <Label>Text Content</Label>
                            <Textarea
                              rows={2}
                              value={selectedElement.content || ''}
                              onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                            />
                          </div>
                        )}
                        {selectedElement.type === 'dynamic_field' && (
                          <div className="space-y-1.5">
                            <Label>Field Binding</Label>
                            <Select value={selectedElement.fieldKey || 'name'} onValueChange={(v) => updateElement(selectedElement.id, { fieldKey: v ?? undefined })}>
                              <SelectTrigger className="w-full">
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
                          <div className="space-y-1.5">
                            <Label>X Pos (%)</Label>
                            <Input type="number" value={selectedElement.x} onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) })} />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Y Pos (%)</Label>
                            <Input type="number" value={selectedElement.y} onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) })} />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="advanced">
                      <AccordionTrigger className="text-sm">Position & Size</AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label>Width (%)</Label>
                            <Input type="number" value={selectedElement.width} onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })} />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Height (%)</Label>
                            <Input type="number" value={selectedElement.height} onChange={(e) => updateElement(selectedElement.id, { height: Number(e.target.value) })} />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label>Font Size</Label>
                          <Input type="number" value={selectedElement.fontSize || 10} onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })} />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : (
                  <div className="text-center py-12 text-sm text-muted-foreground">
                    Select an object on the canvas or layer list to inspect properties.
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedElement && (
              <Card className="mt-4 border-destructive/30">
                <CardContent className="p-4">
                  <Button variant="destructive" className="w-full" onClick={() => handleDeleteElement(selectedElement.id)}>
                    <Trash2 className="size-4" /> Delete Object
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {jsonView && (
          <Card className="p-6 font-mono">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Raw Template Canvas JSON Schema
            </h3>
            <pre className="bg-muted/50 p-4 rounded-lg text-xs text-foreground overflow-x-auto max-h-96">
              {JSON.stringify(templateState, null, 2)}
            </pre>
          </Card>
        )}
      </main>
    </div>
  );
}


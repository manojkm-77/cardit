'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { useCarditStore } from '@/lib/store';
import { FieldType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';

/**
 * Enterprise Schema Builder Page
 * 
 * Professional field management interface with:
 * - typo-page-title for main heading
 * - Clean table layout with proper spacing
 * - rounded-xl cards with shadow-sm
 * - Semantic badge and button usage
 */
export default function DynamicSchemaBuilderPage() {
  const { currentSchool, currentDataset, currentDatasetFields, addDatasetField, updateDatasetField, deleteDatasetField } = useCarditStore();

  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<FieldType>('text');
  const [newIsRequired, setNewIsRequired] = useState(false);
  const [newOptionsText, setNewOptionsText] = useState('');

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;

    const fieldKey = newFieldName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const options = newFieldType === 'select' ? newOptionsText.split(',').map((s) => s.trim()).filter(Boolean) : undefined;

    addDatasetField({
      datasetId: currentDataset.id,
      fieldName: newFieldName,
      fieldKey,
      fieldType: newFieldType,
      isRequired: newIsRequired,
      isSystem: false,
      visibility: true,
      sortOrder: currentDatasetFields.length + 1,
      options
    });

    setNewFieldName('');
    setNewOptionsText('');
    setNewIsRequired(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="typo-page-title">Dynamic Form Schema Builder</h1>
          <p className="typo-body text-muted-foreground">
            Configure dynamic fields per dataset for {currentDataset.name} ({currentSchool.name})
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* Fields Table */}
          <div className="lg:col-span-8">
            <Card className="rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="typo-card-title">
                  Active Schema Fields
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({currentDatasetFields.length} {currentDatasetFields.length === 1 ? 'Field' : 'Fields'})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="typo-meta-label">Order</TableHead>
                      <TableHead className="typo-meta-label">Field Name</TableHead>
                      <TableHead className="typo-meta-label">Database Key</TableHead>
                      <TableHead className="typo-meta-label">Data Type</TableHead>
                      <TableHead className="typo-meta-label">Required</TableHead>
                      <TableHead className="typo-meta-label">Visibility</TableHead>
                      <TableHead className="typo-meta-label text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentDatasetFields.map((field, idx) => (
                      <TableRow key={field.id}>
                        <TableCell className="font-mono text-sm text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold typo-body">{field.fieldName}</span>
                            {field.isSystem && <Badge variant="secondary" className="shadow-sm">System</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-primary font-medium">{field.fieldKey}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono shadow-sm">{field.fieldType}</Badge>
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={field.isRequired}
                            disabled={field.isSystem}
                            onCheckedChange={(c) => updateDatasetField(field.id, { isRequired: !!c })}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            disabled={field.isSystem}
                            onClick={() => updateDatasetField(field.id, { visibility: !field.visibility })}
                          >
                            {field.visibility ? <Eye className="size-4 text-primary" /> : <EyeOff className="size-4 text-muted-foreground" />}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          {!field.isSystem ? (
                            <Button
                              variant="destructive"
                              size="icon-sm"
                              onClick={() => deleteDatasetField(field.id)}
                              title="Delete Field"
                              className="shadow-sm"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          ) : (
                            <span className="typo-caption italic">System Field</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Field Form */}
          <div className="lg:col-span-4 order-first lg:order-none">
            <Card className="rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="typo-card-title flex items-center gap-2">
                  <Plus className="size-5" />
                  <span>Add Custom Field</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddField} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="field-label" className="typo-meta-label">Field Label *</Label>
                    <Input
                      id="field-label"
                      type="text"
                      required
                      placeholder="e.g. Bus Route, House Name, Aadhaar Last 4"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      className="shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="field-type" className="typo-meta-label">Field Type *</Label>
                    <Select value={newFieldType} onValueChange={(v) => setNewFieldType(v as FieldType)}>
                      <SelectTrigger id="field-type" className="w-full shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text Input</SelectItem>
                        <SelectItem value="number">Numeric Input</SelectItem>
                        <SelectItem value="date">Date Picker</SelectItem>
                        <SelectItem value="select">Dropdown Select</SelectItem>
                        <SelectItem value="phone">Phone Number</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newFieldType === 'select' && (
                    <div className="space-y-2">
                      <Label htmlFor="field-options" className="typo-meta-label">Dropdown Options</Label>
                      <Input
                        id="field-options"
                        type="text"
                        placeholder="Red House, Blue House, Green House"
                        value={newOptionsText}
                        onChange={(e) => setNewOptionsText(e.target.value)}
                        className="shadow-sm"
                      />
                      <p className="typo-caption">Comma separated values</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2.5 pt-1">
                    <Checkbox id="field-required" checked={newIsRequired} onCheckedChange={(c) => setNewIsRequired(!!c)} />
                    <Label htmlFor="field-required" className="typo-body-strong cursor-pointer">Mark Field as Mandatory</Label>
                  </div>

                  <Button type="submit" variant="default" className="w-full shadow-sm hover:shadow transition-shadow">
                    <Plus className="size-4" />
                    Add Field to Schema
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/page-header';
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
      <div className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-8 space-y-6">
        <PageHeader
          title="Dynamic Form Schema Builder"
          description={'Configure dynamic fields per dataset for ' + currentDataset.name + ' (' + currentSchool.name + ')'}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Active Schema Fields ({currentDatasetFields.length} Fields)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Field Name</TableHead>
                      <TableHead>Database Key</TableHead>
                      <TableHead>Data Type</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentDatasetFields.map((field, idx) => (
                      <TableRow key={field.id}>
                        <TableCell className="font-mono text-muted-foreground">{idx + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 font-semibold">
                            <span>{field.fieldName}</span>
                            {field.isSystem && <Badge variant="secondary">System</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-primary font-semibold">{field.fieldKey}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">{field.fieldType}</Badge>
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
                            size="icon"
                            disabled={field.isSystem}
                            onClick={() => updateDatasetField(field.id, { visibility: !field.visibility })}
                          >
                            {field.visibility ? <Eye className="text-primary" /> : <EyeOff className="text-muted-foreground" />}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          {!field.isSystem ? (
                            <Button
                              variant="destructive"
                              size="icon-sm"
                              onClick={() => deleteDatasetField(field.id)}
                              title="Delete Field"
                            >
                              <Trash2 />
                            </Button>
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">System Field</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Custom Field</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddField} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="field-label" className="text-xs font-semibold">Field Label *</Label>
                    <Input
                      id="field-label"
                      type="text"
                      required
                      placeholder="e.g. Bus Route, House Name, Aadhaar Last 4"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="field-type" className="text-xs font-semibold">Field Type *</Label>
                    <Select value={newFieldType} onValueChange={(v) => setNewFieldType(v as FieldType)}>
                      <SelectTrigger id="field-type" className="w-full">
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
                    <div className="space-y-1.5">
                      <Label htmlFor="field-options" className="text-xs font-semibold">Dropdown Options (Comma separated)</Label>
                      <Input
                        id="field-options"
                        type="text"
                        placeholder="Red House, Blue House, Green House"
                        value={newOptionsText}
                        onChange={(e) => setNewOptionsText(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <Checkbox id="field-required" checked={newIsRequired} onCheckedChange={(c) => setNewIsRequired(!!c)} />
                    <Label htmlFor="field-required" className="text-xs font-semibold cursor-pointer">Mark Field as Mandatory</Label>
                  </div>

                  <Button type="submit" variant="default" className="w-full">
                    <Plus />
                    Add Field to Schema
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
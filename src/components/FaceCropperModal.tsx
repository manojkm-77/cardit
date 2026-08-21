'use client';

import React, { useState, useEffect } from 'react';
import { Student, CropData } from '../lib/types';
import { useCarditStore } from '../lib/store';
import { ZoomIn, RotateCw, Check, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface FaceCropperModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onCropApplied?: (cropData: CropData, croppedUrl?: string) => void;
}

export const FaceCropperModal: React.FC<FaceCropperModalProps> = ({ 
  student, 
  isOpen, 
  onClose,
  onCropApplied 
}) => {
  const { updateStudent } = useCarditStore();
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (student) {
      // Sync local slider state when a new student opens the modal.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setZoom(student.photoCrop?.zoom || 1);
      setRotation(student.photoCrop?.rotation || student.photoRotation || 0);
      setPosX(student.photoCrop?.x || 0);
      setPosY(student.photoCrop?.y || 0);
    }
  }, [student, isOpen]);

  if (!student) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - posX, y: e.clientY - posY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosX(e.clientX - dragStart.x);
    setPosY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSaveCrop = () => {
    if (!student.photoUrl) return;

    const cropData: CropData = {
      x: posX,
      y: posY,
      zoom,
      rotation
    };

    const targetPhoto = student.photoUrl;

    if (onCropApplied) {
      onCropApplied(cropData, targetPhoto);
    } else {
      updateStudent(student.id, {
        photoUrl: targetPhoto,
        photoCrop: cropData,
        photoRotation: rotation,
        photoUpdatedAt: new Date().toISOString()
      });
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crop Student Photo (3:4)</DialogTitle>
          <DialogDescription>{student.name} â€¢ ADM: {student.admissionNo}</DialogDescription>
        </DialogHeader>

        {/* Interactive 3:4 Aspect Ratio Canvas */}
        <div 
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="relative w-full h-72 bg-muted rounded-lg overflow-hidden flex items-center justify-center border border-border cursor-grab active:cursor-grabbing select-none"
        >
          {/* 3:4 Aspect Ratio Overlay Target */}
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-64 border-2 border-primary/50 rounded-xl relative">
              {/* Face Guide Marker */}
              <div className="absolute inset-4 border border-dashed border-primary/30 rounded-full flex items-center justify-center">
                <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted/80 px-2 py-0.5 rounded">
                  Center Face Here (3:4)
                </span>
              </div>
              <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-primary/50" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-primary/50" />
              <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-primary/50" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-primary/50" />
            </div>
          </div>

          {/* Student Photo */}
          {student.photoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={student.photoUrl}
              alt={student.name}
              className="transition-transform duration-75 object-contain max-h-full"
              style={{
                transform: `translate(${posX}px, ${posY}px) scale(${zoom}) rotate(${rotation}deg)`
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground">
              <User className="w-12 h-12 mb-2 text-muted-foreground" />
              <span className="text-xs font-semibold">No Photo Available</span>
            </div>
          )}
        </div>

        {/* Sliders: Zoom & Rotation */}
        <div className="space-y-3 bg-muted/50 p-4 rounded-lg border border-border text-xs">
          
          {/* Zoom Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-foreground font-semibold">
              <span className="flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-primary" />
                Zoom Level
              </span>
              <span className="font-mono text-primary font-bold">{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Rotation Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-foreground font-semibold">
              <span className="flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-primary" />
                Rotation Angle
              </span>
              <span className="font-mono text-primary font-bold">{rotation}Â°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <DialogClose render={<Button variant="ghost" />} onClick={onClose}>
            Cancel
          </DialogClose>

          <Button
            variant="default"
            onClick={handleSaveCrop}
            disabled={!student.photoUrl}
            className="flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Apply Crop</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

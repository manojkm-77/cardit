'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { CardTemplate, Student, School, TemplateElement } from '../lib/types';
import { User, QrCode } from 'lucide-react';

interface CardPreviewProps {
  template: CardTemplate;
  student: Student;
  school: School;
  side?: 'front' | 'back';
  scale?: number; // scale multiplier e.g. 1.0, 1.5, 2.0
  showBleed?: boolean;
  showCropMarks?: boolean;
  onClickElement?: (element: TemplateElement) => void;
  selectedElementId?: string;
  isEditable?: boolean;
}

export const CardPreview: React.FC<CardPreviewProps> = ({
  template,
  student,
  school,
  side = 'front',
  scale = 1,
  showBleed = false,
  showCropMarks = false,
  onClickElement,
  selectedElementId,
  isEditable = false
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Generate QR Code data URL dynamically for student UUID
  useEffect(() => {
    if (student?.qrUuid) {
      const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://cardit.io'}/verify/${student.qrUuid}`;
      QRCode.toDataURL(verifyUrl, {
        margin: 1,
        width: 180,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR generation error:', err));
    }
  }, [student?.qrUuid]);

  const elements = side === 'front' ? template.frontElements : template.backElements;
  const bgColor = side === 'front' ? template.bgFrontColor || '#1e1b4b' : template.bgBackColor || '#0f172a';

  // Card dimensions in pixels for standard screen rendering (1mm = ~3.78px base at 1x)
  // CR80: 85.6mm x 53.9mm -> ~400px x 252px base size
  const baseWidth = template.orientation === 'landscape' ? 420 : 265;
  const baseHeight = template.orientation === 'landscape' ? 265 : 420;

  const cardWidth = baseWidth * scale;
  const cardHeight = baseHeight * scale;

  // Render dynamic field value helper
  const getFieldValue = (fieldKey?: string, defaultContent?: string): string => {
    if (!fieldKey) return defaultContent || '';
    if (fieldKey === 'name') return student.name || 'Student Name';
    if (fieldKey === 'admissionNo') return student.admissionNo || 'GKB-2026-0000';
    if (fieldKey === 'className') return student.className || 'Class 1-A';
    if (fieldKey === 'fatherName') return `S/O: ${student.fatherName || 'Parent Name'}`;
    if (fieldKey === 'dob') return `DOB: ${student.dynamicData.dob || 'DD-MM-YYYY'}`;
    if (fieldKey === 'bloodGroup') return `BLOOD: ${student.dynamicData.bloodGroup || 'N/A'}`;
    if (fieldKey === 'mobile') return `MOB: ${student.dynamicData.mobile || '+91 00000 00000'}`;
    if (fieldKey === 'emergencyPhone') return `EMERGENCY: ${student.dynamicData.emergencyPhone || student.dynamicData.mobile || 'N/A'}`;
    if (fieldKey === 'address') return `ADDR: ${student.dynamicData.address || 'Address line 1, City, Pincode'}`;

    return student.dynamicData[fieldKey] || defaultContent || `[${fieldKey}]`;
  };

  return (
    <div className="relative inline-block select-none" style={{ padding: showBleed || showCropMarks ? '24px' : '0px' }}>
      {/* Bleed outline guide */}
      {showBleed && (
        <div
          className="absolute inset-0 border border-dashed border-destructive/50 pointer-events-none rounded-lg z-30 flex items-start justify-start p-1"
        >
          <span className="text-[9px] text-destructive bg-muted/80 px-1 rounded font-mono">3mm Bleed Boundary</span>
        </div>
      )}

      {/* Main Card Container */}
      <div
        className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300"
        style={{
          width: `${cardWidth}px`,
          height: `${cardHeight}px`,
          backgroundColor: bgColor
        }}
      >
        {/* Elements Layer */}
        {elements.map((el) => {
          const isSelected = isEditable && selectedElementId === el.id;

          const left = (el.x / 100) * cardWidth;
          const top = (el.y / 100) * cardHeight;
          const width = (el.width / 100) * cardWidth;
          const height = (el.height / 100) * cardHeight;
          const fontSize = (el.fontSize || 10) * scale;

          return (
            <div
              key={el.id}
              onClick={() => onClickElement && onClickElement(el)}
              className={`absolute transition-all duration-150 ${
                isEditable ? 'cursor-pointer hover:ring-2 hover:ring-ring' : ''
              } ${isSelected ? 'ring-2 ring-primary z-50' : ''}`}
              style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                height: `${height}px`,
                zIndex: el.zIndex || 10
              }}
            >
              {/* Element Type: Shape */}
              {el.type === 'shape' && (
                <div
                  className="w-full h-full"
                  style={{
                    backgroundColor: el.backgroundColor || '#312e81',
                    borderRadius: el.borderRadius ? `${typeof el.borderRadius === 'number' ? el.borderRadius * scale : parseInt(String(el.borderRadius)) * scale}px` : '0px'
                  }}
                />
              )}

              {/* Element Type: Text */}
              {el.type === 'text' && (
                <div
                  className="w-full h-full flex items-center leading-tight whitespace-pre-line"
                  style={{
                    fontSize: `${fontSize}px`,
                    color: el.fontColor || '#ffffff',
                    fontWeight: el.fontWeight || '400',
                    fontFamily: el.fontFamily || 'Inter, sans-serif',
                    justifyContent: el.align === 'center' ? 'center' : el.align === 'right' ? 'flex-end' : 'flex-start'
                  }}
                >
                  {el.content}
                </div>
              )}

              {/* Element Type: Dynamic Field */}
              {el.type === 'dynamic_field' && (
                <div
                  className="w-full h-full flex items-center leading-tight overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{
                    fontSize: `${fontSize}px`,
                    color: el.fontColor || '#ffffff',
                    fontWeight: el.fontWeight || '600',
                    fontFamily: el.fontFamily || 'Inter, sans-serif',
                    justifyContent: el.align === 'center' ? 'center' : el.align === 'right' ? 'flex-end' : 'flex-start'
                  }}
                >
                  {getFieldValue(el.fieldKey, el.content)}
                </div>
              )}

              {/* Element Type: School Logo */}
              {el.type === 'logo' && (
                <div className="w-full h-full flex items-center justify-center overflow-hidden rounded">
                  {school.logoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={school.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-primary flex items-center justify-center font-bold text-primary-foreground text-xs">
                      {school.code}
                    </div>
                  )}
                </div>
              )}

              {/* Element Type: Student Photo */}
              {el.type === 'photo' && (
                <div
                  className="relative w-full h-full overflow-hidden bg-muted flex items-center justify-center"
                  style={{
                    borderRadius: el.borderRadius ? `${typeof el.borderRadius === 'number' ? el.borderRadius * scale : parseInt(String(el.borderRadius)) * scale}px` : '6px',
                    border: `${(el.strokeWidth || 2) * scale}px solid ${el.strokeColor || '#6366f1'}`
                  }}
                >
                  {student.photoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground text-center p-1">
                      <User className="w-6 h-6 mb-1 text-muted-foreground" />
                      <span className="text-[8px] font-medium leading-none">No Photo</span>
                    </div>
                  )}

                  {!student.photoCropped && student.photoUrl && (
                    <div className="absolute top-0 right-0 bg-destructive/10 text-destructive text-[10px] font-bold px-1 py-0.5 rounded-bl">
                      Uncropped
                    </div>
                  )}
                </div>
              )}

              {/* Element Type: Dynamic QR Code */}
              {el.type === 'qr_code' && (
                <div className="w-full h-full bg-white p-0.5 rounded flex items-center justify-center shadow-md">
                  {qrDataUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={qrDataUrl} alt="QR" className="w-full h-full object-contain" />
                  ) : (
                    <QrCode className="w-full h-full text-muted-foreground" />
                  )}
                </div>
              )}

              {/* Element Type: Barcode */}
              {el.type === 'barcode' && (
                <div className="w-full h-full bg-white p-1 rounded flex flex-col items-center justify-center">
                  {/* Simulated SVG Barcode */}
                  <svg className="w-full h-3/4" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <rect x="2" y="0" width="3" height="20" fill="#000" />
                    <rect x="7" y="0" width="1" height="20" fill="#000" />
                    <rect x="10" y="0" width="4" height="20" fill="#000" />
                    <rect x="16" y="0" width="2" height="20" fill="#000" />
                    <rect x="20" y="0" width="5" height="20" fill="#000" />
                    <rect x="27" y="0" width="1" height="20" fill="#000" />
                    <rect x="30" y="0" width="3" height="20" fill="#000" />
                    <rect x="35" y="0" width="6" height="20" fill="#000" />
                    <rect x="43" y="0" width="2" height="20" fill="#000" />
                    <rect x="47" y="0" width="4" height="20" fill="#000" />
                    <rect x="53" y="0" width="1" height="20" fill="#000" />
                    <rect x="56" y="0" width="5" height="20" fill="#000" />
                    <rect x="63" y="0" width="2" height="20" fill="#000" />
                    <rect x="67" y="0" width="3" height="20" fill="#000" />
                    <rect x="72" y="0" width="6" height="20" fill="#000" />
                    <rect x="80" y="0" width="1" height="20" fill="#000" />
                    <rect x="83" y="0" width="4" height="20" fill="#000" />
                    <rect x="89" y="0" width="2" height="20" fill="#000" />
                    <rect x="93" y="0" width="4" height="20" fill="#000" />
                  </svg>
                  <span className="text-[7px] font-mono tracking-widest text-foreground mt-0.5">
                    {student.admissionNo || 'GKB-2026-0000'}
                  </span>
                </div>
              )}

              {/* Element Type: Signature */}
              {el.type === 'signature' && (
                <div className="w-full h-full flex flex-col items-center justify-end text-center">
                  <div className="w-3/4 border-b border-border mb-0.5" />
                  <span
                    className="font-serif italic text-muted-foreground"
                    style={{ fontSize: `${(el.fontSize || 8) * scale}px` }}
                  >
                    Dr. S. K. Roy
                  </span>
                  <span className="text-[7px] text-muted-foreground uppercase tracking-wider">
                    {el.content || 'Principal'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};


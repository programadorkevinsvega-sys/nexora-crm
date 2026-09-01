import React from 'react';
import { BlockType } from './email-template-types';

const BLOCK_TYPES: { type: BlockType; label: string; icon: string }[] = [
  { type: 'text', label: 'Text', icon: 'T' },
  { type: 'image', label: 'Image', icon: 'IMG' },
  { type: 'button', label: 'Button', icon: 'BTN' },
  { type: 'spacer', label: 'Spacer', icon: 'SPC' },
  { type: 'divider', label: 'Divider', icon: 'DIV' },
];

export function EmailBlockPalette() {
  const handleDragStart = (e: React.DragEvent, type: BlockType) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type, action: 'add' }));
  };

  return (
    <div className="w-64 border-r border-border bg-card p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold mb-4 text-foreground">Blocks</h3>
      <div className="space-y-2.5">
        {BLOCK_TYPES.map((block) => (
          <div
            key={block.type}
            draggable
            onDragStart={(e) => handleDragStart(e, block.type)}
            className="flex items-center p-2.5 border border-border rounded-lg cursor-move bg-background hover:border-primary/50 transition-colors group"
          >
            <div className="w-8 h-8 flex items-center justify-center bg-muted border border-border rounded-md mr-3 text-xs font-bold text-foreground">
              {block.icon}
            </div>
            <span className="text-xs font-medium text-foreground">{block.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-8 text-[11px] text-muted-foreground">
        Drag blocks onto the canvas to build your email template.
      </div>
    </div>
  );
}

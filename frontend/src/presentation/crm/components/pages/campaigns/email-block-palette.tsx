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
    <div className="w-64 border-r border-gray-200 bg-white p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Blocks</h3>
      <div className="space-y-3">
        {BLOCK_TYPES.map((block) => (
          <div
            key={block.type}
            draggable
            onDragStart={(e) => handleDragStart(e, block.type)}
            className="flex items-center p-3 border border-gray-200 rounded-md cursor-move bg-gray-50 hover:bg-blue-50 transition-colors"
          >
            <div className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded mr-3 text-sm font-bold text-gray-500">
              {block.icon}
            </div>
            <span className="text-sm font-medium text-gray-700">{block.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-8 text-xs text-gray-500">
        Drag blocks onto the canvas to build your email template.
      </div>
    </div>
  );
}

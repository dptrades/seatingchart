import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';

const DraggableGuest = ({ guest, isSelected, onToggleSelect }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: guest.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onToggleSelect}
      className={`relative group glass-card p-3 flex items-center gap-3 cursor-pointer transition-all ${isDragging ? 'opacity-0' : 'opacity-100'} ${isSelected ? 'selected-guest' : ''}`}
    >
      <div 
        className={`w-4 h-4 rounded-full border transition-all flex items-center justify-center ${isSelected ? 'bg-white border-white' : 'border-white/20 group-hover:border-accent'}`}
      >
        {isSelected && <div className="w-1.5 h-1.5 bg-[#818cf8] rounded-full" />}
      </div>
      
      {/* Dedicated Drag Handle */}
      <div 
        {...listeners} 
        {...attributes}
        className="cursor-grab active:cursor-grabbing p-1 -m-1 hover:bg-black/10 rounded-md transition-colors"
      >
        <GripVertical size={16} className={`${isSelected ? 'text-[#0a0c10]' : 'text-dim group-hover:text-accent'} transition-colors`} />
      </div>

      <span className="text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis flex-1 select-none">
        {guest.name}
      </span>
    </div>
  );
};

export default DraggableGuest;

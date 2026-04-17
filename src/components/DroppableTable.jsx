import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import DraggableGuest from './DraggableGuest';
import { Users as UsersIcon } from 'lucide-react';

const DroppableTable = ({ 
  id, 
  table, 
  assignedGuests = [], 
  children, 
  isSidebar = false,
  selectedGuestIds = [],
  toggleSelection
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  if (isSidebar) {
    return (
      <div 
        ref={setNodeRef} 
        className={`flex-1 flex flex-col gap-2 p-2 rounded-xl transition-colors ${isOver ? 'bg-accent/10 border-2 border-dashed border-accent' : 'bg-transparent'}`}
      >
        {children}
      </div>
    );
  }

  const isFull = assignedGuests.length >= table.capacity;

  return (
    <div className="flex flex-col gap-4">
      <div 
        ref={setNodeRef}
        className={`relative glass-card p-3 flex flex-col items-center justify-center min-h-[200px] transition-all group ${
          isOver ? 'border-accent shadow-[0_0_30px_rgba(0,242,255,0.2)] scale-[1.02]' : ''
        } ${isFull ? 'border-amber-500/30' : ''}`}
      >
        <div className="absolute top-1.5 left-2.5 flex items-center gap-2">
          <span className="text-[9px] font-bold uppercase tracking-wider text-accent">{table.label}</span>
        </div>
        
        <div className="absolute top-1.5 right-2.5 flex items-center gap-1.5 text-[9px] text-dim">
          <UsersIcon size={8} className={isFull ? 'text-amber-500' : 'text-accent'} />
          <span className={isFull ? 'text-amber-500 font-bold' : ''}>
            {assignedGuests.length} / {table.capacity}
          </span>
        </div>

        <div className={`
          relative flex items-center justify-center mb-2 transition-all
          ${table.shape === 'round' ? 'rounded-full w-20 h-20' : 'rounded-2xl w-28 h-18'}
          bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-[inset_0_2px_10px_rgba(255,255,255,0.05)]
          ${isOver ? 'from-accent/20 to-accent/5 border-accent/30' : ''}
        `}>
          <div className="text-xl font-bold text-white/20 select-none">
            {table.id.split('-')[1]}
          </div>
          
          {Array.from({ length: table.capacity }).map((_, i) => {
             const angle = (i * 360) / table.capacity;
             const radius = table.shape === 'round' ? 45 : 65;
             const x = radius * Math.cos((angle * Math.PI) / 180);
             const y = radius * Math.sin((angle * Math.PI) / 180);
             const isOccupied = i < assignedGuests.length;
             
             return (
               <div 
                 key={i}
                 className={`absolute w-3 h-3 rounded-full border transition-all duration-500 ${
                   isOccupied 
                   ? 'bg-accent border-accent shadow-[0_0_10px_rgba(0,242,255,0.8)] scale-110' 
                   : 'bg-white/10 border-white/20'
                 }`}
                 style={{
                   transform: `translate(${x}px, ${y}px)`
                 }}
               />
             );
          })}
        </div>

        <div className="w-full mt-4 space-y-2">
          {assignedGuests.map(guest => (
            <DraggableGuest 
              key={guest.id} 
              guest={guest} 
              isSelected={selectedGuestIds.includes(guest.id)}
              onToggleSelect={(e) => toggleSelection(guest.id, e)}
            />
          ))}
          
          {assignedGuests.length === 0 && !isOver && (
            <div className="text-center py-4 text-xs text-dim italic border border-dashed border-white/5 rounded-lg">
              Drag guests here
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DroppableTable;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DndContext, 
  DragOverlay, 
  PointerSensor, 
  useSensor, 
  useSensors,
  defaultDropAnimationSideEffects,
  rectIntersection
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DraggableGuest from './DraggableGuest';
import DroppableTable from './DroppableTable';
import { Users, Layout as LayoutIcon } from 'lucide-react';

const SeatingCanvas = ({ guests, setGuests, tables }) => {
  const [activeId, setActiveId] = useState(null);
  const [selectedGuestIds, setSelectedGuestIds] = useState([]);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    // If dragging a guest that isn't selected, clear selection or just drag that one
    if (!selectedGuestIds.includes(event.active.id)) {
      setSelectedGuestIds([]);
    }
  };

  const toggleSelection = (guestId, e) => {
    e.stopPropagation(); // Prevent drag from starting on click
    const guest = guests.find(g => g.id === guestId);
    
    setSelectedGuestIds(prev => {
      if (prev.includes(guestId)) {
        return prev.filter(id => id !== guestId);
      }
      
      // If guest is assigned to a table, enforce "one per table" rule
      if (guest.tableId) {
        const tableGroupIds = guests
          .filter(g => g.tableId === guest.tableId)
          .map(g => g.id);
        
        const filtered = prev.filter(id => !tableGroupIds.includes(id));
        return [...filtered, guestId];
      }
      
      // Unassigned guests still allow multi-selection
      return [...prev, guestId];
    });
  };

  const handleDragEnd = (event) => {
    const { over, active } = event;
    setActiveId(null);

    if (!over) return;

    const overId = over.id;
    const isOverTable = overId.toString().startsWith('table-');
    const isOverUnassigned = overId === 'unassigned';
    
    if (!isOverTable && !isOverUnassigned) return;

    // Determine which guests to move
    const movingGuestIds = selectedGuestIds.includes(active.id) 
      ? selectedGuestIds 
      : [active.id];

    setGuests(prevGuests => {
      let updatedGuests = [...prevGuests];
      
      if (isOverUnassigned) {
        // Move all selected to unassigned
        updatedGuests = updatedGuests.map(g => 
          movingGuestIds.includes(g.id) ? { ...g, tableId: null } : g
        );
      } else if (isOverTable) {
        const tableId = overId;
        const targetTable = tables.find(t => t.id === tableId);
        
        // Move guests one by one until table is full
        movingGuestIds.forEach(gid => {
          const currentTableGuests = updatedGuests.filter(g => g.tableId === tableId);
          if (currentTableGuests.length < targetTable.capacity) {
            updatedGuests = updatedGuests.map(g => 
              g.id === gid ? { ...g, tableId } : g
            );
          }
        });
      }
      
      return updatedGuests;
    });

    // Clear selection after batch move
    setSelectedGuestIds([]);
  };

  const unassignedGuests = guests.filter(g => !g.tableId);
  const activeGuest = guests.find(g => g.id === activeId);

  return (
      <DndContext 
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-[calc(100vh-140px)] gap-4 overflow-hidden">
          {/* Sidebar: Unassigned Guests (30% width) */}
          <div className="w-30 shrink-0 flex flex-col glass border-r border-white/5 p-4 rounded-2xl">
          <div className="flex flex-col gap-3 mb-4 px-2">
            <h3 className="text-sm font-semibold text-accent flex items-center gap-2">
              <Users size={16} /> Unassigned ({unassignedGuests.length})
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedGuestIds(unassignedGuests.map(g => g.id))}
                className="text-[10px] uppercase tracking-wider text-dim hover:text-accent transition-colors"
              >
                Select All
              </button>
              <span className="text-dim/20">|</span>
              <button 
                onClick={() => setSelectedGuestIds([])}
                className="text-[10px] uppercase tracking-wider text-dim hover:text-red-400 transition-colors"
                disabled={selectedGuestIds.length === 0}
              >
                Clear ({selectedGuestIds.length})
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            <DroppableTable id="unassigned" label="Unassigned Area" isSidebar>
              {unassignedGuests.map(guest => (
                <DraggableGuest 
                  key={guest.id} 
                  guest={guest} 
                  isSelected={selectedGuestIds.includes(guest.id)}
                  onToggleSelect={(e) => toggleSelection(guest.id, e)}
                />
              ))}
            </DroppableTable>
          </div>
        </div>

        {/* Main Area: Tables (70% width) */}
        <div className="w-70 overflow-y-auto p-4 glass rounded-2xl border border-white/5 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {tables.map(table => (
              <DroppableTable 
                key={table.id} 
                id={table.id} 
                table={table}
                assignedGuests={guests.filter(g => g.tableId === table.id)}
                selectedGuestIds={selectedGuestIds}
                toggleSelection={toggleSelection}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Multi-Select Tip Bar */}
      <AnimatePresence>
        {selectedGuestIds.length > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="glass-card px-8 py-4 border-selection bg-selection-soft backdrop-blur-xl rounded-full flex items-center gap-6 border" style={{ boxShadow: '0 0 30px var(--selection-glow)' }}>
              <div className="flex -space-x-3">
                {selectedGuestIds.slice(0, 3).map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-selection border-2 border-bg-dark flex items-center justify-center text-[10px] font-bold text-on-accent" style={{ background: 'var(--selection)', color: 'var(--text-on-accent)' }}>
                    {i === 2 && selectedGuestIds.length > 3 ? `+${selectedGuestIds.length - 2}` : ''}
                  </div>
                ))}
              </div>
              <div className="text-sm font-semibold text-white">
                {selectedGuestIds.length} Guests Selected
                <span className="text-dim font-normal ml-3">Drag any handle to move group</span>
              </div>
              <button 
                onClick={() => setSelectedGuestIds([])}
                className="pointer-events-auto ml-4 text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: '0.5',
            },
          },
        }),
      }}>
        {activeId && activeGuest ? (
          <div className={`glass-card p-3 border-selection bg-selection-soft cursor-grabbing scale-105 w-fit ${selectedGuestIds.length > 1 ? 'border-2' : ''}`} style={{ boxShadow: '0 0 25px var(--selection-glow)' }}>
            <span className="text-sm font-medium whitespace-nowrap">
              {selectedGuestIds.includes(activeId) && selectedGuestIds.length > 1 
                ? `Moving ${selectedGuestIds.length} guests...` 
                : activeGuest.name}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default SeatingCanvas;

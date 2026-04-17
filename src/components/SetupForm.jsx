import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Layout, ChevronRight, Upload, Info, Settings } from 'lucide-react';

const SetupForm = ({ onComplete }) => {
  const [guestText, setGuestText] = useState('');
  const [guestsPerTable, setGuestsPerTable] = useState(8);
  const [roundCount, setRoundCount] = useState(4);
  const [rectCount, setRectCount] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Parse guest text
    const lines = guestText.split('\n').filter(line => line.trim() !== '');
    const guests = lines.map((line, index) => {
      // Replace tabs or multiple spaces with a single space to handle spreadsheet pastes
      const cleanName = line.replace(/[\t,]+/g, ' ').replace(/\s+/g, ' ').trim();
      return {
        id: `guest-${index}`,
        name: cleanName,
        tableId: null
      };
    });

    if (guests.length === 0) {
      alert('Please enter at least one guest name.');
      return;
    }

    if (roundCount === 0 && rectCount === 0) {
      alert('Please specify at least one table.');
      return;
    }

    onComplete(guests, { guestsPerTable, roundCount, rectCount });
  };

  return (
    <div className="glass-card p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-accent/20 rounded-xl text-accent border border-accent/30">
          <Settings size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Event Configuration</h2>
          <p className="text-dim text-sm">Specify your guest list and table requirements.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Guest List section */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-text-main">
            <Users size={16} className="text-accent" />
            Guest List
          </label>
          <textarea
            autoFocus
            className="w-full h-48 bg-black/40 border border-white/10 rounded-xl p-4 focus:border-accent/50 outline-none transition-all resize-none font-mono text-sm"
            placeholder="John Doe&#10;Jane Smith&#10;Alice Johnson..."
            value={guestText}
            onChange={(e) => setGuestText(e.target.value)}
          />
          <div className="flex items-center gap-2 text-xs text-dim bg-white/5 p-3 rounded-lg border border-white/5">
            <Info size={14} className="text-accent-deep" />
            <span>Enter one name per line or paste from a spreadsheet.</span>
          </div>
        </div>

        {/* Table Config section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-text-main">
              <Layout size={16} className="text-accent" />
              Round Tables
            </label>
            <input
              type="number"
              min="0"
              className="w-full"
              value={roundCount}
              onChange={(e) => setRoundCount(parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-text-main">
              <Layout size={16} className="text-accent" />
              Rect. Tables
            </label>
            <input
              type="number"
              min="0"
              className="w-full"
              value={rectCount}
              onChange={(e) => setRectCount(parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-text-main">
              <Layout size={16} className="text-accent" />
              Capacity
            </label>
            <input
              type="number"
              min="1"
              max="20"
              className="w-full"
              value={guestsPerTable}
              onChange={(e) => setGuestsPerTable(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full btn-primary py-4 justify-center text-lg mt-4"
        >
          Generate Seating System <ChevronRight size={20} />
        </motion.button>
      </form>
    </div>
  );
};

export default SetupForm;

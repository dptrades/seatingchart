import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Settings, 
  ChevronRight, 
  Layout, 
  RefreshCcw,
  FileSpreadsheet,
  Copy,
  Check,
  AlertTriangle,
  X
} from 'lucide-react';
import SeatingCanvas from './components/SeatingCanvas';
import SetupForm from './components/SetupForm';

function App() {
  const [phase, setPhase] = useState('setup'); // 'setup' | 'seating'
  const [guests, setGuests] = useState([]);
  const [tables, setTables] = useState([]);
  const [config, setConfig] = useState({
    guestsPerTable: 8,
    tableShape: 'round'
  });
  const [status, setStatus] = useState(''); // '', 'exported', 'copied'
  const [showResetModal, setShowResetModal] = useState(false);
  
  const canvasRef = useRef(null);

  const handleStartSeating = (newGuests, tableConfig) => {
    setGuests(newGuests);
    setConfig(tableConfig);
    
    let newTables = [];
    let tableIndex = 1;

    // Generate Round Tables
    for (let i = 0; i < tableConfig.roundCount; i++) {
      newTables.push({
        id: `table-r-${tableIndex}`,
        label: `Table ${tableIndex} (Round)`,
        shape: 'round',
        capacity: tableConfig.guestsPerTable
      });
      tableIndex++;
    }

    // Generate Rectangular Tables
    for (let i = 0; i < tableConfig.rectCount; i++) {
      newTables.push({
        id: `table-s-${tableIndex}`,
        label: `Table ${tableIndex} (Rect)`,
        shape: 'rect',
        capacity: tableConfig.guestsPerTable
      });
      tableIndex++;
    }
    
    setTables(newTables);
    setPhase('seating');
  };

  const getCSVData = () => {
    const headers = ['Guest Name', 'Table Assignment', 'Table Shape'];
    const rows = guests.map(guest => {
      const table = tables.find(t => t.id === guest.tableId);
      return [
        `"${guest.name.replace(/"/g, '""')}"`,
        table ? table.label : 'Unassigned',
        table ? table.shape.toUpperCase() : 'N/A'
      ].join(',');
    });
    return '\uFEFF' + [headers.join(','), ...rows].join('\n');
  };

  const handleExport = () => {
    console.log('Export Spreadsheet triggered');
    try {
      const csvContent = getCSVData();
      const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
      
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `seating-chart-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setStatus('exported');
      setTimeout(() => setStatus(''), 3000);
      console.log('Download triggered via Data URI');
    } catch (err) {
      console.error('Spreadsheet export failed', err);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const csvContent = getCSVData();
      await navigator.clipboard.writeText(csvContent);
      setStatus('copied');
      setTimeout(() => setStatus(''), 3000);
      console.log('CSV copied to clipboard');
    } catch (err) {
      console.error('Copy to clipboard failed', err);
    }
  };

  const handleReset = () => {
    setShowResetModal(true);
  };

  const confirmReset = () => {
    setPhase('setup');
    setGuests([]);
    setTables([]);
    setShowResetModal(false);
    setStatus('');
    console.log('App reset complete');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="glass shadow-md p-4 sticky top-0 z-50 flex justify-between items-center border-b border-white/5 mx-4 mt-4 mb-0 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent rounded-lg">
            <Layout size={24} color="#0a0c10" />
          </div>
          <div>
            <h1 className="text-xl mb-0" style={{ fontSize: '1.25rem', margin: 0 }}>SeatingMaster</h1>
            <p className="text-xs text-dim">Premium Event Management</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {phase === 'seating' && (
            <>
              <button onClick={handleReset} className="btn-secondary text-sm">
                <RefreshCcw size={16} /> Reset
              </button>
              <button onClick={handleCopyToClipboard} className="btn-secondary text-sm">
                {status === 'copied' ? <Check size={16} className="text-accent" /> : <Copy size={16} />} 
                {status === 'copied' ? 'Copied!' : 'Copy CSV'}
              </button>
              <button onClick={handleExport} className="btn-primary text-sm">
                <FileSpreadsheet size={16} /> 
                {status === 'exported' ? 'Downloading...' : 'Export Spreadsheet'}
              </button>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {phase === 'setup' ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl"
            >
              <SetupForm onComplete={handleStartSeating} />
            </motion.div>
          ) : (
            <motion.div
              key="seating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full h-full flex flex-col"
            >
              <div ref={canvasRef} className="flex-1">
                <SeatingCanvas 
                  guests={guests} 
                  setGuests={setGuests}
                  tables={tables} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="p-6 text-center text-dim text-sm">
        &copy; 2026 SeatingMaster AI. All rights reserved.
      </footer>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card p-8 w-full max-w-md relative z-10 border-accent/20"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border border-amber-500/20 text-amber-500">
                  <AlertTriangle size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Reset Everything?</h2>
                <p className="text-dim mb-8">
                  This will permanently delete your current guest list and table arrangements. This action cannot be undone.
                </p>
                <div className="flex w-full gap-4">
                  <button 
                    onClick={() => setShowResetModal(false)}
                    className="flex-1 btn-secondary justify-center"
                  >
                    Keep Working
                  </button>
                  <button 
                    onClick={confirmReset}
                    className="flex-1 py-3 px-6 rounded-lg bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30 transition-all font-semibold"
                  >
                    Reset Now
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

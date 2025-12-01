import React from 'react';
import { ExperimentLog } from '../types';
import { X, FileText, Calendar, ArrowRight, History } from 'lucide-react';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ExperimentLog[];
  onSelectLog: (log: ExperimentLog) => void;
  isRunning: boolean;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  isOpen, 
  onClose, 
  logs, 
  onSelectLog,
  isRunning
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`fixed inset-y-0 right-0 w-96 bg-[#0f172a] border-l border-slate-700 shadow-2xl transform transition-transform duration-300 ease-in-out z-[70] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-2 text-white">
            <History size={20} className="text-lab-accent" />
            <h2 className="font-bold text-lg">Experiment Log</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-md"
          >
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <History size={48} className="mx-auto mb-4 opacity-20" />
              <p>No experiments run yet.</p>
            </div>
          ) : (
            logs.map((log) => (
              <div 
                key={log.id}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-lab-accent/50 transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-200 text-sm line-clamp-1" title={log.title}>
                    {log.title}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 shrink-0 ml-2">
                    <Calendar size={10} />
                    {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                  "{log.question}"
                </p>

                <button
                  onClick={() => {
                    if (!isRunning) {
                        onSelectLog(log);
                        onClose();
                    }
                  }}
                  disabled={isRunning}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-bold transition-colors ${
                    isRunning 
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                        : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white border border-indigo-500/20'
                  }`}
                >
                  {isRunning ? 'Run in Progress' : 'View White Paper'}
                  {!isRunning && <ArrowRight size={12} />}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/50 text-[10px] text-slate-500 text-center uppercase tracking-wider">
          {logs.length} Records stored
        </div>
      </div>
    </>
  );
};

export default HistorySidebar;
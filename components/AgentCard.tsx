import React, { useEffect, useRef } from 'react';
import { Agent, AgentStatus } from '../types';
import { Terminal, Cpu, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [agent.logs]);

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case AgentStatus.PROVISIONING: return 'text-yellow-400';
      case AgentStatus.TRAINING: return 'text-blue-400';
      case AgentStatus.EVALUATING: return 'text-purple-400';
      case AgentStatus.COMPLETED: return 'text-green-400';
      case AgentStatus.FAILED: return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getLastMetric = () => {
    if (agent.metrics.length === 0) return { loss: '0.000', acc: '0.0%' };
    const last = agent.metrics[agent.metrics.length - 1];
    return { loss: last.loss.toFixed(3), acc: last.accuracy.toFixed(1) + '%' };
  };

  const metrics = getLastMetric();

  return (
    <div className="bg-lab-panel border border-slate-700 rounded-lg overflow-hidden flex flex-col h-80 shadow-lg transition-all hover:border-lab-accent/50">
      {/* Header */}
      <div className="bg-slate-900/50 p-3 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-lab-accent" />
          <span className="font-mono text-sm font-bold text-white truncate max-w-[150px]" title={agent.name}>{agent.name}</span>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${getStatusColor(agent.status)}`}>
            {agent.status === AgentStatus.TRAINING && <Loader2 size={12} className="animate-spin" />}
            {agent.status === AgentStatus.COMPLETED && <CheckCircle2 size={12} />}
            {agent.status}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-px bg-slate-700">
        <div className="bg-lab-panel p-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">GPU Resource</p>
          <p className="text-xs font-mono text-white">{agent.gpuType}</p>
        </div>
        <div className="bg-lab-panel p-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Epoch</p>
          <p className="text-xs font-mono text-white">{agent.currentEpoch} / {agent.totalEpochs}</p>
        </div>
        <div className="bg-lab-panel p-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Loss</p>
          <p className="text-xs font-mono text-white">{metrics.loss}</p>
        </div>
        <div className="bg-lab-panel p-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Accuracy</p>
          <p className="text-xs font-mono text-white">{metrics.acc}</p>
        </div>
      </div>

      {/* Terminal Logs */}
      <div className="flex-1 bg-black p-3 overflow-y-auto scrollbar-hide font-mono text-[10px] leading-relaxed text-green-500/80">
        {agent.logs.map((log, i) => (
          <div key={i} className="mb-0.5 whitespace-pre-wrap break-all">
            <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
            {log}
          </div>
        ))}
        {agent.status === AgentStatus.TRAINING && (
             <div className="animate-pulse">_</div>
        )}
        <div ref={logEndRef} />
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-800 w-full">
        <div 
          className="h-full bg-lab-accent transition-all duration-300 ease-out"
          style={{ width: `${agent.progress}%` }}
        />
      </div>
    </div>
  );
};

export default AgentCard;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  AppStatus, 
  ResearchPlan, 
  Agent, 
  AgentStatus, 
  WhitePaper,
  Hypothesis,
  ExperimentLog
} from './types';
import { planResearch, synthesizeWhitePaper } from './services/geminiService';
import { MAX_EPOCHS, SAMPLE_LOGS } from './constants';
import AgentCard from './components/AgentCard';
import ExperimentChart from './components/ExperimentChart';
import WhitePaperView from './components/WhitePaperView';
import HistorySidebar from './components/HistorySidebar';
import { 
  Bot, 
  Sparkles, 
  Activity, 
  BrainCircuit, 
  ArrowRight,
  Database,
  History,
  Timer,
  UserCircle
} from 'lucide-react';

const App: React.FC = () => {
  // State
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [question, setQuestion] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [plan, setPlan] = useState<ResearchPlan | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [whitePaper, setWhitePaper] = useState<WhitePaper | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0); 
  
  // History State
  const [logs, setLogs] = useState<ExperimentLog[]>(() => {
    try {
      const saved = localStorage.getItem('autoLabLogs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Refs
  const isGeneratingRef = useRef(false);

  // Persist logs
  useEffect(() => {
    localStorage.setItem('autoLabLogs', JSON.stringify(logs));
  }, [logs]);

  // Handlers
  const handleStartResearch = async () => {
    if (!question.trim() || !authorName.trim()) return;
    
    setStatus(AppStatus.PLANNING);
    setElapsedTime(0);
    setWhitePaper(null);
    setAgents([]);
    isGeneratingRef.current = false;
    
    try {
      const researchPlan = await planResearch(question);
      setPlan(researchPlan);
      
      // Initialize Agents based on plan
      const newAgents: Agent[] = researchPlan.hypotheses.map((h: Hypothesis, index: number) => ({
        id: `agent-${index}`,
        name: `Hypothesis-${index + 1}`,
        hypothesisId: h.id,
        gpuType: index % 2 === 0 ? "NVIDIA H100" : "TPU v5p",
        status: AgentStatus.IDLE,
        progress: 0,
        logs: [`Agent initialized for: ${h.title}`],
        currentEpoch: 0,
        totalEpochs: MAX_EPOCHS,
        metrics: [],
        resultSummary: ''
      }));
      
      setAgents(newAgents);
      setStatus(AppStatus.RUNNING);
    } catch (e) {
      console.error(e);
      setStatus(AppStatus.IDLE);
    }
  };

  const handleReset = () => {
    setStatus(AppStatus.IDLE);
    setQuestion('');
    // We keep authorName as a convenience for repeat experiments
    setPlan(null);
    setAgents([]);
    setWhitePaper(null);
    setElapsedTime(0);
  };

  const handleSelectLog = (log: ExperimentLog) => {
    setQuestion(log.question);
    setPlan({ title: log.title, hypotheses: [] }); // Hydrate partial
    setWhitePaper(log.paper);
    setStatus(AppStatus.COMPLETE);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Simulation Engine (Pure state updates)
  const runSimulationStep = useCallback(() => {
    setAgents(prevAgents => {
      return prevAgents.map(agent => {
        const next = { ...agent, logs: [...agent.logs], metrics: [...agent.metrics] };

        // State Machine for Agent
        if (next.status === AgentStatus.IDLE) {
          next.status = AgentStatus.PROVISIONING;
          next.logs.push("Requesting resources from cluster...");
        } else if (next.status === AgentStatus.PROVISIONING) {
          if (Math.random() > 0.7) {
            next.status = AgentStatus.TRAINING;
            next.logs.push("Resources allocated. Starting training run.");
          }
        } else if (next.status === AgentStatus.TRAINING) {
          // Simulate Epoch
          if (next.currentEpoch < next.totalEpochs) {
            next.currentEpoch += 1;
            next.progress = (next.currentEpoch / next.totalEpochs) * 100;
            
            // Simulate Metrics (Simulated descent)
            const baseLoss = 2.5 * Math.exp(-0.2 * next.currentEpoch);
            const noise = (Math.random() - 0.5) * 0.1;
            const loss = Math.max(0.1, baseLoss + noise);
            
            const baseAcc = 95 * (1 - Math.exp(-0.15 * next.currentEpoch));
            const accNoise = (Math.random() - 0.5) * 2;
            const accuracy = Math.min(99.9, Math.max(10, baseAcc + accNoise));

            next.metrics.push({ epoch: next.currentEpoch, loss, accuracy });
            
            // Add random log
            if (Math.random() > 0.6) {
               const logMsg = SAMPLE_LOGS[Math.floor(Math.random() * SAMPLE_LOGS.length)];
               next.logs.push(`Epoch ${next.currentEpoch}: ${logMsg} (Loss: ${loss.toFixed(4)})`);
            }
          } else {
            next.status = AgentStatus.EVALUATING;
            next.logs.push("Training complete. Running final evaluation set...");
          }
        } else if (next.status === AgentStatus.EVALUATING) {
           if (Math.random() > 0.5) {
             next.status = AgentStatus.COMPLETED;
             next.logs.push("Evaluation finished. Uploading artifacts.");
             next.progress = 100;
           }
        }

        // Truncate logs if too long
        if (next.logs.length > 50) next.logs = next.logs.slice(-50);

        return next;
      });
    });
  }, []);

  // Interval for Time and Simulation Tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (status === AppStatus.RUNNING) {
      interval = setInterval(() => {
        setElapsedTime(t => t + 1);
        runSimulationStep();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, runSimulationStep]);

  // Monitor Agents for Completion
  useEffect(() => {
    if (status === AppStatus.RUNNING && agents.length > 0) {
      const allComplete = agents.every(a => a.status === AgentStatus.COMPLETED);
      if (allComplete) {
        // Immediately transition to avoid race condition with the interval loop
        setStatus(AppStatus.WRITING);
      }
    }
  }, [agents, status]);

  // Handle Paper Generation
  useEffect(() => {
    if (status === AppStatus.WRITING && !isGeneratingRef.current) {
        isGeneratingRef.current = true;
        const generate = async () => {
            try {
                const paper = await synthesizeWhitePaper(question, agents, authorName);
                setWhitePaper(paper);
                
                const newLog: ExperimentLog = {
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                    question,
                    title: plan?.title || question,
                    paper
                };
                setLogs(prev => [newLog, ...prev]);
                setStatus(AppStatus.COMPLETE);
            } catch (e) {
                console.error("Failed to generate paper", e);
                setStatus(AppStatus.COMPLETE); // Fallback to complete even on error to show UI
            } finally {
                isGeneratingRef.current = false;
            }
        };
        generate();
    }
  }, [status, question, agents, plan, authorName]);


  return (
    <div className="min-h-screen font-sans text-slate-200 selection:bg-lab-accent/30 selection:text-white pb-20">
      
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-[#0b0f19]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
              <BrainCircuit size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">AutoLab<span className="text-lab-accent">.AI</span></span>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setIsHistoryOpen(true)}
               className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
             >
                <History size={16} />
                <span className="hidden sm:inline">History</span>
             </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
              <div className={`w-2 h-2 rounded-full ${status === AppStatus.IDLE ? 'bg-green-500' : 'bg-lab-accent animate-pulse'}`} />
              <span className="text-xs font-mono font-medium text-slate-300">
                {status === AppStatus.IDLE ? 'SYSTEM ONLINE' : 'SYSTEM BUSY'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Input Phase */}
        {status === AppStatus.IDLE && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                Autonomous Research <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                  at Scale
                </span>
              </h1>
              <p className="text-lg text-slate-400 max-w-xl mx-auto">
                Describe your research question. Our Gemini-powered multi-agent system will design hypotheses, provision GPUs, run experiments, and write the paper.
              </p>
            </div>

            <div className="w-full space-y-4">
              {/* Question Input */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl opacity-25 group-hover:opacity-50 blur transition duration-500"></div>
                <div className="relative flex bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
                  <input 
                    type="text" 
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleStartResearch()}
                    placeholder="e.g., Can a 1B param model learn to solve differential equations?"
                    className="flex-1 bg-transparent border-none px-6 py-5 text-lg focus:outline-none text-white placeholder:text-slate-600"
                  />
                  <button 
                    onClick={handleStartResearch}
                    disabled={!question.trim() || !authorName.trim()}
                    className="bg-lab-accent hover:bg-blue-600 text-white px-8 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed hidden md:block"
                  >
                    <ArrowRight size={24} />
                  </button>
                </div>
              </div>

              {/* Author Input & Mobile Button */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserCircle className="text-slate-500" size={20} />
                   </div>
                   <input 
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Lead Author Name"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-lab-accent focus:ring-1 focus:ring-lab-accent"
                   />
                </div>
                
                <button 
                  onClick={handleStartResearch}
                  disabled={!question.trim() || !authorName.trim()}
                  className="bg-lab-accent hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed md:hidden flex justify-center items-center gap-2"
                >
                  Start Research <ArrowRight size={20} />
                </button>
              </div>
            </div>
            
            <div className="flex gap-4 text-xs text-slate-500 justify-center">
              <span className="flex items-center gap-1"><Sparkles size={12} /> Gemini 3 Pro Planner</span>
              <span className="flex items-center gap-1"><Bot size={12} /> Autonomous Agents</span>
              <span className="flex items-center gap-1"><Database size={12} /> Auto-Paper Gen</span>
            </div>
          </div>
        )}

        {/* Planning Phase */}
        {status === AppStatus.PLANNING && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
              <BrainCircuit size={64} className="text-blue-400 relative z-10 animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold text-white">Decomposing Research Question...</h2>
            <div className="flex flex-col gap-2 max-w-md w-full">
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-1/3 animate-[shimmer_2s_infinite]"></div>
              </div>
              <p className="text-center text-sm text-slate-400 font-mono">Generating hypotheses & experiment designs</p>
            </div>
          </div>
        )}

        {/* Running Phase */}
        {(status === AppStatus.RUNNING || status === AppStatus.WRITING || (status === AppStatus.COMPLETE && !whitePaper)) && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{plan?.title || "Active Research Campaign"}</h2>
                <p className="text-slate-400 font-mono text-sm mt-1">
                    {status === AppStatus.WRITING ? 'Synthesizing final paper...' : 'Executing distributed experiments...'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg">
                    <Timer size={16} className={status === AppStatus.RUNNING ? "text-lab-accent animate-pulse" : "text-slate-500"} />
                    <span className="font-mono text-xl font-bold text-white">{formatTime(elapsedTime)}</span>
                 </div>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg">
                  <Activity size={16} className="text-lab-success" />
                  <span className="text-xs font-mono text-slate-300">CLUSTER HEALTHY</span>
                </div>
              </div>
            </div>

            {/* Metrics Chart */}
            <div className="w-full">
              <ExperimentChart agents={agents} />
            </div>

            {/* Agents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>

             {status === AppStatus.WRITING && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center">
                    <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl flex flex-col items-center max-w-sm text-center shadow-2xl">
                        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
                        <h3 className="text-xl font-bold text-white mb-2">Synthesizing White Paper</h3>
                        <p className="text-slate-400 text-sm">Aggregating metrics, analyzing logs, and formatting results via Gemini 3...</p>
                    </div>
                </div>
             )}
          </div>
        )}

        {/* Results Phase */}
        {status === AppStatus.COMPLETE && whitePaper && (
            <WhitePaperView paper={whitePaper} onReset={handleReset} />
        )}

      </main>

      {/* History Sidebar */}
      <HistorySidebar 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        logs={logs} 
        onSelectLog={handleSelectLog}
        isRunning={status !== AppStatus.IDLE && status !== AppStatus.COMPLETE}
      />

    </div>
  );
};

export default App;
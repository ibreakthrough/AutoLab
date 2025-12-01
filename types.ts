export enum AppStatus {
  IDLE = 'IDLE',
  PLANNING = 'PLANNING',
  RUNNING = 'RUNNING',
  WRITING = 'WRITING',
  COMPLETE = 'COMPLETE',
}

export interface ResearchPlan {
  title: string;
  hypotheses: Hypothesis[];
}

export interface Hypothesis {
  id: string;
  title: string;
  description: string;
  experimentDesign: string;
  expectedOutcome: string;
}

export enum AgentStatus {
  IDLE = 'IDLE',
  PROVISIONING = 'PROVISIONING',
  TRAINING = 'TRAINING',
  EVALUATING = 'EVALUATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface Agent {
  id: string;
  name: string; // e.g., "Experiment-Alpha-1"
  gpuType: string; // e.g., "H100", "TPU v5"
  status: AgentStatus;
  progress: number; // 0-100
  logs: string[];
  currentEpoch: number;
  totalEpochs: number;
  metrics: TrainingMetric[];
  hypothesisId: string;
  resultSummary?: string;
}

export interface TrainingMetric {
  epoch: number;
  loss: number;
  accuracy: number;
}

export interface WhitePaper {
  title: string;
  content: string; // Markdown
  author?: string;
  date?: string;
}

export interface ExperimentLog {
  id: string;
  timestamp: number;
  question: string;
  title: string;
  paper: WhitePaper;
}
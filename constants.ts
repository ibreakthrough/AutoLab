export const MODEL_PLANNER = 'gemini-3-pro-preview'; // High reasoning for planning
export const MODEL_WRITER = 'gemini-3-pro-preview'; // High quality writing
export const MODEL_FAST = 'gemini-2.5-flash'; // For quick simulated log generation if needed

export const MAX_EPOCHS = 20;

export const SAMPLE_LOGS = [
  "Initializing CUDA context...",
  "Allocating tensor buffers...",
  "Downloading dataset partition...",
  "Model architecture loaded: Transformer (1.2B params)",
  "Optimizer: AdamW (lr=3e-4)",
  "Beginning training loop...",
  "Gradient norm clipping applied...",
  "Checkpoint saved.",
  "Evaluating validation set...",
];

import { GoogleGenAI, Type } from "@google/genai";
import { MODEL_PLANNER, MODEL_WRITER } from '../constants';
import { ResearchPlan, Agent, WhitePaper } from '../types';

// Helper to ensure API key exists
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key missing");
    throw new Error("API Key is missing from environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export const planResearch = async (question: string): Promise<ResearchPlan> => {
  const client = getClient();
  
  const prompt = `
    You are a Principal Investigator AI system. 
    Your goal is to investigate the following research question: "${question}".
    
    1. Formulate a catchy title for this research initiative.
    2. Decompose the problem into 3 distinct, testable hypotheses.
    3. For each hypothesis, describe a high-level experiment design (e.g., "Train a ResNet50 on distorted ImageNet").
    
    Return the response in strict JSON format.
  `;

  try {
    const response = await client.models.generateContent({
      model: MODEL_PLANNER,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 2048 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            hypotheses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  experimentDesign: { type: Type.STRING },
                  expectedOutcome: { type: Type.STRING },
                },
                required: ["id", "title", "description", "experimentDesign", "expectedOutcome"],
              },
            },
          },
          required: ["title", "hypotheses"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as ResearchPlan;
  } catch (error) {
    console.error("Error planning research:", error);
    // Fallback mock data if API fails or quota exceeded during demo
    return {
      title: "Error: Could not plan research",
      hypotheses: []
    };
  }
};

export const synthesizeWhitePaper = async (question: string, agents: Agent[], authorName: string): Promise<WhitePaper> => {
  const client = getClient();

  // Serialize agent results for the model
  const resultsContext = agents.map(a => `
    Hypothesis: ${a.name}
    Final Loss: ${a.metrics[a.metrics.length - 1]?.loss.toFixed(4) || 'N/A'}
    Final Accuracy: ${a.metrics[a.metrics.length - 1]?.accuracy.toFixed(2) + '%' || 'N/A'}
    Summary: The experiment completed successfully.
  `).join('\n---\n');

  const prompt = `
    You are a Senior Research Scientist. Write a comprehensive white paper based on the following automated experiments.
    
    Original Question: "${question}"
    
    Experiment Results:
    ${resultsContext}
    
    Structure the paper with:
    1. Abstract
    2. Introduction (Contextualize the question)
    3. Methodology (Describe the agent-based approach)
    4. Results (Synthesize the data provided)
    5. Discussion & Conclusion
    
    Format output as clean Markdown.
  `;

  try {
    const response = await client.models.generateContent({
      model: MODEL_WRITER,
      contents: prompt,
      config: {
        // High budget for detailed writing
        thinkingConfig: { thinkingBudget: 4096 }, 
      }
    });

    return {
      title: "Research Findings: " + question,
      content: response.text || "# Error generating paper",
      author: authorName,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };
  } catch (error) {
    console.error("Error writing paper:", error);
    return {
      title: "Error",
      content: "An error occurred while generating the white paper.",
      author: authorName,
      date: new Date().toLocaleDateString()
    };
  }
};
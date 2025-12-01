import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Agent } from '../types';

interface ExperimentChartProps {
  agents: Agent[];
}

const ExperimentChart: React.FC<ExperimentChartProps> = ({ agents }) => {
  // Transform data: We need a merged array where each key is an agent ID
  // Assuming all agents run on similar epochs for simplicity of visualization
  
  const maxEpochs = Math.max(...agents.map(a => a.metrics.length), 0);
  const data = [];

  for (let i = 0; i < maxEpochs; i++) {
    const point: any = { epoch: i + 1 };
    agents.forEach(agent => {
      if (agent.metrics[i]) {
        point[`${agent.id}_loss`] = agent.metrics[i].loss;
        point[`${agent.id}_acc`] = agent.metrics[i].accuracy;
      }
    });
    data.push(point);
  }

  // Generate distinct colors for agents
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  if (agents.length === 0) return <div className="text-gray-500 text-sm">No active experiments.</div>;

  return (
    <div className="w-full h-64 bg-lab-panel/50 rounded-lg p-4 border border-slate-700">
      <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">Live Metrics (Accuracy & Loss)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="epoch" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend />
          {agents.map((agent, index) => (
            <React.Fragment key={agent.id}>
              {/* Accuracy Line (Solid) */}
              <Line
                type="monotone"
                dataKey={`${agent.id}_acc`}
                name={`${agent.name} (Acc)`}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={false}
              />
              {/* Loss Line (Dashed) */}
              <Line
                type="monotone"
                dataKey={`${agent.id}_loss`}
                name={`${agent.name} (Loss)`}
                stroke={colors[index % colors.length]}
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                hide={true} // Hidden by default to avoid clutter, user can toggle via Legend
              />
            </React.Fragment>
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExperimentChart;

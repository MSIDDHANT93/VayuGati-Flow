import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const HistoricalTrends: React.FC = () => {
  // Mock data for historical trends
  const data = [
    { time: '08:00', congestion: 0.3, speed: 45 },
    { time: '09:00', congestion: 0.5, speed: 35 },
    { time: '10:00', congestion: 0.4, speed: 40 },
    { time: '11:00', congestion: 0.35, speed: 42 },
    { time: '12:00', congestion: 0.6, speed: 30 },
    { time: '13:00', congestion: 0.55, speed: 32 },
    { time: '14:00', congestion: 0.45, speed: 38 },
    { time: '15:00', congestion: 0.5, speed: 35 },
    { time: '16:00', congestion: 0.65, speed: 28 },
    { time: '17:00', congestion: 0.7, speed: 25 },
    { time: '18:00', congestion: 0.6, speed: 30 },
    { time: '19:00', congestion: 0.4, speed: 40 },
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="text-[10px] text-gray-600 mb-1 flex-shrink-0">Reference trend (illustrative)</div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis 
            dataKey="time" 
            stroke="#666"
            fontSize={10}
            tick={{ fill: '#666' }}
          />
          <YAxis 
            stroke="#666"
            fontSize={10}
            tick={{ fill: '#666' }}
            domain={[0, 1]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1a1a1a', 
              border: '1px solid #2a2a2a',
              borderRadius: '4px',
              color: '#ccc'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="congestion" 
            stroke="#ffaa00" 
            strokeWidth={2}
            dot={false}
            name="Congestion"
          />
          <Line 
            type="monotone" 
            dataKey="speed" 
            stroke="#00aaff" 
            strokeWidth={2}
            dot={false}
            name="Speed (normalized)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default HistoricalTrends

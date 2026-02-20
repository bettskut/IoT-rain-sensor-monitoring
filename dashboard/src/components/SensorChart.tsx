import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const SensorChart = ({ data, title, color, min, max }) => {
  return (
    <div className="w-full h-full flex flex-col relative group">
      
      {/* HEADER CHART: Judul di Kiri, LIVE TIMELINE di Kanan */}
      <div className="absolute top-6 left-10 right-10 flex justify-between items-center z-10 pointer-events-none">
        <h3 className="text-[10px] font-black tracking-[0.4em] uppercase opacity-70" style={{ color: color }}>
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[9px] font-black tracking-[0.3em] text-emerald-500 uppercase">
            LIVE TIMELINE
          </span>
        </div>
      </div>

      {/* CONTAINER GRAFIK */}
      <div className="flex-1 w-full h-full pt-16"> {/* pt-16 buat kasih ruang Header di atas */}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={`colorGradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              vertical={false} 
              strokeDasharray="3 3" 
              stroke="#1e293b" 
              opacity={0.3} 
            />
            
            <XAxis 
              dataKey="time" 
              hide={true} 
            />
            <YAxis 
              domain={[min, max]} 
              hide={true} 
            />
            
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#fff'
              }}
              itemStyle={{ color: color }}
              cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '5 5' }}
            />
            
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              fillOpacity={1}
              fill={`url(#colorGradient-${color})`}
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
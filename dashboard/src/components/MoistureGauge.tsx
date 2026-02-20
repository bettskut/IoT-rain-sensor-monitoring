import React from 'react';

export const MoistureGauge = ({ value, label }: { value: number; label: string }) => {
  return (
    <div className="bg-slate-900 p-8 rounded-[32px] border border-slate-800 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group">
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
          <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" 
            strokeDasharray={502.4} strokeDashoffset={502.4 - (502.4 * value) / 100}
            className="text-sky-500 transition-all duration-1000 ease-out" strokeLinecap="round" />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-5xl font-black text-white">{value}%</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        </div>
      </div>
    </div>
  );
};
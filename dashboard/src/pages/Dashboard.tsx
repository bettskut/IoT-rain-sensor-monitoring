import React, { useState, useEffect } from "react";
import { MoistureGauge } from "../components/MoistureGauge";
import { SensorChart } from "../components/SensorChart";
import { 
  Thermometer, 
  Droplets, 
  CloudRain, 
  RefreshCw,
  LayoutDashboard,
  Bell,
  Settings
} from "lucide-react";

export const Dashboard: React.FC = () => {
  // State untuk data real-time
  const [moisture, setMoisture] = useState(0);
  const [temp, setTemp] = useState(0);
  const [rainValue, setRainValue] = useState(0);
  const [status, setStatus] = useState("CONNECTING...");
  
  // State untuk history grafik (agar grafik bergerak)
  const [tempHistory, setTempHistory] = useState<any[]>([]);
  const [rainHistory, setRainHistory] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fungsi untuk mengambil data dari server.js
  const fetchSensorData = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch("http://10.18.19.62:3000/data");
      const data = await response.json();

      // Update angka statis
      setTemp(data.temp);
      setMoisture(data.humidity);
      setRainValue(data.rain);
      setStatus(data.status);

      // Update data grafik (maksimal 20 poin data agar tidak berat)
      const now = new Date();
      const timeLabel = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
      
      setTempHistory(prev => {
        const newData = [...prev, { time: timeLabel, value: data.temp }];
        return newData.slice(-20); // Simpan 20 data terakhir
      });

      setRainHistory(prev => {
        const newData = [...prev, { time: timeLabel, value: data.rain }];
        return newData.slice(-20);
      });

      setTimeout(() => setIsRefreshing(false), 500);
    } catch (error) {
      console.error("Gagal mengambil data dari server:", error);
      setStatus("OFFLINE");
      setIsRefreshing(false);
    }
  };

  // Jalankan polling setiap 2 detik
  useEffect(() => {
    fetchSensorData(); // Ambil data pertama kali
    const interval = setInterval(fetchSensorData, 2000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#01040a] flex text-slate-100 font-sans overflow-hidden">
      {/* --- SIDEBAR --- */}
      <aside className="w-80 bg-[#020617] border-r border-slate-800/80 hidden lg:flex flex-col h-screen sticky top-0 shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
        <div className="p-10">
          <div className="flex items-center gap-4 text-sky-400 mb-20">
            <div className="p-3 bg-sky-500/20 rounded-2xl border border-sky-400/30">
              <LayoutDashboard size={32} />
            </div>
            <span className="font-black text-3xl tracking-tighter text-white">IOT SENSE</span>
          </div>
          <nav className="space-y-6">
            <a href="#" className="flex items-center gap-5 px-8 py-5 bg-sky-600 text-white rounded-[24px] font-black text-lg shadow-xl shadow-sky-600/20">
              <LayoutDashboard size={24} /> Dashboard
            </a>
            <a href="#" className="flex items-center gap-5 px-8 py-5 text-slate-400 hover:bg-slate-800/50 rounded-[24px] font-bold text-lg transition-all group">
              <Bell size={24} className="group-hover:text-sky-400" /> Notifications
            </a>
            <a href="#" className="flex items-center gap-5 px-8 py-5 text-slate-400 hover:bg-slate-800/50 rounded-[24px] font-bold text-lg transition-all group">
              <Settings size={24} className="group-hover:text-sky-400" /> Settings
            </a>
          </nav>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 h-screen overflow-y-auto bg-[#01040a] flex flex-col">
        <header className="w-full px-16 py-10 flex justify-between items-center sticky top-0 bg-[#01040a]/90 backdrop-blur-3xl z-50 border-b border-slate-800/60">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight uppercase">System Command Center</h1>
            <div className="flex items-center gap-4 mt-3">
              <div className={`w-3 h-3 rounded-full animate-pulse shadow-[0_0_20px_rgba(16,185,129,1)] ${status === 'OFFLINE' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
              <p className="text-sky-400/80 text-sm font-black uppercase tracking-[0.5em]">Network: {status}</p>
            </div>
          </div>
          <button 
            onClick={fetchSensorData} 
            className="flex items-center gap-4 px-10 py-5 bg-white text-black rounded-[20px] transition-all active:scale-95 shadow-xl font-black text-sm uppercase tracking-widest hover:bg-sky-400 hover:text-white"
          >
            <RefreshCw size={24} className={isRefreshing ? "animate-spin" : ""} />
            Force Sync
          </button>
        </header>

        <div className="p-16 w-full flex flex-col gap-12">
          {/* 1. TOP STATS */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            <StatCard icon={<Thermometer size={40}/>} label="Air Temperature" value={temp} unit="°C" color="text-orange-500" bg="bg-orange-500/10" glow="shadow-orange-500/5" />
            <StatCard icon={<Droplets size={40}/>} label="Global Moisture" value={moisture} unit="%" color="text-sky-500" bg="bg-sky-500/10" glow="shadow-sky-500/5" />
            <StatCard icon={<CloudRain size={40}/>} label="Rainfall Data" value={rainValue} unit="pt" color="text-indigo-500" bg="bg-indigo-500/10" glow="shadow-indigo-500/5" />
          </section>

          {/* 2. SATURATION GAUGE */}
          <section className="bg-[#020617] p-24 rounded-[60px] border border-slate-800/80 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group">
             <div className="scale-[1.8] transform py-20">
                <MoistureGauge value={moisture} label="SATURATION" />
             </div>
          </section>

          {/* 3. GATEWAY STATUS */}
          <section className="bg-gradient-to-r from-[#020617] to-[#050b18] p-16 rounded-[60px] border border-slate-800/80 shadow-2xl relative">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12">
                <div className="flex-1">
                  <h3 className="font-black text-white text-4xl mb-8 tracking-tighter uppercase">Gateway Protocol Status</h3>
                  <p className="text-slate-400 text-xl leading-relaxed font-medium max-w-5xl">
                    Handshake established with Node Server at 10.18.19.62. Processing live telemetry 
                    from encrypted sensor channels. Status: {status}.
                  </p>
                </div>
                <div className="flex items-center gap-6 bg-[#01040a] px-12 py-8 rounded-[40px] border border-slate-700">
                  <span className="relative flex h-6 w-6">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-6 w-6 bg-emerald-500 shadow-[0_0_25px_rgba(16,185,129,1)]"></span>
                  </span>
                  <span className="text-lg font-black text-white uppercase tracking-[0.4em]">Signal Stable</span>
                </div>
              </div>
          </section>

          {/* 4. CHARTS: FULL FRAME */}
          <div className="flex flex-col gap-12">
            <div className="bg-[#020617] p-12 rounded-[60px] border border-slate-800/80 shadow-2xl min-h-[600px] flex flex-col overflow-hidden">
              <SensorChart data={tempHistory} title="Temperature Trend" color="#f97316" min={10} max={50} />
            </div>

            <div className="bg-[#020617] p-12 rounded-[60px] border border-slate-800/80 shadow-2xl min-h-[600px] flex flex-col overflow-hidden">
              <SensorChart data={rainHistory} title="Rain Intensity (0-4095)" color="#6366f1" min={0} max={4095} />
            </div>
          </div>

          <div className="h-20"></div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ icon, label, value, unit, color, bg, glow }: any) => (
  <div className={`bg-[#020617] p-12 rounded-[50px] border border-slate-800/80 flex items-center gap-10 shadow-2xl transition-all hover:scale-[1.02] ${glow}`}>
    <div className={`p-8 ${bg} ${color} rounded-[35px]`}>{icon}</div>
    <div>
      <p className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] mb-3">{label}</p>
      <p className="text-6xl font-black text-white tracking-tighter">
        {value}<span className="text-slate-600 text-3xl ml-2 font-bold">{unit}</span>
      </p>
    </div>
  </div>
);
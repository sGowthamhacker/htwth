import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Clock, Server, Database, Globe, Cpu, Activity, BarChart2, Zap, Wifi, Users, RefreshCcw, ChevronUp, Archive, Shield, ExternalLink, Calendar, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import RevealOnScroll from '../components/RevealOnScroll';
import Footer from '../components/Footer';
import { getIncidents, type SystemIncident } from '../services/incidents';

interface StatusPageProps {
  onNavigateHome: () => void;
  isDarkMode: boolean;
}

const systems = [
  { name: 'Core Application', status: 'operational', icon: <Server className="w-5 h-5" /> },
  { name: 'Database Clusters', status: 'operational', icon: <Database className="w-5 h-5" /> },
  { name: 'API Endpoints', status: 'operational', icon: <Globe className="w-5 h-5" /> },
  { name: 'Background Workers', status: 'operational', icon: <Cpu className="w-5 h-5" /> },
];

const getHistory = () => {
  return Array.from({ length: 90 }).map((_, i) => ({
    date: new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000).toISOString(),
    status: Math.random() > 0.05 ? 'operational' : (Math.random() > 0.5 ? 'degraded' : 'outage')
  }));
};

const StatusPage: React.FC<StatusPageProps> = ({ onNavigateHome, isDarkMode }) => {
  const [uptime] = useState(99.99);
  const [history] = useState(getHistory());
  const [incidents, setIncidents] = useState<SystemIncident[]>([]);
  const [showFullHistory, setShowFullHistory] = useState(false);
  
  // Realtime Simulation State
  const [livePing, setLivePing] = useState(42);
  const [liveRps, setLiveRps] = useState(1204);
  const [liveLoad, setLiveLoad] = useState(24);
  const [liveUsers, setLiveUsers] = useState(8920);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchIncidents = async () => setIncidents(await getIncidents());
    fetchIncidents();
    
    const handleStorageChange = () => {
        fetchIncidents();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Simulate real-time metric fluctuations
    const interval = setInterval(() => {
        setLivePing(prev => Math.max(20, Math.min(150, prev + (Math.random() * 10 - 5))));
        setLiveRps(prev => Math.max(500, prev + Math.floor(Math.random() * 100 - 50)));
        setLiveLoad(prev => Math.max(5, Math.min(95, prev + (Math.random() * 4 - 2))));
        setLiveUsers(prev => Math.max(1000, prev + Math.floor(Math.random() * 20 - 10)));
    }, 1500);
    
    return () => {
        clearInterval(interval);
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const visibleIncidents = showFullHistory ? incidents : incidents.slice(0, 5);

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#050505] font-sans transition-colors duration-300 text-slate-900 dark:text-slate-100 ${isDarkMode ? 'dark' : ''}`}>
      {/* Refined Header */}
      <header className="sticky top-0 w-full px-4 sm:px-8 py-4 flex justify-between items-center z-50 bg-slate-50/80 dark:bg-[#050505]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/50">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-sm font-semibold transition-all"
        >
          &larr; <span className="hidden sm:inline">Back</span>
        </button>
        <div className="flex flex-col items-end sm:items-center sm:flex-row gap-2">
            <span className="font-bold tracking-widest text-[10px] uppercase text-slate-400">System Status</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
        
        {/* Header Section */}
        <RevealOnScroll animation="fade-up">
          <div className="mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
                <h1 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight">HTWTH Status</h1>
                <p className="text-slate-500 text-base max-w-xl">Real-time performance and historical uptime data for all core systems and infrastructure.</p>
            </div>
            <div className="flex gap-2 items-center bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-500/20 shadow-sm shadow-emerald-500/10">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-700 dark:text-emerald-400 font-bold text-sm uppercase tracking-wider">All Systems Operational</span>
            </div>
          </div>
        </RevealOnScroll>

        {/* Global Uptime & Live Dashboard Panel */}
        <RevealOnScroll animation="fade-up" delay={100}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
            
            {/* 90 Day Uptime Card */}
            <div className="col-span-1 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden group shadow-sm">
                <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity duration-500 text-indigo-500 scale-110 transform">
                    <Activity className="w-48 h-48" />
                </div>
                <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">90-Day Uptime</h3>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{uptime}</span>
                    <span className="text-lg font-bold text-slate-400">%</span>
                </div>
            </div>
            
            {/* Realtime Metrics Bento Grid */}
            <div className="col-span-1 lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
               {/* Metric 1 */}
               <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200/50 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
                   <div className="flex justify-between items-start mb-6">
                       <Wifi className="w-5 h-5 text-indigo-500 opacity-80" />
                       <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping absolute top-6 right-6 opacity-50" />
                   </div>
                   <div>
                       <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-mono tracking-tight">{Math.round(livePing)}<span className="text-[10px] text-slate-400 ml-1">ms</span></div>
                       <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">Global Latency</div>
                   </div>
               </div>
               
               {/* Metric 2 */}
               <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200/50 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
                   <div className="flex justify-between items-start mb-6">
                       <Zap className="w-5 h-5 text-amber-500 opacity-80" />
                   </div>
                   <div>
                       <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-mono tracking-tight">{(liveRps).toLocaleString()}</div>
                       <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">Reqs / Second</div>
                   </div>
               </div>
               
               {/* Metric 3 */}
               <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200/50 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
                   <div className="flex justify-between items-start mb-6">
                       <Cpu className="w-5 h-5 text-rose-500 opacity-80" />
                   </div>
                   <div>
                       <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-mono tracking-tight">{liveLoad.toFixed(1)}<span className="text-[10px] text-slate-400 ml-1">%</span></div>
                       <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">Server Load</div>
                   </div>
               </div>
               
               {/* Metric 4 */}
               <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200/50 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
                   <div className="flex justify-between items-start mb-6">
                       <Users className="w-5 h-5 text-emerald-500 opacity-80" />
                   </div>
                   <div>
                       <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-mono tracking-tight">{(liveUsers).toLocaleString()}</div>
                       <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">Active Users</div>
                   </div>
               </div>
            </div>

          </div>
        </RevealOnScroll>

        {/* Active & Past Incidents */}
        <RevealOnScroll animation="fade-up" delay={150}>
            <div className="mb-20">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-500">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">Recent Incidents</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Monitoring and transparency log</p>
                        </div>
                    </div>
                </div>

                {incidents.length === 0 ? (
                    <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-slate-800 rounded-3xl p-10 flex flex-col items-center text-center gap-4 relative overflow-hidden shadow-sm">
                         <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-2">
                            <CheckCircle className="w-8 h-8" />
                         </div>
                         <h3 className="text-2xl font-black tracking-tight">All Systems Operational</h3>
                         <p className="text-slate-500 dark:text-slate-400 text-base max-w-md">No recent incidents or performance issues have been recorded.</p>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Subtle Timeline Line */}
                        <div className="absolute top-0 bottom-0 left-[2.25rem] w-px hidden sm:block z-0 bg-slate-200 dark:bg-slate-800"></div>
                        
                        <div className="space-y-6 relative z-10">
                            <AnimatePresence mode="popLayout">
                                {visibleIncidents.map((incident, index) => {
                                    const statusConfig: Record<string, { color: string, bg: string, icon: React.ReactNode, ping?: boolean, border: string }> = {
                                        investigating: { color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100/50 dark:bg-rose-500/20', border: 'border-rose-200 dark:border-rose-500/30', icon: <Activity className="w-4 h-4" />, ping: true },
                                        identified: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100/50 dark:bg-amber-500/20', border: 'border-amber-200 dark:border-amber-500/30', icon: <AlertTriangle className="w-4 h-4" />, ping: true },
                                        monitoring: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100/50 dark:bg-blue-500/20', border: 'border-blue-200 dark:border-blue-500/30', icon: <Activity className="w-4 h-4" />, ping: true },
                                        resolved: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100/50 dark:bg-emerald-500/20', border: 'border-emerald-200 dark:border-emerald-500/30', icon: <CheckCircle className="w-4 h-4" /> }
                                    };

                                    const config = statusConfig[incident.status] || statusConfig.investigating;

                                    return (
                                        <motion.div 
                                            key={incident.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            transition={{ duration: 0.3 }}
                                            className="group relative bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-indigo-500/30 transition-all duration-300"
                                        >
                                            {/* Status Badge & Meta */}
                                            <div className="sm:w-48 shrink-0 flex flex-col gap-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl ${config.bg} ${config.color} ${config.border} border shadow-sm`}>
                                                        {config.ping && <div className={`absolute inset-0 rounded-xl ${config.bg} animate-ping opacity-30`}></div>}
                                                        {config.icon}
                                                    </div>
                                                    <div>
                                                        <span className={`block font-bold text-xs tracking-wider uppercase ${config.color}`}>
                                                            {incident.status}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Current State</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col gap-1.5 mt-1">
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(incident.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(incident.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Description & Priority */}
                                            <div className="flex-1 flex flex-col gap-3">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                                {incident.title}
                                                            </h3>
                                                            <div className={`px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest uppercase border
                                                                ${incident.impact === 'critical' ? 'bg-rose-500 text-white border-rose-600' : 
                                                                  incident.impact === 'major' ? 'bg-amber-500 text-white border-amber-600' : 
                                                                  'bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}
                                                            >
                                                                {incident.impact || 'Minor'} Impact
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                                                            <Hash className="w-2.5 h-2.5" /> {incident.id.substring(0, 8)}
                                                        </div>
                                                    </div>
                                                    <ExternalLink className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>

                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                                    {incident.description}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                        
                        {/* Compact Toggle */}
                        <div className="flex flex-col items-center mt-12 relative z-20">
                            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-slate-200 dark:bg-slate-800/60 w-full"></div>
                            
                            <button
                                onClick={() => setShowFullHistory(!showFullHistory)}
                                className="relative flex items-center gap-2 px-6 py-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                            >
                                {showFullHistory ? (
                                    <>
                                        <ChevronUp className="w-3.5 h-3.5" />
                                        Collapse
                                    </>
                                ) : (
                                    <>
                                        <Archive className="w-3.5 h-3.5" />
                                        View Full History ({incidents.length})
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </RevealOnScroll>

        {/* System Components */}
        <RevealOnScroll animation="fade-up" delay={200}>
          <div className="mb-16">
              <h2 className="text-2xl font-bold mb-6 tracking-tight flex items-center gap-2">System Components</h2>
              <div className="flex flex-col gap-4">
                {systems.map((system, idx) => {
                  // Generate an independent minor history for each system, heavily weighted to green
                  const sysHistory = Array.from({ length: 90 }).map((_, i) => ({
                    date: new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000).toISOString(),
                    status: Math.random() > 0.02 ? 'operational' : (Math.random() > 0.5 ? 'degraded' : 'outage')
                  }));
                  
                  return (
                  <div key={system.name} className="flex flex-col p-5 sm:p-6 bg-white dark:bg-[#0a0a0a] border border-slate-200/70 dark:border-slate-800 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-indigo-500">
                            {system.icon}
                          </div>
                          <div>
                              <span className="font-bold text-lg text-slate-800 dark:text-slate-100 block">{system.name}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-500/20 self-start sm:self-auto">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[10px] tracking-widest uppercase">Operational</span>
                        </div>
                    </div>
                    
                    {/* 90-Day Inline Sparkline */}
                    <div>
                        <div className="flex gap-[1.5px] items-end h-6 group w-full mb-2">
                            {sysHistory.map((day, i) => (
                                <div 
                                    key={i} 
                                    className={`flex-1 rounded-sm transition-all duration-300 hover:h-full cursor-pointer relative group/bar
                                        ${day.status === 'operational' ? 'bg-emerald-400 dark:bg-emerald-500/60 h-full hover:bg-emerald-500' : ''}
                                        ${day.status === 'degraded' ? 'bg-amber-400 dark:bg-amber-500/80 h-2/3 hover:bg-amber-500' : ''}
                                        ${day.status === 'outage' ? 'bg-rose-400 dark:bg-rose-500/80 h-1/3 hover:bg-rose-500' : ''}
                                    `}
                                >
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/bar:block bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs py-1 px-2 rounded font-bold whitespace-nowrap z-10 shadow-lg pointer-events-none">
                                        {new Date(day.date).toLocaleDateString()}: <span className="uppercase tracking-widest text-[9px]">{day.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                             <span>90 days ago</span>
                             <span>100% uptime</span>
                             <span>Today</span>
                        </div>
                    </div>
                  </div>
                )})}
              </div>
          </div>
        </RevealOnScroll>

        {/* 90-Day History Bar */}
        <RevealOnScroll animation="fade-up" delay={300}>
            <div className="mb-16">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <h2 className="text-2xl font-bold tracking-tight">90-Day History</h2>
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Operational</div>
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" /> Degraded</div>
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500" /> Outage</div>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200/70 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <div className="flex gap-[2px] sm:gap-1 items-end h-24 mb-6 group w-full relative">
                        {/* A light line for visual baseline */}
                        <div className="absolute inset-x-0 bottom-0 h-px bg-slate-100 dark:bg-slate-800/80 -z-10" />
                        
                        {history.map((day, i) => (
                            <div 
                                key={i} 
                                className={`flex-1 rounded-t-sm transition-all duration-300 hover:h-full cursor-pointer relative group/bar
                                    ${day.status === 'operational' ? 'bg-emerald-400 dark:bg-emerald-500/80 h-1/3 hover:bg-emerald-500' : ''}
                                    ${day.status === 'degraded' ? 'bg-amber-400 dark:bg-amber-500/80 h-2/3 hover:bg-amber-500' : ''}
                                    ${day.status === 'outage' ? 'bg-rose-400 dark:bg-rose-500/80 h-full hover:bg-rose-500' : ''}
                                `}
                            >
                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/bar:block bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs py-1 px-2 rounded font-bold whitespace-nowrap z-10 shadow-lg pointer-events-none">
                                    {new Date(day.date).toLocaleDateString()}: <span className="uppercase tracking-widest text-[9px]">{day.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        <span>90 days ago</span>
                        <div className="flex items-center gap-1.5"><RefreshCcw className="w-3 h-3 animate-spin duration-3000" /><span>Live updates enabled</span></div>
                        <span>Today</span>
                    </div>
                </div>
            </div>
        </RevealOnScroll>


      </main>

      <Footer onAction={onNavigateHome} />
    </div>
  );
};

export default StatusPage;

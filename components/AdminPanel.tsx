
import React, { useState } from 'react';
import { Database, TrendingUp, ShoppingBag, Truck, IndianRupee, MapPin, Navigation, Compass, ShieldCheck, Activity, Globe, Monitor, Zap, Mail, Phone, User as UserIcon, AlertTriangle, ClipboardList } from 'lucide-react';
import { Order, Product, User } from '../types';

interface AdminPanelProps {
  orders: Order[];
  users: User[];
  products: Product[];
  onLogout: () => void;
  logs?: string[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ orders, users, products, onLogout, logs = [] }) => {
  const [activeTab, setActiveTab] = useState<'FINANCE' | 'SYSTEM' | 'MAP' | 'USERS'>('FINANCE');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orders[0]?.id || null);

  const selectedOrder = orders.find(o => o.id === selectedOrderId);
  const completedOrders = orders.filter(o => o.status === 'DELIVERED');
  const totalRevenue = completedOrders.length * 2; 
  const totalPayout = completedOrders.reduce((s, o) => s + o.deliveryCost, 0);

  const aiBgClass = "bg-[#020617] text-white min-h-screen font-mono selection:bg-emerald-500/30";

  const getAdminNotification = (order: Order) => {
    switch (order.status) {
      case 'PENDING':
        return `🔔 New order placed by consumer. Waiting for farmer verification.`;
      case 'ACCEPTED':
        return `✅ Farmer verified availability for the order and awaiting delivery acceptance.`;
      case 'DRIVER_ASSIGNED':
        return `🚚 Delivery partner assigned successfully.`;
      case 'PICKED_UP':
        return `📊 In Transit`;
      case 'DELIVERED':
        return `✔ Order completed successfully`;
      case 'REJECTED':
        return `❌ Order cancelled due to product unavailability.`;
      default:
        return order.status;
    }
  };

  return (
    <div className={aiBgClass}>
      <header className="p-6 flex justify-between items-center border-b border-white/5 backdrop-blur-xl sticky top-0 z-50 bg-[#020617]/80">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2.5 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.5)] animate-pulse">
            <Zap className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white"><strong>GEORGIOS</strong> <span className="text-emerald-400"><strong>CORE AI</strong></span></h1>
            <p className="text-[8px] font-black uppercase text-emerald-500/60 tracking-[0.5em]"><strong>Real-Time Nexus Protocol</strong></p>
          </div>
        </div>
        <nav className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
          {['FINANCE', 'SYSTEM', 'MAP', 'USERS'].map(t => (
            <button key={t} onClick={() => setActiveTab(t as any)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'text-gray-500 hover:text-white'}`}><strong>{t}</strong></button>
          ))}
        </nav>
        <button onClick={onLogout} className="text-[10px] font-black uppercase text-red-400 hover:text-red-500 px-4 border border-red-900/30 rounded-full py-2 hover:bg-red-500/10 transition-all"><strong>TERMINATE SESSION</strong></button>
      </header>

      <div className="p-8 max-w-7xl mx-auto">
        {activeTab === 'FINANCE' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-10">
             <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] relative overflow-hidden group hover:border-emerald-500/30 transition-all">
               <div className="absolute -right-10 -top-10 opacity-5 group-hover:opacity-10 transition-opacity rotate-12"><IndianRupee size={200} /></div>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4"><strong>Platform Gross Net</strong></p>
               <h3 className="text-6xl font-black text-emerald-400 tracking-tighter"><strong>₹{totalRevenue}</strong></h3>
             </div>
             <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] hover:border-blue-500/30 transition-all">
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4"><strong>Logistics Circulation</strong></p>
               <h3 className="text-6xl font-black text-white tracking-tighter"><strong>₹{totalPayout}</strong></h3>
             </div>
             <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(16,185,129,0.2)]">
               <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-4"><strong>Total Ecosystem GMV</strong></p>
               <h3 className="text-6xl font-black text-white tracking-tighter"><strong>₹{totalRevenue + totalPayout}</strong></h3>
             </div>
          </div>
        )}

        {activeTab === 'USERS' && (
          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 animate-in fade-in duration-500">
            <h3 className="text-xl font-black uppercase tracking-tighter mb-6 text-emerald-400"><strong>Node Directory</strong></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((u, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4 group hover:bg-white/10 transition-all">
                   <div className="flex items-center gap-3">
                     <div className="bg-emerald-500/20 p-3 rounded-2xl text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                        <UserIcon size={20} />
                     </div>
                     <div>
                        <h4 className="font-black uppercase tracking-tight text-white"><strong>{u.name}</strong></h4>
                        <span className="text-[9px] font-black uppercase text-emerald-500/60 tracking-widest"><strong>{u.role}</strong></span>
                     </div>
                   </div>
                   <div className="space-y-2">
                     <div className="flex items-center gap-2 text-[10px] text-gray-400">
                       <Mail size={12} className="text-emerald-500" /> <strong>{u.email}</strong>
                     </div>
                     <div className="flex items-center gap-2 text-[10px] text-gray-400">
                       <MapPin size={12} className="text-emerald-500" /> <strong>{u.village || 'Location Unavailable'}</strong>
                     </div>
                   </div>
                   <div className="flex gap-2">
                      <button 
                        onClick={() => window.location.href = `mailto:${u.email}`}
                        className="flex-1 bg-white/5 hover:bg-emerald-600 border border-white/10 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                      >
                        <strong>Email</strong>
                      </button>
                      <button 
                        className="flex-1 bg-white/5 hover:bg-blue-600 border border-white/10 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                      >
                        <strong>Call</strong>
                      </button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'MAP' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[650px] animate-in fade-in duration-700">
            <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-white/10 flex items-center gap-2 bg-white/5"><Activity size={16} className="text-emerald-400"/> <h4 className="text-[10px] font-black uppercase tracking-widest"><strong>Live Job Matrix</strong></h4></div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {orders.map(o => (
                  <button key={o.id} onClick={() => setSelectedOrderId(o.id)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all ${selectedOrderId === o.id ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-inner' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}>
                    <div className="flex justify-between items-center mb-2">
                       <p className="font-black text-[11px] uppercase tracking-tighter"><strong>LINK #{o.id.slice(-4)}</strong></p>
                       <span className={`w-2 h-2 rounded-full ${o.status === 'DELIVERED' ? 'bg-gray-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                    </div>
                    <p className="text-[8px] font-bold text-emerald-400/80 uppercase tracking-widest leading-none mb-1"><strong>{getAdminNotification(o)}</strong></p>
                    <p className="text-[9px] font-medium opacity-60 leading-tight"><strong>{o.farmerVillage}</strong> <span className="text-emerald-400">→</span> <strong>{o.address}</strong></p>
                  </button>
                ))}
                {orders.length === 0 && <p className="text-center py-20 text-[10px] font-black text-gray-600 uppercase"><strong>No active links</strong></p>}
              </div>
            </div>
            <div className="lg:col-span-3 bg-[#010409] border border-white/10 rounded-[3rem] relative overflow-hidden flex items-center justify-center group shadow-2xl">
               {selectedOrder ? (
                 <>
                   <div className="absolute inset-0 overflow-hidden pointer-events-none">
                     <div className="absolute inset-0" style={{ 
                       backgroundImage: 'linear-gradient(to right, #111827 1px, transparent 1px), linear-gradient(to bottom, #111827 1px, transparent 1px)', 
                       backgroundSize: '40px 40px' 
                     }}></div>
                     
                     <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 500">
                        <defs>
                          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                            <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
                          </linearGradient>
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                            <feMerge>
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                        </defs>
                        
                        <path 
                          d="M 200 250 Q 400 150 600 250" 
                          fill="none" 
                          stroke="url(#lineGrad)" 
                          strokeWidth="3" 
                          strokeDasharray="10,10"
                          filter="url(#glow)"
                        >
                          <animate attributeName="stroke-dashoffset" from="200" to="0" dur="5s" repeatCount="indefinite" />
                        </path>

                        <circle cx="200" cy="250" r="8" fill="#10b981" filter="url(#glow)" />
                        <circle cx="200" cy="250" r="15" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.4">
                           <animate attributeName="r" from="15" to="30" dur="2s" repeatCount="indefinite" />
                           <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
                        </circle>

                        <circle cx="600" cy="250" r="8" fill="#3b82f6" filter="url(#glow)" />
                        <circle cx="600" cy="250" r="15" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.4">
                           <animate attributeName="r" from="15" to="30" dur="2s" repeatCount="indefinite" />
                           <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
                        </circle>
                     </svg>
                   </div>
                   
                   <div className="absolute top-10 left-10 p-6 glass-card border-white/10 rounded-[2rem] bg-black/40 backdrop-blur-xl animate-in fade-in duration-1000">
                      <div className="space-y-4">
                         <div>
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1"><strong>Source Node</strong></p>
                            <h5 className="font-black text-lg uppercase"><strong>{selectedOrder.farmerVillage}</strong></h5>
                            <p className="text-[8px] text-gray-500 font-bold uppercase"><strong>Farmer: {selectedOrder.farmerName}</strong></p>
                         </div>
                         <div className="h-8 w-px bg-white/10 ml-2"></div>
                         <div>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1"><strong>Target Node</strong></p>
                            <h5 className="font-black text-lg uppercase"><strong>{selectedOrder.address}</strong></h5>
                            <p className="text-[8px] text-gray-500 font-bold uppercase"><strong>Consumer: {selectedOrder.consumerName}</strong></p>
                         </div>
                      </div>
                   </div>

                   <div className="absolute top-10 right-10 p-6 glass-card border-white/10 rounded-[2rem] bg-black/40 backdrop-blur-xl animate-in fade-in duration-1000">
                      <div className="text-right">
                         <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-1"><strong>Cargo Details</strong></p>
                         <div className="space-y-1 mt-2">
                           {selectedOrder.items.map((it, idx) => (
                             <p key={idx} className="text-[10px] font-bold text-gray-300 uppercase"><strong>{it.name} x {it.quantity}kg</strong></p>
                           ))}
                         </div>
                         <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-[9px] font-black text-gray-500 uppercase"><strong>Transit Partner</strong></p>
                            <p className="text-xs font-black uppercase text-emerald-400"><strong>{selectedOrder.deliveryBoyName || 'Awaiting Claim'}</strong></p>
                         </div>
                      </div>
                   </div>
                   
                   <div className="absolute bottom-10 left-10 right-10 bg-black/60 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom-6 duration-500">
                      <div className="flex items-center gap-6">
                         <div className="bg-emerald-500 p-4 rounded-3xl shadow-[0_0_20px_rgba(16,185,129,0.4)]"><Truck className="text-black w-8 h-8" /></div>
                         <div>
                            <p className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.3em] mb-1"><strong>Transit Telemetry Active</strong></p>
                            <h4 className="font-black text-2xl uppercase tracking-tighter text-white"><strong>{selectedOrder.distanceKm}</strong> <span className="text-gray-500 text-sm"><strong>KM TOTAL</strong></span></h4>
                         </div>
                      </div>
                      <div className="flex gap-4">
                         <button className="bg-white/5 hover:bg-emerald-600/20 px-6 py-3 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest transition-all"><strong>Export Logs</strong></button>
                         <button className="bg-emerald-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.4)]"><strong>Verify Link</strong></button>
                      </div>
                   </div>
                 </>
               ) : (
                 <div className="text-center p-20 border-2 border-dashed border-white/5 rounded-[4rem]">
                    <Compass className="w-20 h-20 text-emerald-500/20 mx-auto mb-6 animate-pulse" />
                    <p className="text-xs font-black uppercase tracking-[0.5em] text-gray-600"><strong>Awaiting Signal Acquisition</strong></p>
                 </div>
               )}
            </div>
          </div>
        )}

        {activeTab === 'SYSTEM' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in zoom-in-95 duration-500">
             <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10">
               <div className="flex justify-between items-center mb-8">
                 <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-emerald-400"><strong>Health Hub</strong></h3>
                 </div>
                 <div className="flex items-center gap-3 bg-emerald-500/10 px-6 py-3 rounded-2xl border border-emerald-500/20">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> 
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400"><strong>Safe</strong></span>
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 {[
                   { label: 'Latency Pulse', value: '1.8ms', icon: Activity },
                   { label: 'Ecosystem Nodes', value: users.length, icon: Globe },
                   { label: 'Active Pipeline', value: orders.filter(o => o.status !== 'DELIVERED').length, icon: Navigation },
                   { label: 'Uptime Integrity', value: '100%', icon: Monitor }
                 ].map((stat, idx) => (
                   <div key={idx} className="p-6 bg-white/5 rounded-[2rem] border border-white/5 flex flex-col items-center">
                     <stat.icon className="text-emerald-500 mb-3" size={24} />
                     <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1"><strong>{stat.label}</strong></p>
                     <p className="text-lg font-black"><strong>{stat.value}</strong></p>
                   </div>
                 ))}
               </div>
             </div>

             <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 flex flex-col">
                <div className="flex items-center gap-3 mb-8">
                   <ClipboardList className="text-emerald-400" />
                   <h3 className="text-2xl font-black uppercase tracking-tighter text-white"><strong>Protocol Logs</strong></h3>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-4">
                   {logs.map((log, idx) => (
                     <div key={idx} className={`p-4 rounded-2xl border ${log.includes('⚠') ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-gray-300'} text-[10px] font-bold`}>
                        {log}
                     </div>
                   ))}
                   {logs.length === 0 && (
                     <div className="h-full flex flex-col items-center justify-center opacity-20">
                        <ShieldCheck size={48} className="mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest"><strong>No Protocol Alerts</strong></p>
                     </div>
                   )}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

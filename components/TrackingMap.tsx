
import React from 'react';
import { MapPin, Truck, Home, Store, ExternalLink, Navigation, Clock, CheckCircle, Package, Utensils, Timer, UserCheck } from 'lucide-react';
import { Role } from '../types';

interface TrackingMapProps {
  status: string;
  pickupLocation?: string;
  dropLocation?: string;
  userRole?: Role;
  distanceKm?: number;
}

export const TrackingMap = ({ status, pickupLocation, dropLocation, userRole, distanceKm }: TrackingMapProps) => {
  // Milestone logic (Detailed Flow)
  const milestones = [
    { id: 'PENDING', label: 'Order Placed', icon: Package },
    { id: 'ACCEPTED', label: 'Farmer Ready', icon: Store },
    { id: 'DRIVER_ASSIGNED', label: 'Driver Claimed', icon: UserCheck },
    { id: 'PICKED_UP', label: 'In Transit', icon: Truck },
    { id: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
  ];

  const getStatusIndex = () => {
    if (status === 'PENDING') return 0;
    if (status === 'ACCEPTED') return 1;
    if (status === 'DRIVER_ASSIGNED') return 2;
    if (status === 'PICKED_UP') return 3;
    if (status === 'DELIVERED') return 4;
    return 0;
  };

  const currentIndex = getStatusIndex();

  const openGoogleMaps = () => {
    const baseUrl = "https://www.google.com/maps/dir/?api=1";
    let destination = status === 'PICKED_UP' || status === 'DRIVER_ASSIGNED' ? (dropLocation || "Home") : (pickupLocation || "Farm");
    const query = encodeURIComponent(destination);
    
    if (userRole === 'DELIVERY' && status !== 'DELIVERED') {
       window.open(`${baseUrl}&destination=${query}&travelmode=driving`, '_blank');
    } else {
       window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden my-6 animate-in fade-in duration-700">
      {/* Visual Header */}
      <div className="bg-gray-900 p-5 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-xl animate-pulse">
            <Truck size={18} className="text-white" />
          </div>
          <div>
            <span className="font-black text-[10px] uppercase tracking-widest block">Logistics Command</span>
            <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-tight">Active Signal Processing</p>
          </div>
        </div>
        <button 
          onClick={openGoogleMaps}
          className="bg-white/10 hover:bg-emerald-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-white/10"
        >
          <Navigation size={12} /> External GPS
        </button>
      </div>

      {/* Progress Bar (Detailed Style) */}
      <div className="p-8 bg-gray-50/50">
        <div className="relative flex justify-between items-start">
          {/* Background Line */}
          <div className="absolute top-6 left-0 right-0 h-1.5 bg-gray-200 rounded-full -z-0"></div>
          {/* Active Line */}
          <div 
            className="absolute top-6 left-0 h-1.5 bg-emerald-500 rounded-full transition-all duration-1000 ease-in-out -z-0"
            style={{ width: `${(currentIndex / (milestones.length - 1)) * 100}%` }}
          ></div>

          {milestones.map((ms, idx) => {
            const Icon = ms.icon;
            const isCompleted = idx <= currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={ms.id} className="flex flex-col items-center relative z-10 w-1/5">
                <div 
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border-[6px] border-white shadow-lg transition-all duration-700 ease-out ${
                    isCompleted ? 'bg-emerald-600 text-white' : 'bg-white text-gray-300'
                  } ${isCurrent ? 'scale-125 ring-[10px] ring-emerald-50' : 'scale-100'}`}
                >
                  <Icon size={18} className={isCurrent ? 'animate-pulse' : ''} />
                </div>
                <span className={`mt-3 text-[9px] font-black uppercase tracking-tighter text-center leading-none ${isCompleted ? 'text-gray-900' : 'text-gray-300'}`}>
                  {ms.label}
                </span>
                {isCurrent && status !== 'DELIVERED' && status !== 'REJECTED' && (
                  <div className="mt-2 flex items-center gap-1 text-[8px] text-emerald-600 animate-bounce font-black uppercase tracking-widest">
                    <span className="w-1 h-1 bg-emerald-600 rounded-full"></span> Live
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Simplified Live Map Simulation (Clean Grid) */}
      <div className="h-32 bg-[#f1f5f9] relative overflow-hidden flex items-center justify-center">
        {/* CSS Pattern to replace image watermark */}
        <div className="absolute inset-0 opacity-10" style={{ 
          backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px), radial-gradient(#10b981 1px, #f1f5f9 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px'
        }}></div>
        
        <div className="relative flex items-center w-full px-16 justify-between">
           <div className="flex flex-col items-center animate-in fade-in duration-500">
             <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
               <Store size={24} className="text-gray-400" />
             </div>
             <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-2">{pickupLocation || 'Farm Origin'}</span>
           </div>
           
           <div className="flex-1 flex justify-center relative">
              <div 
                className="transition-all duration-1000 ease-in-out absolute -top-12"
                style={{ left: `calc(${(currentIndex / 4) * 100}% - 24px)` }}
              >
                <div className="bg-gray-900 text-white p-3 rounded-2xl shadow-2xl border-4 border-white ring-8 ring-emerald-50 animate-in bounce-in duration-500">
                  <Truck size={24} className="animate-pulse" />
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full border border-white"></div>
           </div>

           <div className="flex flex-col items-center animate-in fade-in duration-500">
             <div className="bg-white p-3 rounded-2xl shadow-sm border border-emerald-100">
               <Home size={24} className="text-emerald-600" />
             </div>
             <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700 mt-2">Destination</span>
           </div>
        </div>
      </div>

      <div className="bg-white p-6 text-center border-t border-gray-100">
         <div className="text-sm font-black text-gray-900 uppercase tracking-tight animate-in fade-in duration-500">
            {status === 'PENDING' && 'Synchronizing farmer availability...'}
            {status === 'ACCEPTED' && 'Harvest confirmed. Awaiting driver.'}
            {status === 'DRIVER_ASSIGNED' && 'Transit Partner assigned. Proceeding to Pickup.'}
            {status === 'PICKED_UP' && 'Transporting fresh cargo to you.'}
            {status === 'DELIVERED' && 'Transaction complete. Handover verified.'}
            {status === 'REJECTED' && 'Order cancelled.'}
         </div>
         {status !== 'DELIVERED' && status !== 'REJECTED' && (
           <div className="text-[10px] text-gray-400 mt-2 flex items-center justify-center gap-2 font-black uppercase tracking-widest">
             <Timer size={14} className="text-emerald-500" /> Operational ETA: ~35 Minutes
           </div>
         )}
      </div>
    </div>
  );
};

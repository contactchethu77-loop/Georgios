
import React from 'react';
import { Truck, Phone, User as UserIcon, UserCheck, ArrowRight, Wallet, Star, Lock } from 'lucide-react';
import { Order, User } from '../types';
import { TrackingMap } from './TrackingMap';

interface DeliveryDashboardProps {
  user: User;
  orders: Order[];
  onUpdateStatus: (orderId: string, status: any) => void;
}

export const DeliveryDashboard: React.FC<DeliveryDashboardProps> = ({ user, orders, onUpdateStatus }) => {
  // Only show ACCEPTED orders if they are PAID or CASH (COD)
  const activeOrders = orders.filter(o => {
    const isAvailable = (o.status === 'ACCEPTED') && (o.paymentStatus === 'PAID' || o.paymentMethod === 'CASH');
    const isMine = (o.deliveryBoyId === user.id && o.status !== 'DELIVERED');
    return isAvailable || isMine;
  });

  const completedOrders = orders.filter(o => o.deliveryBoyId === user.id && o.status === 'DELIVERED');
  const totalEarnings = completedOrders.reduce((sum, order) => sum + order.deliveryCost, 0);
  const currentRating = user.rating || 5;

  const getDeliveryNotification = (order: Order) => {
    switch (order.status) {
      case 'ACCEPTED':
        return `📦 New delivery request available – Order ID #${order.id}, Pickup from farmer location and deliver to consumer location. Please accept the order`;
      case 'DRIVER_ASSIGNED':
        return `✅ Order accepted successfully. Proceed to pickup location`;
      case 'PICKED_UP':
        return `🚚 Proceeding to delivery destination.`;
      case 'DELIVERED':
        return `✅ Delivery complete.`;
      default:
        return order.status;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-gray-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><Truck size={120} /></div>
         <div className="relative z-10 flex items-center gap-4">
           <div className="bg-emerald-500 p-4 rounded-2xl"><Truck className="text-gray-900" size={28} /></div>
           <div>
             <h2 className="font-black text-2xl uppercase tracking-widest">Georgios Logistics</h2>
             <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em] mt-1">Real-Time Transit Terminal</p>
           </div>
         </div>
         <div className="relative z-10 flex gap-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-2 rounded-full flex items-center gap-2">
               <Star size={12} className="text-yellow-400 fill-current" />
               <span className="text-emerald-400 text-[11px] font-black uppercase tracking-widest">{currentRating}/5</span>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-2 rounded-full flex items-center gap-2">
               <Wallet size={12} className="text-emerald-400" />
               <span className="text-emerald-400 text-[11px] font-black uppercase tracking-widest">₹{totalEarnings}</span>
            </div>
         </div>
      </div>

      <div className="space-y-8">
        {activeOrders.map(order => {
          const isMine = order.deliveryBoyId === user.id;
          return (
            <div key={order.id} className="glass-card p-10 rounded-[3.5rem] border border-white relative overflow-hidden shadow-sm animate-in slide-in-from-bottom-6">
               <div className="flex justify-between items-start mb-8">
                 <div className="flex-1">
                   <div className="flex items-center gap-3 mb-2">
                     <h3 className="font-black text-2xl tracking-tighter uppercase text-emerald-900">Delivery Job #{order.id}</h3>
                     {!isMine && (
                        <div className="flex items-center gap-2">
                           <span className="bg-emerald-600 text-white text-[9px] font-black px-4 py-1 rounded-full uppercase animate-pulse">Available</span>
                           {order.paymentMethod !== 'CASH' && <span className="bg-blue-600 text-white text-[9px] font-black px-4 py-1 rounded-full uppercase">Prepaid</span>}
                        </div>
                     )}
                   </div>
                   <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 inline-block max-w-lg">
                      <p className="text-[12px] font-black text-emerald-800 leading-tight uppercase tracking-tight"><strong>{getDeliveryNotification(order)}</strong></p>
                   </div>
                   
                   {isMine && (
                     <div className="mt-8 p-8 bg-gray-900 text-white rounded-[3rem] border border-emerald-500/30 shadow-2xl">
                       <h4 className="text-[11px] font-black uppercase text-emerald-400 tracking-widest mb-6 text-center underline decoration-emerald-500/40 underline-offset-8">Coordination Control Center</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all">
                           <div className="flex justify-between items-center mb-4">
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Origin Point</p>
                             <UserCheck size={16} className="text-emerald-400" />
                           </div>
                           <p className="text-lg font-black uppercase tracking-tight text-white mb-1">{order.farmerName}</p>
                           <p className="text-xs text-emerald-200 font-bold mb-5 tracking-widest">{order.farmerPhone}</p>
                           <button onClick={() => window.location.href=`tel:${order.farmerPhone}`} className="w-full bg-emerald-500 text-black py-3 rounded-2xl text-[11px] font-black uppercase flex items-center justify-center gap-2 hover:scale-105 transition-transform">
                             <Phone size={14} /> Call Farmer
                           </button>
                         </div>
                         <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all">
                           <div className="flex justify-between items-center mb-4">
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Destination Target</p>
                             <UserIcon size={16} className="text-blue-400" />
                           </div>
                           <p className="text-lg font-black uppercase tracking-tight text-white mb-1">{order.consumerName}</p>
                           <p className="text-xs text-blue-200 font-bold mb-5 tracking-widest">{order.consumerPhone}</p>
                           <button onClick={() => window.location.href=`tel:${order.consumerPhone}`} className="w-full bg-blue-500 text-white py-3 rounded-2xl text-[11px] font-black uppercase flex items-center justify-center gap-2 hover:scale-105 transition-transform">
                             <Phone size={14} /> Call Consumer
                           </button>
                         </div>
                       </div>
                       <p className="text-[9px] text-gray-500 uppercase font-black text-center mt-6 tracking-[0.2em] opacity-60">Logistics link fully established.</p>
                     </div>
                   )}
                 </div>
               </div>

               {order.status === 'ACCEPTED' && !order.deliveryBoyId && (
                 <button 
                  onClick={() => onUpdateStatus(order.id, 'DRIVER_ASSIGNED')} 
                  className="w-full bg-emerald-600 text-white py-6 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                 >
                   Claim Delivery Job <ArrowRight size={20}/>
                 </button>
               )}
               
               {isMine && (
                 <div className="mt-10 space-y-6">
                    <TrackingMap status={order.status} pickupLocation={order.farmerVillage} dropLocation={order.address} userRole="DELIVERY" />
                    
                    <div className="flex gap-4">
                      {order.status === 'DRIVER_ASSIGNED' && (
                        <button onClick={() => onUpdateStatus(order.id, 'PICKED_UP')} className="flex-1 bg-gray-900 text-white py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl hover:bg-black transition-all">Verify Pickup Successful</button>
                      )}
                      {order.status === 'PICKED_UP' && (
                        <button onClick={() => onUpdateStatus(order.id, 'DELIVERED')} className="flex-1 bg-emerald-600 text-white py-5 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all">Verify Successful Handover</button>
                      )}
                    </div>
                 </div>
               )}
            </div>
          );
        })}

        <div className="space-y-6">
           <h4 className="text-xl font-black uppercase tracking-widest text-emerald-900 ml-4">Job History & Summary</h4>
           {completedOrders.map(order => (
              <div key={order.id} className="glass-card p-8 rounded-[3rem] border-2 border-emerald-500 animate-in fade-in">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="bg-emerald-600 text-white p-3 rounded-2xl shadow-lg">
                       <CheckCircle2 size={24} />
                    </div>
                    <div>
                       <h5 className="font-black text-lg uppercase">Completed Delivery #{order.id}</h5>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(order.date).toLocaleDateString()}</p>
                    </div>
                 </div>
                 <div className="bg-emerald-900 text-white p-6 rounded-[2rem] shadow-2xl border border-emerald-400">
                    <p className="text-sm font-black uppercase tracking-tight">
                       🚚 Delivery Summary: You earned ₹{order.deliveryCost} for this delivery. Total earnings: ₹{totalEarnings}. Your current rating: ⭐ {currentRating}/5 based on customer feedback
                    </p>
                 </div>
              </div>
           ))}
        </div>

        {activeOrders.length === 0 && completedOrders.length === 0 && (
           <div className="py-32 text-center opacity-30 bg-white/40 rounded-[4rem] border border-dashed border-emerald-200">
             <Truck size={64} className="mx-auto mb-6 text-emerald-200" />
             <p className="text-xl font-black uppercase tracking-widest text-emerald-800">No Jobs Available In Your Perimeter</p>
           </div>
        )}
      </div>
    </div>
  );
};
import { CheckCircle2 } from 'lucide-react';

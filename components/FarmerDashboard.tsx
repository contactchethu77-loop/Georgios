
import React, { useState, useRef } from 'react';
import { Camera, Package, TrendingUp, Plus, Star, XCircle, Loader2, User as UserIcon, Phone, CheckCircle2, ShieldCheck, IndianRupee, Wallet } from 'lucide-react';
import { Product, Order, User } from '../types';
import { identifyCropFromImage, predictCropPrice } from '../services/geminiService';
import { TrackingMap } from './TrackingMap';

interface FarmerDashboardProps {
  user: User;
  products: Product[];
  orders: Order[];
  onAddProduct: (product: Product) => void;
  onUpdateOrder: (orderId: string, status: any) => void;
  onInedibleDetected?: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ user, products, orders, onAddProduct, onUpdateOrder, onInedibleDetected }) => {
  const [view, setView] = useState<'HOME' | 'ADD_CROP' | 'ORDERS'>('HOME');
  const [loading, setLoading] = useState(false);
  const [searchStep, setSearchStep] = useState('');
  
  const [newCropName, setNewCropName] = useState('');
  const [newCropPrice, setNewCropPrice] = useState(''); // Will be set by AI
  const [newCropQty, setNewCropQty] = useState('');
  const [newCropImage, setNewCropImage] = useState<string | null>(null);
  
  const [detectedGrade, setDetectedGrade] = useState('');
  const [conclusivePrice, setConclusivePrice] = useState('');
  const [priceAdvice, setPriceAdvice] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const myProducts = products.filter(p => p.farmerId === user.id);
  const myOrders = orders.filter(o => o.farmerId === user.id);

  const completedOrders = myOrders.filter(o => o.status === 'DELIVERED');
  const totalEarnings = completedOrders.reduce((sum, order) => sum + (order.totalAmount - 2), 0);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      setSearchStep('AI Quality Scan...');
      setDetectedGrade('');
      setConclusivePrice('');
      setNewCropPrice('');
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setNewCropImage(base64);
        
        const result = await identifyCropFromImage(base64);
        
        if (result && result.name !== 'Unknown') {
          setNewCropName(result.name);
          setDetectedGrade(result.grade);

          if (result.grade.includes('INEDIBLE') || result.grade.includes('REJECT')) {
             setLoading(false);
             onInedibleDetected?.();
             return;
          }

          setSearchStep(`Searching APMC Rates for ${result.name}...`);
          const priceResult = await predictCropPrice(
            result.name, 
            user.village || 'Sira', 
            result.grade, 
            'current', 
            'day'
          );
          
          setConclusivePrice(priceResult.conclusivePrice);
          setPriceAdvice(priceResult.advice);
          
          const numericPrice = priceResult.conclusivePrice.replace(/[^\d.]/g, '');
          if (numericPrice) setNewCropPrice(numericPrice);
        }
        setLoading(false);
        setSearchStep('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = () => {
    if (!newCropName || !newCropPrice || !newCropQty || !newCropImage || detectedGrade.includes('INEDIBLE')) return;
    
    onAddProduct({
      id: Date.now().toString(),
      farmerId: user.id,
      farmerName: user.name,
      farmerVillage: user.village || 'Sira Junction',
      name: newCropName,
      image: newCropImage,
      pricePerKg: parseFloat(newCropPrice),
      quantityAvailable: parseFloat(newCropQty),
      category: 'Produce',
      description: `${detectedGrade || 'Standard'} grade. AI-Verified Price.`,
      dateListed: new Date().toISOString()
    });
    
    setView('HOME');
    setNewCropName(''); setNewCropPrice(''); setNewCropQty(''); setNewCropImage(null);
  };

  const getFarmerNotification = (order: Order) => {
    const items = order.items.map(i => `${i.name} ${i.quantity} kg`).join(", ");
    switch (order.status) {
      case 'PENDING':
        return `🔔 New Order Received – Order ID #${order.id}, Product: ${items}, Consumer: ${order.consumerName}. Please verify availability and confirm within 30 minutes`;
      case 'ACCEPTED':
        return `✅ Harvest confirmed. Awaiting delivery partner acceptance.`;
      case 'DRIVER_ASSIGNED':
        return `🚚 Delivery partner assigned for your order. Please keep the product ready`;
      case 'PICKED_UP':
        return `✅ Delivery partner collected the product`;
      case 'DELIVERED':
        return `✅ Order delivered to customer`;
      case 'REJECTED':
        return `❌ Order cancelled due to unavailability.`;
      default:
        return order.status;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex bg-white/60 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-white/40">
        {[
          { id: 'HOME', icon: Package, label: 'Inventory' },
          { id: 'ADD_CROP', icon: Plus, label: 'Sell Produce' },
          { id: 'ORDERS', icon: TrendingUp, label: 'Active Orders' },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setView(tab.id as any)}
            className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl transition-all ${view === tab.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-emerald-800/60 hover:bg-white/40'}`}>
            <tab.icon className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-black uppercase tracking-widest"><strong>{tab.label}</strong></span>
          </button>
        ))}
      </div>

      {view === 'HOME' && (
        <div className="space-y-6">
           <div className="grid grid-cols-2 gap-4">
             <div className="glass-card p-6 rounded-[2.5rem] border-l-8 border-emerald-500">
               <div className="flex items-center gap-2 mb-1">
                 <Wallet size={14} className="text-emerald-500" />
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Earnings</p>
               </div>
               <h2 className="text-2xl font-black text-gray-900">₹{totalEarnings}</h2>
             </div>
             <div className="glass-card p-6 rounded-[2.5rem] border-l-8 border-yellow-400">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Reputation</p>
               <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">4.8 <Star size={18} className="text-yellow-500 fill-current" /></h2>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myProducts.map((p) => (
                <div key={p.id} className="glass-card p-4 rounded-3xl flex gap-4 hover:scale-[1.02] transition-transform">
                  <img src={p.image} className="w-24 h-24 object-cover rounded-2xl bg-gray-100" />
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="font-black text-lg text-gray-900 uppercase tracking-tighter">{p.name}</h4>
                    <p className="text-emerald-600 font-black text-sm">₹{p.pricePerKg}/kg</p>
                    <p className="text-gray-400 font-bold text-[10px] uppercase">Stock: {p.quantityAvailable}kg</p>
                  </div>
                </div>
              ))}
              {myProducts.length === 0 && (
                <div className="col-span-full py-20 text-center opacity-40 bg-white/40 rounded-[3rem] border border-dashed border-emerald-200">
                   <Package size={48} className="mx-auto mb-4 text-emerald-300" />
                   <p className="font-black uppercase tracking-widest text-xs">No products published yet</p>
                   <button onClick={() => setView('ADD_CROP')} className="mt-4 text-emerald-600 font-black text-[10px] uppercase underline">Start Selling Now</button>
                </div>
              )}
           </div>
        </div>
      )}

      {view === 'ADD_CROP' && (
        <div className="glass-card p-8 rounded-[3rem] shadow-2xl max-w-lg mx-auto border border-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-emerald-900 tracking-tighter uppercase">List Your Harvest</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">AI-Powered Verified Pricing</p>
          </div>

          <div onClick={() => fileInputRef.current?.click()}
            className={`w-full h-56 border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center cursor-pointer transition relative overflow-hidden ${detectedGrade.includes('INEDIBLE') ? 'border-red-300 bg-red-50' : 'border-emerald-200 bg-white/40 hover:bg-emerald-50'}`}>
            {newCropImage ? <img src={newCropImage} className="w-full h-full object-cover" /> : 
              <div className="flex flex-col items-center">
                <div className="bg-emerald-100 p-5 rounded-full mb-3"><Camera className="w-8 h-8 text-emerald-600" /></div>
                <p className="text-[11px] text-emerald-600 font-black uppercase tracking-widest">Tap to Scan Produce</p>
              </div>}
            {loading && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-3" />
                <p className="text-[11px] font-black uppercase text-emerald-900 tracking-widest">{searchStep}</p>
              </div>
            )}
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

          {newCropName && (
             <div className="mt-6 p-5 bg-emerald-50 rounded-[2rem] border border-emerald-100 animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-center">
                   <div>
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">AI Result</span>
                      <h4 className="font-black text-2xl text-emerald-900 tracking-tighter uppercase">{newCropName}</h4>
                   </div>
                   <div className={`px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest ${detectedGrade.includes('INEDIBLE') ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white shadow-lg'}`}>
                      {detectedGrade}
                   </div>
                </div>
             </div>
          )}

          {detectedGrade.includes('INEDIBLE') ? (
            <div className="mt-8 p-8 bg-red-100 rounded-[2.5rem] text-red-800 border border-red-200 animate-in shake duration-500 text-center">
               <XCircle className="mx-auto mb-4 w-16 h-16 text-red-600" /> 
               <p className="text-lg font-black uppercase tracking-tight">❌ This crop is marked as inedible and will not be listed for sale</p>
               <p className="mt-2 opacity-60 text-[10px] font-bold">AI ANALYSIS DETECTED UNSAFE QUALITY LEVELS.</p>
            </div>
          ) : (
            newCropName && (
              <div className="mt-6 space-y-6">
                {conclusivePrice ? (
                  <div className="bg-emerald-800 text-white p-6 rounded-[2rem] shadow-xl animate-in fade-in slide-in-from-top-4 border-2 border-emerald-400">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[9px] font-black uppercase opacity-60 tracking-widest">Final Verified Mandi Rate</span>
                       <ShieldCheck size={16} className="text-emerald-400" />
                    </div>
                    <div className="text-4xl font-black mb-1">{conclusivePrice} <span className="text-xs opacity-60 font-normal">/kg</span></div>
                    <p className="text-[10px] leading-relaxed font-bold opacity-80">{priceAdvice}</p>
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                      <CheckCircle2 size={12} className="text-emerald-400" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-emerald-200">Price locked by AI Protocol</span>
                    </div>
                  </div>
                ) : (
                   <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 text-center">
                      <Loader2 className="animate-spin mx-auto mb-2 text-gray-300" />
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Calculating Market Value...</p>
                   </div>
                )}
                
                <div className="flex flex-col">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1">Total Weight to Sell (kg)</label>
                  <input 
                    type="number" 
                    value={newCropQty} 
                    onChange={e => setNewCropQty(e.target.value)} 
                    placeholder="Enter quantity" 
                    className="p-5 bg-gray-50 rounded-2xl border-none font-bold text-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                  />
                </div>

                <button 
                  onClick={handlePublish} 
                  disabled={!conclusivePrice || !newCropQty}
                  className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-black text-[13px] uppercase tracking-widest shadow-2xl shadow-emerald-200 active:scale-95 transition-all disabled:opacity-50"
                >
                  Publish with Verified Price
                </button>
              </div>
            )
          )}
        </div>
      )}

      {view === 'ORDERS' && (
        <div className="space-y-6">
           {myOrders.map(order => (
             <div key={order.id} className="glass-card p-8 rounded-[3rem] border border-white relative overflow-hidden shadow-sm">
               { (order.status === 'PICKED_UP' || order.status === 'DELIVERED') && (
                 <div className="absolute top-0 right-0 bg-red-600 text-white px-10 py-3 rounded-bl-[2.5rem] text-[12px] font-black uppercase tracking-widest animate-pulse z-10 shadow-lg">SOLD</div>
               )}
               <div className="mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-black text-xl text-emerald-900 uppercase tracking-tighter">Order #{order.id}</h3>
                      <div className="mt-2 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <p className="text-[11px] font-black text-emerald-700 leading-tight uppercase tracking-tight">{getFarmerNotification(order)}</p>
                      </div>
                      
                      {order.status === 'DELIVERED' && (
                        <div className="mt-4 p-4 bg-emerald-600 text-white rounded-[2rem] shadow-inner border border-emerald-400">
                          <p className="text-xs font-black uppercase tracking-tight">
                            💰 Earnings Update: You earned ₹{order.totalAmount - 2} from this order. Total earnings so far: ₹{totalEarnings}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
               </div>
               
               {order.deliveryBoyId && (
                 <div className="mb-6 p-5 bg-emerald-900 text-white rounded-[2rem] flex items-center gap-4 animate-in slide-in-from-right-4">
                   <div className="bg-emerald-500/20 p-3 rounded-2xl"><UserIcon size={24} className="text-emerald-400" /></div>
                   <div className="flex-1">
                     <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Delivery Partner Assigned</p>
                     <p className="text-base font-black uppercase">{order.deliveryBoyName}</p>
                     <p className="text-[11px] text-emerald-200 font-bold">{order.deliveryBoyPhone}</p>
                   </div>
                   <button onClick={() => window.location.href=`tel:${order.deliveryBoyPhone}`} className="bg-emerald-500 text-black p-4 rounded-2xl hover:scale-110 transition-all shadow-lg"><Phone size={20} /></button>
                 </div>
               )}

               <div className="bg-white/40 p-5 rounded-2xl mb-6 space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs font-black uppercase text-gray-600">
                      <span>{item.name}</span>
                      <span>{item.quantity} kg</span>
                    </div>
                  ))}
               </div>

               {order.status === 'PENDING' && (
                 <div className="flex gap-4">
                   <button onClick={() => onUpdateOrder(order.id, 'ACCEPTED')} className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl">Confirm Availability</button>
                   <button onClick={() => onUpdateOrder(order.id, 'REJECTED')} className="flex-1 bg-red-100 text-red-600 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest">Unavailable</button>
                 </div>
               )}

               {(order.status === 'DRIVER_ASSIGNED' || order.status === 'PICKED_UP') && (
                  <TrackingMap status={order.status} pickupLocation={order.farmerVillage} dropLocation={order.address} userRole="FARMER" />
               )}
             </div>
           ))}
           {myOrders.length === 0 && (
             <div className="py-20 text-center opacity-40 bg-white/40 rounded-[3rem] border border-dashed border-emerald-200">
               <TrendingUp size={48} className="mx-auto mb-4 text-emerald-300" />
               <p className="font-black uppercase tracking-widest text-xs">No active orders yet</p>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

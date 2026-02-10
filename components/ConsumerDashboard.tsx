
import React, { useState } from 'react';
import { Search, MapPin, ShoppingCart, X, Package, Star, Phone, User as UserIcon, CheckCircle2, CreditCard, Wallet, Landmark, Banknote, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { Product, User, Order } from '../types';
import { TrackingMap } from './TrackingMap';

interface ConsumerDashboardProps {
  user: User;
  products: Product[];
  orders: Order[];
  onPlaceOrder: (items: { product: Product; quantity: number }[], totalProductCost: number, platformFee: number, paymentMethod: 'UPI' | 'CASH', specificAddress: string) => void;
  onRateOrder: (orderId: string, rating: number, feedback: string) => void;
  onPaymentUpdate?: (orderId: string, method: string, success: boolean) => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export const ConsumerDashboard: React.FC<ConsumerDashboardProps> = ({ user, products, orders, onPlaceOrder, onRateOrder, onPaymentUpdate }) => {
  const [view, setView] = useState<'SHOP' | 'ORDERS'>('SHOP');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH'>('CASH');
  const [currentLocation, setCurrentLocation] = useState(user.village || 'Tumkur Hub');
  
  const [isPaying, setIsPaying] = useState<string | null>(null);
  const [payStatus, setPayStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILED'>('IDLE');

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const myOrders = orders.filter(o => o.consumerId === user.id);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => setCart(prev => prev.filter(item => item.product.id !== productId));

  const handleProcessPayment = (orderId: string, method: string) => {
    setIsPaying(orderId);
    setPayStatus('PROCESSING');
    
    // Simulate payment gateway delay
    setTimeout(() => {
      const isSuccess = Math.random() > 0.1 || method === 'CASH'; // 90% success rate, 100% for COD
      if (isSuccess) {
        setPayStatus('SUCCESS');
        onPaymentUpdate?.(orderId, method, true);
        setTimeout(() => {
          setIsPaying(null);
          setPayStatus('IDLE');
        }, 2000);
      } else {
        setPayStatus('FAILED');
        onPaymentUpdate?.(orderId, method, false);
        setTimeout(() => setPayStatus('IDLE'), 3000);
      }
    }, 2000);
  };

  const getConsumerNotification = (order: Order) => {
    switch (order.status) {
      case 'PENDING':
        return `✅ Your order has been placed successfully. Waiting for farmer confirmation`;
      case 'ACCEPTED':
        return `✅ Good news! Farmer confirmed product availability. Your order is being prepared for delivery`;
      case 'DRIVER_ASSIGNED':
        return `🚚 Your order has been accepted by a delivery partner. Estimated delivery time: 45 minutes`;
      case 'PICKED_UP':
        return `📦 Your order has been picked up and is on the way`;
      case 'DELIVERED':
        return `🎉 Order delivered successfully. Please rate your experience`;
      case 'REJECTED':
        return `❌ Sorry! The product is currently unavailable. Please try another farmer or product`;
      default:
        return order.status;
    }
  };

  return (
    <div className="relative animate-in fade-in duration-700">
      <div className="flex justify-center mb-8">
        <div className="glass-card p-1.5 rounded-2xl flex border border-white/50">
           <button onClick={() => setView('SHOP')} className={`px-10 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${view === 'SHOP' ? 'bg-emerald-600 text-white shadow-lg' : 'text-emerald-800/60'}`}>Market</button>
           <button onClick={() => setView('ORDERS')} className={`px-10 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${view === 'ORDERS' ? 'bg-emerald-600 text-white shadow-lg' : 'text-emerald-800/60'}`}>My Orders</button>
        </div>
      </div>

      {view === 'SHOP' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-5 rounded-3xl border border-white flex items-center gap-4">
              <Search className="text-gray-400" />
              <input type="text" placeholder="Search fresh produce from local farms..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-none font-bold outline-none text-gray-700 placeholder:text-gray-300" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredProducts.map((p) => (
                <div key={p.id} className="glass-card rounded-[3rem] overflow-hidden hover:shadow-2xl hover:scale-[1.01] transition-all border border-white">
                  <div className="h-56 relative overflow-hidden">
                    <img src={p.image} className="h-full w-full object-cover transition-transform hover:scale-110 duration-700" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm">
                      <p className="text-[10px] font-black uppercase text-emerald-700 tracking-tight">Direct from Farm</p>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="font-black text-2xl text-gray-900 uppercase tracking-tighter mb-1">{p.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-6 flex items-center gap-1.5"><MapPin size={12} className="text-emerald-500"/> {p.farmerVillage}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-black text-emerald-600 tracking-tighter">₹{p.pricePerKg}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Per Kilogram</p>
                      </div>
                      <button onClick={() => addToCart(p)} className="bg-gray-900 text-white p-4 rounded-2xl shadow-xl hover:bg-emerald-600 transition-all hover:scale-110 active:scale-95"><ShoppingCart size={20}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="glass-card p-8 rounded-[3rem] sticky top-32 border-t-[10px] border-emerald-500 shadow-2xl">
              <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter flex items-center gap-3"><ShoppingCart className="text-emerald-600" size={28}/> Shopping Basket</h2>
              
              <div className="space-y-4 mb-10">
                {cart.map(item => (
                  <div key={item.product.id} className="flex justify-between items-center p-4 bg-white/50 rounded-2xl border border-white/50 animate-in slide-in-from-right-4">
                    <div>
                      <span className="font-black text-xs uppercase text-gray-800">{item.product.name}</span>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">{item.quantity}kg x ₹{item.product.pricePerKg}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-red-400 hover:text-red-600 p-2 transition-colors"><X size={18}/></button>
                  </div>
                ))}
              </div>

              <div className="mb-8 space-y-3">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-1">Delivery Destination</p>
                  <p className="text-xs font-bold text-gray-700">{currentLocation}</p>
                </div>
              </div>

              <button 
                onClick={() => onPlaceOrder(cart, 100, 2, paymentMethod, currentLocation)} 
                disabled={cart.length === 0} 
                className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-200 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                Checkout Now
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'ORDERS' && (
        <div className="max-w-3xl mx-auto space-y-8">
           {myOrders.map(order => (
             <div key={order.id} className="glass-card p-10 rounded-[3.5rem] relative overflow-hidden animate-in slide-in-from-bottom-8">
               <div className="flex justify-between items-start mb-8">
                 <div className="flex-1">
                   <h3 className="font-black text-2xl text-gray-900 tracking-tighter uppercase mb-2">Order #{order.id}</h3>
                   <div className="inline-block px-5 py-2 bg-emerald-50 rounded-2xl border border-emerald-100">
                     <p className="text-[11px] font-black text-emerald-700 leading-tight uppercase tracking-tight"><strong>{getConsumerNotification(order)}</strong></p>
                   </div>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Total Amount</p>
                    <p className="text-2xl font-black text-emerald-600">₹{order.totalAmount + order.deliveryCost}</p>
                 </div>
               </div>

               {/* Secure Payment Gateway Feature */}
               {order.status === 'ACCEPTED' && order.paymentStatus === 'PENDING' && (
                 <div className="mb-8 p-8 bg-gray-900 text-white rounded-[3rem] shadow-2xl border-4 border-emerald-500 animate-in zoom-in-95">
                    <div className="flex items-center gap-3 mb-6">
                       <CreditCard className="text-emerald-500" size={32} />
                       <div>
                          <h4 className="text-xl font-black uppercase tracking-tighter">💳 Payment Required</h4>
                          <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Secure Georgios Nexus Gateway</p>
                       </div>
                    </div>
                    
                    <p className="text-xs font-bold text-gray-300 mb-8">Please complete your payment to confirm the order. Our farmer is waiting to release the harvest.</p>

                    {payStatus === 'IDLE' ? (
                       <div className="grid grid-cols-1 gap-3">
                          {[
                            { id: 'UPI', label: 'UPI (PhonePe/GPay)', icon: Smartphone },
                            { id: 'CARD', label: 'Debit / Credit Card', icon: CreditCard },
                            { id: 'NET', label: 'Net Banking', icon: Landmark },
                            { id: 'WALLET', label: 'Wallet', icon: Wallet },
                            { id: 'CASH', label: 'Cash on Delivery', icon: Banknote },
                          ].map((method) => (
                            <button 
                              key={method.id} 
                              onClick={() => handleProcessPayment(order.id, method.id)}
                              className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all group"
                            >
                               <div className="flex items-center gap-4">
                                  <method.icon size={20} className="text-emerald-500" />
                                  <span className="text-[11px] font-black uppercase tracking-widest">{method.label}</span>
                               </div>
                               <ShieldCheck size={16} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          ))}
                       </div>
                    ) : (
                       <div className="py-12 flex flex-col items-center text-center">
                          {payStatus === 'PROCESSING' && (
                             <>
                               <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mb-6" />
                               <p className="text-lg font-black uppercase tracking-widest animate-pulse">Encrypting Transaction...</p>
                               <p className="text-[9px] text-gray-500 font-bold uppercase mt-2">Connecting to Banking Node</p>
                             </>
                          )}
                          {payStatus === 'SUCCESS' && (
                             <div className="animate-in zoom-in">
                               <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
                               <p className="text-lg font-black uppercase tracking-widest text-emerald-400">✅ Payment successful.</p>
                               <p className="text-[10px] text-gray-300 font-bold uppercase mt-2">Your order is confirmed and will be assigned to a delivery partner</p>
                             </div>
                          )}
                          {payStatus === 'FAILED' && (
                             <div className="animate-in shake duration-500">
                               <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                               <p className="text-lg font-black uppercase tracking-widest text-red-400">❌ Payment failed.</p>
                               <p className="text-[10px] text-gray-300 font-bold uppercase mt-2">Please try again with a different method</p>
                               <button onClick={() => setPayStatus('IDLE')} className="mt-6 text-[10px] font-black text-emerald-400 uppercase underline">Try Again</button>
                             </div>
                          )}
                       </div>
                    )}
                 </div>
               )}

               {order.status === 'DELIVERED' && !order.rating && (
                 <div className="mb-8 p-8 bg-emerald-600 text-white rounded-[3rem] shadow-xl text-center border-4 border-emerald-500 animate-pulse">
                    <h4 className="text-xl font-black uppercase mb-4 tracking-tight">⭐ Please rate your delivery experience</h4>
                    <div className="flex justify-center gap-4">
                       {[1, 2, 3, 4, 5].map((star) => (
                         <button 
                          key={star} 
                          onClick={() => onRateOrder(order.id, star, "Great service!")}
                          className="bg-white/20 p-4 rounded-2xl hover:bg-white text-emerald-600 hover:scale-125 transition-all text-2xl shadow-lg"
                         >
                           {star}
                         </button>
                       ))}
                    </div>
                 </div>
               )}

               <TrackingMap status={order.status} pickupLocation={order.farmerVillage} dropLocation={order.address} />
             </div>
           ))}
        </div>
      )}
    </div>
  );
};
import { Smartphone } from 'lucide-react';

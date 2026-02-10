
import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { FarmerDashboard } from './components/FarmerDashboard';
import { ConsumerDashboard } from './components/ConsumerDashboard';
import { DeliveryDashboard } from './components/DeliveryDashboard';
import { AdminPanel } from './components/AdminPanel';
import { Chatbot } from './components/Chatbot';
import { User, Product, Order, Role } from './types';
import { simulateSendEmail } from './services/emailService';
import { Bell, X } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [adminLogs, setAdminLogs] = useState<string[]>([]);
  const [notification, setNotification] = useState<{message: string, type: 'SUCCESS' | 'EMAIL' | 'ALERT'} | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('georgios_active_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('georgios_active_user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('georgios_active_user');
  };

  const getUserPhone = (userId: string) => {
    const db = JSON.parse(localStorage.getItem('georgios_users_db') || '[]');
    const found = db.find((u: any) => u.id === userId);
    return found?.phone || '9988776655';
  };

  const triggerAdminAlert = (msg: string) => {
    setAdminLogs(prev => [msg, ...prev]);
  };

  const placeOrder = async (items: { product: Product; quantity: number }[], totalProductCost: number, platformFee: number, paymentMethod: 'UPI' | 'CASH', specificAddress?: string) => {
    if (!user) return;
    const firstProduct = items[0].product;
    const consumerLoc = specificAddress || user.village || 'Tumkur Hub';

    const newOrder: Order = {
      id: "1023", 
      consumerId: user.id,
      consumerName: user.name,
      consumerPhone: user.phone || getUserPhone(user.id),
      farmerId: firstProduct.farmerId,
      farmerName: firstProduct.farmerName,
      farmerPhone: getUserPhone(firstProduct.farmerId),
      farmerVillage: firstProduct.farmerVillage,
      items: items.map(i => ({ 
        productId: i.product.id, 
        name: i.product.name, 
        quantity: i.quantity, 
        price: i.product.pricePerKg 
      })),
      totalAmount: totalProductCost + platformFee,
      deliveryCost: 165,
      distanceKm: 50,
      status: 'PENDING',
      paymentMethod: paymentMethod,
      paymentStatus: 'PENDING',
      date: new Date().toISOString(),
      address: consumerLoc
    };

    setOrders(prev => [newOrder, ...prev]);
    setNotification({ message: `✅ Your order has been placed successfully. Waiting for farmer confirmation`, type: 'SUCCESS' });
    triggerAdminAlert(`🔔 New order placed by consumer. Waiting for farmer verification.`);
    await simulateSendEmail(newOrder, user.email, false);
  };

  const handlePaymentUpdate = (orderId: string, method: string, success: boolean) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const status = success ? 'PAID' : 'PENDING';
        triggerAdminAlert(`💰 Payment status updated for Order ID #${orderId}: ${status}`);
        return { ...o, paymentMethod: method as any, paymentStatus: status };
      }
      return o;
    }));
  };

  const updateOrderStatus = async (orderId: string, status: any) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updates: any = { status };
        
        if (status === 'ACCEPTED') {
          setNotification({ message: `✅ Good news! Farmer confirmed product availability. Your order is being prepared for delivery`, type: 'SUCCESS' });
          triggerAdminAlert(`✅ Farmer verified availability for the order and awaiting delivery acceptance.`);
        }

        if (status === 'REJECTED') {
          setNotification({ message: `❌ Sorry! The product is currently unavailable. Please try another farmer or product`, type: 'ALERT' });
          triggerAdminAlert(`❌ Order cancelled due to product unavailability.`);
        }

        if (status === 'DRIVER_ASSIGNED' && user?.role === 'DELIVERY') {
           updates.deliveryBoyId = user.id;
           updates.deliveryBoyName = user.name;
           updates.deliveryBoyPhone = user.phone || getUserPhone(user.id);
           updates.deliveryVehicle = user.vehicle?.type;

           setNotification({ message: `✅ Order accepted successfully. Proceed to pickup location`, type: 'SUCCESS' });
           triggerAdminAlert(`🚚 Delivery partner assigned successfully.`);
        }
        
        if (status === 'PICKED_UP') {
          triggerAdminAlert(`📊 In Transit`);
        }

        if (status === 'DELIVERED') {
          updates.paymentStatus = 'PAID';
          triggerAdminAlert(`✔ Order completed successfully`);
        }
        
        return { ...o, ...updates };
      }
      return o;
    }));
  };

  const handleRateOrder = (orderId: string, rating: number, feedback: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updatedOrder = { ...o, rating, feedback };
        if (o.deliveryBoyId) {
          const db = JSON.parse(localStorage.getItem('georgios_users_db') || '[]');
          const userIdx = db.findIndex((u: any) => u.id === o.deliveryBoyId);
          if (userIdx !== -1) {
            const driver = db[userIdx];
            const currentRating = driver.rating || 5;
            driver.rating = parseFloat(((currentRating + rating) / 2).toFixed(1));
            db[userIdx] = driver;
            localStorage.setItem('georgios_users_db', JSON.stringify(db));
            if (user?.id === driver.id) {
               setUser({ ...user, rating: driver.rating });
               localStorage.setItem('georgios_active_user', JSON.stringify({ ...user, rating: driver.rating }));
            }
          }
        }
        return updatedOrder;
      }
      return o;
    }));
  };

  const handleInedibleUpload = () => {
    triggerAdminAlert(`⚠ Farmer uploaded inedible crop – listing disabled`);
  };

  if (isAdmin) {
    const allUsers = JSON.parse(localStorage.getItem('georgios_users_db') || '[]');
    return (
      <>
        <AdminPanel orders={orders} users={allUsers} products={products} onLogout={handleLogout} logs={adminLogs} />
        <Chatbot products={products} />
      </>
    );
  }
  
  if (!user) return <Auth onLogin={handleLogin} onAdminLogin={() => setIsAdmin(true)} />;

  return (
    <div className="relative">
      <Layout userRole={user.role} userName={user.name} onLogout={handleLogout} title={user.role === 'FARMER' ? 'Farmer Hub' : 'Market'}>
        {user.role === 'FARMER' && (
          <FarmerDashboard 
            user={user} 
            products={products} 
            orders={orders} 
            onAddProduct={p => setProducts(v => [p, ...v])} 
            onUpdateOrder={updateOrderStatus}
            onInedibleDetected={handleInedibleUpload}
          />
        )}
        {user.role === 'CONSUMER' && (
          <ConsumerDashboard 
            user={user} 
            products={products} 
            orders={orders} 
            onPlaceOrder={placeOrder} 
            onRateOrder={handleRateOrder}
            onPaymentUpdate={handlePaymentUpdate}
          />
        )}
        {user.role === 'DELIVERY' && (
          <DeliveryDashboard 
            user={user} 
            orders={orders} 
            onUpdateStatus={updateOrderStatus} 
          />
        )}
      </Layout>

      <Chatbot products={products} />

      {notification && (
        <div className="fixed top-24 right-4 z-[100] animate-in slide-in-from-right duration-300">
          <div className={`p-5 rounded-[2rem] shadow-2xl border flex items-center gap-4 min-w-[320px] ${
            notification.type === 'ALERT' ? 'bg-red-900 text-white border-red-500/30' : 'bg-gray-900 text-white border-emerald-500/30'
          }`}>
            <div className={`p-3 rounded-2xl ${notification.type === 'ALERT' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              <Bell size={24} />
            </div>
            <div className="flex-1">
              <p className={`text-[10px] font-black uppercase tracking-widest ${notification.type === 'ALERT' ? 'text-red-400' : 'text-emerald-400'}`}>System Signal</p>
              <p className="text-xs font-bold leading-tight mt-1">{notification.message}</p>
            </div>
            <button onClick={() => setNotification(null)} className="text-gray-500 hover:text-white transition"><X size={18} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

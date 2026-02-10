
import React, { useState } from 'react';
import { Leaf, Tractor, ShoppingBag, Truck, User as UserIcon, LockKeyhole, Crosshair, ShieldCheck, Settings, RefreshCw, ClipboardList, Info, MapPin, Smartphone, CheckCircle2, ArrowRight } from 'lucide-react';
import { Role, User, VehicleType } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
  onAdminLogin: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onAdminLogin }) => {
  const [isRegistering, setIsRegistering] = useState(true);
  const [activeRole, setActiveRole] = useState<Role>('CONSUMER');
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [village, setVillage] = useState('');
  
  // Location State
  const [location, setLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [locLoading, setLocLoading] = useState(false);

  // Delivery Vehicle State
  const [vehicleType, setVehicleType] = useState<VehicleType>('Bike');
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  
  // Error State
  const [error, setError] = useState('');

  // Admin State
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [adminPass, setAdminPass] = useState('');

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setLocLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const mockAddress = position.coords.latitude > 12.9 ? "Tumkur Hub" : "Sira Junction";
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude, address: mockAddress });
        setVillage(mockAddress);
        setLocLoading(false);
      },
      () => {
        setError("Location access denied. Please type your village manually.");
        setLocLoading(false);
      }
    );
  };

  const handleRegister = () => {
    setError('');
    if (!name || !email || !phone || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if ((activeRole === 'FARMER' || activeRole === 'CONSUMER') && !village) {
      setError(`${activeRole === 'FARMER' ? 'Farmers' : 'Buyers'} must provide a location.`);
      return;
    }

    const existingUsers = JSON.parse(localStorage.getItem('georgios_users_db') || '[]');
    const newUser: User = {
      id: `${activeRole[0].toLowerCase()}_${Date.now()}`,
      name, email, phone, role: activeRole,
      village: village,
      location: location || { lat: 12.97, lng: 77.59, address: village || 'Bangalore' },
      vehicle: activeRole === 'DELIVERY' ? { type: vehicleType, name: vehicleName, number: vehicleNumber } : undefined
    };

    const updatedUsers = [...existingUsers, { ...newUser, password }]; 
    localStorage.setItem('georgios_users_db', JSON.stringify(updatedUsers));
    onLogin(newUser);
  };

  const handleLogin = () => {
    setError('');
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    const existingUsers = JSON.parse(localStorage.getItem('georgios_users_db') || '[]');
    const user = existingUsers.find((u: any) => u.email === email && u.password === password);
    if (user) {
      const { password, ...safeUser } = user;
      onLogin(safeUser as User);
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  const handleAdminSubmit = () => {
    if (adminId === 'mangalore' && adminPass === 'bangalore') onAdminLogin();
    else setError("Invalid Admin Credentials");
  };

  if (showAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md">
           <div className="flex justify-center mb-8">
             <div className="bg-gray-100 p-4 rounded-3xl animate-pulse">
                <ShieldCheck className="w-10 h-10 text-emerald-600" />
             </div>
           </div>
           <h2 className="text-2xl font-black text-center mb-10 text-gray-900 tracking-tight uppercase">Control Center</h2>
           <div className="space-y-5">
             <input type="text" placeholder="Admin ID" value={adminId} onChange={e => setAdminId(e.target.value)} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl font-mono text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
             <input type="password" placeholder="Key" value={adminPass} onChange={e => setAdminPass(e.target.value)} className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl font-mono text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
             {error && <p className="text-red-500 text-[10px] font-black uppercase text-center animate-bounce">{error}</p>}
             <button onClick={handleAdminSubmit} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition active:scale-95 shadow-xl">Login Admin</button>
             <button onClick={() => setShowAdmin(false)} className="w-full text-gray-400 text-xs font-bold uppercase tracking-widest py-2 hover:text-gray-600 transition">Return Home</button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfdfd] flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
      <div className="text-center mb-12 animate-in slide-in-from-top-10 duration-500">
        <div className="inline-flex items-center justify-center bg-white p-6 rounded-[2.5rem] shadow-xl mb-6 hover:rotate-6 transition-transform cursor-pointer">
          <Leaf className="w-14 h-14 text-emerald-600" />
        </div>
        <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-2"><strong>Georgios</strong></h1>
        <p className="text-emerald-700 font-black uppercase tracking-[0.3em] text-[10px]"><strong>Farmer Friendly Marketplace</strong></p>
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] w-full max-w-md overflow-hidden border border-gray-100 relative">
        <div className="flex p-3 bg-gray-50 m-6 rounded-[2rem]">
          <button onClick={() => setIsRegistering(false)} className={`flex-1 py-4 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all duration-300 ${!isRegistering ? 'bg-white text-emerald-700 shadow-md scale-100' : 'text-gray-400 scale-95 opacity-70'}`}>Login</button>
          <button onClick={() => setIsRegistering(true)} className={`flex-1 py-4 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all duration-300 ${isRegistering ? 'bg-white text-emerald-700 shadow-md scale-100' : 'text-gray-400 scale-95 opacity-70'}`}>Register</button>
        </div>

        <div className="px-10 pb-12 transition-all duration-500">
          {isRegistering && (
            <div className="mb-8 animate-in slide-in-from-left-4">
              <div className="flex gap-3">
                {[
                  { id: 'FARMER', icon: Tractor, label: 'Farmer' },
                  { id: 'CONSUMER', icon: ShoppingBag, label: 'Buyer' },
                  { id: 'DELIVERY', icon: Truck, label: 'Driver' }
                ].map((role) => (
                  <button key={role.id} onClick={() => { setActiveRole(role.id as Role); setVillage(''); }} className={`flex-1 py-4 flex flex-col items-center rounded-2xl border transition-all duration-300 ${activeRole === role.id ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg scale-105' : 'border-gray-100 text-gray-400 hover:bg-gray-50'}`}>
                    <role.icon size={22} className={`mb-2 ${activeRole === role.id ? 'animate-bounce' : ''}`} />
                    <span className="text-[9px] font-black uppercase tracking-tight"><strong>{role.label}</strong></span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {isRegistering ? (
              <>
                <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-5 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-5 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="tel" placeholder="Mobile Number" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-5 pl-11 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                </div>
                <input type="password" placeholder="Create Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-5 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                
                {(activeRole === 'FARMER' || activeRole === 'CONSUMER') && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 w-4 h-4" />
                        <input 
                          type="text" 
                          placeholder={activeRole === 'FARMER' ? "Village / Farm Name" : "Delivery Village"} 
                          value={village} 
                          onChange={e => setVillage(e.target.value)} 
                          className="w-full p-5 pl-11 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" 
                        />
                      </div>
                      <button onClick={detectLocation} className="p-5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 shadow-sm active:scale-90 transition-all">
                        {locLoading ? <RefreshCw className="animate-spin w-5 h-5" /> : <Crosshair size={20} />}
                      </button>
                    </div>
                  </div>
                )}

                {activeRole === 'DELIVERY' && (
                  <div className="grid grid-cols-1 gap-3 animate-in fade-in duration-300">
                    <div className="flex gap-2">
                      {(['Bike', 'Auto', 'Truck'] as VehicleType[]).map(v => (
                        <button key={v} onClick={() => setVehicleType(v)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${vehicleType === v ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-100 text-gray-400'}`}><strong>{v}</strong></button>
                      ))}
                    </div>
                    <input type="text" placeholder="Vehicle Name" value={vehicleName} onChange={e => setVehicleName(e.target.value)} className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                    <input type="text" placeholder="Vehicle Number" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                )}

                <button onClick={handleRegister} className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-emerald-200 mt-6 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"><strong>Create Account</strong> <ArrowRight size={16}/></button>
              </>
            ) : (
              <>
                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-5 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-5 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                <button onClick={handleLogin} className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl mt-6"><strong>Unlock Dashboard</strong></button>
              </>
            )}

            {error && <p className="bg-red-50 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase border border-red-100 animate-pulse text-center"><strong>{error}</strong></p>}
          </div>
        </div>
      </div>
      
      <button onClick={() => setShowAdmin(true)} className="mt-10 text-gray-300 hover:text-emerald-600 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
        <Settings size={14} /> <strong>Marketplace Control Panel</strong>
      </button>
    </div>
  );
};


export type Role = 'FARMER' | 'CONSUMER' | 'DELIVERY' | 'ADMIN';

export type VehicleType = 'Bike' | 'Auto' | 'Truck';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  gender?: string;
  village?: string; // Used for Farmer/Consumer address text
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  rating?: number;
  walletBalance?: number;
  // Delivery specific
  vehicle?: {
    type: VehicleType;
    name: string;
    number: string;
  };
}

export interface Product {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerVillage: string;
  name: string;
  image: string; // Base64
  pricePerKg: number;
  quantityAvailable: number; // in Kg
  category: string;
  description: string;
  dateListed: string;
}

export interface Order {
  id: string;
  consumerId: string;
  consumerName: string;
  consumerPhone?: string;
  consumerLocation?: { lat: number; lng: number };
  farmerId: string;
  farmerName: string;
  farmerPhone?: string;
  farmerVillage?: string;
  farmerLocation?: { lat: number; lng: number };
  items: { productId: string; name: string; quantity: number; price: number }[];
  totalAmount: number; // Product cost
  deliveryCost: number; // Calculated based on vehicle/distance
  distanceKm: number;
  status: 'PENDING' | 'ACCEPTED' | 'DRIVER_ASSIGNED' | 'PICKED_UP' | 'DELIVERED' | 'REJECTED';
  paymentMethod: 'UPI' | 'CASH';
  paymentStatus: 'PENDING' | 'PAID';
  deliveryBoyId?: string;
  deliveryBoyName?: string;
  deliveryBoyPhone?: string;
  deliveryVehicle?: string;
  date: string;
  address: string;
  // Feedback
  rating?: number;
  feedback?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

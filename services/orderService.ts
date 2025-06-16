// Serviço de pedidos - em produção, usar Firebase Firestore

import { CartItem } from '@/contexts/CartContext';
import { Store } from './storeService';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  store: Store;
  status: OrderStatus;
  paymentMethod: string;
  deliveryAddress: string;
  observations?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderData {
  userId: string;
  items: CartItem[];
  paymentMethod: string;
  deliveryAddress: string;
  observations?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
}

// Dados mockados para demonstração
let MOCK_ORDERS: Order[] = [];

export const createOrder = async (orderData: CreateOrderData): Promise<string> => {
  // Simula delay de rede
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Pega a primeira loja dos itens (assumindo que todos os itens são da mesma loja)
  const firstItem = orderData.items[0];
  const mockStore: Store = {
    id: firstItem.storeId,
    name: firstItem.storeName,
    category: 'padaria',
    image: 'https://images.pexels.com/photos/4686869/pexels-photo-4686869.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.8,
    description: 'Loja local',
    address: 'Rua das Flores, 123 - Centro',
    phone: '(11) 99999-0001',
    isOpen: true,
    products: [],
  };

  const orderId = Date.now().toString();
  const newOrder: Order = {
    id: orderId,
    userId: orderData.userId,
    items: orderData.items,
    store: mockStore,
    status: OrderStatus.PENDING,
    paymentMethod: orderData.paymentMethod,
    deliveryAddress: orderData.deliveryAddress,
    observations: orderData.observations,
    subtotal: orderData.subtotal,
    deliveryFee: orderData.deliveryFee,
    total: orderData.total,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  MOCK_ORDERS.push(newOrder);

  // Simula atualização de status após alguns segundos
  setTimeout(() => {
    updateOrderStatus(orderId, OrderStatus.CONFIRMED);
  }, 3000);

  setTimeout(() => {
    updateOrderStatus(orderId, OrderStatus.PREPARING);
  }, 8000);

  return orderId;
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_ORDERS.find(order => order.id === orderId) || null;
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_ORDERS.filter(order => order.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
  const orderIndex = MOCK_ORDERS.findIndex(order => order.id === orderId);
  if (orderIndex !== -1) {
    MOCK_ORDERS[orderIndex] = {
      ...MOCK_ORDERS[orderIndex],
      status,
      updatedAt: new Date(),
    };
  }
};
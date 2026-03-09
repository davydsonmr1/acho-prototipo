// Serviço de pedidos - Firebase Firestore com fallback para mock

import { CartItem } from '@/contexts/CartContext';
import { Store } from './storeService';
import { isFirebaseConfigured, db } from '@/services/firebase';
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  query,
  where,
  orderBy,
  updateDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';

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
  storeId: string;
  storeName: string;
  status: OrderStatus;
  statusHistory?: { status: string; timestamp: Date; note?: string }[];
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
  const firstItem = orderData.items[0];

  if (isFirebaseConfigured && db) {
    try {
      const orderDoc = await addDoc(collection(db, 'orders'), {
        userId: orderData.userId,
        storeId: firstItem.storeId,
        storeName: firstItem.storeName,
        storeImageUrl: firstItem.image,
        items: orderData.items.map(item => ({
          productId: item.id,
          productName: item.name,
          productImageUrl: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        status: OrderStatus.PENDING,
        statusHistory: [
          { status: OrderStatus.PENDING, timestamp: new Date(), note: 'Pedido criado' },
        ],
        paymentMethod: orderData.paymentMethod,
        paymentStatus: 'pending',
        deliveryAddress: orderData.deliveryAddress,
        observations: orderData.observations || null,
        subtotal: orderData.subtotal,
        deliveryFee: orderData.deliveryFee,
        total: orderData.total,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return orderDoc.id;
    } catch (error) {
      console.error('Erro ao criar pedido no Firestore:', error);
      throw error;
    }
  }

  // Modo mock
  await new Promise(resolve => setTimeout(resolve, 1000));

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
    storeId: firstItem.storeId,
    storeName: firstItem.storeName,
    status: OrderStatus.PENDING,
    statusHistory: [
      { status: OrderStatus.PENDING, timestamp: new Date(), note: 'Pedido criado' },
    ],
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

  // Simula atualização de status
  setTimeout(() => updateOrderStatus(orderId, OrderStatus.CONFIRMED), 3000);
  setTimeout(() => updateOrderStatus(orderId, OrderStatus.PREPARING), 8000);

  return orderId;
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  if (isFirebaseConfigured && db) {
    try {
      const orderDoc = await getDoc(doc(db, 'orders', orderId));
      if (!orderDoc.exists()) return null;
      return parseFirestoreOrder(orderId, orderDoc.data());
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
    }
  }
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_ORDERS.find(order => order.id === orderId) || null;
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  if (isFirebaseConfigured && db) {
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(ordersQuery);
      return snapshot.docs.map(d => parseFirestoreOrder(d.id, d.data()));
    } catch (error) {
      console.error('Erro ao buscar pedidos do usuário:', error);
    }
  }
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_ORDERS.filter(order => order.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
  if (isFirebaseConfigured && db) {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      if (orderSnap.exists()) {
        const data = orderSnap.data();
        const statusHistory = data.statusHistory || [];
        statusHistory.push({ status, timestamp: new Date() });
        await updateDoc(orderRef, {
          status,
          statusHistory,
          updatedAt: new Date(),
        });
      }
      return;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  }
  // Mock
  const orderIndex = MOCK_ORDERS.findIndex(order => order.id === orderId);
  if (orderIndex !== -1) {
    const history = MOCK_ORDERS[orderIndex].statusHistory || [];
    history.push({ status, timestamp: new Date() });
    MOCK_ORDERS[orderIndex] = {
      ...MOCK_ORDERS[orderIndex],
      status,
      statusHistory: history,
      updatedAt: new Date(),
    };
  }
};

// Listener real-time para acompanhar pedido
export const subscribeToOrder = (
  orderId: string,
  callback: (order: Order | null) => void
): Unsubscribe => {
  if (isFirebaseConfigured && db) {
    return onSnapshot(doc(db, 'orders', orderId), (snapshot) => {
      if (snapshot.exists()) {
        callback(parseFirestoreOrder(snapshot.id, snapshot.data()));
      } else {
        callback(null);
      }
    });
  }
  // Mock: polling a cada 2s
  const interval = setInterval(async () => {
    const order = MOCK_ORDERS.find(o => o.id === orderId) || null;
    callback(order);
  }, 2000);
  return () => clearInterval(interval);
};

function parseFirestoreOrder(id: string, data: any): Order {
  return {
    id,
    userId: data.userId,
    items: (data.items || []).map((item: any) => ({
      id: item.productId,
      storeId: data.storeId,
      storeName: data.storeName,
      name: item.productName,
      image: item.productImageUrl,
      price: item.price,
      quantity: item.quantity,
    })),
    store: {
      id: data.storeId,
      name: data.storeName,
      category: '',
      image: data.storeImageUrl || '',
      rating: 0,
      description: '',
      address: '',
      phone: '',
      isOpen: true,
      products: [],
    },
    storeId: data.storeId,
    storeName: data.storeName,
    status: data.status as OrderStatus,
    statusHistory: (data.statusHistory || []).map((h: any) => ({
      status: h.status,
      timestamp: h.timestamp?.toDate ? h.timestamp.toDate() : new Date(h.timestamp),
      note: h.note,
    })),
    paymentMethod: data.paymentMethod,
    deliveryAddress: data.deliveryAddress,
    observations: data.observations,
    subtotal: data.subtotal,
    deliveryFee: data.deliveryFee,
    total: data.total,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
  };
}
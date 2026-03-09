// Serviço de lojas - Firebase Firestore com fallback para mock

import { isFirebaseConfigured, db } from '@/services/firebase';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category?: string;
  isAvailable?: boolean;
}

export interface Store {
  id: string;
  name: string;
  category: string;
  image: string;
  rating: number;
  totalRatings?: number;
  description: string;
  address: string;
  phone: string;
  isOpen: boolean;
  products: Product[];
  deliveryFee?: number;
  minimumOrder?: number;
  estimatedDeliveryTime?: string;
  location?: { latitude: number; longitude: number };
  tags?: string[];
}

const STORES_CACHE_KEY = '@acho:stores_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Dados mockados para demonstração
const MOCK_STORES: Store[] = [
  {
    id: '1',
    name: 'Padaria do João',
    category: 'padaria',
    image: 'https://images.pexels.com/photos/4686869/pexels-photo-4686869.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.8,
    description: 'Pães frescos e produtos de padaria todos os dias',
    address: 'Rua das Flores, 123 - Centro',
    phone: '(11) 99999-0001',
    isOpen: true,
    location: { latitude: -23.5505, longitude: -46.6333 },
    products: [
      {
        id: '1',
        name: 'Pão Francês (kg)',
        price: 8.50,
        image: 'https://images.pexels.com/photos/4686869/pexels-photo-4686869.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Pão francês fresquinho, assado diariamente'
      },
      {
        id: '2',
        name: 'Croissant',
        price: 4.50,
        image: 'https://images.pexels.com/photos/3892469/pexels-photo-3892469.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Croissant folhado e crocante'
      },
      {
        id: '3',
        name: 'Bolo de Chocolate',
        price: 25.00,
        image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Bolo de chocolate caseiro'
      }
    ]
  },
  {
    id: '2',
    name: 'Mercadinho da Maria',
    category: 'mercado',
    image: 'https://images.pexels.com/photos/2292919/pexels-photo-2292919.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.5,
    description: 'Produtos frescos e de qualidade para sua casa',
    address: 'Rua do Comércio, 456 - São João',
    phone: '(11) 99999-0002',
    isOpen: true,
    location: { latitude: -23.5540, longitude: -46.6380 },
    products: [
      {
        id: '4',
        name: 'Leite Integral (1L)',
        price: 4.20,
        image: 'https://images.pexels.com/photos/5946069/pexels-photo-5946069.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Leite integral fresco'
      },
      {
        id: '5',
        name: 'Ovos (dúzia)',
        price: 8.90,
        image: 'https://images.pexels.com/photos/1556707/pexels-photo-1556707.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Ovos frescos da fazenda'
      },
      {
        id: '6',
        name: 'Banana (kg)',
        price: 5.80,
        image: 'https://images.pexels.com/photos/61127/pexels-photo-61127.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Banana madura e doce'
      }
    ]
  },
  {
    id: '3',
    name: 'Farmácia Saúde & Vida',
    category: 'farmacia',
    image: 'https://images.pexels.com/photos/305568/pexels-photo-305568.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.9,
    description: 'Medicamentos e produtos de saúde com qualidade',
    address: 'Av. Principal, 789 - Vila Nova',
    phone: '(11) 99999-0003',
    isOpen: true,
    location: { latitude: -23.5570, longitude: -46.6290 },
    products: [
      {
        id: '7',
        name: 'Dipirona 500mg',
        price: 12.50,
        image: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Analgésico e antitérmico'
      },
      {
        id: '8',
        name: 'Vitamina C',
        price: 18.90,
        image: 'https://images.pexels.com/photos/1407636/pexels-photo-1407636.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Suplemento vitamínico'
      }
    ]
  },
  {
    id: '4',
    name: 'Papelaria Escolar',
    category: 'papelaria',
    image: 'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.3,
    description: 'Material escolar e de escritório',
    address: 'Rua da Escola, 321 - Centro',
    phone: '(11) 99999-0004',
    isOpen: false,
    location: { latitude: -23.5600, longitude: -46.6450 },
    products: [
      {
        id: '9',
        name: 'Caderno Universitário',
        price: 15.90,
        image: 'https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Caderno 200 folhas'
      },
      {
        id: '10',
        name: 'Caneta Azul',
        price: 2.50,
        image: 'https://images.pexels.com/photos/4145154/pexels-photo-4145154.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Caneta esferográfica azul'
      }
    ]
  },
  {
    id: '5',
    name: 'Restaurante da Nonna',
    category: 'restaurante',
    image: 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.7,
    description: 'Comida italiana caseira e saborosa',
    address: 'Rua Italiana, 555 - Bela Vista',
    phone: '(11) 99999-0005',
    isOpen: true,
    location: { latitude: -23.5480, longitude: -46.6410 },
    products: [
      {
        id: '11',
        name: 'Pizza Margherita',
        price: 35.00,
        image: 'https://images.pexels.com/photos/2909822/pexels-photo-2909822.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Pizza tradicional com molho de tomate, mozzarella e manjericão'
      },
      {
        id: '12',
        name: 'Lasanha Bolonhesa',
        price: 28.00,
        image: 'https://images.pexels.com/photos/5639951/pexels-photo-5639951.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Lasanha com molho bolonhesa caseiro'
      }
    ]
  }
];

export const getStores = async (): Promise<Store[]> => {
  if (isFirebaseConfigured && db) {
    try {
      const storesQuery = query(
        collection(db, 'stores'),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(storesQuery);
      const stores: Store[] = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        // Busca produtos da subcollection
        const productsSnap = await getDocs(
          query(collection(db, 'stores', docSnap.id, 'products'))
        );
        const products: Product[] = productsSnap.docs.map(p => ({
          id: p.id,
          ...p.data(),
        })) as Product[];

        stores.push({
          id: docSnap.id,
          name: data.name,
          category: data.category,
          image: data.imageUrl || data.image,
          rating: data.rating || 0,
          totalRatings: data.totalRatings || 0,
          description: data.description,
          address: data.address,
          phone: data.phone,
          isOpen: data.isOpen ?? true,
          products,
          deliveryFee: data.deliveryFee,
          minimumOrder: data.minimumOrder,
          estimatedDeliveryTime: data.estimatedDeliveryTime,
          location: data.location
            ? { latitude: data.location.latitude, longitude: data.location.longitude }
            : undefined,
          tags: data.tags,
        });
      }
      // Cache local
      await AsyncStorage.setItem(
        STORES_CACHE_KEY,
        JSON.stringify({ data: stores, timestamp: Date.now() })
      );
      return stores;
    } catch (error) {
      console.error('Erro ao buscar lojas do Firestore:', error);
      // Tenta cache
      const cached = await getCachedStores();
      if (cached) return cached;
      return MOCK_STORES;
    }
  }
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_STORES;
};

async function getCachedStores(): Promise<Store[] | null> {
  try {
    const raw = await AsyncStorage.getItem(STORES_CACHE_KEY);
    if (raw) {
      const { data, timestamp } = JSON.parse(raw);
      if (Date.now() - timestamp < CACHE_DURATION) return data;
    }
  } catch {}
  return null;
}

export const getStoreById = async (id: string): Promise<Store | null> => {
  if (isFirebaseConfigured && db) {
    try {
      const storeDoc = await getDoc(doc(db, 'stores', id));
      if (!storeDoc.exists()) return null;
      const data = storeDoc.data();
      const productsSnap = await getDocs(collection(db, 'stores', id, 'products'));
      const products: Product[] = productsSnap.docs.map(p => ({
        id: p.id,
        ...p.data(),
      })) as Product[];
      return {
        id: storeDoc.id,
        name: data.name,
        category: data.category,
        image: data.imageUrl || data.image,
        rating: data.rating || 0,
        totalRatings: data.totalRatings || 0,
        description: data.description,
        address: data.address,
        phone: data.phone,
        isOpen: data.isOpen ?? true,
        products,
        deliveryFee: data.deliveryFee,
        minimumOrder: data.minimumOrder,
        estimatedDeliveryTime: data.estimatedDeliveryTime,
        location: data.location
          ? { latitude: data.location.latitude, longitude: data.location.longitude }
          : undefined,
        tags: data.tags,
      };
    } catch (error) {
      console.error('Erro ao buscar loja do Firestore:', error);
    }
  }
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_STORES.find(store => store.id === id) || null;
};

export const getStoresByIds = async (ids: string[]): Promise<Store[]> => {
  if (isFirebaseConfigured && db) {
    try {
      const stores: Store[] = [];
      for (const id of ids) {
        const store = await getStoreById(id);
        if (store) stores.push(store);
      }
      return stores;
    } catch {
      // fallback
    }
  }
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_STORES.filter(store => ids.includes(store.id));
};

export const getStoresByCategory = async (category: string): Promise<Store[]> => {
  if (isFirebaseConfigured && db) {
    try {
      let storesQuery;
      if (category === 'all') {
        storesQuery = query(collection(db, 'stores'), where('isActive', '==', true));
      } else {
        storesQuery = query(
          collection(db, 'stores'),
          where('category', '==', category),
          where('isActive', '==', true)
        );
      }
      const snapshot = await getDocs(storesQuery);
      const stores: Store[] = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const productsSnap = await getDocs(collection(db, 'stores', docSnap.id, 'products'));
        const products: Product[] = productsSnap.docs.map(p => ({
          id: p.id,
          ...p.data(),
        })) as Product[];
        stores.push({
          id: docSnap.id,
          name: data.name,
          category: data.category,
          image: data.imageUrl || data.image,
          rating: data.rating || 0,
          description: data.description,
          address: data.address,
          phone: data.phone,
          isOpen: data.isOpen ?? true,
          products,
        });
      }
      return stores;
    } catch {
      // fallback
    }
  }
  await new Promise(resolve => setTimeout(resolve, 300));
  if (category === 'all') return MOCK_STORES;
  return MOCK_STORES.filter(store => store.category === category);
};

// Busca lojas por texto (nome, categoria, produtos)
export const searchStores = async (queryText: string, stores: Store[]): Promise<Store[]> => {
  const q = queryText.toLowerCase().trim();
  if (!q) return stores;
  return stores.filter(store =>
    store.name.toLowerCase().includes(q) ||
    store.category.toLowerCase().includes(q) ||
    store.description.toLowerCase().includes(q) ||
    store.products.some(p => p.name.toLowerCase().includes(q)) ||
    (store.tags && store.tags.some(t => t.toLowerCase().includes(q)))
  );
};
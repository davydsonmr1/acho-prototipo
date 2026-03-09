/**
 * Script de seed para popular o Firestore com dados iniciais.
 * 
 * Uso: Configure as variáveis de ambiente do Firebase no .env
 * e execute: npx ts-node scripts/seed-firestore.ts
 * 
 * Este script migra os 5 dados mock para o Firestore.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, GeoPoint } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const STORES = [
  {
    id: '1',
    name: 'Padaria do João',
    slug: 'padaria-do-joao',
    category: 'padaria',
    description: 'Pães frescos e produtos de padaria todos os dias',
    imageUrl: 'https://images.pexels.com/photos/4686869/pexels-photo-4686869.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.8,
    totalRatings: 124,
    address: 'Rua das Flores, 123 - Centro',
    phone: '(11) 99999-0001',
    email: 'contato@padariadojoao.com.br',
    ownerId: '',
    isOpen: true,
    isActive: true,
    location: new GeoPoint(-23.5505, -46.6333),
    openingHours: {
      monday: { open: '06:00', close: '20:00' },
      tuesday: { open: '06:00', close: '20:00' },
      wednesday: { open: '06:00', close: '20:00' },
      thursday: { open: '06:00', close: '20:00' },
      friday: { open: '06:00', close: '20:00' },
      saturday: { open: '06:00', close: '18:00' },
      sunday: { open: '07:00', close: '12:00' },
    },
    deliveryFee: 3.5,
    minimumOrder: 10,
    estimatedDeliveryTime: '30-45 min',
    tags: ['pão', 'padaria', 'café', 'bolo', 'croissant'],
    createdAt: new Date(),
    updatedAt: new Date(),
    products: [
      { id: '1', name: 'Pão Francês (kg)', price: 8.50, imageUrl: 'https://images.pexels.com/photos/4686869/pexels-photo-4686869.jpeg?auto=compress&cs=tinysrgb&w=400', description: 'Pão francês fresquinho, assado diariamente', category: 'Pães', isAvailable: true, sortOrder: 1 },
      { id: '2', name: 'Croissant', price: 4.50, imageUrl: 'https://images.pexels.com/photos/3892469/pexels-photo-3892469.jpeg?auto=compress&cs=tinysrgb&w=400', description: 'Croissant folhado e crocante', category: 'Pães', isAvailable: true, sortOrder: 2 },
      { id: '3', name: 'Bolo de Chocolate', price: 25.00, imageUrl: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=400', description: 'Bolo de chocolate caseiro', category: 'Bolos', isAvailable: true, sortOrder: 3 },
    ],
  },
  {
    id: '2',
    name: 'Mercadinho da Maria',
    slug: 'mercadinho-da-maria',
    category: 'mercado',
    description: 'Produtos frescos e de qualidade para sua casa',
    imageUrl: 'https://images.pexels.com/photos/2292919/pexels-photo-2292919.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.5,
    totalRatings: 89,
    address: 'Rua do Comércio, 456 - São João',
    phone: '(11) 99999-0002',
    email: 'contato@mercadodamaria.com.br',
    ownerId: '',
    isOpen: true,
    isActive: true,
    location: new GeoPoint(-23.5515, -46.6343),
    openingHours: {
      monday: { open: '07:00', close: '21:00' },
      tuesday: { open: '07:00', close: '21:00' },
      wednesday: { open: '07:00', close: '21:00' },
      thursday: { open: '07:00', close: '21:00' },
      friday: { open: '07:00', close: '21:00' },
      saturday: { open: '07:00', close: '20:00' },
      sunday: { open: '08:00', close: '14:00' },
    },
    deliveryFee: 4.0,
    minimumOrder: 15,
    estimatedDeliveryTime: '25-40 min',
    tags: ['mercado', 'frutas', 'leite', 'ovos', 'verduras'],
    createdAt: new Date(),
    updatedAt: new Date(),
    products: [
      { id: '4', name: 'Leite Integral (1L)', price: 4.20, imageUrl: 'https://images.pexels.com/photos/5946069/pexels-photo-5946069.jpeg?auto=compress&cs=tinysrgb&w=400', description: 'Leite integral fresco', category: 'Laticínios', isAvailable: true, sortOrder: 1 },
      { id: '5', name: 'Ovos (dúzia)', price: 8.90, imageUrl: 'https://images.pexels.com/photos/1556707/pexels-photo-1556707.jpeg?auto=compress&cs=tinysrgb&w=400', description: 'Ovos frescos da fazenda', category: 'Laticínios', isAvailable: true, sortOrder: 2 },
      { id: '6', name: 'Banana (kg)', price: 5.80, imageUrl: 'https://images.pexels.com/photos/61127/pexels-photo-61127.jpeg?auto=compress&cs=tinysrgb&w=400', description: 'Banana madura e doce', category: 'Frutas', isAvailable: true, sortOrder: 3 },
    ],
  },
  {
    id: '3',
    name: 'Farmácia Saúde & Vida',
    slug: 'farmacia-saude-e-vida',
    category: 'farmacia',
    description: 'Medicamentos e produtos de saúde com qualidade',
    imageUrl: 'https://images.pexels.com/photos/305568/pexels-photo-305568.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.9,
    totalRatings: 213,
    address: 'Av. Principal, 789 - Vila Nova',
    phone: '(11) 99999-0003',
    email: 'contato@farmaciasaudevida.com.br',
    ownerId: '',
    isOpen: true,
    isActive: true,
    location: new GeoPoint(-23.5525, -46.6353),
    openingHours: {
      monday: { open: '07:00', close: '22:00' },
      tuesday: { open: '07:00', close: '22:00' },
      wednesday: { open: '07:00', close: '22:00' },
      thursday: { open: '07:00', close: '22:00' },
      friday: { open: '07:00', close: '22:00' },
      saturday: { open: '08:00', close: '20:00' },
      sunday: { open: '08:00', close: '18:00' },
    },
    deliveryFee: 5.0,
    minimumOrder: 20,
    estimatedDeliveryTime: '20-35 min',
    tags: ['farmácia', 'medicamentos', 'saúde', 'vitaminas'],
    createdAt: new Date(),
    updatedAt: new Date(),
    products: [
      { id: '7', name: 'Dipirona 500mg', price: 12.50, imageUrl: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400', description: 'Analgésico e antitérmico', category: 'Medicamentos', isAvailable: true, sortOrder: 1 },
      { id: '8', name: 'Vitamina C', price: 18.90, imageUrl: 'https://images.pexels.com/photos/1407636/pexels-photo-1407636.jpeg?auto=compress&cs=tinysrgb&w=400', description: 'Suplemento vitamínico', category: 'Vitaminas', isAvailable: true, sortOrder: 2 },
    ],
  },
  {
    id: '4',
    name: 'Papelaria Escolar',
    slug: 'papelaria-escolar',
    category: 'papelaria',
    description: 'Material escolar e de escritório',
    imageUrl: 'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.3,
    totalRatings: 56,
    address: 'Rua da Escola, 321 - Centro',
    phone: '(11) 99999-0004',
    email: 'contato@papelariaescolar.com.br',
    ownerId: '',
    isOpen: false,
    isActive: true,
    location: new GeoPoint(-23.5535, -46.6363),
    openingHours: {
      monday: { open: '08:00', close: '18:00' },
      tuesday: { open: '08:00', close: '18:00' },
      wednesday: { open: '08:00', close: '18:00' },
      thursday: { open: '08:00', close: '18:00' },
      friday: { open: '08:00', close: '18:00' },
      saturday: { open: '08:00', close: '14:00' },
      sunday: null,
    },
    deliveryFee: 3.0,
    minimumOrder: 10,
    estimatedDeliveryTime: '30-50 min',
    tags: ['papelaria', 'escola', 'escritório', 'caderno', 'caneta'],
    createdAt: new Date(),
    updatedAt: new Date(),
    products: [
      { id: '9', name: 'Caderno Universitário', price: 15.90, imageUrl: 'https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?auto=compress&cs=tinysrgb&w=400', description: 'Caderno 200 folhas', category: 'Cadernos', isAvailable: true, sortOrder: 1 },
      { id: '10', name: 'Caneta Azul', price: 2.50, imageUrl: 'https://images.pexels.com/photos/4145154/pexels-photo-4145154.jpeg?auto=compress&cs=tinysrgb&w=400', description: 'Caneta esferográfica azul', category: 'Canetas', isAvailable: true, sortOrder: 2 },
    ],
  },
  {
    id: '5',
    name: 'Restaurante da Nonna',
    slug: 'restaurante-da-nonna',
    category: 'restaurante',
    description: 'Comida italiana caseira e saborosa',
    imageUrl: 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.7,
    totalRatings: 178,
    address: 'Rua Italiana, 555 - Bela Vista',
    phone: '(11) 99999-0005',
    email: 'contato@restaurantedanonna.com.br',
    ownerId: '',
    isOpen: true,
    isActive: true,
    location: new GeoPoint(-23.5545, -46.6373),
    openingHours: {
      monday: null,
      tuesday: { open: '11:00', close: '22:00' },
      wednesday: { open: '11:00', close: '22:00' },
      thursday: { open: '11:00', close: '22:00' },
      friday: { open: '11:00', close: '23:00' },
      saturday: { open: '11:00', close: '23:00' },
      sunday: { open: '11:00', close: '16:00' },
    },
    deliveryFee: 5.0,
    minimumOrder: 25,
    estimatedDeliveryTime: '40-60 min',
    tags: ['restaurante', 'italiano', 'pizza', 'lasanha', 'massa'],
    createdAt: new Date(),
    updatedAt: new Date(),
    products: [
      { id: '11', name: 'Pizza Margherita', price: 35.00, imageUrl: 'https://images.pexels.com/photos/2909822/pexels-photo-2909822.jpeg?auto=compress&cs=tinysrgb&w=400', description: 'Pizza tradicional com molho de tomate, mozzarella e manjericão', category: 'Pizzas', isAvailable: true, sortOrder: 1 },
      { id: '12', name: 'Lasanha Bolonhesa', price: 28.00, imageUrl: 'https://images.pexels.com/photos/5639951/pexels-photo-5639951.jpeg?auto=compress&cs=tinysrgb&w=400', description: 'Lasanha com molho bolonhesa caseiro', category: 'Massas', isAvailable: true, sortOrder: 2 },
    ],
  },
];

async function seed() {
  console.log('🌱 Iniciando seed do Firestore...\n');

  for (const store of STORES) {
    const { products, ...storeData } = store;
    const storeRef = doc(db, 'stores', store.id);

    console.log(`📦 Criando loja: ${store.name}`);
    await setDoc(storeRef, storeData);

    for (const product of products) {
      const productRef = doc(collection(db, 'stores', store.id, 'products'), product.id);
      console.log(`  └─ Produto: ${product.name}`);
      await setDoc(productRef, {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  console.log('\n✅ Seed concluído com sucesso!');
  console.log(`   ${STORES.length} lojas criadas`);
  console.log(`   ${STORES.reduce((acc, s) => acc + s.products.length, 0)} produtos criados`);
}

seed().catch(console.error);

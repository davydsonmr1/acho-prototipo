// Simulação do serviço de lojas - em produção, usar Firebase Firestore

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

export interface Store {
  id: string;
  name: string;
  category: string;
  image: string;
  rating: number;
  description: string;
  address: string;
  phone: string;
  isOpen: boolean;
  products: Product[];
}

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
  // Simula delay de rede
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_STORES;
};

export const getStoreById = async (id: string): Promise<Store | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_STORES.find(store => store.id === id) || null;
};

export const getStoresByIds = async (ids: string[]): Promise<Store[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_STORES.filter(store => ids.includes(store.id));
};

export const getStoresByCategory = async (category: string): Promise<Store[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  if (category === 'all') return MOCK_STORES;
  return MOCK_STORES.filter(store => store.category === category);
};
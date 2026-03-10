# Achô! - Documentação de Referência para IA

> **Projeto:** Achô! - Marketplace Local  
> **Stack:** React Native (Expo SDK 53) + TypeScript + Expo Router + Firebase  
> **Status:** Fases 1-4 implementadas (Firebase + features + UX + painel lojista). Fase 5 parcial. Firebase funciona com fallback mock quando sem `.env`.  
> **Última atualização:** Março 2026  
> **Branch:** `alteracoes-dav` — veja `docs/PROGRESS.md` para detalhes

---

## 1. VISÃO GERAL DO PROJETO

### O que é
Achô! é um marketplace local que conecta consumidores a comércios de bairro (padarias, mercados, farmácias, papelarias, restaurantes). O app permite navegar lojas, fazer pedidos e acompanhar entregas.

### Stack Tecnológica
| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | React Native + Expo | SDK 53, RN 0.79.1 |
| Linguagem | TypeScript | 5.8.3 |
| Navegação | Expo Router | 5.0.2 |
| Estado Global | Context API + AsyncStorage | - |
| Backend (planejado) | Firebase | 10.8.0 |
| Ícones | Lucide React Native | 0.475.0 |
| Disponível mas não usado | Zustand | 4.5.0 |

### Dependências Instaladas (já no package.json)
- `firebase` ^10.8.0
- `expo-location` ~18.0.5
- `expo-notifications` ~0.30.1
- `expo-camera` ~16.1.5
- `@react-native-community/netinfo` ^11.3.1
- `react-native-reanimated` ~3.17.4
- `zustand` ^4.5.0 (instalado mas NÃO utilizado)

---

## 2. ARQUITETURA ATUAL

### Estrutura de Diretórios
```
app/                    # Telas (file-based routing via Expo Router)
├── _layout.tsx         # Root layout: providers, auth redirect, analytics
├── +not-found.tsx      # Tela 404
├── checkout.tsx        # Finalizar pedido
├── (tabs)/             # Tab navigation principal
│   ├── _layout.tsx     # Config das 4 tabs
│   ├── index.tsx       # Home: listagem de lojas + busca + filtros
│   ├── favorites.tsx   # Lojas favoritas
│   ├── cart.tsx        # Carrinho de compras
│   └── profile.tsx     # Perfil do usuário
├── auth/               # Fluxo de autenticação
│   ├── _layout.tsx     # Stack layout para auth
│   ├── index.tsx       # Tela de boas-vindas
│   ├── login.tsx       # Login (email + senha)
│   └── register.tsx    # Cadastro (nome, email, phone, address, senha)
├── order/
│   └── [id].tsx        # Detalhes do pedido + acompanhamento
├── profile/
│   ├── edit.tsx        # Editar perfil
│   ├── help.tsx        # Ajuda e suporte (FAQ, contatos)
│   ├── orders.tsx      # Histórico de pedidos
│   └── settings.tsx    # Configurações (notificações, dark mode, etc)
└── store/
    └── [id].tsx        # Detalhes da loja + produtos + add to cart

components/             # Componentes reutilizáveis
├── CategoryFilter.tsx  # Filtro horizontal de categorias
├── EmptyState.tsx      # Estado vazio genérico
├── ErrorBoundary.tsx   # Error boundary React (class component)
├── LoadingSpinner.tsx  # Spinner de carregamento
├── NetworkStatus.tsx   # Banner de conectividade (NetInfo)
├── SkeletonLoader.tsx  # Skeleton loading (store + product)
├── StoreCard.tsx       # Card de loja (imagem, rating, favorito)
└── Toast.tsx           # Toast notifications (success/error/warning/info)

contexts/               # Gerenciamento de estado global
├── AuthContext.tsx      # Autenticação (user, signIn, signUp, signOut)
├── CartContext.tsx      # Carrinho (items, add, remove, quantity, total)
└── FavoritesContext.tsx # Favoritos (store IDs, toggle)

hooks/                  # Custom hooks
├── useFrameworkReady.ts # Inicialização do framework
├── useNetworkStatus.ts  # Status de conectividade
└── useToast.ts          # Gerenciamento de toasts

services/               # Camada de serviços (MOCK - substituir por Firebase)
├── orderService.ts     # CRUD de pedidos (mock in-memory)
└── storeService.ts     # CRUD de lojas (mock data estático)

utils/                  # Utilitários
├── analytics.ts        # Tracking de eventos (local, max 50 eventos)
├── constants.ts        # Cores, espaçamentos, configs, categorias
├── permissions.ts      # Permissões (location, notifications)
├── storage.ts          # Wrapper AsyncStorage com prefixo @acho:
└── validation.ts       # Validação de forms + formatação (phone, currency, date)

types/
└── env.d.ts            # Tipagem das variáveis de ambiente
```

### Fluxo de Navegação
```
[Auth Guard no _layout.tsx]
  ├── Não autenticado → /auth/index → /auth/login ou /auth/register
  └── Autenticado → /(tabs)/
        ├── Tab 1: Home (index) → /store/[id]
        ├── Tab 2: Favoritos → /store/[id]
        ├── Tab 3: Carrinho → /checkout → /order/[id]
        └── Tab 4: Perfil → /profile/edit, /profile/orders, /profile/help, /profile/settings
                            └── /profile/orders → /order/[id]
```

### Estado Atual (Mock vs Real)
| Funcionalidade | Status | Detalhes |
|---------------|--------|---------|
| Autenticação | � Firebase + Mock fallback | `signInWithEmailAndPassword`, `onAuthStateChanged`, erros PT-BR |
| Listagem de Lojas | 🟢 Firestore + Mock fallback | Cache AsyncStorage (5min TTL), busca aprimorada |
| Produtos | 🟢 Firestore + Mock fallback | Subcollection `stores/{id}/products` |
| Carrinho | 🟢 Funcional | Persistido via AsyncStorage |
| Favoritos | 🟢 Firestore sync | Offline-first com AsyncStorage |
| Pedidos | 🟢 Firestore + Mock fallback | Real-time `onSnapshot`, statusHistory |
| Tracking de pedido | 🟢 Real-time | `subscribeToOrder()` com `onSnapshot` |
| Busca | 🟢 Aprimorada | Busca loja+produto, filtro aberto, ordenação (rating/A-Z/distância) |
| Geolocalização | 🟢 Implementado | `useLocation` hook + Haversine, filtro "Mais perto" |
| Notificações | 🟢 Implementado | `expo-notifications`, deep linking, canais Android |
| Avaliações | 🟢 Implementado | ReviewSection com estrelas, comentário, mock reviews |
| Painel Lojista | 🟢 Implementado | Dashboard, editar loja, CRUD produtos, gerenciar pedidos |
| Onboarding | 🟢 Implementado | 3 slides, AsyncStorage flag, redirect no layout |
| Error Handling | 🟢 Implementado | Mensagens PT-BR, `withRetry` exponential backoff |
| Pagamentos | 🔴 Não implementado | Apenas UI de seleção de método |
| Analytics | 🟡 Local | Console/memória apenas, sem envio |

---

## 3. MODELOS DE DADOS ATUAIS

### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}
```

### Store
```typescript
interface Store {
  id: string;
  name: string;
  category: string;        // 'padaria' | 'mercado' | 'farmacia' | 'papelaria' | 'restaurante'
  image: string;            // URL da imagem
  rating: number;           // 0.0 - 5.0
  description: string;
  address: string;
  phone: string;
  isOpen: boolean;
  products: Product[];      // ⚠️ Embutido na loja (mover para subcollection no Firebase)
}
```

### Product
```typescript
interface Product {
  id: string;
  name: string;
  price: number;            // Em BRL (ex: 8.50)
  image: string;            // URL
  description: string;
}
```

### CartItem
```typescript
interface CartItem {
  id: string;               // product ID
  storeId: string;
  storeName: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}
```

### Order
```typescript
interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  store: Store;
  status: OrderStatus;
  paymentMethod: string;    // 'pix' | 'money' | 'card'
  deliveryAddress: string;
  observations?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}
```

### Categorias do App
```typescript
const CATEGORIES = [
  { id: 'all', name: 'Todos', icon: '🏪' },
  { id: 'padaria', name: 'Padarias', icon: '🥖' },
  { id: 'mercado', name: 'Mercados', icon: '🛒' },
  { id: 'farmacia', name: 'Farmácias', icon: '💊' },
  { id: 'papelaria', name: 'Papelarias', icon: '📚' },
  { id: 'restaurante', name: 'Restaurantes', icon: '🍽️' },
];
```

---

## 4. DESIGN DO BANCO DE DADOS FIREBASE

### 4.1 Serviços Firebase Necessários

| Serviço | Uso |
|---------|-----|
| **Firebase Authentication** | Login/cadastro de usuários (email+senha, Google, telefone) |
| **Cloud Firestore** | Banco de dados principal (lojas, produtos, pedidos, usuários) |
| **Firebase Storage** | Upload de imagens (perfil, lojas, produtos) |
| **Cloud Functions** | Lógica server-side (notificações, status de pedido, validações) |
| **Firebase Cloud Messaging (FCM)** | Push notifications |
| **Firebase Analytics** | Tracking de eventos e métricas |

### 4.2 Estrutura do Firestore

#### Collection: `users`
```
users/{userId}
├── name: string
├── email: string
├── phone: string | null
├── address: string | null
├── avatarUrl: string | null
├── role: 'customer' | 'store_owner' | 'admin'
├── notificationsEnabled: boolean
├── locationEnabled: boolean
├── favoriteStoreIds: string[]            // IDs das lojas favoritas
├── defaultDeliveryAddress: string | null
├── createdAt: Timestamp
├── updatedAt: Timestamp
```

> **Por que `favoriteStoreIds` no doc do usuário?** Para o MVP, a lista de favoritos é pequena (< 100 IDs). Manter no documento do usuário evita uma subcollection e simplifica queries. Se escalar muito, migrar para subcollection.

#### Collection: `stores`
```
stores/{storeId}
├── name: string
├── slug: string                          // URL-friendly name
├── category: string                      // 'padaria' | 'mercado' | 'farmacia' | 'papelaria' | 'restaurante'
├── description: string
├── imageUrl: string
├── rating: number                        // Média calculada
├── totalRatings: number                  // Quantidade de avaliações
├── address: string
├── phone: string
├── email: string | null
├── ownerId: string                       // Ref → users/{userId}
├── isOpen: boolean
├── isActive: boolean                     // Para soft delete / suspensão
├── location: GeoPoint                    // Para busca por proximidade
├── openingHours: {                       // Horário de funcionamento
│     monday: { open: string, close: string } | null,
│     tuesday: { open: string, close: string } | null,
│     ...
│   }
├── deliveryFee: number                   // Taxa de entrega da loja
├── minimumOrder: number                  // Pedido mínimo
├── estimatedDeliveryTime: string         // Ex: "30-45 min"
├── tags: string[]                        // Tags para busca
├── createdAt: Timestamp
├── updatedAt: Timestamp
│
├── [subcollection] products/
│   └── products/{productId}
│       ├── name: string
│       ├── description: string
│       ├── price: number
│       ├── imageUrl: string
│       ├── category: string              // Categoria dentro da loja
│       ├── isAvailable: boolean
│       ├── sortOrder: number             // Ordem de exibição
│       ├── createdAt: Timestamp
│       └── updatedAt: Timestamp
│
└── [subcollection] reviews/
    └── reviews/{reviewId}
        ├── userId: string
        ├── userName: string
        ├── rating: number                // 1-5
        ├── comment: string | null
        ├── createdAt: Timestamp
        └── updatedAt: Timestamp
```

#### Collection: `orders`
```
orders/{orderId}
├── userId: string                        // Ref → users/{userId}
├── storeId: string                       // Ref → stores/{storeId}
├── storeName: string                     // Desnormalizado para queries rápidas
├── storeImageUrl: string                 // Desnormalizado
├── items: [                              // Array embutido (não subcollection)
│     {
│       productId: string,
│       productName: string,
│       productImageUrl: string,
│       price: number,                    // Preço no momento da compra (snapshot)
│       quantity: number
│     }
│   ]
├── status: string                        // OrderStatus enum
├── statusHistory: [                      // Histórico de mudanças de status
│     {
│       status: string,
│       timestamp: Timestamp,
│       note: string | null
│     }
│   ]
├── paymentMethod: string                 // 'pix' | 'money' | 'card'
├── paymentStatus: string                 // 'pending' | 'paid' | 'refunded'
├── deliveryAddress: string
├── observations: string | null
├── subtotal: number
├── deliveryFee: number
├── total: number
├── estimatedDeliveryTime: string | null
├── createdAt: Timestamp
├── updatedAt: Timestamp
```

#### Collection: `notifications` (opcional para MVP)
```
notifications/{notificationId}
├── userId: string
├── title: string
├── body: string
├── type: 'order_update' | 'promotion' | 'system'
├── data: { orderId?: string, storeId?: string }
├── isRead: boolean
├── createdAt: Timestamp
```

### 4.3 Índices do Firestore (necessários)

```
# Pedidos do usuário ordenados por data
orders: userId ASC, createdAt DESC

# Pedidos da loja ordenados por data
orders: storeId ASC, createdAt DESC

# Pedidos do usuário por status
orders: userId ASC, status ASC, createdAt DESC

# Lojas por categoria
stores: category ASC, rating DESC

# Lojas ativas abertas
stores: isActive ASC, isOpen ASC, rating DESC

# Produtos disponíveis por ordem
stores/{storeId}/products: isAvailable ASC, sortOrder ASC
```

### 4.4 Regras de Segurança do Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Usuários: leitura/escrita apenas do próprio perfil
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false; // Soft delete via campo 'isActive'
    }

    // Lojas: leitura pública, escrita apenas pelo dono
    match /stores/{storeId} {
      allow read: if true; // Catálogo público
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        (request.auth.uid == resource.data.ownerId ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow delete: if false;

      // Produtos: leitura pública, escrita pelo dono da loja
      match /products/{productId} {
        allow read: if true;
        allow write: if request.auth != null &&
          request.auth.uid == get(/databases/$(database)/documents/stores/$(storeId)).data.ownerId;
      }

      // Reviews: leitura pública, escrita por usuários autenticados
      match /reviews/{reviewId} {
        allow read: if true;
        allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
        allow update: if request.auth != null && request.auth.uid == resource.data.userId;
        allow delete: if false;
      }
    }

    // Pedidos: leitura pelo comprador ou pela loja, escrita controlada
    match /orders/{orderId} {
      allow read: if request.auth != null &&
        (request.auth.uid == resource.data.userId ||
         request.auth.uid == get(/databases/$(database)/documents/stores/$(resource.data.storeId)).data.ownerId);
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null &&
        (request.auth.uid == resource.data.userId ||
         request.auth.uid == get(/databases/$(database)/documents/stores/$(resource.data.storeId)).data.ownerId);
      allow delete: if false;
    }

    // Notificações: apenas o próprio usuário
    match /notifications/{notificationId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow update: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if false; // Apenas Cloud Functions criam notificações
      allow delete: if false;
    }
  }
}
```

### 4.5 Diagrama de Relacionamentos

```
┌──────────┐     1:N      ┌──────────┐     1:N      ┌──────────────┐
│  users   │──────────────▶│  orders  │◀─────────────│   stores     │
│          │               │          │               │              │
│ id       │               │ userId   │               │ id           │
│ name     │               │ storeId  │               │ ownerId ──┐  │
│ email    │               │ items[]  │               │ name      │  │
│ phone    │               │ status   │               │ category  │  │
│ address  │               │ total    │               │ products/ │  │
│ favorites│               └──────────┘               │ reviews/  │  │
└─────┬────┘                                          └───────────┘  │
      │                                                      │       │
      │              favorites (array de storeIds)           │       │
      └──────────────────────────────────────────────────────┘       │
                                                                     │
      ┌──────────────────────────────────────────────────────────────┘
      │  (store owner é um user com role='store_owner')
      ▼
┌──────────┐
│  users   │
│ (owner)  │
└──────────┘
```

---

## 5. CONFIGURAÇÃO DO FIREBASE

### 5.1 Arquivo de Configuração (criar)

**`services/firebase.ts`**
```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Auth com persistência via AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
```

### 5.2 Variáveis de Ambiente (.env)
```bash
EXPO_PUBLIC_API_URL=https://api.acho.com.br
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_SENTRY_DSN=
EXPO_PUBLIC_ANALYTICS_ID=
```

---

## 6. DESIGN SYSTEM / PADRÕES VISUAIS

### Paleta de Cores
```
primary:    #E11D48 (Rose/Rosa)
success:    #10B981 (Verde)
warning:    #F59E0B (Amarelo)
error:      #EF4444 (Vermelho)
info:       #3B82F6 (Azul)
text:       #1F2937 (dark), #6B7280 (medium), #9CA3AF (light)
background: #FFFFFF (primary), #F9FAFB (secondary), #F3F4F6 (tertiary)
border:     #E5E7EB (light), #D1D5DB (medium), #9CA3AF (dark)
```

### Espaçamentos
```
xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32
```

### Tamanhos de Fonte
```
xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24, xxxl: 32, xxxxl: 48
```

### Border Radius
```
sm: 4, md: 8, lg: 12, xl: 16, xxl: 20, full: 9999
```

### Padrão de Componentes
- Todos os componentes usam `StyleSheet.create()` inline no mesmo arquivo
- Cores são hardcoded nos StyleSheets (não usam constants.ts em todos os lugares)
- Ícones via `lucide-react-native`
- SafeAreaView é usado em todas as telas

---

## 7. CONSTANTES IMPORTANTES

```typescript
DELIVERY_FEE = 3.5          // Taxa de entrega fixa (R$)
API_TIMEOUT = 10000          // 10 segundos
RETRY_ATTEMPTS = 3           // Tentativas de retry
ANALYTICS_MAX_EVENTS = 50    // Máximo de eventos locais
ASYNC_STORAGE_PREFIX = '@acho:'
```

### Métodos de Pagamento
```typescript
['pix', 'money', 'card']
// pix: Pagamento instantâneo
// money: Dinheiro na entrega
// card: Cartão (débito/crédito) na entrega
```

---

## 8. TASKS E ROADMAP DO MVP

### FASE 1: Infraestrutura Firebase (Prioridade ALTA)

#### Task 1.1 — Configurar projeto Firebase ✅
- [x] Criar projeto no Firebase Console
- [x] Habilitar Authentication (Email/Senha + Google Sign-In)
- [x] Criar banco Firestore (start in production mode)
- [x] Habilitar Firebase Storage
- [ ] Gerar arquivo de configuração e salvar variáveis no `.env` *(pendente: config real do Firebase Console)*
- [x] Criar `services/firebase.ts` com inicialização

#### Task 1.2 — Migrar AuthContext para Firebase Auth ✅
- [x] Substituir mock de `signIn()` por `signInWithEmailAndPassword()`
- [x] Substituir mock de `signUp()` por `createUserWithEmailAndPassword()`
- [x] Criar documento do usuário no Firestore ao cadastrar (`users/{uid}`)
- [x] Implementar `onAuthStateChanged()` para persistência de sessão
- [x] Implementar `signOut()` via Firebase
- [x] Implementar `updateUser()` atualizando doc no Firestore
- [x] Remover mock de AsyncStorage para auth
- [x] Adicionar tratamento de erros Firebase (email-already-in-use, wrong-password, etc)
- **Arquivo:** `contexts/AuthContext.tsx`

#### Task 1.3 — Migrar storeService para Firestore ✅
- [x] Reescrever `getStores()` → `getDocs(collection(db, 'stores'))` com filtros
- [x] Reescrever `getStoreById()` → `getDoc(doc(db, 'stores', id))`
- [x] Reescrever `getStoresByCategory()` → query com `where('category', '==', cat)`
- [x] Criar `getStoreProducts()` → `getDocs(collection(db, 'stores', storeId, 'products'))`
- [x] Popular Firestore com dados de seed (as 5 lojas mock atuais)
- [x] Implementar cache local com AsyncStorage para dados de lojas
- **Arquivo:** `services/storeService.ts`

#### Task 1.4 — Migrar orderService para Firestore ✅
- [x] Reescrever `createOrder()` → `addDoc(collection(db, 'orders'), ...)`
- [x] Reescrever `getOrderById()` → `getDoc(doc(db, 'orders', id))`
- [x] Reescrever `getUserOrders()` → query `where('userId', '==', uid)` + `orderBy('createdAt', 'desc')`
- [x] Implementar `onSnapshot()` para acompanhamento em tempo real do pedido
- [x] Remover simulação de progressão de status (será feito pela loja/admin)
- **Arquivo:** `services/orderService.ts`

#### Task 1.5 — Migrar FavoritesContext para Firestore ✅
- [x] Salvar `favoriteStoreIds` no documento do usuário no Firestore
- [x] Manter AsyncStorage como cache local (offline-first)
- [x] Sincronizar quando online
- **Arquivo:** `contexts/FavoritesContext.tsx`

#### Task 1.6 — Migrar CartContext para Firestore (opcional para MVP) ✅
- [x] Carrinho pode permanecer no AsyncStorage (é transitório)
- [ ] Opcional: sincronizar com Firestore para multi-device
- **Decisão:** Manter no AsyncStorage para o MVP

---

### FASE 2: Funcionalidades Core do MVP (Prioridade ALTA)

#### Task 2.1 — Seed de dados no Firestore ✅
- [x] Criar script `scripts/seed-firestore.ts` para popular lojas e produtos
- [x] Migrar os 5 lojas mock com seus produtos para Firestore
- [x] Validar que imagens externas (Pexels) são acessíveis
- [ ] Considerar fazer upload das imagens para Firebase Storage

#### Task 2.2 — Tela de busca aprimorada ✅
- [x] Implementar busca full-text (considerar Algolia ou busca client-side)
- [x] Busca por nome da loja e nome do produto
- [x] Filtro por categoria já funciona (adaptar para queries Firestore)
- [x] Adicionar filtro de "aberto agora"
- [x] Adicionar ordenação (rating, distância, A-Z)

#### Task 2.3 — Sistema real de pedidos (fluxo completo) ✅
- [x] Validar que todos os itens do carrinho são da mesma loja (ou dividir em múltiplos pedidos)
- [x] Verificar disponibilidade dos produtos antes de confirmar
- [x] Snapshot de preços no momento do pedido (preço pode mudar)
- [x] Implementar listener real-time no `order/[id].tsx` via `onSnapshot()`
- [ ] Notificar loja sobre novo pedido (Cloud Function → FCM) *(pendente: Cloud Functions)*

#### Task 2.4 — Upload de imagem de perfil ✅
- [x] Usar `expo-camera` ou `expo-image-picker` para selecionar foto
- [ ] Upload para Firebase Storage (`users/{uid}/avatar.jpg`) *(pendente: config Firebase Storage)*
- [x] Salvar URL no documento do usuário
- [x] Exibir avatar no perfil e no header

#### Task 2.5 — Geolocalização ✅
- [x] Usar `expo-location` para obter localização do usuário
- [x] Filtrar lojas por proximidade (GeoPoint no Firestore)
- [x] Mostrar distância estimada na listagem de lojas
- [ ] Preencher endereço de entrega automaticamente (reverse geocoding)
- [x] Permissões já estão preparadas em `utils/permissions.ts`

---

### FASE 3: Experiência do Usuário (Prioridade MÉDIA)

#### Task 3.1 — Push Notifications ✅
- [x] Configurar `expo-notifications` com FCM
- [x] Salvar token do device no Firestore (`users/{uid}/fcmTokens`)
- [ ] Cloud Function para enviar notificação quando status do pedido muda *(pendente: Cloud Functions)*
- [x] Tipos de notificação: pedido confirmado, preparando, saiu para entrega, entregue
- [x] Deep linking para abrir o pedido ao tocar na notificação

#### Task 3.2 — Sistema de avaliações ✅
- [x] Tela para avaliar após pedido entregue (1-5 estrelas + comentário)
- [x] Salvar na subcollection `stores/{storeId}/reviews/`
- [ ] Cloud Function para recalcular rating médio da loja *(pendente: Cloud Functions)*
- [x] Exibir avaliações na tela da loja

#### Task 3.3 — Histórico e re-pedido ✅
- [x] Melhorar tela de histórico de pedidos (`profile/orders.tsx`)
- [x] Botão "Repetir pedido" → adiciona mesmos itens ao carrinho
- [x] Filtros por status (em andamento, finalizados, cancelados)

#### Task 3.4 — Onboarding ✅
- [x] Tela de onboarding para primeiro acesso (3-4 slides)
- [x] Explicar funcionalidades do app
- [x] Pedir permissão de localização e notificação
- [x] Marcar como completo via `@acho:onboarding_completed`

#### Task 3.5 — Tratamento de erros refinado ✅
- [x] Mensagens de erro em português para todos os erros do Firebase
- [x] Retry automático para falhas de rede
- [x] Tela de "sem conexão" com botão de tentar novamente
- [ ] Error tracking via Sentry (`EXPO_PUBLIC_SENTRY_DSN`) *(pendente: config Sentry)*

---

### FASE 4: Painel do Lojista (Prioridade MÉDIA-ALTA)

> **Nota:** Para o MVP, pode ser um painel web separado ou telas adicionais no app.

#### Task 4.1 — Autenticação de lojista ✅
- [x] Role `store_owner` no documento do usuário
- [x] Telas de login/cadastro de lojista (ou reutilizar fluxo existente)
- [x] Redirecionamento baseado em role

#### Task 4.2 — Gerenciamento de loja ✅
- [x] Tela para criar/editar loja (nome, descrição, endereço, horários)
- [ ] Upload de imagem da loja para Firebase Storage *(pendente: config Firebase Storage)*
- [x] Toggle aberto/fechado
- [x] Definir taxa de entrega e pedido mínimo

#### Task 4.3 — Gerenciamento de produtos ✅
- [x] CRUD de produtos (nome, preço, descrição, imagem)
- [x] Toggle disponibilidade de produto
- [x] Ordenação de produtos
- [x] Categorias de produtos dentro da loja

#### Task 4.4 — Gerenciamento de pedidos (lojista) ✅
- [x] Lista de pedidos recebidos com status
- [x] Atualizar status do pedido (confirmar → preparando → saiu → entregue)
- [x] Rejeitar/cancelar pedido com motivo
- [ ] Notificação sonora para novos pedidos

---

### FASE 5: Polimento e Lançamento (Prioridade BAIXA)

#### Task 5.1 — Performance ⚠️ (parcial)
- [ ] Implementar paginação nas listas (lojas, produtos, pedidos)
- [ ] Lazy loading de imagens com placeholder
- [x] Memoização de componentes pesados (`React.memo`, `useMemo`)
- [ ] Substituir Context API por Zustand (já instalado) para melhor performance
- [x] Implementar cache strategy com AsyncStorage

#### Task 5.2 — Dark Mode
- [ ] Definir paleta de cores para dark mode
- [ ] Toggle nas configurações (já existe UI em `settings.tsx`)
- [ ] Persistir preferência

#### Task 5.3 — Internacionalização
- [ ] Extrair strings para arquivos de idioma
- [ ] Suporte pt-BR (padrão) e en-US

#### Task 5.4 — Testes
- [ ] Testes unitários para services (storeService, orderService)
- [ ] Testes para contexts (auth, cart, favorites)
- [ ] Testes de componentes (StoreCard, CategoryFilter)
- [ ] Jest já está configurado no package.json

#### Task 5.5 — Build e deploy
- [ ] Configurar EAS Build para Android e iOS
- [ ] Criar splash screen e ícone do app
- [ ] Configurar variáveis de ambiente para produção
- [ ] Testar em dispositivos reais
- [ ] Publicar na Play Store / App Store

---

## 9. DECISÕES TÉCNICAS E TRADE-OFFS

### Por que Firestore e não Realtime Database?
- Queries mais poderosas (where, orderBy, compound queries)
- Subcollections (products dentro de stores)
- Melhor para dados estruturados e relacionais
- Offline persistence built-in
- Escalabilidade automática

### Por que não usar Zustand agora?
- Context API funciona bem para o tamanho atual do app
- Zustand está instalado e pode ser migrado na Fase 5
- Recomendação: migrar quando houver problemas de re-render

### Carrinho: AsyncStorage vs Firestore
- Manter no AsyncStorage para MVP (mais rápido, funciona offline)
- Carrinho é dado transitório → não precisa de sincronização server-side
- Se necessário multi-device, migrar para Firestore depois

### Imagens: URLs externas vs Firebase Storage
- Atualmente usa URLs do Pexels (mock)
- Em produção, usar Firebase Storage para imagens de lojas/produtos
- Manter como URL string nos documentos do Firestore

### Busca: Firestore vs Algolia
- Para MVP, busca client-side (filtrando dados já carregados)
- Firestore não suporta full-text search nativo
- Se necessário, integrar Algolia ou Typesense depois

---

## 10. CHECKLIST DE PRIORIDADES PARA MVP

### Must Have (MVP v1.0)
- [x] Autenticação funcional → **migrar para Firebase Auth**
- [x] Catálogo de lojas → **migrar para Firestore**
- [x] Carrinho funcional → **já funciona com AsyncStorage**
- [x] Fazer pedido → **migrar para Firestore**
- [x] Acompanhar pedido → **migrar para real-time Firestore**
- [x] Seed de dados reais no Firestore
- [x] Tratamento de erros em português

### Should Have (MVP v1.1)
- [x] Push notifications de status do pedido
- [x] Geolocalização (lojas perto de mim)
- [x] Upload de foto de perfil
- [x] Sistema de avaliações
- [x] Painel básico do lojista (gerenciar pedidos)

### Nice to Have (Pós-MVP)
- [ ] Dark mode
- [x] Repetir pedido
- [ ] Cupons de desconto
- [ ] Chat entre consumidor e lojista
- [ ] Múltiplos endereços de entrega
- [ ] Pagamento online (Stripe/Mercado Pago)

---

## 11. REFERÊNCIA RÁPIDA DE ARQUIVOS

### Para modificar autenticação:
→ `contexts/AuthContext.tsx` + `services/firebase.ts` (criar)

### Para modificar listagem de lojas:
→ `services/storeService.ts` + `app/(tabs)/index.tsx`

### Para modificar carrinho:
→ `contexts/CartContext.tsx` + `app/(tabs)/cart.tsx`

### Para modificar pedidos:
→ `services/orderService.ts` + `app/checkout.tsx` + `app/order/[id].tsx`

### Para modificar favoritos:
→ `contexts/FavoritesContext.tsx` + `app/(tabs)/favorites.tsx`

### Para adicionar nova tela:
→ Criar arquivo em `app/` seguindo convenção do Expo Router

### Para adicionar novo componente:
→ Criar em `components/` e importar com `@/components/NomeComponente`

### Para adicionar nova rota de tab:
→ Adicionar arquivo em `app/(tabs)/` e registrar em `app/(tabs)/_layout.tsx`

---

## 12. COMANDOS ÚTEIS

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npx expo start

# Type check
npm run type-check

# Rodar testes
npm test

# Build web
npm run build:web

# Build com EAS
eas build --platform android
eas build --platform ios
```

---

## 13. VARIÁVEIS DE AMBIENTE

```bash
# .env (copiar de .env.example)
EXPO_PUBLIC_API_URL=https://api.acho.com.br
EXPO_PUBLIC_API_KEY=
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_SENTRY_DSN=
EXPO_PUBLIC_ANALYTICS_ID=
```

---

*Este documento serve como referência completa para assistentes de IA trabalharem no projeto Achô!. Mantenha-o atualizado conforme o projeto evolui.*

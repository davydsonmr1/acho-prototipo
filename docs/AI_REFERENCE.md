# Achô! - Documentação de Referência para IA

> **Projeto:** Achô! - Marketplace Local  
> **Stack:** React Native (Expo SDK 53) + TypeScript + Expo Router + Firebase  
> **Status:** Protótipo funcional com dados mockados. Próximo passo: integração Firebase.  
> **Última atualização:** Março 2026

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
| Autenticação | 🟡 Mock | Simula com AsyncStorage, sem validação real |
| Listagem de Lojas | 🟡 Mock | 5 lojas hardcoded em `storeService.ts` |
| Produtos | 🟡 Mock | Embutidos dentro de cada loja mock |
| Carrinho | 🟢 Funcional | Persistido via AsyncStorage |
| Favoritos | 🟢 Funcional | Persistido via AsyncStorage |
| Pedidos | 🟡 Mock | In-memory (perde ao recarregar app) |
| Tracking de pedido | 🟡 Mock | Simula progressão automática de status |
| Busca | 🟡 Local | Filtra dados mock por texto |
| Geolocalização | 🔴 Não implementado | Permissões prontas, lógica pendente |
| Notificações | 🔴 Não implementado | Permissões prontas, lógica pendente |
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

#### Task 1.1 — Configurar projeto Firebase
- [ ] Criar projeto no Firebase Console
- [ ] Habilitar Authentication (Email/Senha + Google Sign-In)
- [ ] Criar banco Firestore (start in production mode)
- [ ] Habilitar Firebase Storage
- [ ] Gerar arquivo de configuração e salvar variáveis no `.env`
- [ ] Criar `services/firebase.ts` com inicialização

#### Task 1.2 — Migrar AuthContext para Firebase Auth
- [ ] Substituir mock de `signIn()` por `signInWithEmailAndPassword()`
- [ ] Substituir mock de `signUp()` por `createUserWithEmailAndPassword()`
- [ ] Criar documento do usuário no Firestore ao cadastrar (`users/{uid}`)
- [ ] Implementar `onAuthStateChanged()` para persistência de sessão
- [ ] Implementar `signOut()` via Firebase
- [ ] Implementar `updateUser()` atualizando doc no Firestore
- [ ] Remover mock de AsyncStorage para auth
- [ ] Adicionar tratamento de erros Firebase (email-already-in-use, wrong-password, etc)
- **Arquivo:** `contexts/AuthContext.tsx`

#### Task 1.3 — Migrar storeService para Firestore
- [ ] Reescrever `getStores()` → `getDocs(collection(db, 'stores'))` com filtros
- [ ] Reescrever `getStoreById()` → `getDoc(doc(db, 'stores', id))`
- [ ] Reescrever `getStoresByCategory()` → query com `where('category', '==', cat)`
- [ ] Criar `getStoreProducts()` → `getDocs(collection(db, 'stores', storeId, 'products'))`
- [ ] Popular Firestore com dados de seed (as 5 lojas mock atuais)
- [ ] Implementar cache local com AsyncStorage para dados de lojas
- **Arquivo:** `services/storeService.ts`

#### Task 1.4 — Migrar orderService para Firestore
- [ ] Reescrever `createOrder()` → `addDoc(collection(db, 'orders'), ...)`
- [ ] Reescrever `getOrderById()` → `getDoc(doc(db, 'orders', id))`
- [ ] Reescrever `getUserOrders()` → query `where('userId', '==', uid)` + `orderBy('createdAt', 'desc')`
- [ ] Implementar `onSnapshot()` para acompanhamento em tempo real do pedido
- [ ] Remover simulação de progressão de status (será feito pela loja/admin)
- **Arquivo:** `services/orderService.ts`

#### Task 1.5 — Migrar FavoritesContext para Firestore
- [ ] Salvar `favoriteStoreIds` no documento do usuário no Firestore
- [ ] Manter AsyncStorage como cache local (offline-first)
- [ ] Sincronizar quando online
- **Arquivo:** `contexts/FavoritesContext.tsx`

#### Task 1.6 — Migrar CartContext para Firestore (opcional para MVP)
- [ ] Carrinho pode permanecer no AsyncStorage (é transitório)
- [ ] Opcional: sincronizar com Firestore para multi-device
- **Decisão:** Manter no AsyncStorage para o MVP

---

### FASE 2: Funcionalidades Core do MVP (Prioridade ALTA)

#### Task 2.1 — Seed de dados no Firestore
- [ ] Criar script `scripts/seed-firestore.ts` para popular lojas e produtos
- [ ] Migrar os 5 lojas mock com seus produtos para Firestore
- [ ] Validar que imagens externas (Pexels) são acessíveis
- [ ] Considerar fazer upload das imagens para Firebase Storage

#### Task 2.2 — Tela de busca aprimorada
- [ ] Implementar busca full-text (considerar Algolia ou busca client-side)
- [ ] Busca por nome da loja e nome do produto
- [ ] Filtro por categoria já funciona (adaptar para queries Firestore)
- [ ] Adicionar filtro de "aberto agora"
- [ ] Adicionar ordenação (rating, distância, A-Z)

#### Task 2.3 — Sistema real de pedidos (fluxo completo)
- [ ] Validar que todos os itens do carrinho são da mesma loja (ou dividir em múltiplos pedidos)
- [ ] Verificar disponibilidade dos produtos antes de confirmar
- [ ] Snapshot de preços no momento do pedido (preço pode mudar)
- [ ] Implementar listener real-time no `order/[id].tsx` via `onSnapshot()`
- [ ] Notificar loja sobre novo pedido (Cloud Function → FCM)

#### Task 2.4 — Upload de imagem de perfil
- [ ] Usar `expo-camera` ou `expo-image-picker` para selecionar foto
- [ ] Upload para Firebase Storage (`users/{uid}/avatar.jpg`)
- [ ] Salvar URL no documento do usuário
- [ ] Exibir avatar no perfil e no header

#### Task 2.5 — Geolocalização
- [ ] Usar `expo-location` para obter localização do usuário
- [ ] Filtrar lojas por proximidade (GeoPoint no Firestore)
- [ ] Mostrar distância estimada na listagem de lojas
- [ ] Preencher endereço de entrega automaticamente (reverse geocoding)
- [ ] Permissões já estão preparadas em `utils/permissions.ts`

---

### FASE 3: Experiência do Usuário (Prioridade MÉDIA)

#### Task 3.1 — Push Notifications
- [ ] Configurar `expo-notifications` com FCM
- [ ] Salvar token do device no Firestore (`users/{uid}/fcmTokens`)
- [ ] Cloud Function para enviar notificação quando status do pedido muda
- [ ] Tipos de notificação: pedido confirmado, preparando, saiu para entrega, entregue
- [ ] Deep linking para abrir o pedido ao tocar na notificação

#### Task 3.2 — Sistema de avaliações
- [ ] Tela para avaliar após pedido entregue (1-5 estrelas + comentário)
- [ ] Salvar na subcollection `stores/{storeId}/reviews/`
- [ ] Cloud Function para recalcular rating médio da loja
- [ ] Exibir avaliações na tela da loja

#### Task 3.3 — Histórico e re-pedido
- [ ] Melhorar tela de histórico de pedidos (`profile/orders.tsx`)
- [ ] Botão "Repetir pedido" → adiciona mesmos itens ao carrinho
- [ ] Filtros por status (em andamento, finalizados, cancelados)

#### Task 3.4 — Onboarding
- [ ] Tela de onboarding para primeiro acesso (3-4 slides)
- [ ] Explicar funcionalidades do app
- [ ] Pedir permissão de localização e notificação
- [ ] Marcar como completo via `@acho:onboarding_completed`

#### Task 3.5 — Tratamento de erros refinado
- [ ] Mensagens de erro em português para todos os erros do Firebase
- [ ] Retry automático para falhas de rede
- [ ] Tela de "sem conexão" com botão de tentar novamente
- [ ] Error tracking via Sentry (`EXPO_PUBLIC_SENTRY_DSN`)

---

### FASE 4: Painel do Lojista (Prioridade MÉDIA-ALTA)

> **Nota:** Para o MVP, pode ser um painel web separado ou telas adicionais no app.

#### Task 4.1 — Autenticação de lojista
- [ ] Role `store_owner` no documento do usuário
- [ ] Telas de login/cadastro de lojista (ou reutilizar fluxo existente)
- [ ] Redirecionamento baseado em role

#### Task 4.2 — Gerenciamento de loja
- [ ] Tela para criar/editar loja (nome, descrição, endereço, horários)
- [ ] Upload de imagem da loja para Firebase Storage
- [ ] Toggle aberto/fechado
- [ ] Definir taxa de entrega e pedido mínimo

#### Task 4.3 — Gerenciamento de produtos
- [ ] CRUD de produtos (nome, preço, descrição, imagem)
- [ ] Toggle disponibilidade de produto
- [ ] Ordenação de produtos
- [ ] Categorias de produtos dentro da loja

#### Task 4.4 — Gerenciamento de pedidos (lojista)
- [ ] Lista de pedidos recebidos com status
- [ ] Atualizar status do pedido (confirmar → preparando → saiu → entregue)
- [ ] Rejeitar/cancelar pedido com motivo
- [ ] Notificação sonora para novos pedidos

---

### FASE 5: Polimento e Lançamento (Prioridade BAIXA)

#### Task 5.1 — Performance
- [ ] Implementar paginação nas listas (lojas, produtos, pedidos)
- [ ] Lazy loading de imagens com placeholder
- [ ] Memoização de componentes pesados (`React.memo`, `useMemo`)
- [ ] Substituir Context API por Zustand (já instalado) para melhor performance
- [ ] Implementar cache strategy com AsyncStorage

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
- [ ] Seed de dados reais no Firestore
- [ ] Tratamento de erros em português

### Should Have (MVP v1.1)
- [ ] Push notifications de status do pedido
- [ ] Geolocalização (lojas perto de mim)
- [ ] Upload de foto de perfil
- [ ] Sistema de avaliações
- [ ] Painel básico do lojista (gerenciar pedidos)

### Nice to Have (Pós-MVP)
- [ ] Dark mode
- [ ] Repetir pedido
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

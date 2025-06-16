export const APP_CONFIG = {
  name: 'Achô!',
  version: '1.0.0',
  description: 'Marketplace Local',
  supportEmail: 'suporte@acho.com.br',
  supportPhone: '+5511999999999',
  privacyPolicyUrl: 'https://acho.com.br/privacy',
  termsOfServiceUrl: 'https://acho.com.br/terms',
};

export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.acho.com.br',
  timeout: 10000,
  retryAttempts: 3,
};

export const STORAGE_KEYS = {
  user: 'user',
  cart: 'cart',
  favorites: 'favorites',
  settings: 'settings',
  onboarding: 'onboarding_completed',
};

export const COLORS = {
  primary: '#E11D48',
  secondary: '#F9FAFB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    light: '#9CA3AF',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
    dark: '#9CA3AF',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
};

export const DELIVERY_FEE = 3.5;

export const ORDER_STATUS_MESSAGES = {
  pending: 'Seu pedido foi recebido e está aguardando confirmação da loja.',
  confirmed: 'A loja confirmou seu pedido e iniciará o preparo em breve.',
  preparing: 'Sua compra está sendo preparada com carinho.',
  out_for_delivery: 'Seu pedido saiu para entrega e chegará em breve.',
  delivered: 'Pedido entregue com sucesso! Esperamos que tenha gostado.',
  cancelled: 'Pedido cancelado. Entre em contato se precisar de ajuda.',
};

export const CATEGORIES = [
  { id: 'all', name: 'Todos', icon: '🏪' },
  { id: 'padaria', name: 'Padarias', icon: '🥖' },
  { id: 'mercado', name: 'Mercados', icon: '🛒' },
  { id: 'farmacia', name: 'Farmácias', icon: '💊' },
  { id: 'papelaria', name: 'Papelarias', icon: '📚' },
  { id: 'restaurante', name: 'Restaurantes', icon: '🍽️' },
];
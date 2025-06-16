import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  RefreshControl,
} from 'react-native';
import { ArrowLeft, Clock, CircleCheck as CheckCircle, Truck, Package, MapPin, Phone } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getOrderById, Order, OrderStatus } from '@/services/orderService';
import LoadingSpinner from '@/components/LoadingSpinner';

const ORDER_STATUS_CONFIG = {
  [OrderStatus.PENDING]: {
    icon: Clock,
    color: '#F59E0B',
    title: 'Pedido Recebido',
    description: 'Aguardando confirmação da loja',
  },
  [OrderStatus.CONFIRMED]: {
    icon: CheckCircle,
    color: '#10B981',
    title: 'Pedido Confirmado',
    description: 'A loja confirmou seu pedido',
  },
  [OrderStatus.PREPARING]: {
    icon: Package,
    color: '#3B82F6',
    title: 'Em Preparo',
    description: 'Sua compra está sendo preparada',
  },
  [OrderStatus.OUT_FOR_DELIVERY]: {
    icon: Truck,
    color: '#8B5CF6',
    title: 'Saiu para Entrega',
    description: 'Seu pedido está a caminho',
  },
  [OrderStatus.DELIVERED]: {
    icon: CheckCircle,
    color: '#10B981',
    title: 'Entregue',
    description: 'Pedido entregue com sucesso',
  },
  [OrderStatus.CANCELLED]: {
    icon: Clock,
    color: '#EF4444',
    title: 'Cancelado',
    description: 'Pedido foi cancelado',
  },
};

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      const orderData = await getOrderById(id!);
      setOrder(orderData);
    } catch (error) {
      console.error('Erro ao carregar pedido:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrder();
    setRefreshing(false);
  };

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return <LoadingSpinner text="Carregando pedido..." />;
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Pedido não encontrado</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = ORDER_STATUS_CONFIG[order.status];
  const StatusIcon = statusConfig.icon;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerBackButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Pedido #{order.id.slice(-6)}</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Status */}
        <View style={styles.statusSection}>
          <View style={[styles.statusIcon, { backgroundColor: statusConfig.color }]}>
            <StatusIcon size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.statusTitle}>{statusConfig.title}</Text>
          <Text style={styles.statusDescription}>{statusConfig.description}</Text>
          <Text style={styles.orderDate}>
            Pedido realizado em {formatDate(order.createdAt)}
          </Text>
        </View>

        {/* Store Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏪 Loja</Text>
          <View style={styles.storeCard}>
            <Image source={{ uri: order.store.image }} style={styles.storeImage} />
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{order.store.name}</Text>
              <View style={styles.storeDetail}>
                <MapPin size={16} color="#6B7280" />
                <Text style={styles.storeDetailText}>{order.store.address}</Text>
              </View>
              <View style={styles.storeDetail}>
                <Phone size={16} color="#6B7280" />
                <Text style={styles.storeDetailText}>{order.store.phone}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Itens do Pedido</Text>
          <View style={styles.itemsCard}>
            {order.items.map((item) => (
              <View key={`${item.id}-${item.storeId}`} style={styles.orderItem}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                </View>
                <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Delivery Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Entrega</Text>
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryRow}>
              <Text style={styles.deliveryLabel}>Endereço:</Text>
              <Text style={styles.deliveryValue}>{order.deliveryAddress}</Text>
            </View>
            <View style={styles.deliveryRow}>
              <Text style={styles.deliveryLabel}>Pagamento:</Text>
              <Text style={styles.deliveryValue}>
                {order.paymentMethod === 'pix' && 'PIX'}
                {order.paymentMethod === 'money' && 'Dinheiro'}
                {order.paymentMethod === 'card' && 'Cartão na entrega'}
              </Text>
            </View>
            {order.observations && (
              <View style={styles.deliveryRow}>
                <Text style={styles.deliveryLabel}>Observações:</Text>
                <Text style={styles.deliveryValue}>{order.observations}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Resumo</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatPrice(order.subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taxa de entrega</Text>
              <Text style={styles.summaryValue}>{formatPrice(order.deliveryFee)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  headerBackButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  statusSection: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    padding: 32,
    marginBottom: 12,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  orderDate: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  storeCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  storeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  storeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  storeDetailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  itemsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 14,
    color: '#E11D48',
    fontWeight: '500',
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  deliveryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  deliveryRow: {
    marginBottom: 12,
  },
  deliveryLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  deliveryValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#E11D48',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
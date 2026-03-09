import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  ArrowLeft,
  Clock,
  CircleCheck as CheckCircle,
  Package,
  Truck,
  X,
  ChevronDown,
} from 'lucide-react-native';
import { router } from 'expo-router';

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

interface StoreOrder {
  id: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
  deliveryAddress: string;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pendente', color: '#F59E0B', icon: Clock },
  confirmed: { label: 'Confirmado', color: '#3B82F6', icon: CheckCircle },
  preparing: { label: 'Preparando', color: '#8B5CF6', icon: Package },
  out_for_delivery: { label: 'Saiu entrega', color: '#10B981', icon: Truck },
  delivered: { label: 'Entregue', color: '#059669', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: '#EF4444', icon: X },
};

const STATUS_FLOW: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

const MOCK_ORDERS: StoreOrder[] = [
  {
    id: '1001',
    customerName: 'Maria Silva',
    items: [
      { name: 'Pão Francês (kg)', quantity: 2, price: 8.5 },
      { name: 'Croissant', quantity: 3, price: 4.5 },
    ],
    total: 34.0,
    status: 'pending',
    createdAt: new Date(),
    deliveryAddress: 'Rua das Flores, 123',
  },
  {
    id: '1002',
    customerName: 'João Santos',
    items: [{ name: 'Bolo de Chocolate', quantity: 1, price: 25.0 }],
    total: 28.5,
    status: 'preparing',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    deliveryAddress: 'Av. Principal, 456',
  },
  {
    id: '1003',
    customerName: 'Ana Oliveira',
    items: [
      { name: 'Pão Francês (kg)', quantity: 1, price: 8.5 },
      { name: 'Bolo de Chocolate', quantity: 1, price: 25.0 },
    ],
    total: 37.0,
    status: 'delivered',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    deliveryAddress: 'Rua do Comércio, 789',
  },
];

export default function StoreOrdersScreen() {
  const [orders, setOrders] = useState<StoreOrder[]>(MOCK_ORDERS);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');

  const formatPrice = (price: number) => `R$ ${price.toFixed(2).replace('.', ',')}`;

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setRefreshing(false);
  };

  const advanceStatus = (orderId: string) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const currentIndex = STATUS_FLOW.indexOf(order.status);
        if (currentIndex < 0 || currentIndex >= STATUS_FLOW.length - 1) return order;
        const nextStatus = STATUS_FLOW[currentIndex + 1];
        return { ...order, status: nextStatus };
      })
    );
  };

  const cancelOrder = (orderId: string) => {
    Alert.alert('Cancelar pedido', 'Tem certeza que deseja cancelar este pedido?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim, cancelar',
        style: 'destructive',
        onPress: () => {
          setOrders(prev =>
            prev.map(order =>
              order.id === orderId ? { ...order, status: 'cancelled' as OrderStatus } : order
            )
          );
        },
      },
    ]);
  };

  const getNextStatusLabel = (status: OrderStatus): string | null => {
    const currentIndex = STATUS_FLOW.indexOf(status);
    if (currentIndex < 0 || currentIndex >= STATUS_FLOW.length - 1) return null;
    return STATUS_CONFIG[STATUS_FLOW[currentIndex + 1]].label;
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status === filterStatus);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pedidos</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, filterStatus === 'all' && styles.filterChipActive]}
          onPress={() => setFilterStatus('all')}
        >
          <Text style={[styles.filterChipText, filterStatus === 'all' && styles.filterChipTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>
        {(['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'] as OrderStatus[]).map(
          (status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterChip, filterStatus === status && styles.filterChipActive]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[styles.filterChipText, filterStatus === status && styles.filterChipTextActive]}>
                {STATUS_CONFIG[status].label}
              </Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredOrders.map((order) => {
          const config = STATUS_CONFIG[order.status];
          const StatusIcon = config.icon;
          const nextLabel = getNextStatusLabel(order.status);

          return (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>Pedido #{order.id}</Text>
                  <Text style={styles.orderTime}>{formatTime(order.createdAt)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
                  <StatusIcon size={14} color="#FFFFFF" />
                  <Text style={styles.statusBadgeText}>{config.label}</Text>
                </View>
              </View>

              <Text style={styles.customerName}>{order.customerName}</Text>
              <Text style={styles.deliveryAddress}>{order.deliveryAddress}</Text>

              <View style={styles.itemsList}>
                {order.items.map((item, idx) => (
                  <Text key={idx} style={styles.itemText}>
                    {item.quantity}x {item.name} - {formatPrice(item.price * item.quantity)}
                  </Text>
                ))}
              </View>

              <View style={styles.orderFooter}>
                <Text style={styles.orderTotal}>{formatPrice(order.total)}</Text>
                <View style={styles.orderActions}>
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => cancelOrder(order.id)}
                    >
                      <Text style={styles.cancelBtnText}>Cancelar</Text>
                    </TouchableOpacity>
                  )}
                  {nextLabel && (
                    <TouchableOpacity
                      style={styles.advanceBtn}
                      onPress={() => advanceStatus(order.id)}
                    >
                      <Text style={styles.advanceBtnText}>{nextLabel}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        })}
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
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 0,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#E11D48',
  },
  filterChipText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  orderTime: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  deliveryAddress: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  itemsList: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  itemText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E11D48',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  cancelBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  advanceBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E11D48',
  },
  advanceBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});

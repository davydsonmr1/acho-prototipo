import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import {
  Store,
  Package,
  ShoppingBag,
  Settings,
  ArrowLeft,
  TrendingUp,
  ToggleLeft,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function StoreOwnerDashboard() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  // Mock stats
  const stats = {
    todayOrders: 12,
    pendingOrders: 3,
    revenue: 856.5,
    totalProducts: 15,
  };

  const toggleStoreOpen = (value: boolean) => {
    setIsOpen(value);
    Alert.alert(
      'Status atualizado',
      value ? 'Sua loja está aberta para pedidos!' : 'Sua loja foi fechada temporariamente.'
    );
  };

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Painel do Lojista</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Store status */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.storeName}>Minha Loja</Text>
              <Text style={[styles.statusText, { color: isOpen ? '#10B981' : '#EF4444' }]}>
                {isOpen ? 'Aberta' : 'Fechada'}
              </Text>
            </View>
            <Switch
              value={isOpen}
              onValueChange={toggleStoreOpen}
              trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
              thumbColor={isOpen ? '#10B981' : '#9CA3AF'}
            />
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
            <ShoppingBag size={24} color="#3B82F6" />
            <Text style={styles.statNumber}>{stats.todayOrders}</Text>
            <Text style={styles.statLabel}>Pedidos hoje</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Package size={24} color="#F59E0B" />
            <Text style={styles.statNumber}>{stats.pendingOrders}</Text>
            <Text style={styles.statLabel}>Pendentes</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#ECFDF5' }]}>
            <TrendingUp size={24} color="#10B981" />
            <Text style={styles.statNumber}>{formatPrice(stats.revenue)}</Text>
            <Text style={styles.statLabel}>Faturamento</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#F3E8FF' }]}>
            <Store size={24} color="#8B5CF6" />
            <Text style={styles.statNumber}>{stats.totalProducts}</Text>
            <Text style={styles.statLabel}>Produtos</Text>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Ações rápidas</Text>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => router.push('/store-owner/orders')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}>
              <ShoppingBag size={20} color="#3B82F6" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Gerenciar Pedidos</Text>
              <Text style={styles.actionDescription}>Visualize e atualize pedidos</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => router.push('/store-owner/products')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#D1FAE5' }]}>
              <Package size={20} color="#10B981" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Gerenciar Produtos</Text>
              <Text style={styles.actionDescription}>Adicione, edite ou remova produtos</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => router.push('/store-owner/edit-store')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#EDE9FE' }]}>
              <Settings size={20} color="#8B5CF6" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Configurações da Loja</Text>
              <Text style={styles.actionDescription}>Edite informações e horários</Text>
            </View>
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '47%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
});

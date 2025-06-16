import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import { ArrowLeft, MapPin, CreditCard, Smartphone, DollarSign, MessageSquare } from 'lucide-react-native';
import { router } from 'expo-router';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { createOrder } from '@/services/orderService';

const PAYMENT_METHODS = [
  { id: 'pix', name: 'PIX', icon: Smartphone, description: 'Pagamento instantâneo' },
  { id: 'money', name: 'Dinheiro', icon: DollarSign, description: 'Pagamento na entrega' },
  { id: 'card', name: 'Cartão na entrega', icon: CreditCard, description: 'Débito ou crédito' },
];

export default function CheckoutScreen() {
  const { user } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState('pix');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [observations, setObservations] = useState('');
  const [loading, setLoading] = useState(false);

  const subtotal = getCartTotal();
  const deliveryFee = 3.5;
  const total = subtotal + deliveryFee;

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const handleConfirmOrder = async () => {
    if (!deliveryAddress.trim()) {
      Alert.alert('Erro', 'Por favor, informe o endereço de entrega.');
      return;
    }

    setLoading(true);
    try {
      const orderId = await createOrder({
        userId: user!.id,
        items: cartItems,
        paymentMethod: selectedPayment,
        deliveryAddress: deliveryAddress.trim(),
        observations: observations.trim(),
        subtotal,
        deliveryFee,
        total,
      });

      clearCart();
      Alert.alert(
        'Pedido confirmado!',
        'Seu pedido foi enviado para a loja. Você pode acompanhar o status na tela de pedidos.',
        [
          {
            text: 'Ver pedido',
            onPress: () => router.replace(`/order/${orderId}`),
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      Alert.alert('Erro', 'Não foi possível confirmar seu pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Finalizar Pedido</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Endereço de Entrega</Text>
          <View style={styles.addressContainer}>
            <MapPin size={20} color="#6B7280" />
            <TextInput
              style={styles.addressInput}
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              placeholder="Digite seu endereço completo"
              multiline
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Forma de Pagamento</Text>
          {PAYMENT_METHODS.map((method) => {
            const IconComponent = method.icon;
            return (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentOption,
                  selectedPayment === method.id && styles.paymentOptionSelected
                ]}
                onPress={() => setSelectedPayment(method.id)}
              >
                <IconComponent size={24} color="#6B7280" />
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentName}>{method.name}</Text>
                  <Text style={styles.paymentDescription}>{method.description}</Text>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedPayment === method.id && styles.radioButtonSelected
                ]} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Observations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 Observações</Text>
          <View style={styles.observationsContainer}>
            <MessageSquare size={20} color="#6B7280" />
            <TextInput
              style={styles.observationsInput}
              value={observations}
              onChangeText={setObservations}
              placeholder="Alguma observação especial? (opcional)"
              multiline
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Resumo do Pedido</Text>
          <View style={styles.summaryCard}>
            {cartItems.map((item) => (
              <View key={`${item.id}-${item.storeId}`} style={styles.summaryItem}>
                <Text style={styles.summaryItemName}>
                  {item.quantity}x {item.name}
                </Text>
                <Text style={styles.summaryItemPrice}>
                  {formatPrice(item.price * item.quantity)}
                </Text>
              </View>
            ))}
            
            <View style={styles.divider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taxa de entrega</Text>
              <Text style={styles.summaryValue}>{formatPrice(deliveryFee)}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
          onPress={handleConfirmOrder}
          disabled={loading}
        >
          <Text style={styles.confirmButtonText}>
            {loading ? 'Confirmando...' : `Confirmar Pedido • ${formatPrice(total)}`}
          </Text>
        </TouchableOpacity>
      </View>
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
  backButton: {
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
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addressInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentOptionSelected: {
    borderColor: '#E11D48',
    backgroundColor: '#FEF2F2',
  },
  paymentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  paymentDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  radioButtonSelected: {
    borderColor: '#E11D48',
    backgroundColor: '#E11D48',
  },
  observationsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  observationsInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryItemName: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  summaryItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
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
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  confirmButton: {
    backgroundColor: '#E11D48',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
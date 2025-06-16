import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { ArrowLeft, MessageCircle, Phone, Mail, CircleHelp as HelpCircle, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';

const FAQ_ITEMS = [
  {
    question: 'Como faço um pedido?',
    answer: 'Navegue pelas lojas, adicione produtos ao carrinho e finalize o pedido na tela de checkout.',
  },
  {
    question: 'Quais formas de pagamento são aceitas?',
    answer: 'Aceitamos PIX, dinheiro na entrega e cartão na entrega (débito ou crédito).',
  },
  {
    question: 'Quanto tempo demora a entrega?',
    answer: 'O tempo de entrega varia de acordo com a loja e sua localização, geralmente entre 30-60 minutos.',
  },
  {
    question: 'Posso cancelar meu pedido?',
    answer: 'Sim, você pode cancelar seu pedido antes que ele seja confirmado pela loja. Entre em contato conosco.',
  },
  {
    question: 'Como acompanho meu pedido?',
    answer: 'Você pode acompanhar o status do seu pedido em tempo real na seção "Meus Pedidos".',
  },
];

export default function HelpScreen() {
  const [expandedFAQ, setExpandedFAQ] = React.useState<number | null>(null);

  const handleWhatsApp = () => {
    const phoneNumber = '5511999999999'; // Substitua pelo número real
    const message = 'Olá! Preciso de ajuda com o app Achô!';
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Erro', 'WhatsApp não está instalado no seu dispositivo.');
        }
      })
      .catch((err) => console.error('Erro ao abrir WhatsApp:', err));
  };

  const handleEmail = () => {
    const email = 'suporte@acho.com.br'; // Substitua pelo email real
    const subject = 'Suporte - App Achô!';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    
    Linking.openURL(url).catch((err) => {
      console.error('Erro ao abrir email:', err);
      Alert.alert('Erro', 'Não foi possível abrir o aplicativo de email.');
    });
  };

  const handlePhone = () => {
    const phoneNumber = 'tel:+5511999999999'; // Substitua pelo número real
    
    Linking.openURL(phoneNumber).catch((err) => {
      console.error('Erro ao fazer ligação:', err);
      Alert.alert('Erro', 'Não foi possível fazer a ligação.');
    });
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
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
        <Text style={styles.title}>Ajuda e Suporte</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entre em Contato</Text>
          <View style={styles.contactCard}>
            <TouchableOpacity style={styles.contactItem} onPress={handleWhatsApp}>
              <View style={styles.contactLeft}>
                <MessageCircle size={20} color="#25D366" />
                <View style={styles.contactText}>
                  <Text style={styles.contactName}>WhatsApp</Text>
                  <Text style={styles.contactDescription}>Resposta rápida</Text>
                </View>
              </View>
              <ChevronRight size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={handlePhone}>
              <View style={styles.contactLeft}>
                <Phone size={20} color="#3B82F6" />
                <View style={styles.contactText}>
                  <Text style={styles.contactName}>Telefone</Text>
                  <Text style={styles.contactDescription}>(11) 99999-9999</Text>
                </View>
              </View>
              <ChevronRight size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
              <View style={styles.contactLeft}>
                <Mail size={20} color="#EF4444" />
                <View style={styles.contactText}>
                  <Text style={styles.contactName}>Email</Text>
                  <Text style={styles.contactDescription}>suporte@acho.com.br</Text>
                </View>
              </View>
              <ChevronRight size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
          <View style={styles.faqCard}>
            {FAQ_ITEMS.map((item, index) => (
              <View key={index}>
                <TouchableOpacity
                  style={styles.faqItem}
                  onPress={() => toggleFAQ(index)}
                >
                  <View style={styles.faqLeft}>
                    <HelpCircle size={20} color="#6B7280" />
                    <Text style={styles.faqQuestion}>{item.question}</Text>
                  </View>
                  <ChevronRight 
                    size={16} 
                    color="#9CA3AF"
                    style={[
                      styles.faqChevron,
                      expandedFAQ === index && styles.faqChevronExpanded
                    ]}
                  />
                </TouchableOpacity>
                
                {expandedFAQ === index && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{item.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre o App</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              O Achô! é um marketplace local que conecta você aos comércios do seu bairro. 
              Nosso objetivo é fortalecer a economia local e facilitar suas compras do dia a dia.
            </Text>
            <Text style={styles.infoVersion}>Versão 1.0.0</Text>
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
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 20,
    marginBottom: 12,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactText: {
    marginLeft: 12,
  },
  contactName: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  faqLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  faqQuestion: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  faqChevron: {
    transform: [{ rotate: '0deg' }],
  },
  faqChevronExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  faqAnswer: {
    paddingHorizontal: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
    marginBottom: 16,
  },
  infoVersion: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
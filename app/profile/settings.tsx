import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { ArrowLeft, Bell, Shield, Globe, Moon, Smartphone, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);

  const handleNotificationChange = (value: boolean) => {
    setNotifications(value);
    // Aqui você implementaria a lógica para ativar/desativar notificações
  };

  const handleDarkModeChange = (value: boolean) => {
    setDarkMode(value);
    // Aqui você implementaria a lógica para alternar tema
    Alert.alert('Em breve', 'Modo escuro será implementado em breve!');
  };

  const handleLocationChange = (value: boolean) => {
    setLocationServices(value);
    // Aqui você implementaria a lógica para serviços de localização
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('Política de Privacidade', 'Funcionalidade em desenvolvimento!');
  };

  const handleTermsOfService = () => {
    Alert.alert('Termos de Uso', 'Funcionalidade em desenvolvimento!');
  };

  const handleLanguage = () => {
    Alert.alert('Idioma', 'Funcionalidade em desenvolvimento!');
  };

  const handleAbout = () => {
    Alert.alert(
      'Sobre o Achô!',
      'Versão 1.0.0\n\nAchô! é um marketplace local que conecta você aos comércios do seu bairro.',
      [{ text: 'OK' }]
    );
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
        <Text style={styles.title}>Configurações</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificações</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Bell size={20} color="#6B7280" />
                <View style={styles.settingText}>
                  <Text style={styles.settingName}>Notificações Push</Text>
                  <Text style={styles.settingDescription}>
                    Receba atualizações sobre seus pedidos
                  </Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={handleNotificationChange}
                trackColor={{ false: '#D1D5DB', true: '#E11D48' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aparência</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Moon size={20} color="#6B7280" />
                <View style={styles.settingText}>
                  <Text style={styles.settingName}>Modo Escuro</Text>
                  <Text style={styles.settingDescription}>
                    Ativar tema escuro
                  </Text>
                </View>
              </View>
              <Switch
                value={darkMode}
                onValueChange={handleDarkModeChange}
                trackColor={{ false: '#D1D5DB', true: '#E11D48' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Privacy & Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacidade e Segurança</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Smartphone size={20} color="#6B7280" />
                <View style={styles.settingText}>
                  <Text style={styles.settingName}>Serviços de Localização</Text>
                  <Text style={styles.settingDescription}>
                    Permitir acesso à localização
                  </Text>
                </View>
              </View>
              <Switch
                value={locationServices}
                onValueChange={handleLocationChange}
                trackColor={{ false: '#D1D5DB', true: '#E11D48' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <TouchableOpacity style={styles.settingItem} onPress={handlePrivacyPolicy}>
              <View style={styles.settingLeft}>
                <Shield size={20} color="#6B7280" />
                <Text style={styles.settingName}>Política de Privacidade</Text>
              </View>
              <ChevronRight size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={handleTermsOfService}>
              <View style={styles.settingLeft}>
                <Shield size={20} color="#6B7280" />
                <Text style={styles.settingName}>Termos de Uso</Text>
              </View>
              <ChevronRight size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* General */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Geral</Text>
          <View style={styles.settingCard}>
            <TouchableOpacity style={styles.settingItem} onPress={handleLanguage}>
              <View style={styles.settingLeft}>
                <Globe size={20} color="#6B7280" />
                <Text style={styles.settingName}>Idioma</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>Português</Text>
                <ChevronRight size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem} onPress={handleAbout}>
              <View style={styles.settingLeft}>
                <Smartphone size={20} color="#6B7280" />
                <Text style={styles.settingName}>Sobre o App</Text>
              </View>
              <ChevronRight size={16} color="#9CA3AF" />
            </TouchableOpacity>
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
  settingCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingName: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
});
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const FCM_TOKEN_KEY = '@acho:fcm_token';

// Configura handlers de notificação
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permissão de notificações não concedida');
      return null;
    }

    // Configura canal para Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('orders', {
        name: 'Pedidos',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E11D48',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('promotions', {
        name: 'Promoções',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
    }

    // projectId é necessário apenas em development builds com EAS
    // Em Expo Go sem EAS configurado, isso pode falhar — ignoramos silenciosamente
    let token: string | null = null;
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      token = tokenData.data;
    } catch {
      // Token de push não disponível (Expo Go sem EAS ou emulador)
      return null;
    }

    await AsyncStorage.setItem(FCM_TOKEN_KEY, token);

    return token;
  } catch (error) {
    console.error('Erro ao registrar notificações push:', error);
    return null;
  }
}

export function setupNotificationListeners() {
  // Quando o usuário toca na notificação
  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;

    if (data?.orderId) {
      router.push(`/order/${data.orderId}`);
    } else if (data?.storeId) {
      router.push(`/store/${data.storeId}`);
    }
  });

  return () => {
    responseSubscription.remove();
  };
}

// Notificação local para atualizações de pedido
export async function sendLocalOrderNotification(
  title: string,
  body: string,
  orderId: string
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { orderId },
      sound: 'default',
    },
    trigger: null, // Imediato
  });
}

// Mapeia status de pedido para mensagens de notificação
export function getOrderStatusNotification(status: string): { title: string; body: string } | null {
  switch (status) {
    case 'confirmed':
      return { title: 'Pedido confirmado! ✅', body: 'A loja confirmou seu pedido e já vai começar a preparar.' };
    case 'preparing':
      return { title: 'Preparando seu pedido 👨‍🍳', body: 'Seu pedido está sendo preparado com carinho!' };
    case 'out_for_delivery':
      return { title: 'Saiu para entrega! 🛵', body: 'Seu pedido está a caminho. Fique atento!' };
    case 'delivered':
      return { title: 'Pedido entregue! 🎉', body: 'Seu pedido foi entregue. Bom apetite!' };
    case 'cancelled':
      return { title: 'Pedido cancelado ❌', body: 'Infelizmente seu pedido foi cancelado.' };
    default:
      return null;
  }
}

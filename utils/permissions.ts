import { Platform } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

export class PermissionManager {
  static async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return new Promise((resolve) => {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            () => resolve(true),
            () => resolve(false)
          );
        } else {
          resolve(false);
        }
      });
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  static async requestNotificationPermission(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return new Promise((resolve) => {
        if ('Notification' in window) {
          Notification.requestPermission().then((permission) => {
            resolve(permission === 'granted');
          });
        } else {
          resolve(false);
        }
      });
    }

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  static async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    const hasPermission = await this.requestLocationPermission();
    if (!hasPermission) return null;

    if (Platform.OS === 'web') {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          () => resolve(null)
        );
      });
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }
}
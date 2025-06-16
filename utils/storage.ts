import AsyncStorage from '@react-native-async-storage/async-storage';

export class SecureStorage {
  private static prefix = '@acho:';

  static async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(this.prefix + key, jsonValue);
    } catch (error) {
      console.error('Error saving data:', error);
      throw new Error('Falha ao salvar dados');
    }
  }

  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(this.prefix + key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error reading data:', error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('Error removing data:', error);
      throw new Error('Falha ao remover dados');
    }
  }

  static async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter(key => key.startsWith(this.prefix));
      await AsyncStorage.multiRemove(appKeys);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw new Error('Falha ao limpar dados');
    }
  }

  static async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys.filter(key => key.startsWith(this.prefix))
                .map(key => key.replace(this.prefix, ''));
    } catch (error) {
      console.error('Error getting keys:', error);
      return [];
    }
  }
}
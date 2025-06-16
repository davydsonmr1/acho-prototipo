import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Heart } from 'lucide-react-native';
import { useFavorites } from '@/contexts/FavoritesContext';
import { getStoresByIds, Store } from '@/services/storeService';
import { router } from 'expo-router';
import StoreCard from '@/components/StoreCard';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function FavoritesScreen() {
  const { favorites } = useFavorites();
  const [favoriteStores, setFavoriteStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFavoriteStores();
  }, [favorites]);

  const loadFavoriteStores = async () => {
    if (favorites.length === 0) {
      setFavoriteStores([]);
      setLoading(false);
      return;
    }

    try {
      const stores = await getStoresByIds(favorites);
      setFavoriteStores(stores);
    } catch (error) {
      console.error('Erro ao carregar lojas favoritas:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavoriteStores();
    setRefreshing(false);
  };

  const handleStorePress = (storeId: string) => {
    router.push(`/store/${storeId}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💖 Suas Lojas Favoritas</Text>
        <Text style={styles.subtitle}>
          {favorites.length} {favorites.length === 1 ? 'loja favorita' : 'lojas favoritas'}
        </Text>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Heart size={64} color="#E5E7EB" />
          <Text style={styles.emptyTitle}>Nenhuma loja favorita</Text>
          <Text style={styles.emptyText}>
            Adicione suas lojas favoritas tocando no ❤️ para encontrá-las rapidamente aqui!
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.storesGrid}>
            {favoriteStores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                isFavorite={true}
                onPress={() => handleStorePress(store.id)}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  storesGrid: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});
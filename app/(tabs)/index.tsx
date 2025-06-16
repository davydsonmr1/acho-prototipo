import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Search, MapPin, Star, Clock } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { getStores, Store } from '@/services/storeService';
import StoreCard from '@/components/StoreCard';
import CategoryFilter from '@/components/CategoryFilter';
import LoadingSpinner from '@/components/LoadingSpinner';

const CATEGORIES = [
  { id: 'all', name: 'Todos', icon: '🏪' },
  { id: 'padaria', name: 'Padarias', icon: '🥖' },
  { id: 'mercado', name: 'Mercados', icon: '🛒' },
  { id: 'farmacia', name: 'Farmácias', icon: '💊' },
  { id: 'papelaria', name: 'Papelarias', icon: '📚' },
  { id: 'restaurante', name: 'Restaurantes', icon: '🍽️' },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    filterStores();
  }, [stores, searchQuery, selectedCategory]);

  const loadStores = async () => {
    try {
      const storesData = await getStores();
      setStores(storesData);
    } catch (error) {
      console.error('Erro ao carregar lojas:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStores();
    setRefreshing(false);
  };

  const filterStores = () => {
    let filtered = stores;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(store => store.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(store =>
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredStores(filtered);
  };

  const handleStorePress = (storeId: string) => {
    router.push(`/store/${storeId}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.locationText}>Sua localização</Text>
          </View>
          <Text style={styles.welcomeText}>
            Olá, {user?.name || 'Usuário'}! 👋
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar lojas..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Category Filter */}
        <CategoryFilter
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Featured Section */}
        {selectedCategory === 'all' && !searchQuery && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⭐ Destaques</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.featuredContainer}>
                {stores.slice(0, 3).map((store) => (
                  <TouchableOpacity
                    key={store.id}
                    style={styles.featuredCard}
                    onPress={() => handleStorePress(store.id)}
                  >
                    <Image source={{ uri: store.image }} style={styles.featuredImage} />
                    <View style={styles.featuredOverlay}>
                      <Text style={styles.featuredName}>{store.name}</Text>
                      <View style={styles.featuredInfo}>
                        <Star size={12} color="#FCD34D" fill="#FCD34D" />
                        <Text style={styles.featuredRating}>{store.rating}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Stores List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? '🏪 Todas as lojas' : 
             `${CATEGORIES.find(cat => cat.id === selectedCategory)?.icon} ${CATEGORIES.find(cat => cat.id === selectedCategory)?.name}`}
          </Text>
          
          {filteredStores.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Nenhuma loja encontrada' : 'Nenhuma loja disponível'}
              </Text>
            </View>
          ) : (
            <View style={styles.storesGrid}>
              {filteredStores.map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  isFavorite={favorites.includes(store.id)}
                  onPress={() => handleStorePress(store.id)}
                />
              ))}
            </View>
          )}
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
    padding: 20,
    paddingBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 20,
    marginBottom: 16,
  },
  featuredContainer: {
    flexDirection: 'row',
    paddingLeft: 20,
  },
  featuredCard: {
    width: 280,
    height: 140,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 16,
  },
  featuredName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featuredInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredRating: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
  },
  storesGrid: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { Search, MapPin, Star, Clock, SlidersHorizontal } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { getStores, Store, searchStores } from '@/services/storeService';
import StoreCard from '@/components/StoreCard';
import CategoryFilter from '@/components/CategoryFilter';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useLocation, calculateDistance, formatDistance } from '@/hooks/useLocation';

const CATEGORIES = [
  { id: 'all', name: 'Todos', icon: '🏪' },
  { id: 'padaria', name: 'Padarias', icon: '🥖' },
  { id: 'mercado', name: 'Mercados', icon: '🛒' },
  { id: 'farmacia', name: 'Farmácias', icon: '💊' },
  { id: 'papelaria', name: 'Papelarias', icon: '📚' },
  { id: 'restaurante', name: 'Restaurantes', icon: '🍽️' },
];

type SortOption = 'rating' | 'name' | 'distance' | 'default';

export default function HomeScreen() {
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showFilters, setShowFilters] = useState(false);
  const { location, requestLocation } = useLocation();

  useEffect(() => {
    loadStores();
    requestLocation();
  }, []);

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

  // Busca e filtragem com useMemo para performance
  const filteredStores = useMemo(() => {
    let filtered = stores;

    // Filtro de categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(store => store.category === selectedCategory);
    }

    // Busca por texto (nome da loja, categoria, produtos)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(store =>
        store.name.toLowerCase().includes(q) ||
        store.category.toLowerCase().includes(q) ||
        store.description.toLowerCase().includes(q) ||
        store.products.some(p => p.name.toLowerCase().includes(q))
      );
    }

    // Filtro "aberto agora"
    if (showOpenOnly) {
      filtered = filtered.filter(store => store.isOpen);
    }

    // Ordenação
    switch (sortBy) {
      case 'rating':
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'distance':
        if (location) {
          filtered = [...filtered].sort((a, b) => {
            const distA = a.location ? calculateDistance(location.latitude, location.longitude, a.location.latitude, a.location.longitude) : Infinity;
            const distB = b.location ? calculateDistance(location.latitude, location.longitude, b.location.latitude, b.location.longitude) : Infinity;
            return distA - distB;
          });
        }
        break;
      default:
        break;
    }

    return filtered;
  }, [stores, searchQuery, selectedCategory, showOpenOnly, sortBy, location]);

  const handleStorePress = useCallback((storeId: string) => {
    router.push(`/store/${storeId}`);
  }, []);

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
          <TouchableOpacity style={styles.locationContainer} onPress={requestLocation}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.locationText}>
              {location ? 'Localização obtida' : 'Obter localização'}
            </Text>
          </TouchableOpacity>
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
              placeholder="Buscar lojas ou produtos..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal size={20} color={showFilters ? '#E11D48' : '#6B7280'} />
            </TouchableOpacity>
          </View>

          {/* Filtros avançados */}
          {showFilters && (
            <View style={styles.filtersRow}>
              <TouchableOpacity
                style={[styles.filterChip, showOpenOnly && styles.filterChipActive]}
                onPress={() => setShowOpenOnly(!showOpenOnly)}
              >
                <Clock size={14} color={showOpenOnly ? '#FFFFFF' : '#6B7280'} />
                <Text style={[styles.filterChipText, showOpenOnly && styles.filterChipTextActive]}>
                  Abertos agora
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterChip, sortBy === 'rating' && styles.filterChipActive]}
                onPress={() => setSortBy(sortBy === 'rating' ? 'default' : 'rating')}
              >
                <Star size={14} color={sortBy === 'rating' ? '#FFFFFF' : '#6B7280'} />
                <Text style={[styles.filterChipText, sortBy === 'rating' && styles.filterChipTextActive]}>
                  Melhor avaliados
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterChip, sortBy === 'name' && styles.filterChipActive]}
                onPress={() => setSortBy(sortBy === 'name' ? 'default' : 'name')}
              >
                <Text style={[styles.filterChipText, sortBy === 'name' && styles.filterChipTextActive]}>
                  A-Z
                </Text>
              </TouchableOpacity>

              {location && (
                <TouchableOpacity
                  style={[styles.filterChip, sortBy === 'distance' && styles.filterChipActive]}
                  onPress={() => setSortBy(sortBy === 'distance' ? 'default' : 'distance')}
                >
                  <MapPin size={14} color={sortBy === 'distance' ? '#FFFFFF' : '#6B7280'} />
                  <Text style={[styles.filterChipText, sortBy === 'distance' && styles.filterChipTextActive]}>
                    Mais perto
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
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
              {filteredStores.map((store) => {
                const dist = location && store.location
                  ? formatDistance(calculateDistance(location.latitude, location.longitude, store.location.latitude, store.location.longitude))
                  : undefined;
                return (
                  <StoreCard
                    key={store.id}
                    store={store}
                    isFavorite={favorites.includes(store.id)}
                    onPress={() => handleStorePress(store.id)}
                    distance={dist}
                  />
                );
              })}
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
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: '#E11D48',
    borderColor: '#E11D48',
  },
  filterChipText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
});
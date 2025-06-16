import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Star, Clock, Heart } from 'lucide-react-native';
import { Store } from '@/services/storeService';
import { useFavorites } from '@/contexts/FavoritesContext';

interface StoreCardProps {
  store: Store;
  isFavorite: boolean;
  onPress: () => void;
}

export default function StoreCard({ store, isFavorite, onPress }: StoreCardProps) {
  const { toggleFavorite } = useFavorites();

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    toggleFavorite(store.id);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: store.image }} style={styles.image} />
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={handleFavoritePress}
        >
          <Heart 
            size={20} 
            color={isFavorite ? "#E11D48" : "#FFFFFF"} 
            fill={isFavorite ? "#E11D48" : "transparent"}
          />
        </TouchableOpacity>
        {!store.isOpen && (
          <View style={styles.closedOverlay}>
            <Text style={styles.closedText}>Fechado</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{store.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{store.description}</Text>
        
        <View style={styles.info}>
          <View style={styles.rating}>
            <Star size={14} color="#FCD34D" fill="#FCD34D" />
            <Text style={styles.ratingText}>{store.rating}</Text>
          </View>
          
          <View style={styles.status}>
            <Clock size={14} color={store.isOpen ? "#10B981" : "#EF4444"} />
            <Text style={[
              styles.statusText,
              { color: store.isOpen ? "#10B981" : "#EF4444" }
            ]}>
              {store.isOpen ? "Aberto" : "Fechado"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closedOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  closedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    marginLeft: 4,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isFirebaseConfigured, db } from '@/services/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface FavoritesContextData {
  favorites: string[];
  addToFavorites: (storeId: string) => void;
  removeFromFavorites: (storeId: string) => void;
  toggleFavorite: (storeId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextData>({} as FavoritesContextData);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    loadFavorites();
  }, [user]);

  useEffect(() => {
    saveFavorites();
  }, [favorites]);

  const loadFavorites = async () => {
    // Primeiro carrega do cache local
    try {
      const storedFavorites = await AsyncStorage.getItem('@acho:favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }

    // Depois sincroniza com Firestore
    if (isFirebaseConfigured && db && user) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.id));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.favoriteStoreIds && Array.isArray(data.favoriteStoreIds)) {
            setFavorites(data.favoriteStoreIds);
            await AsyncStorage.setItem('@acho:favorites', JSON.stringify(data.favoriteStoreIds));
          }
        }
      } catch (error) {
        console.error('Erro ao sincronizar favoritos com Firestore:', error);
      }
    }
  };

  const saveFavorites = async () => {
    try {
      await AsyncStorage.setItem('@acho:favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Erro ao salvar favoritos:', error);
    }
  };

  const syncFavoritesToFirestore = async (newFavorites: string[]) => {
    if (isFirebaseConfigured && db && user) {
      try {
        await updateDoc(doc(db, 'users', user.id), {
          favoriteStoreIds: newFavorites,
          updatedAt: new Date(),
        });
      } catch (error) {
        console.error('Erro ao sincronizar favoritos com Firestore:', error);
      }
    }
  };

  const addToFavorites = (storeId: string) => {
    const updated = [...favorites, storeId];
    setFavorites(updated);
    syncFavoritesToFirestore(updated);
  };

  const removeFromFavorites = (storeId: string) => {
    const updated = favorites.filter(id => id !== storeId);
    setFavorites(updated);
    syncFavoritesToFirestore(updated);
  };

  const toggleFavorite = (storeId: string) => {
    if (favorites.includes(storeId)) {
      removeFromFavorites(storeId);
    } else {
      addToFavorites(storeId);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites deve ser usado dentro de FavoritesProvider');
  }
  return context;
};
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesContextData {
  favorites: string[];
  addToFavorites: (storeId: string) => void;
  removeFromFavorites: (storeId: string) => void;
  toggleFavorite: (storeId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextData>({} as FavoritesContextData);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    saveFavorites();
  }, [favorites]);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('@acho:favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  };

  const saveFavorites = async () => {
    try {
      await AsyncStorage.setItem('@acho:favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Erro ao salvar favoritos:', error);
    }
  };

  const addToFavorites = (storeId: string) => {
    setFavorites(prev => [...prev, storeId]);
  };

  const removeFromFavorites = (storeId: string) => {
    setFavorites(prev => prev.filter(id => id !== storeId));
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
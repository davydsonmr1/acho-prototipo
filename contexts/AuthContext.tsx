import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, phone?: string, address?: string) => Promise<void>;
  signOut: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('@acho:user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    // Simulação de autenticação - em produção, usar Firebase Auth
    const mockUser: User = {
      id: '1',
      name: 'Usuário Demo',
      email,
      phone: '(11) 99999-9999',
      address: 'Rua Demo, 123 - Bairro Demo, Cidade Demo',
    };

    setUser(mockUser);
    await AsyncStorage.setItem('@acho:user', JSON.stringify(mockUser));
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    phone?: string,
    address?: string
  ) => {
    // Simulação de registro - em produção, usar Firebase Auth
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      address,
    };

    setUser(newUser);
    await AsyncStorage.setItem('@acho:user', JSON.stringify(newUser));
  };

  const signOut = async () => {
    setUser(null);
    await AsyncStorage.removeItem('@acho:user');
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    await AsyncStorage.setItem('@acho:user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
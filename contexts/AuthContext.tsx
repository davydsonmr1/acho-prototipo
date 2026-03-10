import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isFirebaseConfigured, auth as firebaseAuth, db } from '@/services/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithCredential,
  GoogleAuthProvider,
  FirebaseError,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  role?: 'customer' | 'store_owner' | 'admin';
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, phone?: string, address?: string) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signOut: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Tradução de erros do Firebase para português
function getFirebaseErrorMessage(error: FirebaseError): string {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'Este email já está em uso. Tente outro email.';
    case 'auth/invalid-email':
      return 'Email inválido. Verifique o formato do email.';
    case 'auth/operation-not-allowed':
      return 'Operação não permitida. Entre em contato com o suporte.';
    case 'auth/weak-password':
      return 'Senha muito fraca. Use pelo menos 6 caracteres.';
    case 'auth/user-disabled':
      return 'Esta conta foi desativada. Entre em contato com o suporte.';
    case 'auth/user-not-found':
      return 'Usuário não encontrado. Verifique o email informado.';
    case 'auth/wrong-password':
      return 'Senha incorreta. Tente novamente.';
    case 'auth/invalid-credential':
      return 'Email ou senha incorretos. Tente novamente.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Aguarde um momento e tente novamente.';
    case 'auth/network-request-failed':
      return 'Sem conexão com a internet. Verifique sua conexão.';
    default:
      return 'Ocorreu um erro inesperado. Tente novamente.';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigured && firebaseAuth) {
      // Listener de autenticação Firebase
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(db!, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const appUser: User = {
                id: firebaseUser.uid,
                name: userData.name || firebaseUser.displayName || '',
                email: firebaseUser.email || '',
                phone: userData.phone,
                address: userData.address,
                avatarUrl: userData.avatarUrl,
                role: userData.role || 'customer',
              };
              setUser(appUser);
              await AsyncStorage.setItem('@acho:user', JSON.stringify(appUser));
            } else {
              // Usuário existe no Auth mas não no Firestore
              const appUser: User = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || '',
                email: firebaseUser.email || '',
              };
              setUser(appUser);
            }
          } catch {
            // Fallback para dados locais
            const storedUser = await AsyncStorage.getItem('@acho:user');
            if (storedUser) setUser(JSON.parse(storedUser));
          }
        } else {
          setUser(null);
          await AsyncStorage.removeItem('@acho:user');
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Modo mock: carrega do AsyncStorage
      loadStoredUser();
    }
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
    if (isFirebaseConfigured && firebaseAuth) {
      try {
        const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        // onAuthStateChanged cuidará do estado do usuário
        const userDoc = await getDoc(doc(db!, 'users', credential.user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const appUser: User = {
            id: credential.user.uid,
            name: userData.name || '',
            email: credential.user.email || '',
            phone: userData.phone,
            address: userData.address,
            avatarUrl: userData.avatarUrl,
            role: userData.role || 'customer',
          };
          setUser(appUser);
          await AsyncStorage.setItem('@acho:user', JSON.stringify(appUser));
        }
      } catch (error) {
        if (error instanceof Error && 'code' in error) {
          throw new Error(getFirebaseErrorMessage(error as FirebaseError));
        }
        throw error;
      }
    } else {
      // Modo mock
      const mockUser: User = {
        id: '1',
        name: 'Usuário Demo',
        email,
        phone: '(11) 99999-9999',
        address: 'Rua Demo, 123 - Bairro Demo, Cidade Demo',
        role: 'customer',
      };
      setUser(mockUser);
      await AsyncStorage.setItem('@acho:user', JSON.stringify(mockUser));
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    phone?: string,
    address?: string
  ) => {
    if (isFirebaseConfigured && firebaseAuth && db) {
      try {
        const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        const newUser: User = {
          id: credential.user.uid,
          name,
          email: credential.user.email || email,
          phone,
          address,
          role: 'customer',
        };

        // Cria documento do usuário no Firestore
        await setDoc(doc(db, 'users', credential.user.uid), {
          name,
          email: credential.user.email || email,
          phone: phone || null,
          address: address || null,
          avatarUrl: null,
          role: 'customer',
          notificationsEnabled: true,
          locationEnabled: false,
          favoriteStoreIds: [],
          defaultDeliveryAddress: address || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        setUser(newUser);
        await AsyncStorage.setItem('@acho:user', JSON.stringify(newUser));
      } catch (error) {
        if (error instanceof Error && 'code' in error) {
          throw new Error(getFirebaseErrorMessage(error as FirebaseError));
        }
        throw error;
      }
    } else {
      // Modo mock
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        phone,
        address,
        role: 'customer',
      };
      setUser(newUser);
      await AsyncStorage.setItem('@acho:user', JSON.stringify(newUser));
    }
  };

  const signInWithGoogle = async (idToken: string) => {
    if (!isFirebaseConfigured || !firebaseAuth || !db) {
      throw new Error('Firebase não configurado. Verifique as variáveis de ambiente.');
    }
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(firebaseAuth, credential);

    // Cria documento no Firestore se for o primeiro login com Google
    const userDocRef = doc(db, 'users', result.user.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        name: result.user.displayName || '',
        email: result.user.email || '',
        phone: null,
        address: null,
        avatarUrl: result.user.photoURL || null,
        role: 'customer',
        notificationsEnabled: true,
        locationEnabled: false,
        favoriteStoreIds: [],
        defaultDeliveryAddress: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    // onAuthStateChanged cuida de atualizar o estado do usuário
  };

  const signOut = async () => {
    if (isFirebaseConfigured && firebaseAuth) {
      try {
        await firebaseSignOut(firebaseAuth);
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
      }
    }
    setUser(null);
    await AsyncStorage.removeItem('@acho:user');
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...userData };

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'users', user.id), {
          ...userData,
          updatedAt: new Date(),
        });
      } catch (error) {
        console.error('Erro ao atualizar perfil no Firestore:', error);
      }
    }

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
        signInWithGoogle,
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
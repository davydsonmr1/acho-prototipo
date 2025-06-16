import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { WifiOff, Wifi } from 'lucide-react-native';
import NetInfo from '@react-native-community/netinfo';

export default function NetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const slideAnim = new Animated.Value(-50);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? true;
      setIsConnected(connected);
      
      if (!connected) {
        setShowBanner(true);
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      } else if (showBanner) {
        // Delay para mostrar reconexão
        setTimeout(() => {
          Animated.spring(slideAnim, {
            toValue: -50,
            useNativeDriver: true,
          }).start(() => {
            setShowBanner(false);
          });
        }, 2000);
      }
    });

    return () => unsubscribe();
  }, [showBanner]);

  if (!showBanner) return null;

  return (
    <Animated.View 
      style={[
        styles.banner,
        { 
          backgroundColor: isConnected ? '#10B981' : '#EF4444',
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      {isConnected ? (
        <Wifi size={16} color="#FFFFFF" />
      ) : (
        <WifiOff size={16} color="#FFFFFF" />
      )}
      <Text style={styles.text}>
        {isConnected ? 'Conectado novamente!' : 'Sem conexão com a internet'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    zIndex: 1000,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});
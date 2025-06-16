import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { CircleCheck as CheckCircle, CircleAlert as AlertCircle, Circle as XCircle, Info } from 'lucide-react-native';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

const { width } = Dimensions.get('window');

export default function Toast({ 
  message, 
  type, 
  visible, 
  onHide, 
  duration = 3000 
}: ToastProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (visible) {
      // Mostrar toast
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      // Auto hide
      timeoutRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    } else {
      hideToast();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible]);

  const hideToast = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onHide();
    });
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          backgroundColor: '#10B981',
          iconColor: '#FFFFFF',
        };
      case 'error':
        return {
          icon: XCircle,
          backgroundColor: '#EF4444',
          iconColor: '#FFFFFF',
        };
      case 'warning':
        return {
          icon: AlertCircle,
          backgroundColor: '#F59E0B',
          iconColor: '#FFFFFF',
        };
      case 'info':
        return {
          icon: Info,
          backgroundColor: '#3B82F6',
          iconColor: '#FFFFFF',
        };
      default:
        return {
          icon: Info,
          backgroundColor: '#6B7280',
          iconColor: '#FFFFFF',
        };
    }
  };

  if (!visible) return null;

  const config = getToastConfig();
  const IconComponent = config.icon;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <IconComponent size={20} color={config.iconColor} />
      <Text style={styles.message} numberOfLines={2}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
});
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonLoader({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4,
  style 
}: SkeletonLoaderProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, []);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E7EB', '#F3F4F6'],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
}

export function StoreCardSkeleton() {
  return (
    <View style={styles.storeCardSkeleton}>
      <SkeletonLoader height={160} borderRadius={12} style={{ marginBottom: 16 }} />
      <View style={styles.storeCardContent}>
        <SkeletonLoader height={20} width="70%" style={{ marginBottom: 8 }} />
        <SkeletonLoader height={16} width="100%" style={{ marginBottom: 4 }} />
        <SkeletonLoader height={16} width="80%" style={{ marginBottom: 12 }} />
        <View style={styles.storeCardFooter}>
          <SkeletonLoader height={16} width="30%" />
          <SkeletonLoader height={16} width="25%" />
        </View>
      </View>
    </View>
  );
}

export function ProductCardSkeleton() {
  return (
    <View style={styles.productCardSkeleton}>
      <SkeletonLoader width={80} height={80} borderRadius={8} />
      <View style={styles.productCardContent}>
        <SkeletonLoader height={16} width="80%" style={{ marginBottom: 4 }} />
        <SkeletonLoader height={14} width="100%" style={{ marginBottom: 8 }} />
        <SkeletonLoader height={16} width="40%" />
      </View>
      <SkeletonLoader width={40} height={40} borderRadius={20} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E7EB',
  },
  storeCardSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  storeCardContent: {
    padding: 16,
  },
  storeCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productCardSkeleton: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  productCardContent: {
    flex: 1,
    marginLeft: 12,
  },
});
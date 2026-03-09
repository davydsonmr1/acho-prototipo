import { Stack } from 'expo-router';

export default function StoreOwnerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit-store" />
      <Stack.Screen name="products" />
      <Stack.Screen name="orders" />
    </Stack>
  );
}

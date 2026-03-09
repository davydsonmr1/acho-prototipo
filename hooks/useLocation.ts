import { useState, useEffect } from 'react';
import { PermissionManager } from '@/utils/permissions';

interface Location {
  latitude: number;
  longitude: number;
}

export function useLocation() {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      const coords = await PermissionManager.getCurrentLocation();
      if (coords) {
        setLocation(coords);
      } else {
        setError('Não foi possível obter sua localização. Verifique as permissões.');
      }
    } catch (err) {
      setError('Erro ao obter localização.');
    } finally {
      setLoading(false);
    }
  };

  return { location, loading, error, requestLocation };
}

// Calcula distância entre dois pontos (Haversine formula) em km
export function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

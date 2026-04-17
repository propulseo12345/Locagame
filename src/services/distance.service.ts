import { logger } from '../lib/logger';

// ─── Configuration ────────────────────────────────────────────────────────────
const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;
const ORS_BASE_URL = 'https://api.openrouteservice.org';

/** Tarif par kilomètre */
export const PRICE_PER_KM = 0.80;

/** Distance maximale de livraison (km) */
const MAX_DELIVERY_DISTANCE_KM = 150;

/** Coordonnées fixes de l'entrepôt LOCAGAME */
export const WAREHOUSE = {
  lat: 43.2896,
  lng: 5.4086,
  address: '553 rue Saint-Pierre, 13012 Marseille',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Coordinates {
  lat: number;
  lng: number;
}

interface DistanceResult {
  distanceKm: number;
  deliveryFee: number;
  success: boolean;
  error?: string;
}

// ─── Cache sessionStorage ─────────────────────────────────────────────────────
const CACHE_KEY = 'ors_delivery_cache';

function getCached(key: string): { fee: number; distanceKm: number } | null {
  try {
    const cache = JSON.parse(sessionStorage.getItem(CACHE_KEY) || '{}');
    const entry = cache[key];
    if (entry && Date.now() - entry.timestamp < 3_600_000) {
      return { fee: entry.fee, distanceKm: entry.distanceKm };
    }
    return null;
  } catch {
    return null;
  }
}

function setCache(key: string, fee: number, distanceKm: number) {
  try {
    const cache = JSON.parse(sessionStorage.getItem(CACHE_KEY) || '{}');
    cache[key] = { fee, distanceKm, timestamp: Date.now() };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // silently ignore
  }
}

// ─── 1. Géocodage adresse → coordonnées GPS (Pelias / ORS) ───────────────────
async function geocodeAddress(
  address: string,
  city: string,
  postalCode: string
): Promise<Coordinates | null> {
  const query = `${address}, ${postalCode} ${city}, France`;
  const url =
    `${ORS_BASE_URL}/geocode/search?api_key=${ORS_API_KEY}` +
    `&text=${encodeURIComponent(query)}` +
    `&boundary.country=FR` +
    `&size=1`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Geocode HTTP ${res.status}`);
    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) return null;

    const [lng, lat] = feature.geometry.coordinates;
    return { lat, lng };
  } catch (err) {
    logger.error('[ORS] Geocode error:', err);
    return null;
  }
}

// ─── 2. Distance routière réelle (ORS Directions API) ─────────────────────────
async function getRouteDistance(
  clientLat: number,
  clientLng: number
): Promise<number | null> {
  const url =
    `${ORS_BASE_URL}/v2/directions/driving-car` +
    `?api_key=${ORS_API_KEY}` +
    `&start=${WAREHOUSE.lng},${WAREHOUSE.lat}` +
    `&end=${clientLng},${clientLat}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Directions HTTP ${res.status}`);
    const data = await res.json();

    const distanceMeters = data.features?.[0]?.properties?.summary?.distance;
    if (distanceMeters == null) return null;

    // Mètres → km, arrondi à 1 décimale
    return Math.round(distanceMeters / 100) / 10;
  } catch (err) {
    logger.error('[ORS] Directions error:', err);
    return null;
  }
}

// ─── 3. Fonction principale exportée ──────────────────────────────────────────
export async function calculateDeliveryFee(
  address: string,
  city: string,
  postalCode: string
): Promise<DistanceResult> {
  if (!address || !city || !postalCode) {
    return { success: false, distanceKm: 0, deliveryFee: 0, error: 'Adresse incomplète' };
  }

  if (!ORS_API_KEY) {
    logger.error('[ORS] VITE_ORS_API_KEY non configurée');
    return { success: false, distanceKm: 0, deliveryFee: 0, error: 'Service de calcul indisponible' };
  }

  // Cache hit ?
  const cacheKey = `${address}|${postalCode}|${city}`.toLowerCase();
  const cached = getCached(cacheKey);
  if (cached) {
    return { success: true, distanceKm: cached.distanceKm, deliveryFee: cached.fee };
  }

  try {
    // 1. Géocode l'adresse client
    const coords = await geocodeAddress(address, city, postalCode);
    if (!coords) {
      return {
        success: false,
        distanceKm: 0,
        deliveryFee: 0,
        error: 'Adresse introuvable — vérifiez votre saisie',
      };
    }

    // 2. Distance routière réelle
    const distanceKm = await getRouteDistance(coords.lat, coords.lng);
    if (distanceKm === null) {
      return {
        success: false,
        distanceKm: 0,
        deliveryFee: 0,
        error: 'Impossible de calculer la distance routière',
      };
    }

    // 3. Plafond de distance
    if (distanceKm > MAX_DELIVERY_DISTANCE_KM) {
      return {
        success: false,
        distanceKm,
        deliveryFee: 0,
        error: `Livraison non disponible au-delà de ${MAX_DELIVERY_DISTANCE_KM} km (${distanceKm} km). Contactez-nous.`,
      };
    }

    // 4. Prix = distance × tarif/km, arrondi au centime
    const deliveryFee = Math.round(distanceKm * PRICE_PER_KM * 100) / 100;

    // 5. Mise en cache
    setCache(cacheKey, deliveryFee, distanceKm);

    return { success: true, distanceKm, deliveryFee };
  } catch (err) {
    logger.error('[ORS] calculateDeliveryFee error:', err);
    return {
      success: false,
      distanceKm: 0,
      deliveryFee: 0,
      error: 'Erreur lors du calcul de la distance',
    };
  }
}

// ─── 4. Autocomplétion d'adresse (ORS Pelias) ────────────────────────────────
export interface AddressSuggestion {
  label: string;
  street: string;
  city: string;
  postalCode: string;
  lat: number;
  lng: number;
}

export async function searchAddresses(
  query: string,
  signal?: AbortSignal
): Promise<AddressSuggestion[]> {
  if (!query || query.length < 3 || !ORS_API_KEY) return [];

  const url =
    `${ORS_BASE_URL}/geocode/autocomplete?api_key=${ORS_API_KEY}` +
    `&text=${encodeURIComponent(query)}` +
    `&boundary.country=FR` +
    `&layers=address,street` +
    `&size=6` +
    `&focus.point.lat=${WAREHOUSE.lat}` +
    `&focus.point.lon=${WAREHOUSE.lng}`;

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`ORS autocomplete ${res.status}`);
    const data = await res.json();

    return (data.features ?? [])
      .map((f: Record<string, unknown>) => {
        const p = f.properties as Record<string, string | undefined>;
        const geom = f.geometry as { coordinates: [number, number] };
        const [lng, lat] = geom.coordinates;

        const parts = [
          p.housenumber,
          p.street ?? p.name,
          p.postalcode,
          p.locality ?? p.county,
        ].filter(Boolean);

        return {
          label: parts.join(', '),
          street: [p.housenumber, p.street ?? p.name].filter(Boolean).join(' '),
          city: p.locality ?? p.county ?? '',
          postalCode: p.postalcode ?? '',
          lat,
          lng,
        };
      })
      .filter((s: AddressSuggestion) => s.postalCode && s.city);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') return [];
    logger.error('[ORS] Autocomplete error:', err);
    return [];
  }
}

// ─── 5. Calcul depuis coordonnées (skip geocoding) ───────────────────────────
export async function calculateDeliveryFeeFromCoords(
  lat: number,
  lng: number
): Promise<DistanceResult> {
  if (!ORS_API_KEY) {
    return { success: false, distanceKm: 0, deliveryFee: 0, error: 'Service indisponible' };
  }

  try {
    const distanceKm = await getRouteDistance(lat, lng);
    if (distanceKm === null) {
      return { success: false, distanceKm: 0, deliveryFee: 0, error: 'Impossible de calculer la distance' };
    }

    if (distanceKm > MAX_DELIVERY_DISTANCE_KM) {
      return {
        success: false,
        distanceKm,
        deliveryFee: 0,
        error: `Livraison non disponible au-delà de ${MAX_DELIVERY_DISTANCE_KM} km (${distanceKm} km). Contactez-nous.`,
      };
    }

    const deliveryFee = Math.round(distanceKm * PRICE_PER_KM * 100) / 100;
    return { success: true, distanceKm, deliveryFee };
  } catch (err) {
    logger.error('[ORS] calculateDeliveryFeeFromCoords error:', err);
    return { success: false, distanceKm: 0, deliveryFee: 0, error: 'Erreur de calcul' };
  }
}

export function formatDeliveryFee(distanceKm: number, fee: number): string {
  return `${distanceKm} km × ${PRICE_PER_KM.toFixed(2)}€ = ${fee.toFixed(2)}€`;
}

export const DistanceService = {
  calculateDeliveryFee,
  calculateDeliveryFeeFromCoords,
  searchAddresses,
  formatDeliveryFee,
  PRICE_PER_KM,
  WAREHOUSE,
};

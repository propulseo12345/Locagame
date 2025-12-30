// Service de calcul de distance pour les frais de livraison

// Adresse de l'entrepôt LOCAGAME
const WAREHOUSE_ADDRESS = {
  street: "553 rue St Pierre",
  city: "Marseille",
  postalCode: "13012",
  // Coordonnées approximatives de l'entrepôt (à ajuster si nécessaire)
  lat: 43.3082,
  lng: 5.4372,
};

// Tarif par kilomètre
export const PRICE_PER_KM = 0.80;

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

/**
 * Calcule la distance à vol d'oiseau entre deux points (formule de Haversine)
 */
function haversineDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Géocode une adresse en utilisant l'API Nominatim (OpenStreetMap)
 */
async function geocodeAddress(address: string, city: string, postalCode: string): Promise<Coordinates | null> {
  try {
    const query = encodeURIComponent(`${address}, ${postalCode} ${city}, France`);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'LOCAGAME-App/1.0',
        },
      }
    );

    if (!response.ok) {
      console.error('Erreur géocodage:', response.statusText);
      return null;
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.error('Erreur géocodage:', error);
    return null;
  }
}

/**
 * Calcule les frais de livraison basés sur la distance
 * Applique un coefficient de 1.3 pour tenir compte des routes (vs vol d'oiseau)
 */
export async function calculateDeliveryFee(
  address: string,
  city: string,
  postalCode: string
): Promise<DistanceResult> {
  try {
    // Si l'adresse est incomplète, retourner une erreur
    if (!address || !city || !postalCode) {
      return {
        distanceKm: 0,
        deliveryFee: 0,
        success: false,
        error: 'Adresse incomplète',
      };
    }

    // Géocoder l'adresse de livraison
    const deliveryCoords = await geocodeAddress(address, city, postalCode);

    if (!deliveryCoords) {
      // Si le géocodage échoue, estimer basé sur le code postal
      const estimatedDistance = estimateDistanceByPostalCode(postalCode);
      return {
        distanceKm: estimatedDistance,
        deliveryFee: Math.round(estimatedDistance * PRICE_PER_KM * 100) / 100,
        success: true,
        error: 'Distance estimée (adresse non trouvée)',
      };
    }

    // Calculer la distance à vol d'oiseau
    const straightLineDistance = haversineDistance(
      { lat: WAREHOUSE_ADDRESS.lat, lng: WAREHOUSE_ADDRESS.lng },
      deliveryCoords
    );

    // Appliquer un coefficient pour la distance route (environ 1.3x la distance à vol d'oiseau)
    const roadDistance = Math.round(straightLineDistance * 1.3 * 10) / 10;

    // Calculer les frais
    const fee = Math.round(roadDistance * PRICE_PER_KM * 100) / 100;

    return {
      distanceKm: roadDistance,
      deliveryFee: fee,
      success: true,
    };
  } catch (error) {
    console.error('Erreur calcul distance:', error);
    return {
      distanceKm: 0,
      deliveryFee: 0,
      success: false,
      error: 'Erreur lors du calcul',
    };
  }
}

/**
 * Estimation de la distance basée sur le département (code postal)
 * Utilisé en fallback si le géocodage échoue
 */
function estimateDistanceByPostalCode(postalCode: string): number {
  const dept = postalCode.substring(0, 2);

  // Distances estimées depuis Marseille (13012) vers les départements voisins
  const distancesByDept: Record<string, number> = {
    '13': 15,  // Bouches-du-Rhône (moyenne)
    '84': 80,  // Vaucluse
    '30': 100, // Gard
    '83': 60,  // Var
    '04': 120, // Alpes-de-Haute-Provence
    '05': 180, // Hautes-Alpes
    '06': 200, // Alpes-Maritimes
    '34': 150, // Hérault
    '11': 250, // Aude
    '26': 200, // Drôme
  };

  return distancesByDept[dept] || 100; // Par défaut 100km
}

/**
 * Formate les frais de livraison pour l'affichage
 */
export function formatDeliveryFee(distanceKm: number, fee: number): string {
  return `${distanceKm} km × ${PRICE_PER_KM.toFixed(2)}€ = ${fee.toFixed(2)}€`;
}

export const DistanceService = {
  calculateDeliveryFee,
  formatDeliveryFee,
  PRICE_PER_KM,
  WAREHOUSE_ADDRESS,
};

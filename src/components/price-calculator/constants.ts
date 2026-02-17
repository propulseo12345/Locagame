// Coordonnees de l'entrepot
export const WAREHOUSE = {
  address: "553, rue St Pierre 13012 Marseille",
  lat: 43.3020,
  lng: 5.4310
};

// Prix par kilometre
export const PRICE_PER_KM = 0.80;

// Estimation des distances par code postal (en km depuis l'entrepot)
export const POSTAL_CODE_DISTANCES: { [key: string]: number } = {
  // Marseille
  '13001': 5, '13002': 4, '13003': 3, '13004': 4, '13005': 5,
  '13006': 6, '13007': 7, '13008': 8, '13009': 10, '13010': 6,
  '13011': 4, '13012': 2, '13013': 5, '13014': 6, '13015': 8,
  '13016': 15, '13017': 20, '13018': 25, '13019': 30,
  // Aix-en-Provence
  '13080': 35, '13090': 32, '13100': 30, '13290': 28, '13540': 25,
  // Aubagne
  '13400': 18, '13390': 20,
  // Martigues
  '13500': 40,
  // Autres villes des Bouches-du-Rhone
  '13600': 45, '13700': 50, '13800': 55, '13127': 35,
  '13220': 25, '13230': 35, '13250': 22, '13260': 28,
  '13270': 55, '13280': 60, '13300': 38, '13310': 42,
  '13320': 48, '13330': 52, '13340': 65, '13350': 58,
  '13360': 62, '13370': 45, '13380': 48, '13410': 50,
  '13420': 52, '13430': 55, '13440': 58, '13450': 60,
  '13460': 62, '13470': 65, '13480': 22, '13490': 68,
  // Var
  '83000': 60, '83100': 65, '83120': 55, '83130': 58,
  '83140': 70, '83150': 75, '83160': 80, '83170': 45,
  '83190': 50, '83200': 55, '83210': 48, '83220': 52,
  // Vaucluse
  '84000': 85, '84100': 90, '84200': 95, '84300': 100,
  // Alpes
  '04000': 120, '05000': 150,
  // Gard
  '30000': 100, '30100': 105,
};

export function estimateDistance(postalCode: string): number | null {
  const estimatedDistance = POSTAL_CODE_DISTANCES[postalCode];
  if (estimatedDistance) return estimatedDistance;

  if (postalCode.startsWith('13')) return 40;
  if (postalCode.startsWith('83') || postalCode.startsWith('84')) return 80;
  if (postalCode.startsWith('04') || postalCode.startsWith('05') || postalCode.startsWith('06')) return 120;
  if (postalCode.startsWith('30') || postalCode.startsWith('34')) return 100;

  return null; // Hors zone
}

export function calculateHaversineDistance(lat: number, lng: number): number {
  const R = 6371;
  const dLat = (lat - WAREHOUSE.lat) * Math.PI / 180;
  const dLon = (lng - WAREHOUSE.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(WAREHOUSE.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDistance = R * c;
  return Math.round(straightDistance * 1.3);
}

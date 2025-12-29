export const fakeDeliveryZones = [
  {
    id: 'zone_001',
    name: 'Marseille Centre',
    postalCodes: ['13001', '13002', '13003', '13004', '13005', '13006', '13007', '13008'],
    cities: ['Marseille'],
    deliveryFee: 85,
    freeDeliveryThreshold: null,
    estimatedDeliveryTime: '2-4 heures',
    availableDays: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
    isActive: true,
    note: 'Frais kilométriques en supplément'
  },
  {
    id: 'zone_002',
    name: 'Marseille Étendu',
    postalCodes: ['13009', '13010', '13011', '13012', '13013', '13014', '13015', '13016'],
    cities: ['Marseille'],
    deliveryFee: 85,
    freeDeliveryThreshold: null,
    estimatedDeliveryTime: '4-6 heures',
    availableDays: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
    isActive: true,
    note: 'Frais kilométriques en supplément'
  },
  {
    id: 'zone_003',
    name: 'Aix-en-Provence',
    postalCodes: ['13080', '13090', '13100', '13290', '13540'],
    cities: ['Aix-en-Provence', 'Le Tholonet', 'Puyricard'],
    deliveryFee: 25,
    freeDeliveryThreshold: 400,
    estimatedDeliveryTime: 'Lendemain',
    availableDays: ['mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
    isActive: true
  },
  {
    id: 'zone_004',
    name: 'Toulon',
    postalCodes: ['83000', '83100', '83200'],
    cities: ['Toulon', 'La Seyne-sur-Mer', 'La Garde'],
    deliveryFee: 40,
    freeDeliveryThreshold: 500,
    estimatedDeliveryTime: 'J+1',
    availableDays: ['mercredi', 'jeudi', 'vendredi', 'samedi'],
    isActive: true
  },
  {
    id: 'zone_005',
    name: 'Avignon',
    postalCodes: ['84000', '84140'],
    cities: ['Avignon', 'Montfavet'],
    deliveryFee: 50,
    freeDeliveryThreshold: 600,
    estimatedDeliveryTime: 'J+1 ou J+2',
    availableDays: ['jeudi', 'vendredi', 'samedi'],
    isActive: false // Zone temporairement désactivée
  }
];

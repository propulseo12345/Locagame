export const fakeProducts = [
  {
    id: 'prod_001',
    name: 'Baby-foot géant 11vs11',
    category: 'Jeux de Bar',
    description: 'Baby-foot géant spectaculaire pour 22 joueurs simultanés',
    shortDescription: 'Le baby-foot le plus impressionnant pour vos événements',
    price: {
      oneDay: 450,
      weekend: 800,
      week: 1400
    },
    stock: {
      total: 2,
      available: 1
    },
    images: [
      'https://images.pexels.com/photos/163888/foosball-fun-game-team-163888.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop'
    ],
    status: 'active', // active | inactive | maintenance
    specifications: {
      dimensions: '8m × 4m × 1.2m',
      weight: '350 kg',
      players: '22 joueurs',
      powerRequired: false,
      setupTime: '45 minutes'
    },
    totalReservations: 47,
    rating: 4.9,
    tags: ['géant', 'outdoor', 'team-building']
  },
  {
    id: 'prod_002',
    name: 'Table de Roulette Professionnelle',
    category: 'Casino & Poker',
    description: 'Table de roulette casino authentique avec croupier',
    shortDescription: 'Ambiance casino chic pour vos soirées',
    price: {
      oneDay: 250,
      weekend: 450,
      week: 900
    },
    stock: {
      total: 3,
      available: 3
    },
    images: ['https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800&auto=format&fit=crop'],
    status: 'active',
    specifications: {
      dimensions: '2.4m × 1.4m × 0.9m',
      weight: '80 kg',
      players: '8-10 joueurs',
      powerRequired: false,
      setupTime: '15 minutes'
    },
    totalReservations: 89,
    rating: 5.0,
    tags: ['casino', 'luxe', 'mariage']
  },
  {
    id: 'prod_003',
    name: 'Pack Console Rétrogaming',
    category: 'Jeux Vidéo',
    description: '15 consoles rétro de 1985 à 2010 avec +500 jeux',
    shortDescription: 'Voyage nostalgique dans l\'histoire du jeu vidéo',
    price: {
      oneDay: 180,
      weekend: 320,
      week: 600
    },
    stock: {
      total: 5,
      available: 4
    },
    images: ['https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop'],
    status: 'active',
    specifications: {
      dimensions: 'Stand 3m × 2m',
      weight: '45 kg',
      players: '1-4 joueurs',
      powerRequired: true,
      setupTime: '30 minutes'
    },
    totalReservations: 134,
    rating: 4.8,
    tags: ['geek', 'nostalgie', 'anniversaire']
  },
  {
    id: 'prod_004',
    name: 'Simulateur de Ski VR',
    category: 'Jeux de Bar',
    description: 'Simulateur de ski avec casque VR et plateforme mobile',
    shortDescription: 'Sensation de glisse immersive',
    price: {
      oneDay: 350,
      weekend: 600,
      week: 1100
    },
    stock: {
      total: 1,
      available: 0 // Réservé
    },
    images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&auto=format&fit=crop'],
    status: 'active',
    specifications: {
      dimensions: '2m × 1.5m × 2.5m',
      weight: '120 kg',
      players: '1 joueur',
      powerRequired: true,
      setupTime: '20 minutes'
    },
    totalReservations: 56,
    rating: 4.7,
    tags: ['VR', 'sport', 'hiver']
  },
  {
    id: 'prod_005',
    name: 'Jenga XXL 1.5m',
    category: 'Jeux en Bois',
    description: 'Jenga géant en bois massif, pièces de 30cm',
    shortDescription: 'Le classique en version démesurée',
    price: {
      oneDay: 80,
      weekend: 140,
      week: 250
    },
    stock: {
      total: 8,
      available: 6
    },
    images: ['https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop'],
    status: 'active',
    specifications: {
      dimensions: 'Tour jusqu\'à 1.5m',
      weight: '25 kg',
      players: '2-8 joueurs',
      powerRequired: false,
      setupTime: '5 minutes'
    },
    totalReservations: 203,
    rating: 4.9,
    tags: ['outdoor', 'famille', 'facile']
  },
  {
    id: 'prod_006',
    name: 'Ping Pong Géant',
    category: 'Jeux de Bar',
    description: 'Table de ping-pong géante pour 8 joueurs',
    shortDescription: 'Le ping-pong en version XXL',
    price: {
      oneDay: 200,
      weekend: 350,
      week: 650
    },
    stock: {
      total: 4,
      available: 3
    },
    images: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop'],
    status: 'active',
    specifications: {
      dimensions: '6m × 3m × 0.8m',
      weight: '180 kg',
      players: '8 joueurs',
      powerRequired: false,
      setupTime: '25 minutes'
    },
    totalReservations: 78,
    rating: 4.6,
    tags: ['sport', 'outdoor', 'équipe']
  },
  {
    id: 'prod_007',
    name: 'Machine à Bulles Géante',
    category: 'Événementiel',
    description: 'Machine à bulles professionnelle pour événements',
    shortDescription: 'Magie des bulles pour tous vos événements',
    price: {
      oneDay: 120,
      weekend: 200,
      week: 380
    },
    stock: {
      total: 6,
      available: 5
    },
    images: ['https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&auto=format&fit=crop'],
    status: 'active',
    specifications: {
      dimensions: '1.2m × 0.8m × 1.5m',
      weight: '35 kg',
      players: 'Illimité',
      powerRequired: true,
      setupTime: '10 minutes'
    },
    totalReservations: 156,
    rating: 4.8,
    tags: ['enfants', 'magie', 'fête']
  },
  {
    id: 'prod_008',
    name: 'Table de Blackjack',
    category: 'Casino & Poker',
    description: 'Table de blackjack professionnelle avec croupier',
    shortDescription: 'Ambiance Vegas pour vos soirées',
    price: {
      oneDay: 200,
      weekend: 360,
      week: 700
    },
    stock: {
      total: 2,
      available: 2
    },
    images: ['https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800&auto=format&fit=crop'],
    status: 'active',
    specifications: {
      dimensions: '2.2m × 1.2m × 0.9m',
      weight: '75 kg',
      players: '6-8 joueurs',
      powerRequired: false,
      setupTime: '15 minutes'
    },
    totalReservations: 92,
    rating: 4.9,
    tags: ['casino', 'luxe', 'soirée']
  },
  {
    id: 'prod_009',
    name: 'Karaoké Professionnel',
    category: 'Événementiel',
    description: 'Système karaoké complet avec micros et écran',
    shortDescription: 'L\'ambiance musicale parfaite',
    price: {
      oneDay: 150,
      weekend: 280,
      week: 520
    },
    stock: {
      total: 3,
      available: 2
    },
    images: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop'],
    status: 'active',
    specifications: {
      dimensions: 'Écran 2m + matériel',
      weight: '50 kg',
      players: 'Illimité',
      powerRequired: true,
      setupTime: '20 minutes'
    },
    totalReservations: 167,
    rating: 4.7,
    tags: ['musique', 'soirée', 'divertissement']
  },
  {
    id: 'prod_010',
    name: 'Poker Table Géante',
    category: 'Casino & Poker',
    description: 'Table de poker géante pour 12 joueurs',
    shortDescription: 'Le poker en version XXL',
    price: {
      oneDay: 300,
      weekend: 550,
      week: 1050
    },
    stock: {
      total: 2,
      available: 1
    },
    images: ['https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800&auto=format&fit=crop'],
    status: 'active',
    specifications: {
      dimensions: '3m × 1.5m × 0.9m',
      weight: '120 kg',
      players: '12 joueurs',
      powerRequired: false,
      setupTime: '20 minutes'
    },
    totalReservations: 45,
    rating: 4.8,
    tags: ['poker', 'géant', 'tournoi']
  },
  {
    id: 'prod_011',
    name: 'Jeu de Fléchettes Géant',
    category: 'Jeux de Bar',
    description: 'Cible de fléchettes géante avec fléchettes sécurisées',
    shortDescription: 'Le pub game en version XXL',
    price: {
      oneDay: 100,
      weekend: 180,
      week: 340
    },
    stock: {
      total: 5,
      available: 4
    },
    images: ['https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800&auto=format&fit=crop'],
    status: 'active',
    specifications: {
      dimensions: 'Cible 2m de diamètre',
      weight: '30 kg',
      players: '2-8 joueurs',
      powerRequired: false,
      setupTime: '10 minutes'
    },
    totalReservations: 89,
    rating: 4.5,
    tags: ['pub', 'précision', 'compétition']
  },
  {
    id: 'prod_012',
    name: 'Mölkky Géant',
    category: 'Jeux en Bois',
    description: 'Jeu de quilles finlandais en version géante',
    shortDescription: 'Le Mölkky en version XXL',
    price: {
      oneDay: 90,
      weekend: 160,
      week: 300
    },
    stock: {
      total: 4,
      available: 3
    },
    images: ['https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop'],
    status: 'active',
    specifications: {
      dimensions: 'Jeu 8m × 4m',
      weight: '40 kg',
      players: '2-12 joueurs',
      powerRequired: false,
      setupTime: '15 minutes'
    },
    totalReservations: 67,
    rating: 4.6,
    tags: ['outdoor', 'bois', 'famille']
  },
  {
    id: 'prod_013',
    name: 'Simulateur de Golf',
    category: 'Jeux de Bar',
    description: 'Simulateur de golf avec détection de mouvement',
    shortDescription: 'Le golf indoor parfait',
    price: {
      oneDay: 400,
      weekend: 720,
      week: 1350
    },
    stock: {
      total: 1,
      available: 0 // En maintenance
    },
    images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&auto=format&fit=crop'],
    status: 'maintenance',
    specifications: {
      dimensions: '3m × 2m × 2.5m',
      weight: '200 kg',
      players: '1-4 joueurs',
      powerRequired: true,
      setupTime: '45 minutes'
    },
    totalReservations: 34,
    rating: 4.9,
    tags: ['golf', 'sport', 'simulation']
  },
  {
    id: 'prod_014',
    name: 'Cornhole Géant',
    category: 'Jeux en Bois',
    description: 'Jeu de cornhole en version géante',
    shortDescription: 'Le cornhole américain en XXL',
    price: {
      oneDay: 110,
      weekend: 200,
      week: 380
    },
    stock: {
      total: 6,
      available: 5
    },
    images: ['https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop'],
    status: 'active',
    specifications: {
      dimensions: '2 planches 1.2m × 0.6m',
      weight: '35 kg',
      players: '2-8 joueurs',
      powerRequired: false,
      setupTime: '10 minutes'
    },
    totalReservations: 123,
    rating: 4.7,
    tags: ['outdoor', 'précision', 'équipe']
  },
  {
    id: 'prod_015',
    name: 'Pétanque Géante',
    category: 'Jeux en Bois',
    description: 'Boules de pétanque géantes en bois',
    shortDescription: 'La pétanque en version XXL',
    price: {
      oneDay: 70,
      weekend: 130,
      week: 250
    },
    stock: {
      total: 8,
      available: 7
    },
    images: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop'],
    status: 'active',
    specifications: {
      dimensions: 'Terrain 10m × 3m',
      weight: '25 kg',
      players: '2-8 joueurs',
      powerRequired: false,
      setupTime: '5 minutes'
    },
    totalReservations: 145,
    rating: 4.8,
    tags: ['outdoor', 'tradition', 'famille']
  }
];

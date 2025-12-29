export const fakeCustomers = [
  {
    id: 'cust_001',
    firstName: 'Sophie',
    lastName: 'Martin',
    email: 'sophie.martin@email.com',
    phone: '+33 6 12 34 56 78',
    type: 'particulier',
    company: null,
    avatar: null,
    addresses: [
      {
        id: 'addr_001',
        label: 'Domicile',
        street: '25 Avenue du Prado',
        zipCode: '13006',
        city: 'Marseille',
        country: 'France',
        isDefault: true
      }
    ],
    stats: {
      memberSince: '2023-03-12',
      totalReservations: 8,
      totalSpent: 2450,
      averageBasket: 306,
      favoriteCategories: ['Jeux de Bar', 'Casino'],
      lastReservation: '2024-10-16'
    },
    preferences: {
      newsletter: true,
      smsNotifications: true
    },
    status: 'active',
    segment: 'VIP' // VIP | nouveau | inactif | standard
  },
  {
    id: 'cust_002',
    firstName: 'Thomas',
    lastName: 'Dubois',
    email: 'thomas.dubois@startup.com',
    phone: '+33 6 98 76 54 32',
    type: 'professionnel',
    company: 'TechStart SAS',
    siret: '123 456 789 00012',
    avatar: null,
    addresses: [
      {
        id: 'addr_002',
        label: 'Bureaux',
        street: '15 Rue Paradis',
        zipCode: '13001',
        city: 'Marseille',
        country: 'France',
        isDefault: true
      }
    ],
    stats: {
      memberSince: '2022-09-05',
      totalReservations: 15,
      totalSpent: 4890,
      averageBasket: 326,
      favoriteCategories: ['Casino', 'Jeux Vidéo'],
      lastReservation: '2024-10-25'
    },
    preferences: {
      newsletter: true,
      smsNotifications: false
    },
    status: 'active',
    segment: 'VIP'
  },
  {
    id: 'cust_003',
    firstName: 'Marie',
    lastName: 'Lefebvre',
    email: 'marie.lefebvre@gmail.com',
    phone: '+33 7 45 67 89 01',
    type: 'particulier',
    company: null,
    avatar: null,
    addresses: [
      {
        id: 'addr_003',
        label: 'Maison',
        street: '8 Chemin de la Madrague',
        zipCode: '13015',
        city: 'Marseille',
        country: 'France',
        isDefault: true
      }
    ],
    stats: {
      memberSince: '2024-06-20',
      totalReservations: 2,
      totalSpent: 615,
      averageBasket: 308,
      favoriteCategories: ['Jeux de Bar'],
      lastReservation: '2024-11-05'
    },
    preferences: {
      newsletter: false,
      smsNotifications: true
    },
    status: 'active',
    segment: 'nouveau'
  },
  {
    id: 'cust_004',
    firstName: 'Pierre',
    lastName: 'Moreau',
    email: 'pierre.moreau@company.fr',
    phone: '+33 6 23 45 67 89',
    type: 'professionnel',
    company: 'EventPro Marseille',
    siret: '987 654 321 00098',
    avatar: null,
    addresses: [
      {
        id: 'addr_004',
        label: 'Bureaux',
        street: '42 Boulevard Longchamp',
        zipCode: '13001',
        city: 'Marseille',
        country: 'France',
        isDefault: true
      }
    ],
    stats: {
      memberSince: '2021-11-15',
      totalReservations: 23,
      totalSpent: 8750,
      averageBasket: 380,
      favoriteCategories: ['Événementiel', 'Jeux de Bar'],
      lastReservation: '2024-11-10'
    },
    preferences: {
      newsletter: true,
      smsNotifications: true
    },
    status: 'active',
    segment: 'VIP'
  },
  {
    id: 'cust_005',
    firstName: 'Julie',
    lastName: 'Rousseau',
    email: 'julie.rousseau@email.com',
    phone: '+33 7 12 34 56 78',
    type: 'particulier',
    company: null,
    avatar: null,
    addresses: [
      {
        id: 'addr_005',
        label: 'Domicile',
        street: '12 Rue de la République',
        zipCode: '13002',
        city: 'Marseille',
        country: 'France',
        isDefault: true
      }
    ],
    stats: {
      memberSince: '2023-08-30',
      totalReservations: 5,
      totalSpent: 1850,
      averageBasket: 370,
      favoriteCategories: ['Casino'],
      lastReservation: '2024-11-15'
    },
    preferences: {
      newsletter: true,
      smsNotifications: false
    },
    status: 'active',
    segment: 'standard'
  },
  {
    id: 'cust_006',
    firstName: 'Antoine',
    lastName: 'Petit',
    email: 'antoine.petit@startup.io',
    phone: '+33 6 87 65 43 21',
    type: 'professionnel',
    company: 'InnovateLab',
    siret: '456 789 123 00045',
    avatar: null,
    addresses: [
      {
        id: 'addr_006',
        label: 'Bureaux',
        street: '88 Avenue de la Plage',
        zipCode: '13008',
        city: 'Marseille',
        country: 'France',
        isDefault: true
      }
    ],
    stats: {
      memberSince: '2024-02-14',
      totalReservations: 7,
      totalSpent: 2100,
      averageBasket: 300,
      favoriteCategories: ['Jeux de Bar', 'Jeux en Bois'],
      lastReservation: '2024-11-20'
    },
    preferences: {
      newsletter: true,
      smsNotifications: true
    },
    status: 'active',
    segment: 'standard'
  },
  {
    id: 'cust_007',
    firstName: 'Camille',
    lastName: 'Bernard',
    email: 'camille.bernard@email.com',
    phone: '+33 7 98 76 54 32',
    type: 'particulier',
    company: null,
    avatar: null,
    addresses: [
      {
        id: 'addr_007',
        label: 'Maison',
        street: '5 Impasse des Lilas',
        zipCode: '13012',
        city: 'Marseille',
        country: 'France',
        isDefault: true
      }
    ],
    stats: {
      memberSince: '2024-09-10',
      totalReservations: 3,
      totalSpent: 950,
      averageBasket: 317,
      favoriteCategories: ['Jeux en Bois'],
      lastReservation: '2024-11-22'
    },
    preferences: {
      newsletter: false,
      smsNotifications: true
    },
    status: 'active',
    segment: 'nouveau'
  },
  {
    id: 'cust_008',
    firstName: 'Lucas',
    lastName: 'Garcia',
    email: 'lucas.garcia@company.com',
    phone: '+33 6 45 67 89 01',
    type: 'professionnel',
    company: 'Event Solutions',
    siret: '789 123 456 00078',
    avatar: null,
    addresses: [
      {
        id: 'addr_008',
        label: 'Bureaux',
        street: '30 Cours Mirabeau',
        zipCode: '13100',
        city: 'Aix-en-Provence',
        country: 'France',
        isDefault: true
      }
    ],
    stats: {
      memberSince: '2020-05-20',
      totalReservations: 31,
      totalSpent: 12500,
      averageBasket: 403,
      favoriteCategories: ['Casino', 'Événementiel'],
      lastReservation: '2024-11-28'
    },
    preferences: {
      newsletter: true,
      smsNotifications: true
    },
    status: 'active',
    segment: 'VIP'
  },
  {
    id: 'cust_009',
    firstName: 'Emma',
    lastName: 'Leroy',
    email: 'emma.leroy@email.com',
    phone: '+33 7 23 45 67 89',
    type: 'particulier',
    company: null,
    avatar: null,
    addresses: [
      {
        id: 'addr_009',
        label: 'Domicile',
        street: '18 Rue de la Paix',
        zipCode: '13003',
        city: 'Marseille',
        country: 'France',
        isDefault: true
      }
    ],
    stats: {
      memberSince: '2024-10-15',
      totalReservations: 1,
      totalSpent: 450,
      averageBasket: 450,
      favoriteCategories: ['Jeux de Bar'],
      lastReservation: '2024-11-29'
    },
    preferences: {
      newsletter: true,
      smsNotifications: false
    },
    status: 'active',
    segment: 'nouveau'
  },
  {
    id: 'cust_010',
    firstName: 'Nicolas',
    lastName: 'Simon',
    email: 'nicolas.simon@startup.fr',
    phone: '+33 6 78 90 12 34',
    type: 'professionnel',
    company: 'TechCorp',
    siret: '321 654 987 00032',
    avatar: null,
    addresses: [
      {
        id: 'addr_010',
        label: 'Bureaux',
        street: '55 Avenue du Général de Gaulle',
        zipCode: '13004',
        city: 'Marseille',
        country: 'France',
        isDefault: true
      }
    ],
    stats: {
      memberSince: '2023-12-01',
      totalReservations: 12,
      totalSpent: 4200,
      averageBasket: 350,
      favoriteCategories: ['Jeux Vidéo', 'Événementiel'],
      lastReservation: '2024-12-01'
    },
    preferences: {
      newsletter: true,
      smsNotifications: true
    },
    status: 'active',
    segment: 'VIP'
  },
  {
    id: 'cust_011',
    firstName: 'Léa',
    lastName: 'Moreau',
    email: 'lea.moreau@email.com',
    phone: '+33 7 34 56 78 90',
    type: 'particulier',
    company: null,
    avatar: null,
    addresses: [
      {
        id: 'addr_011',
        label: 'Maison',
        street: '7 Rue des Roses',
        zipCode: '13007',
        city: 'Marseille',
        country: 'France',
        isDefault: true
      }
    ],
    stats: {
      memberSince: '2023-06-15',
      totalReservations: 4,
      totalSpent: 1200,
      averageBasket: 300,
      favoriteCategories: ['Jeux en Bois'],
      lastReservation: '2024-08-20'
    },
    preferences: {
      newsletter: false,
      smsNotifications: false
    },
    status: 'inactive',
    segment: 'inactif'
  },
  {
    id: 'cust_012',
    firstName: 'Marc',
    lastName: 'Durand',
    email: 'marc.durand@company.fr',
    phone: '+33 6 56 78 90 12',
    type: 'professionnel',
    company: 'Corporate Events',
    siret: '654 321 789 00065',
    avatar: null,
    addresses: [
      {
        id: 'addr_012',
        label: 'Bureaux',
        street: '100 Avenue de la Canebière',
        zipCode: '13001',
        city: 'Marseille',
        country: 'France',
        isDefault: true
      }
    ],
    stats: {
      memberSince: '2022-01-10',
      totalReservations: 18,
      totalSpent: 6800,
      averageBasket: 378,
      favoriteCategories: ['Événementiel', 'Jeux de Bar'],
      lastReservation: '2024-09-15'
    },
    preferences: {
      newsletter: true,
      smsNotifications: true
    },
    status: 'active',
    segment: 'VIP'
  },
  {
    id: 'cust_013',
    firstName: 'Sarah',
    lastName: 'Lopez',
    email: 'sarah.lopez@email.com',
    phone: '+33 7 67 89 01 23',
    type: 'particulier',
    company: null,
    avatar: null,
    addresses: [
      {
        id: 'addr_013',
        label: 'Domicile',
        street: '23 Boulevard de la Libération',
        zipCode: '13004',
        city: 'Marseille',
        country: 'France',
        isDefault: true
      }
    ],
    stats: {
      memberSince: '2024-07-05',
      totalReservations: 2,
      totalSpent: 680,
      averageBasket: 340,
      favoriteCategories: ['Casino'],
      lastReservation: '2024-10-30'
    },
    preferences: {
      newsletter: true,
      smsNotifications: true
    },
    status: 'active',
    segment: 'nouveau'
  },
  {
    id: 'cust_014',
    firstName: 'David',
    lastName: 'Martinez',
    email: 'david.martinez@startup.com',
    phone: '+33 6 89 01 23 45',
    type: 'professionnel',
    company: 'Digital Solutions',
    siret: '147 258 369 00014',
    avatar: null,
    addresses: [
      {
        id: 'addr_014',
        label: 'Bureaux',
        street: '15 Place Castellane',
        zipCode: '13006',
        city: 'Marseille',
        country: 'France',
        isDefault: true
      }
    ],
    stats: {
      memberSince: '2023-04-22',
      totalReservations: 9,
      totalSpent: 3200,
      averageBasket: 356,
      favoriteCategories: ['Jeux Vidéo', 'Jeux de Bar'],
      lastReservation: '2024-11-12'
    },
    preferences: {
      newsletter: true,
      smsNotifications: false
    },
    status: 'active',
    segment: 'standard'
  },
  {
    id: 'cust_015',
    firstName: 'Claire',
    lastName: 'André',
    email: 'claire.andre@email.com',
    phone: '+33 7 78 90 12 34',
    type: 'particulier',
    company: null,
    avatar: null,
    addresses: [
      {
        id: 'addr_015',
        label: 'Maison',
        street: '9 Rue de la Paix',
        zipCode: '13005',
        city: 'Marseille',
        country: 'France',
        isDefault: true
      }
    ],
    stats: {
      memberSince: '2024-03-18',
      totalReservations: 3,
      totalSpent: 890,
      averageBasket: 297,
      favoriteCategories: ['Jeux en Bois', 'Événementiel'],
      lastReservation: '2024-11-08'
    },
    preferences: {
      newsletter: false,
      smsNotifications: true
    },
    status: 'active',
    segment: 'nouveau'
  }
];

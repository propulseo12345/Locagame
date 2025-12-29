export const fakeReservations = [
  {
    id: 'res_001',
    orderNumber: 'LOC-2024-001',
    customer: {
      id: 'cust_001',
      firstName: 'Sophie',
      lastName: 'Martin',
      email: 'sophie.martin@email.com',
      phone: '+33 6 12 34 56 78',
      type: 'particulier'
    },
    products: [
      {
        productId: 'prod_001',
        productName: 'Baby-foot géant 11vs11',
        quantity: 1,
        duration: 3,
        unitPrice: 800
      },
      {
        productId: 'prod_005',
        productName: 'Jenga XXL 1.5m',
        quantity: 2,
        duration: 3,
        unitPrice: 140
      }
    ],
    dates: {
      start: '2024-11-15',
      end: '2024-11-17',
      deliveryTime: '10:00'
    },
    delivery: {
      type: 'delivery',
      address: {
        street: '25 Avenue du Prado',
        zipCode: '13006',
        city: 'Marseille',
        country: 'France'
      },
      zone: 'Marseille Centre',
      deliveryFee: 0
    },
    pricing: {
      subtotal: 1080,
      deliveryFee: 0,
      discount: 0,
      total: 1080
    },
    payment: {
      method: 'Stripe',
      status: 'paid',
      transactionId: 'ch_3Abc123def456',
      paidAt: '2024-10-16T14:35:00Z'
    },
    status: 'confirmed', // pending | confirmed | preparing | delivered | completed | cancelled
    notes: 'Événement anniversaire 40 ans - 50 personnes attendues',
    createdAt: '2024-10-16T14:32:00Z',
    timeline: [
      { status: 'Réservation créée', date: '2024-10-16T14:32:00Z' },
      { status: 'Paiement confirmé', date: '2024-10-16T14:35:00Z' },
      { status: 'En préparation', date: '2024-11-14T09:00:00Z' }
    ]
  },
  {
    id: 'res_002',
    orderNumber: 'LOC-2024-002',
    customer: {
      id: 'cust_002',
      firstName: 'Thomas',
      lastName: 'Dubois',
      email: 'thomas.dubois@startup.com',
      phone: '+33 6 98 76 54 32',
      type: 'professionnel',
      company: 'TechStart SAS'
    },
    products: [
      {
        productId: 'prod_002',
        productName: 'Table de Roulette Professionnelle',
        quantity: 2,
        duration: 1,
        unitPrice: 250
      },
      {
        productId: 'prod_003',
        productName: 'Pack Console Rétrogaming',
        quantity: 1,
        duration: 1,
        unitPrice: 180
      }
    ],
    dates: {
      start: '2024-11-08',
      end: '2024-11-08',
      deliveryTime: '18:00'
    },
    delivery: {
      type: 'delivery',
      address: {
        street: '15 Rue Paradis',
        zipCode: '13001',
        city: 'Marseille',
        country: 'France'
      },
      zone: 'Marseille Centre',
      deliveryFee: 0
    },
    pricing: {
      subtotal: 680,
      deliveryFee: 0,
      discount: 68,
      total: 612
    },
    payment: {
      method: 'PayPal',
      status: 'paid',
      transactionId: 'PAYID-ABC123',
      paidAt: '2024-10-25T11:20:00Z'
    },
    status: 'completed',
    notes: 'Soirée afterwork entreprise - 80 personnes',
    createdAt: '2024-10-25T11:15:00Z',
    timeline: [
      { status: 'Réservation créée', date: '2024-10-25T11:15:00Z' },
      { status: 'Paiement confirmé', date: '2024-10-25T11:20:00Z' },
      { status: 'En préparation', date: '2024-11-08T08:00:00Z' },
      { status: 'Livré', date: '2024-11-08T18:00:00Z' },
      { status: 'Retour effectué', date: '2024-11-08T23:30:00Z' },
      { status: 'Clôturé', date: '2024-11-09T10:00:00Z' }
    ]
  },
  {
    id: 'res_003',
    orderNumber: 'LOC-2024-003',
    customer: {
      id: 'cust_003',
      firstName: 'Marie',
      lastName: 'Lefebvre',
      email: 'marie.lefebvre@gmail.com',
      phone: '+33 7 45 67 89 01',
      type: 'particulier'
    },
    products: [
      {
        productId: 'prod_004',
        productName: 'Simulateur de Ski VR',
        quantity: 1,
        duration: 2,
        unitPrice: 600
      }
    ],
    dates: {
      start: '2024-11-20',
      end: '2024-11-21',
      deliveryTime: '14:00'
    },
    delivery: {
      type: 'delivery',
      address: {
        street: '8 Chemin de la Madrague',
        zipCode: '13015',
        city: 'Marseille',
        country: 'France'
      },
      zone: 'Marseille Étendu',
      deliveryFee: 15
    },
    pricing: {
      subtotal: 600,
      deliveryFee: 15,
      discount: 0,
      total: 615
    },
    payment: {
      method: 'Stripe',
      status: 'pending',
      transactionId: null,
      paidAt: null
    },
    status: 'pending',
    notes: 'Fête d\'anniversaire enfant - thème montagne',
    createdAt: '2024-11-05T16:45:00Z',
    timeline: [
      { status: 'Réservation créée', date: '2024-11-05T16:45:00Z' }
    ]
  },
  {
    id: 'res_004',
    orderNumber: 'LOC-2024-004',
    customer: {
      id: 'cust_004',
      firstName: 'Pierre',
      lastName: 'Moreau',
      email: 'pierre.moreau@company.fr',
      phone: '+33 6 23 45 67 89',
      type: 'professionnel',
      company: 'EventPro Marseille'
    },
    products: [
      {
        productId: 'prod_006',
        productName: 'Ping Pong Géant',
        quantity: 1,
        duration: 1,
        unitPrice: 200
      },
      {
        productId: 'prod_007',
        productName: 'Machine à Bulles Géante',
        quantity: 1,
        duration: 1,
        unitPrice: 120
      },
      {
        productId: 'prod_009',
        productName: 'Karaoké Professionnel',
        quantity: 1,
        duration: 1,
        unitPrice: 150
      }
    ],
    dates: {
      start: '2024-11-12',
      end: '2024-11-12',
      deliveryTime: '16:00'
    },
    delivery: {
      type: 'delivery',
      address: {
        street: '42 Boulevard Longchamp',
        zipCode: '13001',
        city: 'Marseille',
        country: 'France'
      },
      zone: 'Marseille Centre',
      deliveryFee: 0
    },
    pricing: {
      subtotal: 470,
      deliveryFee: 0,
      discount: 47,
      total: 423
    },
    payment: {
      method: 'Virement',
      status: 'paid',
      transactionId: 'VIR-2024-001',
      paidAt: '2024-11-10T10:30:00Z'
    },
    status: 'preparing',
    notes: 'Événement corporate - 100 personnes',
    createdAt: '2024-11-10T10:25:00Z',
    timeline: [
      { status: 'Réservation créée', date: '2024-11-10T10:25:00Z' },
      { status: 'Paiement confirmé', date: '2024-11-10T10:30:00Z' },
      { status: 'En préparation', date: '2024-11-11T09:00:00Z' }
    ]
  },
  {
    id: 'res_005',
    orderNumber: 'LOC-2024-005',
    customer: {
      id: 'cust_005',
      firstName: 'Julie',
      lastName: 'Rousseau',
      email: 'julie.rousseau@email.com',
      phone: '+33 7 12 34 56 78',
      type: 'particulier'
    },
    products: [
      {
        productId: 'prod_010',
        productName: 'Poker Table Géante',
        quantity: 1,
        duration: 2,
        unitPrice: 550
      }
    ],
    dates: {
      start: '2024-11-18',
      end: '2024-11-19',
      deliveryTime: '19:00'
    },
    delivery: {
      type: 'delivery',
      address: {
        street: '12 Rue de la République',
        zipCode: '13002',
        city: 'Marseille',
        country: 'France'
      },
      zone: 'Marseille Centre',
      deliveryFee: 0
    },
    pricing: {
      subtotal: 550,
      deliveryFee: 0,
      discount: 0,
      total: 550
    },
    payment: {
      method: 'Stripe',
      status: 'paid',
      transactionId: 'ch_3Def456ghi789',
      paidAt: '2024-11-15T14:20:00Z'
    },
    status: 'delivered',
    notes: 'Soirée poker entre amis - 12 personnes',
    createdAt: '2024-11-15T14:15:00Z',
    timeline: [
      { status: 'Réservation créée', date: '2024-11-15T14:15:00Z' },
      { status: 'Paiement confirmé', date: '2024-11-15T14:20:00Z' },
      { status: 'En préparation', date: '2024-11-17T09:00:00Z' },
      { status: 'Livré', date: '2024-11-18T19:00:00Z' }
    ]
  },
  {
    id: 'res_006',
    orderNumber: 'LOC-2024-006',
    customer: {
      id: 'cust_006',
      firstName: 'Antoine',
      lastName: 'Petit',
      email: 'antoine.petit@startup.io',
      phone: '+33 6 87 65 43 21',
      type: 'professionnel',
      company: 'InnovateLab'
    },
    products: [
      {
        productId: 'prod_011',
        productName: 'Jeu de Fléchettes Géant',
        quantity: 2,
        duration: 1,
        unitPrice: 100
      },
      {
        productId: 'prod_012',
        productName: 'Mölkky Géant',
        quantity: 1,
        duration: 1,
        unitPrice: 90
      }
    ],
    dates: {
      start: '2024-11-22',
      end: '2024-11-22',
      deliveryTime: '13:00'
    },
    delivery: {
      type: 'delivery',
      address: {
        street: '88 Avenue de la Plage',
        zipCode: '13008',
        city: 'Marseille',
        country: 'France'
      },
      zone: 'Marseille Centre',
      deliveryFee: 0
    },
    pricing: {
      subtotal: 290,
      deliveryFee: 0,
      discount: 29,
      total: 261
    },
    payment: {
      method: 'PayPal',
      status: 'paid',
      transactionId: 'PAYID-DEF456',
      paidAt: '2024-11-20T16:45:00Z'
    },
    status: 'completed',
    notes: 'Team building startup - 25 personnes',
    createdAt: '2024-11-20T16:40:00Z',
    timeline: [
      { status: 'Réservation créée', date: '2024-11-20T16:40:00Z' },
      { status: 'Paiement confirmé', date: '2024-11-20T16:45:00Z' },
      { status: 'En préparation', date: '2024-11-21T09:00:00Z' },
      { status: 'Livré', date: '2024-11-22T13:00:00Z' },
      { status: 'Retour effectué', date: '2024-11-22T20:00:00Z' },
      { status: 'Clôturé', date: '2024-11-23T10:00:00Z' }
    ]
  },
  {
    id: 'res_007',
    orderNumber: 'LOC-2024-007',
    customer: {
      id: 'cust_007',
      firstName: 'Camille',
      lastName: 'Bernard',
      email: 'camille.bernard@email.com',
      phone: '+33 7 98 76 54 32',
      type: 'particulier'
    },
    products: [
      {
        productId: 'prod_014',
        productName: 'Cornhole Géant',
        quantity: 1,
        duration: 3,
        unitPrice: 200
      },
      {
        productId: 'prod_015',
        productName: 'Pétanque Géante',
        quantity: 1,
        duration: 3,
        unitPrice: 130
      }
    ],
    dates: {
      start: '2024-11-25',
      end: '2024-11-27',
      deliveryTime: '10:00'
    },
    delivery: {
      type: 'delivery',
      address: {
        street: '5 Impasse des Lilas',
        zipCode: '13012',
        city: 'Marseille',
        country: 'France'
      },
      zone: 'Marseille Étendu',
      deliveryFee: 15
    },
    pricing: {
      subtotal: 330,
      deliveryFee: 15,
      discount: 0,
      total: 345
    },
    payment: {
      method: 'Stripe',
      status: 'paid',
      transactionId: 'ch_3Ghi789jkl012',
      paidAt: '2024-11-22T11:30:00Z'
    },
    status: 'confirmed',
    notes: 'Weekend famille - 15 personnes',
    createdAt: '2024-11-22T11:25:00Z',
    timeline: [
      { status: 'Réservation créée', date: '2024-11-22T11:25:00Z' },
      { status: 'Paiement confirmé', date: '2024-11-22T11:30:00Z' }
    ]
  },
  {
    id: 'res_008',
    orderNumber: 'LOC-2024-008',
    customer: {
      id: 'cust_008',
      firstName: 'Lucas',
      lastName: 'Garcia',
      email: 'lucas.garcia@company.com',
      phone: '+33 6 45 67 89 01',
      type: 'professionnel',
      company: 'Event Solutions'
    },
    products: [
      {
        productId: 'prod_008',
        productName: 'Table de Blackjack',
        quantity: 3,
        duration: 1,
        unitPrice: 200
      }
    ],
    dates: {
      start: '2024-11-30',
      end: '2024-11-30',
      deliveryTime: '18:30'
    },
    delivery: {
      type: 'delivery',
      address: {
        street: '30 Cours Mirabeau',
        zipCode: '13100',
        city: 'Aix-en-Provence',
        country: 'France'
      },
      zone: 'Aix-en-Provence',
      deliveryFee: 25
    },
    pricing: {
      subtotal: 600,
      deliveryFee: 25,
      discount: 62.5,
      total: 562.5
    },
    payment: {
      method: 'Virement',
      status: 'paid',
      transactionId: 'VIR-2024-002',
      paidAt: '2024-11-28T14:15:00Z'
    },
    status: 'preparing',
    notes: 'Soirée casino corporate - 150 personnes',
    createdAt: '2024-11-28T14:10:00Z',
    timeline: [
      { status: 'Réservation créée', date: '2024-11-28T14:10:00Z' },
      { status: 'Paiement confirmé', date: '2024-11-28T14:15:00Z' },
      { status: 'En préparation', date: '2024-11-29T09:00:00Z' }
    ]
  },
  {
    id: 'res_009',
    orderNumber: 'LOC-2024-009',
    customer: {
      id: 'cust_009',
      firstName: 'Emma',
      lastName: 'Leroy',
      email: 'emma.leroy@email.com',
      phone: '+33 7 23 45 67 89',
      type: 'particulier'
    },
    products: [
      {
        productId: 'prod_001',
        productName: 'Baby-foot géant 11vs11',
        quantity: 1,
        duration: 1,
        unitPrice: 450
      }
    ],
    dates: {
      start: '2024-12-01',
      end: '2024-12-01',
      deliveryTime: '15:00'
    },
    delivery: {
      type: 'delivery',
      address: {
        street: '18 Rue de la Paix',
        zipCode: '13003',
        city: 'Marseille',
        country: 'France'
      },
      zone: 'Marseille Centre',
      deliveryFee: 0
    },
    pricing: {
      subtotal: 450,
      deliveryFee: 0,
      discount: 0,
      total: 450
    },
    payment: {
      method: 'Stripe',
      status: 'pending',
      transactionId: null,
      paidAt: null
    },
    status: 'pending',
    notes: 'Anniversaire mariage - 60 personnes',
    createdAt: '2024-11-29T09:20:00Z',
    timeline: [
      { status: 'Réservation créée', date: '2024-11-29T09:20:00Z' }
    ]
  },
  {
    id: 'res_010',
    orderNumber: 'LOC-2024-010',
    customer: {
      id: 'cust_010',
      firstName: 'Nicolas',
      lastName: 'Simon',
      email: 'nicolas.simon@startup.fr',
      phone: '+33 6 78 90 12 34',
      type: 'professionnel',
      company: 'TechCorp'
    },
    products: [
      {
        productId: 'prod_003',
        productName: 'Pack Console Rétrogaming',
        quantity: 2,
        duration: 2,
        unitPrice: 320
      },
      {
        productId: 'prod_009',
        productName: 'Karaoké Professionnel',
        quantity: 1,
        duration: 2,
        unitPrice: 280
      }
    ],
    dates: {
      start: '2024-12-05',
      end: '2024-12-06',
      deliveryTime: '17:00'
    },
    delivery: {
      type: 'delivery',
      address: {
        street: '55 Avenue du Général de Gaulle',
        zipCode: '13004',
        city: 'Marseille',
        country: 'France'
      },
      zone: 'Marseille Centre',
      deliveryFee: 0
    },
    pricing: {
      subtotal: 920,
      deliveryFee: 0,
      discount: 92,
      total: 828
    },
    payment: {
      method: 'PayPal',
      status: 'paid',
      transactionId: 'PAYID-GHI789',
      paidAt: '2024-12-01T10:45:00Z'
    },
    status: 'confirmed',
    notes: 'Weekend team building - 40 personnes',
    createdAt: '2024-12-01T10:40:00Z',
    timeline: [
      { status: 'Réservation créée', date: '2024-12-01T10:40:00Z' },
      { status: 'Paiement confirmé', date: '2024-12-01T10:45:00Z' }
    ]
  },
  {
    id: 'res_011',
    orderNumber: 'LOC-2024-011',
    customer: {
      id: 'cust_011',
      firstName: 'Alexandre',
      lastName: 'Durand',
      email: 'alexandre.durand@email.com',
      phone: '+33 6 11 22 33 44',
      type: 'particulier'
    },
    products: [
      {
        productId: 'prod_002',
        productName: 'Table de Roulette Professionnelle',
        quantity: 1,
        duration: 1,
        unitPrice: 250
      }
    ],
    dates: {
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
      deliveryTime: '09:00'
    },
    delivery: {
      type: 'delivery',
      address: {
        street: '78 Rue Paradis',
        zipCode: '13006',
        city: 'Marseille',
        country: 'France'
      },
      zone: 'Marseille Centre',
      deliveryFee: 0
    },
    pricing: {
      subtotal: 250,
      deliveryFee: 0,
      discount: 0,
      total: 250
    },
    payment: {
      method: 'Stripe',
      status: 'paid',
      transactionId: 'ch_3New001',
      paidAt: new Date().toISOString()
    },
    status: 'confirmed',
    notes: 'Événement anniversaire',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    timeline: [
      { status: 'Réservation créée', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { status: 'Paiement confirmé', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: 'res_012',
    orderNumber: 'LOC-2024-012',
    customer: {
      id: 'cust_012',
      firstName: 'Laura',
      lastName: 'Petit',
      email: 'laura.petit@email.com',
      phone: '+33 6 22 33 44 55',
      type: 'particulier'
    },
    products: [
      {
        productId: 'prod_011',
        productName: 'Jeu de Fléchettes Géant',
        quantity: 2,
        duration: 1,
        unitPrice: 100
      },
      {
        productId: 'prod_012',
        productName: 'Mölkky Géant',
        quantity: 1,
        duration: 1,
        unitPrice: 90
      }
    ],
    dates: {
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
      deliveryTime: '11:30'
    },
    delivery: {
      type: 'delivery',
      address: {
        street: '15 Boulevard de la Plage',
        zipCode: '13008',
        city: 'Marseille',
        country: 'France'
      },
      zone: 'Marseille Centre',
      deliveryFee: 0
    },
    pricing: {
      subtotal: 290,
      deliveryFee: 0,
      discount: 0,
      total: 290
    },
    payment: {
      method: 'PayPal',
      status: 'paid',
      transactionId: 'PAYID-New002',
      paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    status: 'confirmed',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    timeline: [
      { status: 'Réservation créée', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { status: 'Paiement confirmé', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: 'res_013',
    orderNumber: 'LOC-2024-013',
    customer: {
      id: 'cust_013',
      firstName: 'Maxime',
      lastName: 'Roux',
      email: 'maxime.roux@company.fr',
      phone: '+33 6 33 44 55 66',
      type: 'professionnel',
      company: 'EventPro'
    },
    products: [
      {
        productId: 'prod_004',
        productName: 'Simulateur de Ski VR',
        quantity: 1,
        duration: 1,
        unitPrice: 600
      }
    ],
    dates: {
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
      deliveryTime: '14:00'
    },
    delivery: {
      type: 'delivery',
      address: {
        street: '32 Avenue de la Canebière',
        zipCode: '13001',
        city: 'Marseille',
        country: 'France'
      },
      zone: 'Marseille Centre',
      deliveryFee: 0
    },
    pricing: {
      subtotal: 600,
      deliveryFee: 0,
      discount: 60,
      total: 540
    },
    payment: {
      method: 'Virement',
      status: 'paid',
      transactionId: 'VIR-2024-003',
      paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    status: 'preparing',
    notes: 'Événement corporate',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    timeline: [
      { status: 'Réservation créée', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { status: 'Paiement confirmé', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { status: 'En préparation', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: 'res_014',
    orderNumber: 'LOC-2024-014',
    customer: {
      id: 'cust_014',
      firstName: 'Clara',
      lastName: 'Vincent',
      email: 'clara.vincent@email.com',
      phone: '+33 6 44 55 66 77',
      type: 'particulier'
    },
    products: [
      {
        productId: 'prod_006',
        productName: 'Ping Pong Géant',
        quantity: 1,
        duration: 1,
        unitPrice: 200
      }
    ],
    dates: {
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
      deliveryTime: '16:30'
    },
    delivery: {
      type: 'delivery',
      address: {
        street: '9 Rue de la République',
        zipCode: '13002',
        city: 'Marseille',
        country: 'France'
      },
      zone: 'Marseille Centre',
      deliveryFee: 0
    },
    pricing: {
      subtotal: 200,
      deliveryFee: 0,
      discount: 0,
      total: 200
    },
    payment: {
      method: 'Stripe',
      status: 'paid',
      transactionId: 'ch_3New003',
      paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    status: 'confirmed',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    timeline: [
      { status: 'Réservation créée', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { status: 'Paiement confirmé', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
    ]
  },
  {
    id: 'res_015',
    orderNumber: 'LOC-2024-015',
    customer: {
      id: 'cust_015',
      firstName: 'Julien',
      lastName: 'Lefebvre',
      email: 'julien.lefebvre@email.com',
      phone: '+33 6 55 66 77 88',
      type: 'particulier'
    },
    products: [
      {
        productId: 'prod_001',
        productName: 'Baby-foot géant 11vs11',
        quantity: 1,
        duration: 1,
        unitPrice: 450
      },
      {
        productId: 'prod_005',
        productName: 'Jenga XXL 1.5m',
        quantity: 1,
        duration: 1,
        unitPrice: 140
      }
    ],
    dates: {
      start: (() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      })(),
      end: (() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      })(),
      deliveryTime: '10:00'
    },
    delivery: {
      type: 'delivery',
      address: {
        street: '45 Rue Saint-Ferréol',
        zipCode: '13001',
        city: 'Marseille',
        country: 'France'
      },
      zone: 'Marseille Centre',
      deliveryFee: 0
    },
    pricing: {
      subtotal: 590,
      deliveryFee: 0,
      discount: 0,
      total: 590
    },
    payment: {
      method: 'Stripe',
      status: 'paid',
      transactionId: 'ch_3New004',
      paidAt: new Date().toISOString()
    },
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    timeline: [
      { status: 'Réservation créée', date: new Date().toISOString() },
      { status: 'Paiement confirmé', date: new Date().toISOString() }
    ]
  },
  {
    id: 'res_016',
    orderNumber: 'LOC-2024-016',
    customer: {
      id: 'cust_016',
      firstName: 'Sarah',
      lastName: 'Girard',
      email: 'sarah.girard@email.com',
      phone: '+33 6 66 77 88 99',
      type: 'particulier'
    },
    products: [
      {
        productId: 'prod_009',
        productName: 'Karaoké Professionnel',
        quantity: 1,
        duration: 1,
        unitPrice: 150
      }
    ],
    dates: {
      start: (() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      })(),
      end: (() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      })(),
      deliveryTime: '13:00'
    },
    delivery: {
      type: 'delivery',
      address: {
        street: '22 Cours Julien',
        zipCode: '13006',
        city: 'Marseille',
        country: 'France'
      },
      zone: 'Marseille Centre',
      deliveryFee: 0
    },
    pricing: {
      subtotal: 150,
      deliveryFee: 0,
      discount: 0,
      total: 150
    },
    payment: {
      method: 'PayPal',
      status: 'paid',
      transactionId: 'PAYID-New005',
      paidAt: new Date().toISOString()
    },
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    timeline: [
      { status: 'Réservation créée', date: new Date().toISOString() },
      { status: 'Paiement confirmé', date: new Date().toISOString() }
    ]
  },
  {
    id: 'res_017',
    orderNumber: 'LOC-2024-017',
    customer: {
      id: 'cust_017',
      firstName: 'Antoine',
      lastName: 'Moreau',
      email: 'antoine.moreau@company.com',
      phone: '+33 6 77 88 99 00',
      type: 'professionnel',
      company: 'Business Events'
    },
    products: [
      {
        productId: 'prod_002',
        productName: 'Table de Roulette Professionnelle',
        quantity: 2,
        duration: 1,
        unitPrice: 250
      }
    ],
    dates: {
      start: (() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      })(),
      end: (() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      })(),
      deliveryTime: '15:30'
    },
    delivery: {
      type: 'delivery',
      address: {
        street: '67 Rue de Rome',
        zipCode: '13006',
        city: 'Marseille',
        country: 'France'
      },
      zone: 'Marseille Centre',
      deliveryFee: 0
    },
    pricing: {
      subtotal: 500,
      deliveryFee: 0,
      discount: 50,
      total: 450
    },
    payment: {
      method: 'Virement',
      status: 'paid',
      transactionId: 'VIR-2024-004',
      paidAt: new Date().toISOString()
    },
    status: 'preparing',
    notes: 'Événement entreprise',
    createdAt: new Date().toISOString(),
    timeline: [
      { status: 'Réservation créée', date: new Date().toISOString() },
      { status: 'Paiement confirmé', date: new Date().toISOString() }
    ]
  },
  {
    id: 'res_018',
    orderNumber: 'LOC-2024-018',
    customer: {
      id: 'cust_001',
      firstName: 'Sophie',
      lastName: 'Martin',
      email: 'sophie.martin@email.com',
      phone: '+33 6 12 34 56 78',
      type: 'particulier'
    },
    products: [
      {
        productId: 'prod_001',
        productName: 'Baby-foot géant 11vs11',
        quantity: 1,
        duration: 3,
        unitPrice: 800
      }
    ],
    dates: {
      start: (() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      })(),
      end: (() => {
        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 3);
        return dayAfter.toISOString().split('T')[0];
      })(),
      deliveryTime: '09:00'
    },
    delivery: {
      type: 'delivery',
      address: {
        street: '25 Avenue du Prado',
        zipCode: '13006',
        city: 'Marseille',
        country: 'France'
      },
      zone: 'Marseille Centre',
      deliveryFee: 0
    },
    pricing: {
      subtotal: 800,
      deliveryFee: 0,
      discount: 0,
      total: 800
    },
    payment: {
      method: 'Stripe',
      status: 'paid',
      transactionId: 'ch_3New006',
      paidAt: new Date().toISOString()
    },
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    timeline: [
      { status: 'Réservation créée', date: new Date().toISOString() },
      { status: 'Paiement confirmé', date: new Date().toISOString() }
    ]
  }
];

import { DeliveryTask } from '../../types';

export const fakeDeliveryTasks: DeliveryTask[] = [
  {
    id: 'task_001',
    reservationId: 'res_001',
    orderNumber: 'LOC-2024-001',
    type: 'delivery',
    scheduledDate: '2024-11-15',
    scheduledTime: '10:00',
    vehicleId: 'veh_001',
    technicianId: 'tech_001',
    status: 'scheduled',
    customer: {
      firstName: 'Sophie',
      lastName: 'Martin',
      phone: '+33 6 12 34 56 78',
      email: 'sophie.martin@email.com'
    },
    address: {
      street: '25 Avenue du Prado',
      city: 'Marseille',
      postalCode: '13006',
      country: 'France'
    },
    products: [
      {
        productId: 'prod_001',
        productName: 'Baby-foot géant 11vs11',
        quantity: 1
      },
      {
        productId: 'prod_005',
        productName: 'Jenga XXL 1.5m',
        quantity: 2
      }
    ],
    accessConstraints: {
      floor: 2,
      hasElevator: true,
      accessCode: 'A1234',
      parkingInfo: 'Parking souterrain - Place 12',
      specialInstructions: 'Sonner à l\'appartement 2B. Livraison dans le salon.',
      contactOnSite: 'Sophie Martin - +33 6 12 34 56 78'
    },
    notes: 'Événement anniversaire 40 ans - 50 personnes attendues'
  },
  {
    id: 'task_002',
    reservationId: 'res_001',
    orderNumber: 'LOC-2024-001',
    type: 'pickup',
    scheduledDate: '2024-11-17',
    scheduledTime: '18:00',
    vehicleId: 'veh_001',
    technicianId: 'tech_001',
    status: 'scheduled',
    customer: {
      firstName: 'Sophie',
      lastName: 'Martin',
      phone: '+33 6 12 34 56 78',
      email: 'sophie.martin@email.com'
    },
    address: {
      street: '25 Avenue du Prado',
      city: 'Marseille',
      postalCode: '13006',
      country: 'France'
    },
    products: [
      {
        productId: 'prod_001',
        productName: 'Baby-foot géant 11vs11',
        quantity: 1
      },
      {
        productId: 'prod_005',
        productName: 'Jenga XXL 1.5m',
        quantity: 2
      }
    ],
    accessConstraints: {
      floor: 2,
      hasElevator: true,
      accessCode: 'A1234',
      parkingInfo: 'Parking souterrain - Place 12'
    }
  },
  {
    id: 'task_003',
    reservationId: 'res_004',
    orderNumber: 'LOC-2024-004',
    type: 'delivery',
    scheduledDate: '2024-11-12',
    scheduledTime: '16:00',
    vehicleId: 'veh_002',
    technicianId: 'tech_002',
    status: 'in_progress',
    startedAt: '2024-11-12T15:45:00Z',
    customer: {
      firstName: 'Pierre',
      lastName: 'Moreau',
      phone: '+33 6 23 45 67 89',
      email: 'pierre.moreau@company.fr'
    },
    address: {
      street: '42 Boulevard Longchamp',
      city: 'Marseille',
      postalCode: '13001',
      country: 'France'
    },
    products: [
      {
        productId: 'prod_006',
        productName: 'Ping Pong Géant',
        quantity: 1
      },
      {
        productId: 'prod_007',
        productName: 'Machine à Bulles Géante',
        quantity: 1
      },
      {
        productId: 'prod_009',
        productName: 'Karaoké Professionnel',
        quantity: 1
      }
    ],
    accessConstraints: {
      floor: 0,
      hasElevator: false,
      parkingInfo: 'Parking privé disponible',
      specialInstructions: 'Livraison dans la cour intérieure',
      contactOnSite: 'Pierre Moreau - +33 6 23 45 67 89'
    },
    notes: 'Événement corporate - 100 personnes'
  },
  {
    id: 'task_004',
    reservationId: 'res_005',
    orderNumber: 'LOC-2024-005',
    type: 'delivery',
    scheduledDate: '2024-11-18',
    scheduledTime: '19:00',
    vehicleId: 'veh_003',
    technicianId: 'tech_003',
    status: 'completed',
    startedAt: '2024-11-18T18:45:00Z',
    completedAt: '2024-11-18T19:30:00Z',
    customer: {
      firstName: 'Julie',
      lastName: 'Rousseau',
      phone: '+33 7 12 34 56 78',
      email: 'julie.rousseau@email.com'
    },
    address: {
      street: '12 Rue de la République',
      city: 'Marseille',
      postalCode: '13002',
      country: 'France'
    },
    products: [
      {
        productId: 'prod_010',
        productName: 'Poker Table Géante',
        quantity: 1
      }
    ],
    accessConstraints: {
      floor: 3,
      hasElevator: true,
      specialInstructions: 'Appartement au 3ème étage, sonner à l\'interphone'
    },
    notes: 'Soirée poker entre amis - 12 personnes'
  },
  {
    id: 'task_005',
    reservationId: 'res_005',
    orderNumber: 'LOC-2024-005',
    type: 'pickup',
    scheduledDate: '2024-11-19',
    scheduledTime: '20:00',
    vehicleId: 'veh_003',
    technicianId: 'tech_003',
    status: 'scheduled',
    customer: {
      firstName: 'Julie',
      lastName: 'Rousseau',
      phone: '+33 7 12 34 56 78',
      email: 'julie.rousseau@email.com'
    },
    address: {
      street: '12 Rue de la République',
      city: 'Marseille',
      postalCode: '13002',
      country: 'France'
    },
    products: [
      {
        productId: 'prod_010',
        productName: 'Poker Table Géante',
        quantity: 1
      }
    ],
    accessConstraints: {
      floor: 3,
      hasElevator: true
    }
  },
  {
    id: 'task_006',
    reservationId: 'res_007',
    orderNumber: 'LOC-2024-007',
    type: 'delivery',
    scheduledDate: '2024-11-25',
    scheduledTime: '10:00',
    vehicleId: 'veh_004',
    technicianId: 'tech_004',
    status: 'scheduled',
    customer: {
      firstName: 'Camille',
      lastName: 'Bernard',
      phone: '+33 7 98 76 54 32',
      email: 'camille.bernard@email.com'
    },
    address: {
      street: '5 Impasse des Lilas',
      city: 'Marseille',
      postalCode: '13012',
      country: 'France'
    },
    products: [
      {
        productId: 'prod_014',
        productName: 'Cornhole Géant',
        quantity: 1
      },
      {
        productId: 'prod_015',
        productName: 'Pétanque Géante',
        quantity: 1
      }
    ],
    accessConstraints: {
      floor: 0,
      hasElevator: false,
      parkingInfo: 'Parking devant la maison',
      specialInstructions: 'Livraison dans le jardin',
      contactOnSite: 'Camille Bernard - +33 7 98 76 54 32'
    },
    notes: 'Weekend famille - 15 personnes'
  },
  {
    id: 'task_007',
    reservationId: 'res_008',
    orderNumber: 'LOC-2024-008',
    type: 'delivery',
    scheduledDate: '2024-11-30',
    scheduledTime: '18:30',
    vehicleId: 'veh_001',
    technicianId: 'tech_001',
    status: 'scheduled',
    customer: {
      firstName: 'Lucas',
      lastName: 'Garcia',
      phone: '+33 6 45 67 89 01',
      email: 'lucas.garcia@company.com'
    },
    address: {
      street: '30 Cours Mirabeau',
      city: 'Aix-en-Provence',
      postalCode: '13100',
      country: 'France'
    },
    products: [
      {
        productId: 'prod_008',
        productName: 'Table de Blackjack',
        quantity: 3
      }
    ],
    accessConstraints: {
      floor: 1,
      hasElevator: true,
      accessCode: 'B5678',
      parkingInfo: 'Parking public à proximité',
      specialInstructions: 'Salle de réception au 1er étage',
      contactOnSite: 'Lucas Garcia - +33 6 45 67 89 01'
    },
    notes: 'Soirée casino corporate - 150 personnes'
  },
  {
    id: 'task_008',
    reservationId: 'res_010',
    orderNumber: 'LOC-2024-010',
    type: 'delivery',
    scheduledDate: '2024-12-05',
    scheduledTime: '17:00',
    vehicleId: 'veh_002',
    technicianId: 'tech_002',
    status: 'scheduled',
    customer: {
      firstName: 'Nicolas',
      lastName: 'Simon',
      phone: '+33 6 78 90 12 34',
      email: 'nicolas.simon@startup.fr'
    },
    address: {
      street: '55 Avenue du Général de Gaulle',
      city: 'Marseille',
      postalCode: '13004',
      country: 'France'
    },
    products: [
      {
        productId: 'prod_003',
        productName: 'Pack Console Rétrogaming',
        quantity: 2
      },
      {
        productId: 'prod_009',
        productName: 'Karaoké Professionnel',
        quantity: 1
      }
    ],
    accessConstraints: {
      floor: 0,
      hasElevator: false,
      parkingInfo: 'Parking privé',
      specialInstructions: 'Livraison dans la salle de réunion',
      contactOnSite: 'Nicolas Simon - +33 6 78 90 12 34'
    },
    notes: 'Weekend team building - 40 personnes'
  },
  {
    id: 'task_009',
    reservationId: 'res_011',
    orderNumber: 'LOC-2024-011',
    type: 'delivery',
    scheduledDate: new Date().toISOString().split('T')[0], // Aujourd'hui
    scheduledTime: '09:00',
    vehicleId: 'veh_001',
    technicianId: 'tech_001',
    status: 'scheduled',
    customer: {
      firstName: 'Alexandre',
      lastName: 'Durand',
      phone: '+33 6 11 22 33 44',
      email: 'alexandre.durand@email.com'
    },
    address: {
      street: '78 Rue Paradis',
      city: 'Marseille',
      postalCode: '13006',
      country: 'France'
    },
    products: [
      {
        productId: 'prod_002',
        productName: 'Table de Roulette Professionnelle',
        quantity: 1
      }
    ],
    accessConstraints: {
      floor: 1,
      hasElevator: true,
      parkingInfo: 'Parking public'
    },
    notes: 'Événement anniversaire'
  },
  {
    id: 'task_010',
    reservationId: 'res_012',
    orderNumber: 'LOC-2024-012',
    type: 'delivery',
    scheduledDate: new Date().toISOString().split('T')[0], // Aujourd'hui
    scheduledTime: '11:30',
    vehicleId: 'veh_002',
    technicianId: 'tech_002',
    status: 'scheduled',
    customer: {
      firstName: 'Laura',
      lastName: 'Petit',
      phone: '+33 6 22 33 44 55',
      email: 'laura.petit@email.com'
    },
    address: {
      street: '15 Boulevard de la Plage',
      city: 'Marseille',
      postalCode: '13008',
      country: 'France'
    },
    products: [
      {
        productId: 'prod_011',
        productName: 'Jeu de Fléchettes Géant',
        quantity: 2
      },
      {
        productId: 'prod_012',
        productName: 'Mölkky Géant',
        quantity: 1
      }
    ],
    accessConstraints: {
      floor: 0,
      hasElevator: false,
      parkingInfo: 'Parking privé'
    }
  },
  {
    id: 'task_011',
    reservationId: 'res_013',
    orderNumber: 'LOC-2024-013',
    type: 'delivery',
    scheduledDate: new Date().toISOString().split('T')[0], // Aujourd'hui
    scheduledTime: '14:00',
    vehicleId: 'veh_003',
    technicianId: 'tech_003',
    status: 'scheduled',
    customer: {
      firstName: 'Maxime',
      lastName: 'Roux',
      phone: '+33 6 33 44 55 66',
      email: 'maxime.roux@company.fr'
    },
    address: {
      street: '32 Avenue de la Canebière',
      city: 'Marseille',
      postalCode: '13001',
      country: 'France'
    },
    products: [
      {
        productId: 'prod_004',
        productName: 'Simulateur de Ski VR',
        quantity: 1
      }
    ],
    accessConstraints: {
      floor: 2,
      hasElevator: true,
      accessCode: 'C9876',
      parkingInfo: 'Parking souterrain'
    },
    notes: 'Événement corporate'
  },
  {
    id: 'task_012',
    reservationId: 'res_014',
    orderNumber: 'LOC-2024-014',
    type: 'delivery',
    scheduledDate: new Date().toISOString().split('T')[0], // Aujourd'hui
    scheduledTime: '16:30',
    vehicleId: 'veh_004',
    technicianId: 'tech_004',
    status: 'scheduled',
    customer: {
      firstName: 'Clara',
      lastName: 'Vincent',
      phone: '+33 6 44 55 66 77',
      email: 'clara.vincent@email.com'
    },
    address: {
      street: '9 Rue de la République',
      city: 'Marseille',
      postalCode: '13002',
      country: 'France'
    },
    products: [
      {
        productId: 'prod_006',
        productName: 'Ping Pong Géant',
        quantity: 1
      }
    ],
    accessConstraints: {
      floor: 0,
      hasElevator: false
    }
  },
  {
    id: 'task_013',
    reservationId: 'res_015',
    orderNumber: 'LOC-2024-015',
    type: 'delivery',
    scheduledDate: (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    })(),
    scheduledTime: '10:00',
    vehicleId: 'veh_001',
    technicianId: 'tech_001',
    status: 'scheduled',
    customer: {
      firstName: 'Julien',
      lastName: 'Lefebvre',
      phone: '+33 6 55 66 77 88',
      email: 'julien.lefebvre@email.com'
    },
    address: {
      street: '45 Rue Saint-Ferréol',
      city: 'Marseille',
      postalCode: '13001',
      country: 'France'
    },
    products: [
      {
        productId: 'prod_001',
        productName: 'Baby-foot géant 11vs11',
        quantity: 1
      },
      {
        productId: 'prod_005',
        productName: 'Jenga XXL 1.5m',
        quantity: 1
      }
    ],
    accessConstraints: {
      floor: 1,
      hasElevator: true
    }
  },
  {
    id: 'task_014',
    reservationId: 'res_016',
    orderNumber: 'LOC-2024-016',
    type: 'delivery',
    scheduledDate: (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    })(),
    scheduledTime: '13:00',
    vehicleId: 'veh_002',
    technicianId: 'tech_002',
    status: 'scheduled',
    customer: {
      firstName: 'Sarah',
      lastName: 'Girard',
      phone: '+33 6 66 77 88 99',
      email: 'sarah.girard@email.com'
    },
    address: {
      street: '22 Cours Julien',
      city: 'Marseille',
      postalCode: '13006',
      country: 'France'
    },
    products: [
      {
        productId: 'prod_009',
        productName: 'Karaoké Professionnel',
        quantity: 1
      }
    ],
    accessConstraints: {
      floor: 0,
      hasElevator: false,
      parkingInfo: 'Parking public'
    }
  },
  {
    id: 'task_015',
    reservationId: 'res_017',
    orderNumber: 'LOC-2024-017',
    type: 'delivery',
    scheduledDate: (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    })(),
    scheduledTime: '15:30',
    vehicleId: 'veh_003',
    technicianId: 'tech_003',
    status: 'scheduled',
    customer: {
      firstName: 'Antoine',
      lastName: 'Moreau',
      phone: '+33 6 77 88 99 00',
      email: 'antoine.moreau@company.com'
    },
    address: {
      street: '67 Rue de Rome',
      city: 'Marseille',
      postalCode: '13006',
      country: 'France'
    },
    products: [
      {
        productId: 'prod_002',
        productName: 'Table de Roulette Professionnelle',
        quantity: 2
      }
    ],
    accessConstraints: {
      floor: 0,
      hasElevator: false
    },
    notes: 'Événement entreprise'
  },
  {
    id: 'task_016',
    reservationId: 'res_018',
    orderNumber: 'LOC-2024-018',
    type: 'pickup',
    scheduledDate: (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    })(),
    scheduledTime: '18:00',
    vehicleId: 'veh_001',
    technicianId: 'tech_001',
    status: 'scheduled',
    customer: {
      firstName: 'Sophie',
      lastName: 'Martin',
      phone: '+33 6 12 34 56 78',
      email: 'sophie.martin@email.com'
    },
    address: {
      street: '25 Avenue du Prado',
      city: 'Marseille',
      postalCode: '13006',
      country: 'France'
    },
    products: [
      {
        productId: 'prod_001',
        productName: 'Baby-foot géant 11vs11',
        quantity: 1
      }
    ],
    accessConstraints: {
      floor: 2,
      hasElevator: true,
      accessCode: 'A1234'
    }
  }
];


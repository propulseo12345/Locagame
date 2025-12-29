import { Vehicle } from '../../types';

export const fakeVehicles: Vehicle[] = [
  {
    id: 'veh_001',
    name: 'Camion 1',
    type: 'truck',
    capacity: 50, // m³
    licensePlate: 'AB-123-CD',
    isActive: true
  },
  {
    id: 'veh_002',
    name: 'Camion 2',
    type: 'truck',
    capacity: 50,
    licensePlate: 'EF-456-GH',
    isActive: true
  },
  {
    id: 'veh_003',
    name: 'Utilitaire 1',
    type: 'van',
    capacity: 20,
    licensePlate: 'IJ-789-KL',
    isActive: true
  },
  {
    id: 'veh_004',
    name: 'Utilitaire 2',
    type: 'van',
    capacity: 20,
    licensePlate: 'MN-012-OP',
    isActive: true
  }
];


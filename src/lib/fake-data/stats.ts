export const fakeDashboardStats = {
  revenue: {
    today: 1240,
    week: 8950,
    month: 34600,
    year: 287500,
    evolution: {
      week: +12.5, // %
      month: +8.3,
      year: +23.7
    },
    byMonth: [
      { month: 'Jan', amount: 18500 },
      { month: 'Fév', amount: 22300 },
      { month: 'Mar', amount: 19800 },
      { month: 'Avr', amount: 28400 },
      { month: 'Mai', amount: 32100 },
      { month: 'Juin', amount: 26700 },
      { month: 'Juil', amount: 35200 },
      { month: 'Août', amount: 33500 },
      { month: 'Sep', amount: 29400 },
      { month: 'Oct', amount: 38100 },
      { month: 'Nov', amount: 42500 },
      { month: 'Déc', amount: 40300 }
    ]
  },
  reservations: {
    today: 3,
    week: 18,
    month: 67,
    year: 542,
    byStatus: {
      pending: 5,
      confirmed: 12,
      preparing: 8,
      delivered: 3,
      completed: 489,
      cancelled: 25
    }
  },
  products: {
    total: 87,
    active: 79,
    inactive: 5,
    maintenance: 3,
    mostRented: [
      { id: 'prod_005', name: 'Jenga XXL', rentals: 203 },
      { id: 'prod_003', name: 'Pack Rétrogaming', rentals: 134 },
      { id: 'prod_002', name: 'Roulette Pro', rentals: 89 }
    ]
  },
  customers: {
    total: 287,
    new: 23,
    vip: 45,
    inactive: 67
  },
  occupancyRate: 68, // %
  averageBasket: 312 // €
};

import { supabase } from '../lib/supabase';

export interface DashboardStats {
  revenue: {
    today: number;
    week: number;
    month: number;
    byMonth: Array<{ month: string; amount: number }>;
  };
  reservations: {
    total: number;
    pending: number;
    confirmed: number;
    delivered: number;
  };
  products: {
    total: number;
    available: number;
    reserved: number;
    mostRented: Array<{ id: string; name: string; rentals: number }>;
  };
  customers: {
    total: number;
    new_this_month: number;
  };
}

export class StatsService {
  /**
   * Récupère les statistiques du dashboard admin
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Récupérer les statistiques des réservations
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select('status, total, created_at');

      if (reservationsError) {
        console.error('Error loading reservations:', reservationsError);
      }

      // Récupérer les produits
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, is_active');

      if (productsError) {
        console.error('Error loading products:', productsError);
      }

      // Récupérer les clients
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('id, created_at');

      if (customersError) {
        console.error('Error loading customers:', customersError);
      }

      // Calculer les dates
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Calculer le revenu
      const revenueToday = (reservationsData || [])
        .filter((r) => new Date(r.created_at) >= startOfDay)
        .reduce((sum, r) => sum + (r.total || 0), 0);

      const revenueWeek = (reservationsData || [])
        .filter((r) => new Date(r.created_at) >= startOfWeek)
        .reduce((sum, r) => sum + (r.total || 0), 0);

      const revenueMonth = (reservationsData || [])
        .filter((r) => new Date(r.created_at) >= startOfMonth)
        .reduce((sum, r) => sum + (r.total || 0), 0);

      // Compter les réservations par statut
      const reservationsTotal = reservationsData?.length || 0;
      const reservationsPending = reservationsData?.filter((r) => r.status === 'pending').length || 0;
      const reservationsConfirmed = reservationsData?.filter((r) => r.status === 'confirmed').length || 0;
      const reservationsDelivered = reservationsData?.filter((r) => r.status === 'delivered').length || 0;

      // Compter les produits
      const productsTotal = productsData?.length || 0;
      const productsAvailable = productsData?.filter((p) => p.is_active).length || 0;

      // Compter les clients
      const customersTotal = customersData?.length || 0;
      const customersNewThisMonth = customersData?.filter(
        (c) => new Date(c.created_at) >= startOfMonth
      ).length || 0;

      // Calculer le revenu par mois (12 derniers mois)
      const byMonth: Array<{ month: string; amount: number }> = [];
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
        
        const monthRevenue = (reservationsData || [])
          .filter((r) => {
            const rDate = new Date(r.created_at);
            return rDate >= monthStart && rDate <= monthEnd;
          })
          .reduce((sum, r) => sum + (r.total || 0), 0);
        
        byMonth.push({
          month: monthNames[monthDate.getMonth()],
          amount: monthRevenue,
        });
      }

      return {
        revenue: {
          today: revenueToday,
          week: revenueWeek,
          month: revenueMonth,
          byMonth,
        },
        reservations: {
          total: reservationsTotal,
          pending: reservationsPending,
          confirmed: reservationsConfirmed,
          delivered: reservationsDelivered,
        },
        products: {
          total: productsTotal,
          available: productsAvailable,
          reserved: 0, // TODO: calculer depuis product_availability
          mostRented: [], // TODO: calculer depuis les réservations
        },
        customers: {
          total: customersTotal,
          new_this_month: customersNewThisMonth,
        },
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques d'un client
   */
  static async getCustomerStats(customerId: string): Promise<{
    total_reservations: number;
    total_spent: number;
    loyalty_points: number;
    favorite_categories: string[];
  }> {
    try {
      // Récupérer les réservations du client
      const { data: reservationsData } = await supabase
        .from('reservations')
        .select('total, status')
        .eq('customer_id', customerId);

      // Récupérer le profil client
      const { data: customerData } = await supabase
        .from('customers')
        .select('loyalty_points')
        .eq('id', customerId)
        .single();

      // Récupérer les favoris pour déterminer les catégories préférées
      const { data: favoritesData } = await supabase
        .from('customer_favorites')
        .select('product:products(category:categories(name))')
        .eq('customer_id', customerId);

      const totalReservations = reservationsData?.length || 0;
      const totalSpent = reservationsData?.reduce((sum, r) => sum + (r.total || 0), 0) || 0;
      const loyaltyPoints = customerData?.loyalty_points || 0;

      // Compter les catégories favorites
      const categoryCounts: Record<string, number> = {};
      favoritesData?.forEach((fav: any) => {
        const categoryName = fav.product?.category?.name;
        if (categoryName) {
          categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
        }
      });

      const favoriteCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name);

      return {
        total_reservations: totalReservations,
        total_spent: totalSpent,
        loyalty_points: loyaltyPoints,
        favorite_categories: favoriteCategories,
      };
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques d'un technicien
   */
  static async getTechnicianStats(technicianId: string): Promise<{
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    completion_rate: number;
  }> {
    try {
      const { data: tasksData } = await supabase
        .from('delivery_tasks')
        .select('status')
        .eq('technician_id', technicianId);

      const totalTasks = tasksData?.length || 0;
      const completedTasks = tasksData?.filter((t) => t.status === 'completed').length || 0;
      const pendingTasks = tasksData?.filter((t) => t.status === 'scheduled' || t.status === 'in_progress').length || 0;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return {
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        pending_tasks: pendingTasks,
        completion_rate: Math.round(completionRate),
      };
    } catch (error) {
      console.error('Error fetching technician stats:', error);
      throw error;
    }
  }
}

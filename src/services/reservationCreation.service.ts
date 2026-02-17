import { supabase } from '../lib/supabase';

interface CreateReservationData {
  customer_id: string;
  start_date: string;
  end_date: string;
  delivery_time?: string;
  delivery_type: 'delivery' | 'pickup';
  delivery_address_id?: string;
  pickup_time?: string;
  return_time?: string;
  pickup_slot?: string;
  zone_id?: string;
  event_type?: string;
  items: Array<{
    product_id: string;
    quantity: number;
    duration_days: number;
    unit_price: number;
    subtotal: number;
  }>;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  deposit?: number;
  total: number;
  notes?: string;
  recipient_data?: Record<string, unknown> | null;
  event_details?: Record<string, unknown> | null;
  cgv_accepted?: boolean;
  newsletter_accepted?: boolean;
  is_business?: boolean;
  billing_company_name?: string;
  billing_vat_number?: string;
  billing_address_line1?: string;
  billing_address_line2?: string;
  billing_postal_code?: string;
  billing_city?: string;
  billing_country?: string;
  start_slot?: 'AM' | 'PM';
  end_slot?: 'AM' | 'PM';
  delivery_is_mandatory?: boolean;
  pickup_is_mandatory?: boolean;
  pricing_breakdown?: object;
}

async function createDeliveryTasks(
  reservation: any,
  orderData: CreateReservationData
): Promise<void> {
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', orderData.customer_id)
    .single();

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .in('id', orderData.items.map(i => i.product_id));

  if (orderData.delivery_type === 'delivery' && orderData.delivery_address_id) {
    const { data: address } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', orderData.delivery_address_id)
      .single();

    await supabase.from('delivery_tasks').insert({
      reservation_id: reservation.id,
      order_number: `ORD-${reservation.id.substring(0, 8)}-DELIVERY`,
      type: 'delivery',
      scheduled_date: orderData.start_date,
      scheduled_time: orderData.delivery_time || '09:00',
      status: 'scheduled',
      customer_data: customer,
      address_data: address,
      products_data: products,
    });

    await supabase.from('delivery_tasks').insert({
      reservation_id: reservation.id,
      order_number: `ORD-${reservation.id.substring(0, 8)}-PICKUP`,
      type: 'pickup',
      scheduled_date: orderData.end_date,
      scheduled_time: orderData.delivery_time || '09:00',
      status: 'scheduled',
      customer_data: customer,
      address_data: address,
      products_data: products,
    });
  } else if (orderData.delivery_type === 'pickup') {
    const warehouseAddress = {
      name: 'Entrepôt LOCAGAME',
      street: 'Zone Industrielle des Paluds',
      city: '13400 Aubagne',
    };

    await supabase.from('delivery_tasks').insert({
      reservation_id: reservation.id,
      order_number: `ORD-${reservation.id.substring(0, 8)}-CLIENT-PICKUP`,
      type: 'client_pickup',
      scheduled_date: orderData.start_date,
      scheduled_time: orderData.pickup_time || '09:00',
      status: 'scheduled',
      customer_data: customer,
      address_data: warehouseAddress,
      products_data: products,
      notes: "Retrait client à l'entrepôt",
    });

    await supabase.from('delivery_tasks').insert({
      reservation_id: reservation.id,
      order_number: `ORD-${reservation.id.substring(0, 8)}-CLIENT-RETURN`,
      type: 'client_return',
      scheduled_date: orderData.end_date,
      scheduled_time: orderData.return_time || '09:00',
      status: 'scheduled',
      customer_data: customer,
      address_data: warehouseAddress,
      products_data: products,
      notes: "Retour client à l'entrepôt",
    });
  }
}

export async function createReservation(orderData: CreateReservationData): Promise<any> {
  try {
    // 1. Créer la réservation principale
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .insert({
        customer_id: orderData.customer_id,
        start_date: orderData.start_date,
        end_date: orderData.end_date,
        delivery_time: orderData.delivery_time,
        delivery_type: orderData.delivery_type,
        delivery_address_id: orderData.delivery_address_id,
        pickup_time: orderData.pickup_time,
        return_time: orderData.return_time,
        pickup_slot: orderData.pickup_slot,
        zone_id: orderData.zone_id,
        event_type: orderData.event_type,
        notes: orderData.notes,
        subtotal: orderData.subtotal,
        delivery_fee: orderData.delivery_fee,
        discount: orderData.discount,
        deposit_amount: orderData.deposit || 0,
        total: orderData.total,
        status: 'pending',
        recipient_data: orderData.recipient_data,
        event_details: orderData.event_details,
        cgv_accepted: orderData.cgv_accepted ?? false,
        newsletter_accepted: orderData.newsletter_accepted ?? false,
        is_business: orderData.is_business ?? false,
        billing_company_name: orderData.billing_company_name,
        billing_vat_number: orderData.billing_vat_number,
        billing_address_line1: orderData.billing_address_line1,
        billing_address_line2: orderData.billing_address_line2,
        billing_postal_code: orderData.billing_postal_code,
        billing_city: orderData.billing_city,
        billing_country: orderData.billing_country,
        start_slot: orderData.start_slot ?? 'AM',
        end_slot: orderData.end_slot ?? 'AM',
        delivery_is_mandatory: orderData.delivery_is_mandatory ?? false,
        pickup_is_mandatory: orderData.pickup_is_mandatory ?? false,
        pricing_breakdown: orderData.pricing_breakdown,
      })
      .select('*')
      .single();

    if (reservationError) {
      console.error('Error creating reservation:', reservationError);
      throw reservationError;
    }

    // 2. Créer les items de réservation
    const itemsToInsert = orderData.items.map(item => ({
      reservation_id: reservation.id,
      product_id: item.product_id,
      quantity: item.quantity,
      duration_days: item.duration_days,
      unit_price: item.unit_price,
      subtotal: item.subtotal,
    }));

    const { error: itemsError } = await supabase
      .from('reservation_items')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error('Error creating reservation items:', itemsError);
      await supabase.from('reservations').delete().eq('id', reservation.id);
      throw itemsError;
    }

    // 3. Créer les tâches de livraison (non-bloquant)
    try {
      await createDeliveryTasks(reservation, orderData);
    } catch (taskError) {
      console.error('Erreur création tâche (non-bloquant):', taskError);
    }

    // 4. Retourner la réservation complète
    const { data: fullReservation } = await supabase
      .from('reservations')
      .select('*, customer:customers(*), reservation_items:reservation_items(*)')
      .eq('id', reservation.id)
      .single();

    return fullReservation;
  } catch (error) {
    console.error('Error in createReservation:', error);
    throw error;
  }
}

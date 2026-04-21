import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { reservationConfirmationTemplate } from "../_shared/email-templates.ts";

// CORS restreint — les webhooks Stripe sont server-to-server (pas affectés par CORS)
const ALLOWED_ORIGIN = Deno.env.get("SITE_URL") || "https://www.locagame.net";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatAddress(address: Record<string, string> | null): string {
  if (!address) return "Adresse non renseignée";
  const parts = [
    address.street,
    address.complement,
    `${address.postal_code || ""} ${address.city || ""}`.trim(),
  ].filter(Boolean);
  return parts.join(", ");
}

async function sendConfirmationEmail(
  supabaseUrl: string,
  serviceRoleKey: string,
  reservation: Record<string, any>
): Promise<void> {
  const customer = reservation.customer;
  if (!customer?.email) {
    console.log("[stripe-webhook] No customer email, skipping confirmation email");
    return;
  }

  const customerName = `${customer.first_name || ""} ${customer.last_name || ""}`.trim();

  const html = reservationConfirmationTemplate({
    customerName: customerName || "Client",
    reservationNumber: reservation.reservation_number || reservation.id,
    eventDate: formatDate(reservation.event_date),
    eventAddress: formatAddress(reservation.delivery_address),
    items: (reservation.reservation_items || []).map(
      (item: Record<string, any>) => ({
        name: item.product?.name || "Article",
        quantity: item.quantity || 1,
        price: (item.unit_price || 0) * (item.quantity || 1),
      })
    ),
    totalAmount: reservation.total_amount || 0,
    reservationUrl: `https://www.locagame.net/client/reservations/${reservation.id}`,
  });

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: customer.email,
        subject: `Réservation #${reservation.reservation_number || ""} confirmée — LOCAGAME`,
        html,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("[stripe-webhook] Email send failed:", errData);
    } else {
      console.log(`[stripe-webhook] Confirmation email sent to ${customer.email}`);
    }
  } catch (err) {
    // Best-effort: ne pas bloquer le webhook si l'email échoue
    console.error("[stripe-webhook] Email send error (non-blocking):", err);
  }
}

/**
 * Crée les delivery_tasks après confirmation de paiement.
 * Logique identique à l'ancienne CheckoutAuthenticated.createDeliveryTasks.
 */
async function createDeliveryTasks(
  supabase: ReturnType<typeof createClient>,
  reservation: Record<string, any>
): Promise<void> {
  const reservationId = reservation.id;
  const customer = reservation.customer;
  const deliveryAddress = reservation.delivery_address;
  const items = reservation.reservation_items || [];

  // Charger les produits complets pour products_data
  const productIds = items.map((i: Record<string, any>) => i.product_id).filter(Boolean);
  const { data: products } = productIds.length > 0
    ? await supabase.from("products").select("*").in("id", productIds)
    : { data: [] };

  if (reservation.delivery_type === "delivery" && deliveryAddress) {
    // Tâche LIVRAISON (start_date)
    await supabase.from("delivery_tasks").insert({
      reservation_id: reservationId,
      order_number: `ORD-${reservationId.substring(0, 8)}-DELIVERY`,
      type: "delivery",
      scheduled_date: reservation.start_date,
      scheduled_time: reservation.delivery_time || "09:00",
      status: "scheduled",
      customer_data: customer,
      address_data: deliveryAddress,
      products_data: products,
    });

    // Tâche RETOUR (end_date)
    await supabase.from("delivery_tasks").insert({
      reservation_id: reservationId,
      order_number: `ORD-${reservationId.substring(0, 8)}-PICKUP`,
      type: "pickup",
      scheduled_date: reservation.end_date,
      scheduled_time: reservation.delivery_time || "09:00",
      status: "scheduled",
      customer_data: customer,
      address_data: deliveryAddress,
      products_data: products,
    });
  } else if (reservation.delivery_type === "pickup") {
    const warehouseAddress = {
      name: "Entrepôt LOCAGAME",
      street: "Zone Industrielle des Paluds",
      city: "13400 Aubagne",
    };

    // Tâche RETRAIT CLIENT (start_date)
    await supabase.from("delivery_tasks").insert({
      reservation_id: reservationId,
      order_number: `ORD-${reservationId.substring(0, 8)}-CLIENT-PICKUP`,
      type: "client_pickup",
      scheduled_date: reservation.start_date,
      scheduled_time: reservation.pickup_time || "09:00",
      status: "scheduled",
      customer_data: customer,
      address_data: warehouseAddress,
      products_data: products,
      notes: "Retrait client à l'entrepôt",
    });

    // Tâche RETOUR CLIENT (end_date)
    await supabase.from("delivery_tasks").insert({
      reservation_id: reservationId,
      order_number: `ORD-${reservationId.substring(0, 8)}-CLIENT-RETURN`,
      type: "client_return",
      scheduled_date: reservation.end_date,
      scheduled_time: reservation.return_time || "09:00",
      status: "scheduled",
      customer_data: customer,
      address_data: warehouseAddress,
      products_data: products,
      notes: "Retour client à l'entrepôt",
    });
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Payload size limit: 100 KB (Stripe webhooks can be large)
  const contentLength = parseInt(req.headers.get("content-length") || "0");
  if (contentLength > 100_000) {
    return jsonResponse({ error: "Payload too large" }, 413);
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!stripeKey || !webhookSecret) {
    console.error(
      "[stripe-webhook] Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET"
    );
    return jsonResponse({ error: "Configuration manquante" }, 500);
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-12-18.acacia" });
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return jsonResponse({ error: "Missing stripe-signature header" }, 400);
    }

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error("[stripe-webhook] Signature verification failed:", err);
      return jsonResponse({ error: "Invalid signature" }, 400);
    }

    console.log(`[stripe-webhook] Event: ${event.type} | ID: ${event.id}`);

    // IDEMPOTENCE: verifier si cet event a deja ete traite
    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id")
      .eq("stripe_event_id", event.id)
      .maybeSingle();

    if (existingPayment) {
      console.log(
        `[stripe-webhook] Event ${event.id} already processed, skipping`
      );
      return jsonResponse({ received: true, already_processed: true });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const reservationId = session.metadata?.reservation_id;

        if (!reservationId) {
          console.error(
            "[stripe-webhook] No reservation_id in session metadata"
          );
          break;
        }

        console.log(
          `[stripe-webhook] Payment OK for reservation: ${reservationId}`
        );

        // Mettre a jour la reservation - paiement = confirmation directe
        const { error: updateError } = await supabase
          .from("reservations")
          .update({
            status: "confirmed",
            payment_status: "paid",
            payment_intent_id: (session.payment_intent as string) || null,
            stripe_checkout_session_id: session.id,
            paid_at: new Date().toISOString(),
            payment_method: session.payment_method_types?.[0] || "card",
          })
          .eq("id", reservationId);

        if (updateError) {
          console.error(
            "[stripe-webhook] Update reservation error:",
            updateError
          );
          throw updateError;
        }

        // Inserer le paiement avec stripe_event_id pour idempotence
        const { error: paymentError } = await supabase
          .from("payments")
          .insert({
            reservation_id: reservationId,
            stripe_payment_intent_id:
              (session.payment_intent as string) || null,
            stripe_checkout_session_id: session.id,
            stripe_event_id: event.id,
            amount: (session.amount_total || 0) / 100,
            currency: session.currency || "eur",
            status: "succeeded",
            metadata: {
              customer_email: session.customer_details?.email,
              customer_name: session.customer_details?.name,
              payment_method: session.payment_method_types?.[0] || "card",
            },
          });

        if (paymentError) {
          console.error(
            "[stripe-webhook] Insert payment error:",
            paymentError
          );
        }

        console.log(
          `[stripe-webhook] Reservation ${reservationId} -> confirmed (paid)`
        );

        // BLOQUER LE STOCK — maintenant que le paiement est confirmé
        const { data: reservation } = await supabase
          .from("reservations")
          .select(
            `
            *,
            reservation_items(*, product:products(name)),
            customer:customers(first_name, last_name, email),
            delivery_address:addresses(*)
          `
          )
          .eq("id", reservationId)
          .single();

        if (reservation) {
          for (const item of reservation.reservation_items || []) {
            const { error: stockError } = await supabase
              .from("product_availability")
              .insert({
                product_id: item.product_id,
                reservation_id: reservationId,
                start_date: reservation.start_date,
                end_date: reservation.end_date,
                quantity: item.quantity || 1,
                status: "reserved",
              });

            if (stockError) {
              console.error(
                `[stripe-webhook] Stock blocking error for product ${item.product_id}:`,
                stockError
              );
            }
          }

          console.log(
            `[stripe-webhook] Stock blocked for reservation ${reservationId}`
          );

          // Envoyer l'email de confirmation (best-effort)
          await sendConfirmationEmail(
            supabaseUrl,
            supabaseServiceKey,
            reservation
          );

          // Créer les delivery_tasks APRÈS paiement confirmé
          try {
            await createDeliveryTasks(supabase, reservation);
            console.log(
              `[stripe-webhook] Delivery tasks created for reservation ${reservationId}`
            );
          } catch (taskErr) {
            console.error(
              "[stripe-webhook] Delivery tasks creation error (non-blocking):",
              taskErr
            );
          }

          // Incrémenter current_uses du code promo (best-effort)
          if (reservation.promo_code) {
            try {
              await supabase.rpc("increment_promo_code_usage", {
                p_code: reservation.promo_code,
              });
              console.log(
                `[stripe-webhook] Promo code usage incremented: ${reservation.promo_code}`
              );
            } catch (promoErr) {
              console.error(
                "[stripe-webhook] Promo usage increment error (non-blocking):",
                promoErr
              );
            }
          }
        }

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const reservationId = session.metadata?.reservation_id;

        if (!reservationId) break;

        console.log(
          `[stripe-webhook] Session expired for: ${reservationId}`
        );

        const { error: cancelError } = await supabase
          .from("reservations")
          .update({ status: "cancelled", payment_status: "expired" })
          .eq("id", reservationId)
          .eq("status", "pending_payment");

        if (cancelError) {
          console.error("[stripe-webhook] Cancel error:", cancelError);
          throw cancelError;
        }

        // Supprimer les delivery_tasks orphelines (filet de sécurité)
        await supabase
          .from("delivery_tasks")
          .delete()
          .eq("reservation_id", reservationId);

        // Liberer le stock
        await supabase
          .from("product_availability")
          .delete()
          .eq("reservation_id", reservationId);

        console.log(
          `[stripe-webhook] Reservation ${reservationId} -> cancelled (expired)`
        );
        break;
      }

      default:
        console.log(`[stripe-webhook] Unhandled event: ${event.type}`);
    }

    return jsonResponse({ received: true });
  } catch (error) {
    console.error("[stripe-webhook] Error:", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      500
    );
  }
});

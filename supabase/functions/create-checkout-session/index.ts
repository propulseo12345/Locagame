import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const ALLOWED_ORIGIN = Deno.env.get("SITE_URL") || "https://www.locagame.net";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Vérifie que l'appelant est autorisé à créer une session pour cette réservation.
 * - Utilisateur authentifié : doit être le propriétaire (customer_id === user.id)
 * - Guest (pas de JWT) : la réservation doit appartenir à un guest (is_guest=true)
 */
async function verifyOwnership(
  req: Request,
  reservation: Record<string, unknown>,
  supabaseUrl: string,
  supabaseAnonKey: string
): Promise<{ authorized: boolean; error?: string }> {
  const authHeader = req.headers.get("authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user }, error } = await anonClient.auth.getUser();

      if (error || !user) {
        return { authorized: false, error: "Token invalide" };
      }

      const customer = reservation.customer as Record<string, unknown> | null;
      if (!customer || customer.id !== user.id) {
        console.error(
          `[create-checkout-session] Ownership mismatch: user=${user.id}, customer=${customer?.id}`
        );
        return { authorized: false, error: "Non autorisé : cette réservation ne vous appartient pas" };
      }

      return { authorized: true };
    } catch (err) {
      console.error("[create-checkout-session] JWT verification error:", err);
      return { authorized: false, error: "Erreur de vérification d'identité" };
    }
  } else {
    const customer = reservation.customer as Record<string, unknown> | null;
    if (!customer || customer.is_guest !== true) {
      console.error(
        `[create-checkout-session] Unauthenticated access to non-guest reservation`
      );
      return { authorized: false, error: "Authentification requise" };
    }

    return { authorized: true };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    console.error("[create-checkout-session] STRIPE_SECRET_KEY is not set");
    return jsonResponse({ error: "Configuration Stripe manquante (STRIPE_SECRET_KEY)" }, 500);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("[create-checkout-session] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set");
    return jsonResponse({ error: "Configuration Supabase manquante" }, 500);
  }

  try {
    const stripe = new Stripe(stripeKey, { apiVersion: "2024-12-18.acacia" });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log("[create-checkout-session] Request body:", JSON.stringify(body));

    const { reservation_id, success_url, cancel_url } = body;

    if (!reservation_id || !success_url || !cancel_url) {
      return jsonResponse({ error: "reservation_id, success_url et cancel_url requis" }, 400);
    }

    // 1. Charger la reservation avec ses items, customer et pricing_breakdown
    const { data: reservation, error: resError } = await supabase
      .from("reservations")
      .select("*, reservation_items(*), customer:customers(*)")
      .eq("id", reservation_id)
      .single();

    if (resError) {
      console.error("[create-checkout-session] DB error:", resError);
      return jsonResponse({ error: "Reservation introuvable: " + resError.message }, 404);
    }

    if (!reservation) {
      return jsonResponse({ error: "Reservation introuvable" }, 404);
    }

    // 2. SÉCURITÉ: Vérifier l'ownership
    const ownershipCheck = await verifyOwnership(
      req,
      reservation as Record<string, unknown>,
      supabaseUrl,
      supabaseAnonKey
    );

    if (!ownershipCheck.authorized) {
      return jsonResponse({ error: ownershipCheck.error || "Non autorisé" }, 403);
    }

    console.log("[create-checkout-session] Reservation status:", reservation.status, "payment_status:", reservation.payment_status);

    // 3. Verifier que la reservation est en attente de paiement
    if (reservation.status !== "pending_payment") {
      return jsonResponse({ error: `Statut invalide: ${reservation.status}. Attendu: pending_payment` }, 400);
    }

    // 4. Construire les line items Stripe depuis la DB (source de vérité)
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of reservation.reservation_items || []) {
      const { data: product } = await supabase
        .from("products")
        .select("name, images")
        .eq("id", item.product_id)
        .single();

      const unitAmount = Math.round((item.subtotal / item.quantity) * 100);
      console.log("[create-checkout-session] Line item:", product?.name, "unit_amount:", unitAmount, "qty:", item.quantity);

      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: product?.name || `Produit ${item.product_id.substring(0, 8)}`,
            ...(product?.images?.[0] ? { images: [product.images[0]] } : {}),
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      });
    }

    // 5. Ajouter les majorations (surcharges weekend/jour férié) depuis pricing_breakdown
    const pricingBreakdown = reservation.pricing_breakdown as Record<string, unknown> | null;
    const surchargesTotal = Number(pricingBreakdown?.surcharges_total || 0);

    if (surchargesTotal > 0) {
      // Détailler les surcharges depuis le breakdown si possible
      const items = (pricingBreakdown?.items || []) as Array<Record<string, unknown>>;
      let deliverySurcharge = 0;
      let pickupSurcharge = 0;

      for (const item of items) {
        deliverySurcharge += Number(item.delivery_surcharge || 0);
        pickupSurcharge += Number(item.pickup_surcharge || 0);
      }

      if (deliverySurcharge > 0) {
        lineItems.push({
          price_data: {
            currency: "eur",
            product_data: { name: "Majoration livraison (week-end / jour férié)" },
            unit_amount: Math.round(deliverySurcharge * 100),
          },
          quantity: 1,
        });
      }

      if (pickupSurcharge > 0) {
        lineItems.push({
          price_data: {
            currency: "eur",
            product_data: { name: "Majoration reprise (week-end / jour férié)" },
            unit_amount: Math.round(pickupSurcharge * 100),
          },
          quantity: 1,
        });
      }

      // Fallback : si les surcharges détaillées ne matchent pas le total
      const detailedTotal = deliverySurcharge + pickupSurcharge;
      if (Math.abs(detailedTotal - surchargesTotal) > 0.01) {
        const remainder = surchargesTotal - detailedTotal;
        if (remainder > 0) {
          lineItems.push({
            price_data: {
              currency: "eur",
              product_data: { name: "Majorations" },
              unit_amount: Math.round(remainder * 100),
            },
            quantity: 1,
          });
        }
      }

      console.log("[create-checkout-session] Surcharges: delivery=", deliverySurcharge, "pickup=", pickupSurcharge, "total=", surchargesTotal);
    }

    // 6. Ajouter les frais de livraison
    if (reservation.delivery_fee > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: { name: "Frais de livraison" },
          unit_amount: Math.round(reservation.delivery_fee * 100),
        },
        quantity: 1,
      });
    }

    if (lineItems.length === 0) {
      return jsonResponse({ error: "Aucun article dans la reservation" }, 400);
    }

    // 7. Vérification de cohérence : total Stripe vs total DB
    const stripeTotal = lineItems.reduce((sum, li) => {
      const unitAmount = (li.price_data as Record<string, unknown>)?.unit_amount as number || 0;
      const qty = li.quantity || 1;
      return sum + unitAmount * qty;
    }, 0);
    const dbTotalCents = Math.round(Number(reservation.total) * 100);

    console.log("[create-checkout-session] Stripe total (cents):", stripeTotal, "DB total (cents):", dbTotalCents);

    if (Math.abs(stripeTotal - dbTotalCents) > 1) {
      console.warn("[create-checkout-session] Total mismatch! Stripe:", stripeTotal / 100, "DB:", reservation.total);
    }

    // 8. Creer ou recuperer le Stripe Customer
    let stripeCustomerId: string | undefined;
    const customer = reservation.customer;

    if (customer?.stripe_customer_id) {
      stripeCustomerId = customer.stripe_customer_id;
    } else if (customer) {
      try {
        const stripeCustomer = await stripe.customers.create({
          email: customer.email,
          name: `${customer.first_name} ${customer.last_name}`,
          phone: customer.phone || undefined,
          metadata: { locagame_customer_id: customer.id },
        });
        stripeCustomerId = stripeCustomer.id;

        await supabase
          .from("customers")
          .update({ stripe_customer_id: stripeCustomer.id })
          .eq("id", customer.id);
      } catch (custErr) {
        console.error("[create-checkout-session] Stripe customer creation error:", custErr);
      }
    }

    // 9. Creer la session Stripe Checkout
    console.log("[create-checkout-session] Creating Stripe session with", lineItems.length, "items");

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      line_items: lineItems,
      success_url: success_url.includes("?") ? `${success_url}&session_id={CHECKOUT_SESSION_ID}` : `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      metadata: { reservation_id: reservation.id },
      payment_intent_data: {
        metadata: { reservation_id: reservation.id },
      },
      locale: "fr",
    };

    if (stripeCustomerId) {
      sessionParams.customer = stripeCustomerId;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log("[create-checkout-session] Session created:", session.id, "url:", session.url);

    // 10. Mettre a jour la reservation
    await supabase
      .from("reservations")
      .update({
        stripe_checkout_session_id: session.id,
        payment_status: "pending_payment",
      })
      .eq("id", reservation.id);

    return jsonResponse({ session_id: session.id, session_url: session.url });

  } catch (error) {
    console.error("[create-checkout-session] Unhandled error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return jsonResponse({ error: message }, 500);
  }
});

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { rateLimitResponse } from "../_shared/rate-limiter.ts";

const SITE_URL = Deno.env.get("SITE_URL") || "https://www.locagame.net";
const isDev = Deno.env.get("ENVIRONMENT") !== "production";
const ALLOWED_ORIGINS = isDev
  ? [SITE_URL, "http://localhost:5173", "http://localhost:1974"]
  : [SITE_URL];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : SITE_URL;
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
  cors?: Record<string, string>
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...(cors || {}), "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  const cors = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  // Rate limit: 10 req/min/IP
  const rlResponse = rateLimitResponse(req, "sync-reservation-payment", 10, cors);
  if (rlResponse) return rlResponse;

  // Payload size limit: 10 KB
  const contentLength = parseInt(req.headers.get("content-length") || "0");
  if (contentLength > 10_000) {
    return jsonResponse({ error: "Payload too large" }, 413, cors);
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!stripeKey) {
    return jsonResponse({ error: "STRIPE_SECRET_KEY manquante" }, 500, cors);
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-12-18.acacia" });
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Authentifier l'appelant via JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Non autorisé" }, 401, cors);
    }

    const token = authHeader.replace("Bearer ", "");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(supabaseUrl, anonKey);
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(token);

    if (authError || !user) {
      return jsonResponse({ error: "Non autorisé" }, 401, cors);
    }

    const { reservation_id } = await req.json();

    if (!reservation_id) {
      return jsonResponse({ error: "reservation_id requis" }, 400, cors);
    }

    // Charger la réservation
    const { data: reservation, error: resError } = await supabase
      .from("reservations")
      .select(
        "id, status, payment_status, stripe_checkout_session_id, payment_intent_id, customer_id"
      )
      .eq("id", reservation_id)
      .single();

    if (resError || !reservation) {
      return jsonResponse({ error: "Réservation introuvable" }, 404, cors);
    }

    // Vérifier que l'appelant est admin OU le customer propriétaire
    const { data: adminCheck } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    const isOwner = reservation.customer_id === user.id;

    if (!adminCheck && !isOwner) {
      return jsonResponse(
        { error: "Accès non autorisé à cette réservation" },
        403,
        cors
      );
    }

    // Si déjà payé, rien à faire
    if (reservation.payment_status === "paid") {
      return jsonResponse(
        {
          status: "already_paid",
          payment_confirmed: true,
          reservation_status: reservation.status,
          payment_status: reservation.payment_status,
        },
        200,
        cors
      );
    }

    // Vérifier via Stripe
    let stripePaid = false;
    let paymentIntentId: string | null = null;
    let paymentMethod = "card";

    // Méthode 1 : via checkout session
    if (reservation.stripe_checkout_session_id) {
      try {
        const session = await stripe.checkout.sessions.retrieve(
          reservation.stripe_checkout_session_id
        );
        console.log(
          `[sync] Session ${session.id}: payment_status=${session.payment_status}`
        );

        if (session.payment_status === "paid") {
          stripePaid = true;
          paymentIntentId = (session.payment_intent as string) || null;
          paymentMethod = session.payment_method_types?.[0] || "card";
        }
      } catch (err) {
        console.error("[sync] Stripe session retrieve error:", err);
      }
    }

    // Méthode 2 : via payment intent
    if (!stripePaid && reservation.payment_intent_id) {
      try {
        const pi = await stripe.paymentIntents.retrieve(
          reservation.payment_intent_id
        );
        console.log(`[sync] PaymentIntent ${pi.id}: status=${pi.status}`);

        if (pi.status === "succeeded") {
          stripePaid = true;
          paymentIntentId = pi.id;
        }
      } catch (err) {
        console.error("[sync] Stripe PI retrieve error:", err);
      }
    }

    if (stripePaid) {
      const newStatus =
        reservation.status === "pending_payment"
          ? "confirmed"
          : reservation.status;

      const { error: updateError } = await supabase
        .from("reservations")
        .update({
          status: newStatus,
          payment_status: "paid",
          payment_intent_id: paymentIntentId,
          paid_at: new Date().toISOString(),
          payment_method: paymentMethod,
        })
        .eq("id", reservation_id);

      if (updateError) {
        console.error("[sync] Update error:", updateError);
        return jsonResponse(
          { error: "Erreur mise à jour: " + updateError.message },
          500,
          cors
        );
      }

      // Insérer le paiement (idempotent via stripe_checkout_session_id)
      if (reservation.stripe_checkout_session_id) {
        const { data: existingPayment } = await supabase
          .from("payments")
          .select("id")
          .eq(
            "stripe_checkout_session_id",
            reservation.stripe_checkout_session_id
          )
          .maybeSingle();

        if (!existingPayment) {
          const session = await stripe.checkout.sessions.retrieve(
            reservation.stripe_checkout_session_id
          );
          await supabase.from("payments").insert({
            reservation_id,
            stripe_payment_intent_id: paymentIntentId,
            stripe_checkout_session_id: reservation.stripe_checkout_session_id,
            stripe_event_id: `sync_${reservation_id}_${Date.now()}`,
            amount: (session.amount_total || 0) / 100,
            currency: session.currency || "eur",
            status: "succeeded",
            metadata: {
              source: "sync-reservation-payment",
              customer_email: session.customer_details?.email,
              payment_method: paymentMethod,
            },
          });
          console.log(`[sync] Payment record created for ${reservation_id}`);
        }
      }

      console.log(
        `[sync] Reservation ${reservation_id} -> ${newStatus} (paid)`
      );

      return jsonResponse(
        {
          status: "synced",
          payment_confirmed: true,
          reservation_status: newStatus,
          payment_status: "paid",
        },
        200,
        cors
      );
    } else {
      return jsonResponse(
        {
          status: "not_paid",
          payment_confirmed: false,
          message:
            "Aucun paiement confirmé sur Stripe pour cette réservation",
        },
        200,
        cors
      );
    }
  } catch (error) {
    console.error("[sync] Error:", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Erreur interne" },
      500,
      cors
    );
  }
});

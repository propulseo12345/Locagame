import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { rateLimitResponse } from "../_shared/rate-limiter.ts";

const ALLOWED_ORIGIN = Deno.env.get("SITE_URL") || "https://www.locagame.net";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limit: 3 req/min/IP
  const rlResponse = rateLimitResponse(req, "delete-account", 3, corsHeaders);
  if (rlResponse) return rlResponse;

  // Payload size limit: 10 KB
  const contentLength = parseInt(req.headers.get("content-length") || "0");
  if (contentLength > 10_000) {
    return jsonResponse({ error: "Payload too large" }, 413);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Vérifier l'authentification de l'appelant
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return jsonResponse({ error: "Non authentifié" }, 401);
  }

  // Client avec le token de l'utilisateur pour vérifier son identité
  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) {
    return jsonResponse({ error: "Utilisateur non trouvé" }, 401);
  }

  const userId = user.id;

  // Client admin (service_role) pour supprimer les données et l'auth user
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  try {
    // 1. Trouver le customer_id lié à cet auth user
    const { data: customer } = await adminClient
      .from("customers")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (customer) {
      const customerId = customer.id;

      // 2. Supprimer les favoris
      await adminClient
        .from("customer_favorites")
        .delete()
        .eq("customer_id", customerId);

      // 3. Récupérer les réservations
      const { data: reservations } = await adminClient
        .from("reservations")
        .select("id")
        .eq("customer_id", customerId);

      if (reservations && reservations.length > 0) {
        const reservationIds = reservations.map((r: { id: string }) => r.id);

        // 4. Supprimer les items de réservation
        await adminClient
          .from("reservation_items")
          .delete()
          .in("reservation_id", reservationIds);

        // 5. Supprimer les disponibilités produits
        await adminClient
          .from("product_availability")
          .delete()
          .in("reservation_id", reservationIds);

        // 6. Supprimer les tâches de livraison
        await adminClient
          .from("delivery_tasks")
          .delete()
          .in("reservation_id", reservationIds);

        // 7. Supprimer les paiements
        await adminClient
          .from("payments")
          .delete()
          .in("reservation_id", reservationIds);

        // 8. Supprimer les réservations
        await adminClient
          .from("reservations")
          .delete()
          .eq("customer_id", customerId);
      }

      // 9. Supprimer les adresses
      await adminClient
        .from("addresses")
        .delete()
        .eq("customer_id", customerId);

      // 10. Supprimer le customer
      await adminClient
        .from("customers")
        .delete()
        .eq("id", customerId);
    }

    // 11. Supprimer l'utilisateur auth
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      console.error("[delete-account] Auth delete error:", deleteAuthError);
      return jsonResponse({ error: "Erreur lors de la suppression du compte" }, 500);
    }

    console.log(`[delete-account] Account ${userId} deleted successfully`);
    return jsonResponse({ success: true });
  } catch (err) {
    console.error("[delete-account] Error:", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Erreur interne" },
      500
    );
  }
});

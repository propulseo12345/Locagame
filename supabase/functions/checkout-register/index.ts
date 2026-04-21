import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { welcomeTemplate } from "../_shared/email-templates.ts";
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

async function sendWelcomeEmail(
  supabaseUrl: string,
  serviceRoleKey: string,
  email: string,
  customerName: string,
  tempPassword?: string
): Promise<void> {
  try {
    const html = welcomeTemplate({
      customerName: customerName || "Client",
      loginUrl: `${SITE_URL}/client/dashboard`,
      tempPassword,
    });

    const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: email,
        subject: "Bienvenue sur LOCAGAME",
        html,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("[checkout-register] Welcome email failed:", errData);
    } else {
      console.log(`[checkout-register] Welcome email sent to ${email}`);
    }
  } catch (err) {
    console.error("[checkout-register] Welcome email error (non-blocking):", err);
  }
}

Deno.serve(async (req: Request) => {
  const cors = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  // Rate limit: 3 req/min/IP
  const rlResponse = rateLimitResponse(req, "checkout-register", 3, cors);
  if (rlResponse) return rlResponse;

  // Payload size limit: 10 KB
  const contentLength = parseInt(req.headers.get("content-length") || "0");
  if (contentLength > 10_000) {
    return jsonResponse({ error: "Payload too large" }, 413, cors);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!supabaseUrl || !supabaseServiceKey) {
    return jsonResponse(
      { error: "Configuration Supabase manquante" },
      500,
      cors
    );
  }

  try {
    const { email, first_name, last_name, phone, password } = await req.json();

    if (!email) {
      return jsonResponse({ error: "Email requis" }, 400, cors);
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Use provided password or generate a secure temporary one
    const isTemporary = !password;
    const finalPassword = password || (() => {
      const bytes = new Uint8Array(24);
      crypto.getRandomValues(bytes);
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      return Array.from(bytes, (b) => chars[b % chars.length]).join("") + "Aa1!";
    })();

    // Create user with auto-confirm via admin API
    const { data: userData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: finalPassword,
        email_confirm: true,
        user_metadata: {
          first_name: first_name || "",
          last_name: last_name || "",
          phone: phone || "",
        },
      });

    if (createError) {
      console.error(
        "[checkout-register] createUser error:",
        createError.message
      );

      if (
        createError.message.includes("already been registered") ||
        createError.message.includes("already exists") ||
        createError.message.includes("duplicate")
      ) {
        return jsonResponse({ error: "EMAIL_EXISTS" }, 409, cors);
      }

      return jsonResponse({ error: createError.message }, 400, cors);
    }

    if (!userData?.user) {
      return jsonResponse(
        { error: "Erreur lors de la création du compte" },
        500,
        cors
      );
    }

    console.log(
      `[checkout-register] User created: ${userData.user.id} (${email})`
    );

    // Envoyer le welcome email avec mot de passe temporaire si applicable (best-effort, non-bloquant)
    const customerName = `${first_name || ""} ${last_name || ""}`.trim();
    sendWelcomeEmail(
      supabaseUrl,
      supabaseServiceKey,
      email,
      customerName,
      isTemporary ? finalPassword : undefined
    );

    return jsonResponse(
      {
        success: true,
        user_id: userData.user.id,
      },
      200,
      cors
    );
  } catch (error) {
    console.error("[checkout-register] Unhandled error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return jsonResponse({ error: message }, 500, cors);
  }
});

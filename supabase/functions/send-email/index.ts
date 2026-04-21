import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { rateLimitResponse } from "../_shared/rate-limiter.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") ?? "noreply@locagame.net";
const EMAIL_FROM_NAME = Deno.env.get("EMAIL_FROM_NAME") ?? "LOCAGAME";

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

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

Deno.serve(async (req: Request) => {
  const cors = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // Rate limit: 5 req/min/IP
  const rlResponse = rateLimitResponse(req, "send-email", 5, cors);
  if (rlResponse) return rlResponse;

  // Payload size limit: 10 KB
  const cl = parseInt(req.headers.get("content-length") || "0");
  if (cl > 10_000) {
    return new Response(JSON.stringify({ error: "Payload too large" }), {
      status: 413,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // ── Auth guard ──────────────────────────────────────────────────────────────
  // Accepte : service_role key (appels Edge Function to Edge Function)
  //           OU JWT utilisateur valide (appels frontend authentifiés)
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const token = authHeader.replace("Bearer ", "");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Appel serveur-à-serveur (ex. stripe-webhook) : service role key
  const isServiceRole = token === supabaseServiceKey;

  if (!isServiceRole) {
    // Vérification JWT utilisateur
    const supabaseAuth = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
  }
  // ── Fin auth guard ──────────────────────────────────────────────────────────

  try {
    const payload: EmailPayload = await req.json();

    if (!payload.to || !payload.subject || !payload.html) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, html" }),
        {
          status: 400,
          headers: { ...cors, "Content-Type": "application/json" },
        }
      );
    }

    if (!RESEND_API_KEY) {
      console.error("[send-email] RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 503,
          headers: { ...cors, "Content-Type": "application/json" },
        }
      );
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
        reply_to: payload.replyTo,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("[send-email] Resend API error:", data);
      return new Response(JSON.stringify({ error: data }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    console.log("[send-email] Email sent to:", payload.to);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[send-email] Unexpected error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal error",
      }),
      {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      }
    );
  }
});

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Types
interface TechnicianInput {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

interface VehicleInput {
  name: string;
  type: "truck" | "van";
  capacity: number;
  license_plate: string;
}

interface RequestPayload {
  technician: TechnicianInput;
  vehicle: VehicleInput;
}

interface SuccessResponse {
  success: true;
  technician: { id: string; email: string; first_name: string; last_name: string };
  vehicle: { id: string; name: string; license_plate: string };
  invite_sent: true;
}

interface ErrorResponse {
  success: false;
  error: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(data: SuccessResponse | ErrorResponse, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only POST
  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    // 1. Vérifier Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ success: false, error: "Missing Authorization header" }, 401);
    }

    const jwt = authHeader.replace("Bearer ", "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client avec JWT appelant pour identifier l'utilisateur
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    const { data: userData, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !userData.user) {
      return jsonResponse({ success: false, error: "Invalid token" }, 401);
    }

    const callerId = userData.user.id;

    // Client service_role pour opérations admin
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 2. Vérifier que l'appelant est admin actif
    const { data: adminCheck, error: adminError } = await supabaseAdmin
      .from("admin_users")
      .select("id")
      .eq("user_id", callerId)
      .eq("is_active", true)
      .single();

    if (adminError || !adminCheck) {
      return jsonResponse({ success: false, error: "Admin access required" }, 403);
    }

    // 3. Parser et valider le payload
    const payload: RequestPayload = await req.json();

    if (!payload.technician || !payload.vehicle) {
      return jsonResponse({ success: false, error: "Missing technician or vehicle data" }, 400);
    }

    const { technician, vehicle } = payload;

    // Validation technician
    if (!technician.email || !technician.first_name || !technician.last_name) {
      return jsonResponse({ success: false, error: "Technician: email, first_name, last_name required" }, 400);
    }

    // Validation email format basique
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(technician.email)) {
      return jsonResponse({ success: false, error: "Invalid email format" }, 400);
    }

    // Validation vehicle
    if (!vehicle.name || !vehicle.type || !vehicle.capacity || !vehicle.license_plate) {
      return jsonResponse({ success: false, error: "Vehicle: name, type, capacity, license_plate required" }, 400);
    }

    if (!["truck", "van"].includes(vehicle.type)) {
      return jsonResponse({ success: false, error: "Vehicle type must be 'truck' or 'van'" }, 400);
    }

    if (vehicle.capacity <= 0) {
      return jsonResponse({ success: false, error: "Vehicle capacity must be positive" }, 400);
    }

    // 4. Vérifier unicité email (auth + technicians)
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const emailExists = existingUsers?.users?.some(
      (u) => u.email?.toLowerCase() === technician.email.toLowerCase()
    );
    if (emailExists) {
      return jsonResponse({ success: false, error: "Email already exists in auth" }, 409);
    }

    const { data: existingTech } = await supabaseAdmin
      .from("technicians")
      .select("id")
      .ilike("email", technician.email)
      .single();
    if (existingTech) {
      return jsonResponse({ success: false, error: "Email already exists in technicians" }, 409);
    }

    // 5. Vérifier unicité plaque
    const licensePlateUpper = vehicle.license_plate.toUpperCase().trim();
    const { data: existingPlate } = await supabaseAdmin
      .from("vehicles")
      .select("id")
      .eq("license_plate", licensePlateUpper)
      .single();
    if (existingPlate) {
      return jsonResponse({ success: false, error: "License plate already exists" }, 409);
    }

    // 6. Créer le véhicule
    const { data: newVehicle, error: vehicleError } = await supabaseAdmin
      .from("vehicles")
      .insert({
        name: vehicle.name.trim(),
        type: vehicle.type,
        capacity: vehicle.capacity,
        license_plate: licensePlateUpper,
        is_active: true,
      })
      .select("id, name, license_plate")
      .single();

    if (vehicleError || !newVehicle) {
      console.error("Vehicle creation error:", vehicleError);
      return jsonResponse({ success: false, error: `Failed to create vehicle: ${vehicleError?.message}` }, 500);
    }

    // 7. Créer le user Auth via invitation email
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      technician.email.toLowerCase().trim(),
      {
        data: { role: "technician" }, // metadata non utilisée pour authz
      }
    );

    if (inviteError || !inviteData.user) {
      // Rollback: supprimer le véhicule
      await supabaseAdmin.from("vehicles").delete().eq("id", newVehicle.id);
      console.error("Auth invite error:", inviteError);
      return jsonResponse({ success: false, error: `Failed to invite user: ${inviteError?.message}` }, 500);
    }

    const newAuthUserId = inviteData.user.id;

    // 8. Créer le technicien
    const { data: newTechnician, error: techError } = await supabaseAdmin
      .from("technicians")
      .insert({
        user_id: newAuthUserId,
        email: technician.email.toLowerCase().trim(),
        first_name: technician.first_name.trim(),
        last_name: technician.last_name.trim(),
        phone: technician.phone?.trim() || null,
        vehicle_id: newVehicle.id,
        is_active: true,
      })
      .select("id, email, first_name, last_name")
      .single();

    if (techError || !newTechnician) {
      // Rollback: supprimer auth user et véhicule
      await supabaseAdmin.auth.admin.deleteUser(newAuthUserId);
      await supabaseAdmin.from("vehicles").delete().eq("id", newVehicle.id);
      console.error("Technician creation error:", techError);
      return jsonResponse({ success: false, error: `Failed to create technician: ${techError?.message}` }, 500);
    }

    // 9. Succès
    const response: SuccessResponse = {
      success: true,
      technician: {
        id: newTechnician.id,
        email: newTechnician.email,
        first_name: newTechnician.first_name,
        last_name: newTechnician.last_name,
      },
      vehicle: {
        id: newVehicle.id,
        name: newVehicle.name,
        license_plate: newVehicle.license_plate,
      },
      invite_sent: true,
    };

    return jsonResponse(response, 201);

  } catch (error) {
    console.error("Unexpected error:", error);
    return jsonResponse({ success: false, error: "Internal server error" }, 500);
  }
});

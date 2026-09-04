import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local",
  );
}

/**
 * Cliente unico para toda la app.
 *
 * Va con la clave publicable, la unica que puede estar en el navegador. Como
 * todavia no hay cuentas, las tablas no tienen RLS: cualquiera con esta clave
 * lee y escribe todo. Por eso la app no se publica hasta que haya login.
 */
export const supabase = createClient(url, key);

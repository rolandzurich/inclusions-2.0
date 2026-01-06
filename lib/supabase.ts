import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:3001';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Helper: Erstelle Supabase Client nur wenn Keys vorhanden
function createSupabaseClient(url: string, key: string): SupabaseClient | null {
  if (!url || !key) {
    return null;
  }
  try {
    return createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return null;
  }
}

// Client für öffentliche Anfragen (Frontend)
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// Client für Admin-Operationen (Backend, Service Role)
export const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey);

// Helper: IP-Adresse aus Request extrahieren
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

// Helper: Rate Limiting prüfen
export async function checkRateLimit(
  ipAddress: string,
  endpoint: string,
  maxRequests: number = 10,
  windowMinutes: number = 60
): Promise<{ allowed: boolean; remaining: number }> {
  if (!supabaseAdmin) {
    // Wenn Supabase nicht verfügbar, erlaube alle Requests
    return { allowed: true, remaining: maxRequests };
  }

  try {
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - windowMinutes);

    // Aktuelle Requests zählen
    const { data: existing } = await supabaseAdmin
      .from('rate_limits')
      .select('request_count')
      .eq('ip_address', ipAddress)
      .eq('endpoint', endpoint)
      .gte('window_start', windowStart.toISOString())
      .single();

    if (existing) {
      if (existing.request_count >= maxRequests) {
        return { allowed: false, remaining: 0 };
      }
      
      // Request Count erhöhen
      await supabaseAdmin
        .from('rate_limits')
        .update({ request_count: existing.request_count + 1 })
        .eq('ip_address', ipAddress)
        .eq('endpoint', endpoint);
      
      return { allowed: true, remaining: maxRequests - existing.request_count - 1 };
    } else {
      // Neuer Eintrag
      await supabaseAdmin
        .from('rate_limits')
        .insert({
          ip_address: ipAddress,
          endpoint,
          request_count: 1,
          window_start: new Date().toISOString(),
        });
      
      return { allowed: true, remaining: maxRequests - 1 };
    }
  } catch (error) {
    // Bei Fehler erlaube Request
    console.error('Rate limit check error:', error);
    return { allowed: true, remaining: maxRequests };
  }
}


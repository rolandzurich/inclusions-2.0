import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Importiere Resend-Konfiguration
    const { resend, resendApiKey, fromEmail, adminEmail } = await import('@/lib/resend');
    
    // Teste Resend-API direkt
    let apiTestResult = null;
    let apiError = null;
    
    if (resend) {
      try {
        // Versuche eine Test-E-Mail zu senden (wird nicht wirklich gesendet, aber prüft API-Key)
        // Resend hat keine "test" API, also prüfen wir die Konfiguration
        apiTestResult = {
          resendInstanceExists: true,
          apiKeyLength: resendApiKey?.length || 0,
          apiKeyPrefix: resendApiKey?.substring(0, 15) || 'none',
        };
      } catch (err: any) {
        apiError = err?.message || String(err);
      }
    }
    
    // Prüfe Environment-Variablen
    const envCheck = {
      RESEND_API_KEY: {
        exists: !!process.env.RESEND_API_KEY,
        isPlaceholder: process.env.RESEND_API_KEY === 're_your-resend-api-key-here',
        length: process.env.RESEND_API_KEY?.length || 0,
        prefix: process.env.RESEND_API_KEY?.substring(0, 15) || 'none',
      },
      RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'not set',
      RESEND_ADMIN_EMAIL: process.env.RESEND_ADMIN_EMAIL || 'not set',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'not set',
    };
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      resendConfig: {
        resendIsNull: resend === null,
        resendApiKey: resendApiKey ? `${resendApiKey.substring(0, 15)}...` : 'not set',
        fromEmail,
        adminEmail,
      },
      envCheck,
      apiTest: apiTestResult,
      apiError,
      diagnostics: {
        resendInstanceCreated: resend !== null,
        apiKeyValid: resendApiKey && resendApiKey !== 're_your-resend-api-key-here' && resendApiKey.length > 20,
        fromEmailSet: !!fromEmail && fromEmail.includes('@'),
        adminEmailSet: !!adminEmail && adminEmail.includes('@'),
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || String(error),
      stack: error?.stack,
    }, { status: 500 });
  }
}

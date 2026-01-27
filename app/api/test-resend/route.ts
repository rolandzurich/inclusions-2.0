import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { resend, resendApiKey, fromEmail, adminEmail } = await import('@/lib/resend');
    
    // Versuche eine Test-E-Mail zu senden (an eine Test-Adresse)
    let testResult = null;
    let testError = null;
    
    if (resend) {
      try {
        // Verwende eine Test-E-Mail-Adresse (wird nicht wirklich versendet, aber prüft API)
        const testEmail = request.nextUrl.searchParams.get('email') || 'test@example.com';
        testResult = await resend.emails.send({
          from: fromEmail,
          to: testEmail,
          subject: 'Test E-Mail von Inclusions',
          html: '<p>Dies ist eine Test-E-Mail.</p>',
          text: 'Dies ist eine Test-E-Mail.',
        });
      } catch (err: any) {
        testError = {
          message: err?.message || String(err),
          name: err?.name,
          stack: err?.stack,
        };
      }
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      resendConfig: {
        resendIsNull: resend === null,
        resendApiKey: resendApiKey ? `${resendApiKey.substring(0, 15)}...` : 'not set',
        fromEmail,
        adminEmail,
      },
      envCheck: {
        RESEND_API_KEY: {
          exists: !!process.env.RESEND_API_KEY,
          isPlaceholder: process.env.RESEND_API_KEY === 're_your-resend-api-key-here',
          length: process.env.RESEND_API_KEY?.length || 0,
          prefix: process.env.RESEND_API_KEY?.substring(0, 15) || 'none',
        },
        RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'not set',
        RESEND_ADMIN_EMAIL: process.env.RESEND_ADMIN_EMAIL || 'not set',
      },
      testResult: testResult ? {
        hasError: !!testResult.error,
        error: testResult.error ? {
          message: testResult.error.message,
          name: testResult.error.name,
          statusCode: (testResult.error as any)?.statusCode,
        } : null,
        emailId: testResult.data?.id,
      } : null,
      testError,
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

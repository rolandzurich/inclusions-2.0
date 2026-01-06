import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { sendVIPConfirmation, sendVIPNotification, resend, resendApiKey, fromEmail, adminEmail } = await import('@/lib/resend');
    
    const testEmail = request.nextUrl.searchParams.get('email') || 'test@example.com';
    
    const info = {
      resendConfigured: !!resend,
      resendApiKeySet: !!resendApiKey,
      fromEmail,
      adminEmail,
      testEmail,
    };

    console.log('🧪 Test-E-Mail-Endpoint aufgerufen');
    console.log('📋 Konfiguration:', JSON.stringify(info, null, 2));

    if (!resend) {
      return NextResponse.json({
        success: false,
        error: 'Resend nicht konfiguriert',
        info,
        message: 'RESEND_API_KEY ist nicht gesetzt. Bitte setze die Umgebungsvariable RESEND_API_KEY.',
      }, { status: 500 });
    }

    // Test: Bestätigungs-E-Mail senden
    console.log('📧 Versuche Test-Bestätigungs-E-Mail zu senden...');
    const confirmationResult = await sendVIPConfirmation(
      testEmail,
      'Test Person',
      '2026-04-25'
    );

    console.log('📧 Bestätigungs-E-Mail Ergebnis:', JSON.stringify(confirmationResult, null, 2));

    // Test: Benachrichtigungs-E-Mail senden
    console.log('📧 Versuche Test-Benachrichtigungs-E-Mail zu senden...');
    const notificationResult = await sendVIPNotification({
      name: 'Test Person',
      email: testEmail,
      phone: '+41 79 123 45 67',
      eventDate: '2026-04-25',
      eventLocation: 'Supermarket, Zürich',
      message: 'Dies ist eine Test-Nachricht',
    });

    console.log('📧 Benachrichtigungs-E-Mail Ergebnis:', JSON.stringify(notificationResult, null, 2));

    return NextResponse.json({
      success: true,
      info,
      results: {
        confirmation: confirmationResult,
        notification: notificationResult,
      },
      message: 'Test-E-Mails wurden versendet. Prüfe dein E-Mail-Postfach und die Server-Logs.',
    });
  } catch (error) {
    console.error('❌ Fehler im Test-Endpoint:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}


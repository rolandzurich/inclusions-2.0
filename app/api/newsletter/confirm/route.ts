import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendNewsletterWelcome } from '@/lib/resend';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/newsletter?error=missing-token', request.url));
    }

    // Subscriber mit Token finden
    const { data: subscriber, error: findError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .eq('opt_in_token', token)
      .single();

    if (findError || !subscriber) {
      return NextResponse.redirect(new URL('/newsletter?error=invalid-token', request.url));
    }

    // Prüfen ob bereits bestätigt
    if (subscriber.opt_in_confirmed_at) {
      return NextResponse.redirect(new URL('/newsletter?error=already-confirmed', request.url));
    }

    // Prüfen ob Token abgelaufen
    if (new Date(subscriber.opt_in_expires_at) < new Date()) {
      return NextResponse.redirect(new URL('/newsletter?error=token-expired', request.url));
    }

    // Bestätigen
    const { error: updateError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .update({
        opt_in_confirmed_at: new Date().toISOString(),
        status: 'confirmed',
      })
      .eq('id', subscriber.id);

    if (updateError) {
      console.error('Error confirming subscription:', updateError);
      return NextResponse.redirect(new URL('/newsletter?error=confirmation-failed', request.url));
    }

    // Willkommens-E-Mail senden
    await sendNewsletterWelcome(
      subscriber.email,
      subscriber.first_name || 'Liebe/r'
    ).catch(err => console.error('Error sending welcome email:', err));

    return NextResponse.redirect(new URL('/newsletter?success=confirmed', request.url));
  } catch (error) {
    console.error('Error confirming newsletter subscription:', error);
    return NextResponse.redirect(new URL('/newsletter?error=unknown', request.url));
  }
}


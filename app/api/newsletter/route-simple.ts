import { NextRequest, NextResponse } from 'next/server';
import { insertNewsletterSubscriber } from '@/lib/db-json';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validierung
    if (!body.email) {
      return NextResponse.json(
        { success: false, message: 'E-Mail ist erforderlich.' },
        { status: 400 }
      );
    }

    // Speichere in JSON
    const result = await insertNewsletterSubscriber({
      email: body.email.toLowerCase().trim(),
      first_name: body.first_name || null,
      last_name: body.last_name || null,
      interests: body.interests || [],
      age_group: body.age_group || null,
      has_disability: body.has_disability || false,
      disability_type: body.disability_type || null,
      accessibility_needs: body.accessibility_needs || null,
    });

    console.log('✅ Newsletter gespeichert:', result.data);

    return NextResponse.json({
      success: true,
      message: 'Vielen Dank für deine Anmeldung!'
    });

  } catch (error) {
    console.error('❌ Newsletter Error:', error);
    return NextResponse.json(
      { success: false, message: 'Ein Fehler ist aufgetreten.' },
      { status: 500 }
    );
  }
}

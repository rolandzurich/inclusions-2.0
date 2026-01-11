import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET: Export newsletter subscribers as CSV for Mailchimp import
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const { supabaseAdmin } = await import('@/lib/supabase');
      if (!supabaseAdmin) {
        throw new Error('Supabase nicht verfügbar');
      }
      
      // Get all confirmed subscribers
      const { data, error } = await supabaseAdmin
        .from('newsletter_subscribers')
        .select('email, first_name, last_name, has_disability, created_at, status')
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Fehler beim Laden der Abonnenten.' },
          { status: 500 }
        );
      }

      // Create CSV
      const csvHeaders = ['Email Address', 'First Name', 'Last Name', 'Has Disability', 'Date Subscribed'];
      const csvRows = data.map(sub => [
        sub.email || '',
        sub.first_name || '',
        sub.last_name || '',
        sub.has_disability ? 'Yes' : 'No',
        new Date(sub.created_at).toISOString().split('T')[0],
      ]);

      // Escape CSV values (handle commas, quotes, newlines)
      const escapeCsvValue = (value: string) => {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      };

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(escapeCsvValue).join(','))
      ].join('\n');

      // Return as CSV file
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="mailchimp-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } catch (supabaseError) {
      return NextResponse.json(
        { error: 'Supabase nicht verfügbar.' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error exporting newsletter subscribers:', error);
    return NextResponse.json(
      { error: 'Fehler beim Exportieren der Abonnenten.' },
      { status: 500 }
    );
  }
}

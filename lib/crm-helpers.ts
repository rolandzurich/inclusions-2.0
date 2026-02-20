import { query } from '@/lib/db-postgres';

/**
 * Kontakt erstellen oder aktualisieren (Deduplizierung per E-Mail)
 * Gibt die Kontakt-ID zurück.
 */
export async function upsertContact(data: {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  postal_code?: string | null;
  city?: string | null;
  has_disability?: boolean;
  has_iv_card?: boolean;
  special_needs?: string | null;
  categories: string[];
  source: string;
}): Promise<string> {
  // Prüfe ob Kontakt mit dieser E-Mail existiert
  if (data.email) {
    const existing = await query(
      `SELECT id, categories FROM contacts WHERE email = $1 LIMIT 1`,
      [data.email.toLowerCase().trim()]
    );

    if (existing.data && existing.data.length > 0) {
      const contact = existing.data[0];
      const existingCats: string[] = contact.categories || [];
      const newCats = [...new Set([...existingCats, ...data.categories])];

      await query(`
        UPDATE contacts SET
          categories = $1,
          has_disability = CASE WHEN $2 THEN TRUE ELSE has_disability END,
          has_iv_card = CASE WHEN $3 THEN TRUE ELSE has_iv_card END,
          special_needs = COALESCE($4, special_needs),
          phone = COALESCE($5, phone),
          address_line1 = COALESCE($6, address_line1),
          postal_code = COALESCE($7, postal_code),
          city = COALESCE($8, city),
          updated_at = NOW()
        WHERE id = $9
      `, [
        newCats,
        data.has_disability || false,
        data.has_iv_card || false,
        data.special_needs || null,
        data.phone || null,
        data.address || null,
        data.postal_code || null,
        data.city || null,
        contact.id,
      ]);

      return contact.id;
    }
  }

  // Neuen Kontakt erstellen
  const result = await query(`
    INSERT INTO contacts (
      first_name, last_name, email, phone,
      address_line1, postal_code, city,
      has_disability, has_iv_card, special_needs,
      categories, source
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING id
  `, [
    data.first_name,
    data.last_name,
    data.email?.toLowerCase().trim(),
    data.phone || null,
    data.address || null,
    data.postal_code || null,
    data.city || null,
    data.has_disability || false,
    data.has_iv_card || false,
    data.special_needs || null,
    data.categories,
    data.source,
  ]);

  if (result.error || !result.data || result.data.length === 0) {
    throw new Error(result.error || 'Kontakt konnte nicht erstellt werden');
  }

  return result.data[0].id;
}

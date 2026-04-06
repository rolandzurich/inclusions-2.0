/**
 * INCLUSIONS KI-E-Mail-Hub – Gemini AI Analyse
 * 
 * Analysiert E-Mails mit Gemini und schlägt CRM-Aktionen vor.
 */

import { query } from './db-postgres';
import { upsertContact } from './crm-helpers';

// ============================================
// TYPEN
// ============================================

export interface EmailAnalysis {
  classification: string;
  urgency: 'low' | 'normal' | 'medium' | 'high' | 'critical';
  sentiment: 'positiv' | 'neutral' | 'negativ';
  language: string;
  is_internal: boolean;
  extracted: {
    person_name?: string;
    person_first_name?: string;
    person_last_name?: string;
    organization?: string;
    phone?: string;
    email?: string;
    website?: string;
    intent: string;
    mentioned_dates?: string[];
    amount_mentioned?: string;
    key_topics?: string[];
  };
  suggested_actions: SuggestedAction[];
  summary_de: string;
  requires_response: boolean;
  response_deadline?: string;
  requires_web_research: boolean;
  web_research_query?: string;
}

export interface SuggestedAction {
  type: string;
  reason: string;
  data: Record<string, any>;
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((tag) => String(tag || '').trim())
    .filter((tag) => tag.length > 0);
}

function splitName(fullName: string): { first_name: string; last_name: string } {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first_name: '', last_name: '' };
  if (parts.length === 1) return { first_name: parts[0], last_name: '' };
  return { first_name: parts[0], last_name: parts.slice(1).join(' ') };
}

// ============================================
// GEMINI ANALYSE
// ============================================

const SYSTEM_PROMPT = `Du bist der KI-Assistent von INCLUSIONS, einem inklusiven Event-Verein aus Zürich.
Du analysierst eingehende E-Mails und extrahierst strukturierte Informationen.

INCLUSIONS organisiert inklusive Events (Menschen mit und ohne Beeinträchtigung), 
hauptsächlich im Supermarket Zürich. Nächstes Event: INCLUSIONS 2.0 am 25. April 2026.

Wichtige Kontexte:
- Sponsoring-Anfragen sind sehr wertvoll (immer urgency: high)
- Medien-Anfragen sind zeitkritisch (urgency: high)  
- VIP-Anmeldungen: Personen mit Beeinträchtigung, die Gratis-Eintritt + Begleitung bekommen
- Booking: DJ-Buchungen, Location-Anfragen, Technik
- Partnerschaften: NPOs, Stiftungen, Organisationen aus dem Inklusionsbereich
- Interne Mails (zwischen @inclusions.zone Adressen): als "internal" klassifizieren, keine Aktionen

Antworte IMMER als valides JSON (kein Markdown, keine Erklärung).`;

const ANALYSIS_PROMPT = `Analysiere diese E-Mail und gib ein JSON-Objekt zurück:

ABSENDER: {from_name} <{from_email}>
AN: {to_email}
CC: {cc}
BETREFF: {subject}
DATUM: {received_at}
ACCOUNT: {account}

--- E-MAIL-INHALT ---
{body}
--- ENDE ---

Gib folgendes JSON zurück:
{
  "classification": "booking" | "sponsoring" | "partnership" | "media" | "volunteer" | "vip" | "donation" | "general" | "newsletter" | "spam" | "internal" | "automated",
  "urgency": "low" | "normal" | "medium" | "high" | "critical",
  "sentiment": "positiv" | "neutral" | "negativ",
  "language": "de" | "en" | "fr" | "it",
  "is_internal": true/false,
  "extracted": {
    "person_name": "Vollständiger Name oder null",
    "person_first_name": "Vorname oder null",
    "person_last_name": "Nachname oder null",
    "organization": "Organisationsname oder null",
    "phone": "Telefonnummer oder null",
    "email": "Kontakt-E-Mail (falls anders als Absender) oder null",
    "website": "Website oder null",
    "intent": "Was will die Person? (1-2 Sätze)",
    "mentioned_dates": ["YYYY-MM-DD Format oder null"],
    "amount_mentioned": "Betrag falls erwähnt oder null",
    "key_topics": ["Thema1", "Thema2"]
  },
  "suggested_actions": [
    {
      "type": "create_contact" | "update_contact" | "create_company" | "create_deal" | "create_project" | "create_event" | "create_booking" | "create_vip" | "add_note",
      "reason": "Warum diese Aktion?",
      "data": { ... relevante Felder für die Aktion ... }
    }
  ],
  "summary_de": "Zusammenfassung in 1-2 Sätzen auf Deutsch",
  "requires_response": true/false,
  "response_deadline": "YYYY-MM-DD oder null",
  "requires_web_research": true/false,
  "web_research_query": "Suchbegriff für Google oder null"
}

REGELN:
- Bei internen Mails (@inclusions.zone → @inclusions.zone): classification="internal", keine suggested_actions
- Bei automatisierten Mails (no-reply, noreply, mailer-daemon): classification="automated", keine Aktionen
- Bei Spam/Newsletter: classification="spam" oder "newsletter", keine Aktionen
- create_contact.data braucht: {first_name, last_name, email, phone?, organization?, role?, source: "email", tags: [...]}
- create_company.data braucht: {name, website?, email?, notes?}
- create_deal.data braucht: {title, description, amount_chf?, status: "lead", contact_email}
- create_project.data braucht: {title, description, status: "planned", tags: [...]}
- create_event.data braucht: {name, description, start_at, location_name?}
- Setze urgency="high" bei: Sponsoring > CHF 500, Medienanfragen, Deadlines < 7 Tage
- Setze requires_web_research=true wenn eine unbekannte Organisation erwähnt wird`;

/**
 * Analysiert eine E-Mail mit Gemini.
 */
export async function analyzeEmail(email: {
  from_name: string;
  from_email: string;
  to_email: string;
  cc: string;
  subject: string;
  body_text: string;
  received_at: string;
  account: string;
}): Promise<EmailAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY nicht konfiguriert');
  }
  
  // Body auf max 8000 Zeichen kürzen (Gemini Context)
  const body = email.body_text.substring(0, 8000);
  
  const prompt = ANALYSIS_PROMPT
    .replace('{from_name}', email.from_name || '')
    .replace('{from_email}', email.from_email)
    .replace('{to_email}', email.to_email)
    .replace('{cc}', email.cc || '')
    .replace('{subject}', email.subject)
    .replace('{received_at}', email.received_at)
    .replace('{account}', email.account)
    .replace('{body}', body);
  
  // Gemini API direkt aufrufen (REST)
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    }
  );
  
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API Fehler ${response.status}: ${err}`);
  }
  
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) {
    throw new Error('Gemini gab keine Antwort zurück');
  }
  
  // JSON parsen (Gemini gibt manchmal Markdown-Wrapper zurück)
  const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const analysis: EmailAnalysis = JSON.parse(jsonStr);
  
  return analysis;
}

// ============================================
// BATCH-ANALYSE
// ============================================

/**
 * Analysiert alle nicht-analysierten E-Mails in der DB.
 */
export async function analyzeUnprocessedEmails(limit: number = 20): Promise<{
  analyzed: number;
  errors: number;
  results: { id: string; subject: string; classification: string; urgency: string; error?: string }[];
}> {
  // Hole unanalysierte E-Mails
  const unprocessed = await query(`
    SELECT id, from_name, from_email, to_email, cc, subject, body_text, received_at, account
    FROM email_messages
    WHERE ai_status = 'pending'
    ORDER BY received_at DESC
    LIMIT $1
  `, [limit]);
  
  let analyzed = 0;
  let errors = 0;
  const results: any[] = [];
  
  for (const email of (unprocessed.data || [])) {
    try {
      // Status auf "analyzing" setzen
      await query(`UPDATE email_messages SET ai_status = 'analyzing' WHERE id = $1`, [email.id]);
      
      const analysis = await analyzeEmail({
        from_name: email.from_name,
        from_email: email.from_email,
        to_email: email.to_email,
        cc: email.cc || '',
        subject: email.subject,
        body_text: email.body_text || '',
        received_at: email.received_at,
        account: email.account,
      });
      
      // Analyse in DB speichern
      await query(`
        UPDATE email_messages SET
          ai_status = 'analyzed',
          ai_analysis = $2,
          ai_summary = $3,
          ai_classification = $4,
          ai_urgency = $5,
          ai_sentiment = $6,
          ai_analyzed_at = NOW()
        WHERE id = $1
      `, [
        email.id,
        JSON.stringify(analysis),
        analysis.summary_de,
        analysis.classification,
        analysis.urgency,
        analysis.sentiment,
      ]);
      
      // Vorgeschlagene Aktionen speichern
      for (const action of analysis.suggested_actions) {
        await query(`
          INSERT INTO email_actions (email_id, action_type, action_data, is_research)
          VALUES ($1, $2, $3, $4)
        `, [
          email.id,
          action.type,
          JSON.stringify({ ...action.data, reason: action.reason }),
          false,
        ]);
      }
      
      // Web-Research Aktion hinzufügen wenn nötig
      if (analysis.requires_web_research && analysis.web_research_query) {
        await query(`
          INSERT INTO email_actions (email_id, action_type, action_data, is_research, research_source)
          VALUES ($1, 'web_research', $2, true, $3)
        `, [
          email.id,
          JSON.stringify({ query: analysis.web_research_query, reason: 'KI empfiehlt Web-Recherche' }),
          analysis.web_research_query,
        ]);
      }
      
      analyzed++;
      results.push({
        id: email.id,
        subject: email.subject,
        classification: analysis.classification,
        urgency: analysis.urgency,
      });
      
    } catch (err: any) {
      errors++;
      await query(`UPDATE email_messages SET ai_status = 'error' WHERE id = $1`, [email.id]);
      results.push({
        id: email.id,
        subject: email.subject,
        classification: 'error',
        urgency: 'normal',
        error: err.message,
      });
      console.error(`❌ Analyse-Fehler für "${email.subject}":`, err.message);
    }
    
    // Rate-Limiting: 500ms zwischen Anfragen
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return { analyzed, errors, results };
}

// ============================================
// AKTIONEN ANWENDEN
// ============================================

/**
 * Wendet eine vorgeschlagene Aktion an (erstellt den CRM-Eintrag).
 */
export async function applyAction(actionId: string, appliedBy: string): Promise<{ success: boolean; resultId?: string; resultType?: string; error?: string }> {
  // Aktion laden
  const actionResult = await query(`
    SELECT ea.*, em.from_email, em.subject
    FROM email_actions ea
    JOIN email_messages em ON ea.email_id = em.id
    WHERE ea.id = $1 AND ea.status = 'suggested'
  `, [actionId]);
  
  if (!actionResult.data || actionResult.data.length === 0) {
    return { success: false, error: 'Aktion nicht gefunden oder bereits verarbeitet' };
  }
  
  const action = actionResult.data[0];
  const data = action.action_data;
  
  try {
    let resultId: string | undefined;
    let resultType: string | undefined;
    
    switch (action.action_type) {
      case 'create_contact': {
        const email = (data.email || action.from_email || '').toLowerCase().trim();
        const firstName = (data.first_name || '').trim();
        const lastName = (data.last_name || '').trim();
        const parsedName = splitName((data.person_name || '').trim());
        const finalFirstName = firstName || parsedName.first_name || 'Unbekannt';
        const finalLastName = lastName || parsedName.last_name || '-';
        const note = `[E-Mail-Hub] ${data.reason || ''}\nQuelle: ${action.subject}`.trim();

        let existingId: string | null = null;
        if (email) {
          const existing = await query(`SELECT id, notes FROM contacts WHERE LOWER(email) = LOWER($1) LIMIT 1`, [email]);
          existingId = existing.data?.[0]?.id || null;
        }

        if (existingId) {
          await query(`
            UPDATE contacts SET
              first_name = COALESCE(NULLIF($2, ''), first_name),
              last_name = COALESCE(NULLIF($3, ''), last_name),
              phone = COALESCE($4, phone),
              role = COALESCE($5, role),
              tags = CASE
                WHEN $6::text[] IS NULL OR array_length($6::text[], 1) IS NULL THEN tags
                WHEN tags IS NULL THEN $6::text[]
                ELSE ARRAY(SELECT DISTINCT unnest(tags || $6::text[]))
              END,
              notes = CASE
                WHEN COALESCE(notes, '') = '' THEN $7
                ELSE notes || E'\n---\n' || $7
              END,
              updated_at = NOW()
            WHERE id = $1
          `, [
            existingId,
            finalFirstName,
            finalLastName,
            data.phone || null,
            data.role || null,
            normalizeTags(data.tags).length > 0 ? normalizeTags(data.tags) : null,
            note,
          ]);
          resultId = existingId;
        } else {
          const res = await query(`
            INSERT INTO contacts (first_name, last_name, email, phone, role, source, tags, notes)
            VALUES ($1, $2, $3, $4, $5, 'email', $6, $7)
            RETURNING id
          `, [
            finalFirstName,
            finalLastName,
            email || null,
            data.phone || null,
            data.role || null,
            normalizeTags(data.tags).length > 0 ? normalizeTags(data.tags) : null,
            note,
          ]);
          resultId = res.data?.[0]?.id;
        }

        resultType = 'contacts';
        break;
      }

      case 'update_contact': {
        const email = (data.email || action.from_email || '').toLowerCase().trim();
        if (!email) {
          return { success: false, error: 'update_contact benötigt eine E-Mail-Adresse' };
        }

        const existing = await query(`SELECT id, notes FROM contacts WHERE LOWER(email) = LOWER($1) LIMIT 1`, [email]);
        const existingId = existing.data?.[0]?.id;
        if (!existingId) {
          return { success: false, error: `Kein bestehender Kontakt für ${email} gefunden` };
        }

        const nameFallback = splitName((data.person_name || '').trim());
        const updateResult = await query(`
          UPDATE contacts SET
            first_name = COALESCE(NULLIF($2, ''), first_name),
            last_name = COALESCE(NULLIF($3, ''), last_name),
            phone = COALESCE($4, phone),
            role = COALESCE($5, role),
            tags = CASE
              WHEN $6::text[] IS NULL OR array_length($6::text[], 1) IS NULL THEN tags
              WHEN tags IS NULL THEN $6::text[]
              ELSE ARRAY(SELECT DISTINCT unnest(tags || $6::text[]))
            END,
            notes = CASE
              WHEN COALESCE(notes, '') = '' THEN $7
              ELSE notes || E'\n---\n' || $7
            END,
            updated_at = NOW()
          WHERE id = $1
          RETURNING id
        `, [
          existingId,
          (data.first_name || nameFallback.first_name || '').trim(),
          (data.last_name || nameFallback.last_name || '').trim(),
          data.phone || null,
          data.role || null,
          normalizeTags(data.tags).length > 0 ? normalizeTags(data.tags) : null,
          `[E-Mail-Hub] ${data.reason || ''}\nQuelle: ${action.subject}`.trim(),
        ]);

        resultId = updateResult.data?.[0]?.id;
        resultType = 'contacts';
        break;
      }
      
      case 'create_company': {
        const companyName = (data.name || data.organization || '').trim();
        if (!companyName) {
          return { success: false, error: 'create_company benötigt mindestens einen Firmennamen' };
        }
        const existing = await query(`SELECT id FROM companies WHERE LOWER(name) = LOWER($1) LIMIT 1`, [companyName]);
        if (existing.data?.length) {
          await query(`
            UPDATE companies SET
              website = COALESCE($2, website),
              email = COALESCE($3, email),
              notes = CASE
                WHEN COALESCE(notes, '') = '' THEN $4
                ELSE notes || E'\n---\n' || $4
              END,
              updated_at = NOW()
            WHERE id = $1
          `, [
            existing.data[0].id,
            data.website || null,
            data.email || null,
            `[E-Mail-Hub] ${data.reason || data.notes || ''}`.trim(),
          ]);
          resultId = existing.data[0].id;
        } else {
          const res = await query(`
            INSERT INTO companies (name, website, email, notes)
            VALUES ($1, $2, $3, $4)
            RETURNING id
          `, [
            companyName,
            data.website || null,
            data.email || null,
            `[E-Mail-Hub] ${data.reason || data.notes || ''}`.trim(),
          ]);
          resultId = res.data?.[0]?.id;
        }
        resultType = 'companies';
        break;
      }
      
      case 'create_deal': {
        // Finde Contact-ID basierend auf E-Mail
        const contactRes = await query(`SELECT id FROM contacts WHERE email = $1 LIMIT 1`, [data.contact_email || action.from_email]);
        const contactId = contactRes.data?.[0]?.id;
        
        const res = await query(`
          INSERT INTO deals (title, description, amount_chf, status, contact_id, notes)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `, [
          data.title,
          data.description || '',
          data.amount_chf || null,
          data.status || 'lead',
          contactId,
          `[E-Mail-Hub] ${data.reason || ''}`,
        ]);
        resultId = res.data?.[0]?.id;
        resultType = 'deals';
        break;
      }
      
      case 'create_project': {
        const normalizedStatus = ['planning', 'active', 'on_hold', 'completed', 'cancelled'].includes(data.status)
          ? data.status
          : 'planning';
        const res = await query(`
          INSERT INTO projects (title, description, status, tags, metadata)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
        `, [
          data.title || data.name || 'Neues Projekt',
          data.description || '',
          normalizedStatus,
          normalizeTags(data.tags).length > 0 ? normalizeTags(data.tags) : null,
          JSON.stringify({ source: 'email-hub', email_id: action.email_id }),
        ]);
        resultId = res.data?.[0]?.id;
        resultType = 'projects';
        break;
      }
      
      case 'create_event': {
        const res = await query(`
          INSERT INTO events_v2 (name, description, start_at, location_name, status, tags)
          VALUES ($1, $2, $3, $4, 'draft', $5)
          RETURNING id
        `, [
          data.name || data.title || 'Neues Event',
          data.description || '',
          data.start_at || new Date().toISOString(),
          data.location_name || '',
          normalizeTags(data.tags).length > 0 ? normalizeTags(data.tags) : null,
        ]);
        resultId = res.data?.[0]?.id;
        resultType = 'events_v2';
        break;
      }

      case 'create_booking': {
        const fullName = (data.name || data.person_name || '').trim();
        const split = splitName(fullName);
        const firstName = (data.first_name || split.first_name || 'Unbekannt').trim();
        const lastName = (data.last_name || split.last_name || '-').trim();
        const email = (data.email || action.from_email || '').toLowerCase().trim();

        const res = await query(`
          INSERT INTO contact_requests (
            name, email, phone, message,
            booking_type, booking_item, event_date, event_location, event_type,
            admin_notes, status
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'new')
          RETURNING id
        `, [
          `${firstName} ${lastName}`.trim(),
          email || 'unknown@inclusions.zone',
          data.phone || null,
          data.description || data.intent || data.reason || action.subject || null,
          data.booking_type || null,
          data.booking_item || data.item || null,
          data.event_date || null,
          data.event_location || null,
          data.event_type || null,
          `[E-Mail-Hub] ${data.reason || ''}\nQuelle: ${action.subject}`.trim(),
        ]);

        resultId = res.data?.[0]?.id;
        resultType = 'contact_requests';
        break;
      }

      case 'create_vip': {
        const fullName = (data.name || data.person_name || '').trim();
        const split = splitName(fullName);
        const firstName = (data.first_name || split.first_name || 'VIP').trim();
        const lastName = (data.last_name || split.last_name || 'Gast').trim();
        const email = (data.email || action.from_email || '').toLowerCase().trim();

        const contactId = await upsertContact({
          first_name: firstName,
          last_name: lastName,
          email,
          phone: data.phone || null,
          categories: ['vip'],
          source: 'email_hub',
          special_needs: data.special_needs || null,
        });

        const res = await query(`
          INSERT INTO vip_registrations (
            contact_id, registration_type, event_date, event_location,
            arrival_time, status, raw_data
          )
          VALUES ($1, 'self', $2, $3, $4, 'pending', $5)
          RETURNING id
        `, [
          contactId,
          data.event_date || null,
          data.event_location || null,
          data.arrival_time || null,
          JSON.stringify({
            source: 'email_hub',
            reason: data.reason || null,
            action_id: actionId,
            email_id: action.email_id,
            payload: data,
          }),
        ]);
        resultId = res.data?.[0]?.id;
        resultType = 'vip_registrations';
        break;
      }
      
      case 'add_note': {
        // Notiz zum E-Mail hinzufügen
        await query(`
          UPDATE email_messages SET notes = COALESCE(notes, '') || E'\n' || $2, updated_at = NOW()
          WHERE id = $1
        `, [action.email_id, data.note || data.reason || '']);
        resultType = 'email_messages';
        resultId = action.email_id;
        break;
      }

      case 'web_research': {
        await query(`
          UPDATE email_messages SET
            web_research = jsonb_build_object(
              'query', $2,
              'reason', $3,
              'status', 'queued',
              'requested_by', $4,
              'requested_at', NOW()
            ),
            updated_at = NOW()
          WHERE id = $1
        `, [
          action.email_id,
          data.query || data.web_research_query || '',
          data.reason || 'Web-Recherche angefordert',
          appliedBy,
        ]);
        resultType = 'email_messages';
        resultId = action.email_id;
        break;
      }
      
      default:
        return { success: false, error: `Unbekannter Aktionstyp: ${action.action_type}` };
    }
    
    // Aktion als angewendet markieren
    await query(`
      UPDATE email_actions SET
        status = 'applied',
        result_type = $2,
        result_id = $3,
        applied_at = NOW(),
        applied_by = $4
      WHERE id = $1
    `, [actionId, resultType, resultId, appliedBy]);
    
    // E-Mail als verarbeitet markieren wenn alle Aktionen erledigt
    const remaining = await query(`
      SELECT COUNT(*) as count FROM email_actions
      WHERE email_id = $1 AND status = 'suggested'
    `, [action.email_id]);
    
    if (parseInt(remaining.data?.[0]?.count || '0') === 0) {
      await query(`UPDATE email_messages SET is_processed = true, processed_at = NOW() WHERE id = $1`, [action.email_id]);
    }
    
    return { success: true, resultId, resultType };
    
  } catch (err: any) {
    await query(`UPDATE email_actions SET status = 'error' WHERE id = $1`, [actionId]);
    return { success: false, error: err.message };
  }
}

/**
 * Lehnt eine vorgeschlagene Aktion ab.
 */
export async function rejectAction(actionId: string, rejectedBy: string): Promise<boolean> {
  const result = await query(`
    UPDATE email_actions SET status = 'rejected', applied_by = $2, applied_at = NOW()
    WHERE id = $1 AND status = 'suggested'
    RETURNING id
  `, [actionId, rejectedBy]);
  
  return (result.data?.length || 0) > 0;
}

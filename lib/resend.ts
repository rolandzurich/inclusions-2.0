import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@inclusions.zone';
const adminEmail = process.env.RESEND_ADMIN_EMAIL || 'info@inclusions.zone';

// #region agent log
fetch('http://127.0.0.1:7243/ingest/10419aa7-e8ae-40cb-b044-efefcfde0373',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/resend.ts:3',message:'Resend init - checking env vars',data:{hasApiKey:!!resendApiKey,apiKeyPrefix:resendApiKey?.substring(0,10)||'none',fromEmail,adminEmail},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
// #endregion

if (!resendApiKey || resendApiKey === 're_your-resend-api-key-here') {
  console.warn('⚠️ RESEND_API_KEY ist nicht gesetzt oder ist ein Platzhalter. E-Mail-Versand wird nicht funktionieren.');
  console.warn('⚠️ Formulare funktionieren trotzdem, aber keine E-Mails werden versendet.');
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/10419aa7-e8ae-40cb-b044-efefcfde0373',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/resend.ts:10',message:'RESEND_API_KEY missing or placeholder',data:{resendApiKey:resendApiKey||'undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
  // #endregion
}

export const resend = (resendApiKey && resendApiKey !== 're_your-resend-api-key-here') ? new Resend(resendApiKey) : null;

// #region agent log
fetch('http://127.0.0.1:7243/ingest/10419aa7-e8ae-40cb-b044-efefcfde0373',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/resend.ts:13',message:'Resend instance created',data:{resendIsNull:resend===null,hasApiKey:!!resendApiKey},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
// #endregion

// Export für Prüfung in anderen Dateien
export { resendApiKey, fromEmail, adminEmail };

// Generische Email-Versand-Funktion
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!resend) {
    console.warn('⚠️ Resend nicht initialisiert - Email wird nicht versendet');
    return { error: 'Resend not initialized' };
  }

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });
    return result;
  } catch (error) {
    console.error('❌ Email-Versand Fehler:', error);
    return { error };
  }
}

// E-Mail Templates
export async function sendContactConfirmation(to: string, name: string) {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/10419aa7-e8ae-40cb-b044-efefcfde0373',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/resend.ts:18',message:'sendContactConfirmation called',data:{to,name,resendIsNull:resend===null,fromEmail},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
  // #endregion
  if (!resend) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/10419aa7-e8ae-40cb-b044-efefcfde0373',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/resend.ts:20',message:'Resend is null - returning error',data:{to,name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    return { error: 'Resend nicht konfiguriert' };
  }

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/10419aa7-e8ae-40cb-b044-efefcfde0373',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/resend.ts:22',message:'Calling resend.emails.send for contact confirmation',data:{from:fromEmail,to},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1,H2,H3,H5'})}).catch(()=>{});
  // #endregion

  const result = await resend.emails.send({
    from: fromEmail,
    to,
    subject: 'Vielen Dank für deine Anfrage - Inclusions',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #ff00ff;">Vielen Dank, ${name}!</h1>
          <p>Wir haben deine Anfrage erhalten und melden uns bald bei dir.</p>
          <p>Bis dahin,<br>Das Inclusions Team</p>
        </body>
      </html>
    `,
    text: `Vielen Dank, ${name}!\n\nWir haben deine Anfrage erhalten und melden uns bald bei dir.\n\nBis dahin,\nDas Inclusions Team`,
  });
  
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/10419aa7-e8ae-40cb-b044-efefcfde0373',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/resend.ts:41',message:'Contact confirmation email result',data:{hasError:!!result.error,error:result.error,hasData:!!result.data,emailId:result.data?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1,H2,H3,H5'})}).catch(()=>{});
  // #endregion
  
  return result;
}

export async function sendBookingConfirmation(to: string, name: string, bookingItem?: string, eventDate?: string, eventLocation?: string) {
  if (!resend) return { error: 'Resend nicht konfiguriert' };

  // Vorname extrahieren (erster Teil des Namens)
  const firstName = name.split(' ')[0];
  
  // Booking-Info zusammenstellen
  const bookingInfo = bookingItem ? ` für ${bookingItem}` : '';
  const eventInfo = eventDate && eventLocation 
    ? ` am ${eventDate} in ${eventLocation}`
    : eventDate 
      ? ` am ${eventDate}`
      : eventLocation
        ? ` in ${eventLocation}`
        : '';

  return await resend.emails.send({
    from: fromEmail,
    to,
    reply_to: adminEmail,
    subject: 'Vielen Dank für deine Buchungsanfrage - Inclusions',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.8; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; font-size: 16px;">
          <h1 style="color: #ff00ff; font-size: 24px; margin-bottom: 20px;">Liebe / Lieber ${firstName}</h1>
          <p style="font-size: 18px; margin-bottom: 15px;">vielen Dank für deine Buchungsanfrage${bookingInfo}${eventInfo}.</p>
          <p style="margin-bottom: 15px;">Wir haben deine Anfrage erhalten und werden sie schnellstmöglich prüfen.</p>
          <p style="margin-bottom: 15px;">Falls es vorab noch Unklarheiten gibt, melden wir uns bei dir.</p>
          <p style="margin-bottom: 15px;">Wir melden uns bald bei dir mit weiteren Details zu deiner Buchung.</p>
          <p style="margin-top: 30px;">Bis bald – wir freuen uns auf deine Anfrage.</p>
          <p style="margin-top: 20px;">Herzlich<br>Dein Inclusions Team</p>
        </body>
      </html>
    `,
    text: `Liebe / Lieber ${firstName}\n\nvielen Dank für deine Buchungsanfrage${bookingInfo}${eventInfo}.\n\nWir haben deine Anfrage erhalten und werden sie schnellstmöglich prüfen.\n\nFalls es vorab noch Unklarheiten gibt, melden wir uns bei dir.\nWir melden uns bald bei dir mit weiteren Details zu deiner Buchung.\n\nBis bald – wir freuen uns auf deine Anfrage.\n\nHerzlich\nDein Inclusions Team`,
  });
}

export async function sendContactNotification(data: {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  bookingType?: string;
  bookingItem?: string;
  eventDate?: string;
  eventLocation?: string;
  eventType?: string;
  sourceUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}) {
  if (!resend) return { error: 'Resend nicht konfiguriert' };

  // Bestimme Formular-Typ für Betreff
  const formType = data.bookingType || data.bookingItem ? 'Buchungsanfrage' : 'Kontaktanfrage';
  const emailSubject = `📧 ${formType}${data.bookingItem ? `: ${data.bookingItem}` : ''}${data.eventDate ? ` - ${data.eventDate}` : ''} - Inclusions`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #ff00ff;">Neue ${formType}</h2>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #333;">Kontaktinformationen</h3>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>E-Mail:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
          ${data.phone ? `<p><strong>Telefon:</strong> <a href="tel:${data.phone}">${data.phone}</a></p>` : ''}
        </div>

        ${data.bookingType || data.bookingItem || data.eventDate || data.eventLocation ? `
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #333;">Buchungsdetails</h3>
          ${data.bookingType ? `<p><strong>Buchungstyp:</strong> ${data.bookingType}</p>` : ''}
          ${data.bookingItem ? `<p><strong>Gebuchtes Item:</strong> ${data.bookingItem}</p>` : ''}
          ${data.eventDate ? `<p><strong>Event-Datum:</strong> ${data.eventDate}</p>` : ''}
          ${data.eventLocation ? `<p><strong>Event-Ort:</strong> ${data.eventLocation}</p>` : ''}
          ${data.eventType ? `<p><strong>Event-Typ:</strong> ${data.eventType}</p>` : ''}
        </div>
        ` : ''}

        ${data.message ? `
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #333;">Nachricht</h3>
          <p style="white-space: pre-wrap;">${data.message.replace(/\n/g, '<br>')}</p>
        </div>
        ` : ''}

        ${data.sourceUrl || data.utmSource || data.utmMedium || data.utmCampaign ? `
        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin-top: 20px; font-size: 12px; color: #666;">
          <h4 style="margin-top: 0; color: #666;">Tracking-Informationen</h4>
          ${data.sourceUrl ? `<p><strong>Quelle:</strong> <a href="${data.sourceUrl}">${data.sourceUrl}</a></p>` : ''}
          ${data.utmSource ? `<p><strong>UTM Source:</strong> ${data.utmSource}</p>` : ''}
          ${data.utmMedium ? `<p><strong>UTM Medium:</strong> ${data.utmMedium}</p>` : ''}
          ${data.utmCampaign ? `<p><strong>UTM Campaign:</strong> ${data.utmCampaign}</p>` : ''}
        </div>
        ` : ''}
      </body>
    </html>
  `;
  
  const emailText = `Neue ${formType}\n\nKontaktinformationen:\nName: ${data.name}\nE-Mail: ${data.email}\n${data.phone ? `Telefon: ${data.phone}\n` : ''}\n${data.bookingType || data.bookingItem || data.eventDate || data.eventLocation ? `Buchungsdetails:\n${data.bookingType ? `Buchungstyp: ${data.bookingType}\n` : ''}${data.bookingItem ? `Gebuchtes Item: ${data.bookingItem}\n` : ''}${data.eventDate ? `Event-Datum: ${data.eventDate}\n` : ''}${data.eventLocation ? `Event-Ort: ${data.eventLocation}\n` : ''}${data.eventType ? `Event-Typ: ${data.eventType}\n` : ''}\n` : ''}${data.message ? `Nachricht:\n${data.message}\n\n` : ''}${data.sourceUrl ? `Quelle: ${data.sourceUrl}\n` : ''}${data.utmSource ? `UTM Source: ${data.utmSource}\n` : ''}${data.utmMedium ? `UTM Medium: ${data.utmMedium}\n` : ''}${data.utmCampaign ? `UTM Campaign: ${data.utmCampaign}\n` : ''}`;

  // Sende E-Mails einzeln
  const results = [];
  
  // Primär an info@inclusions.zone
  if (adminEmail) {
    try {
      const result1 = await resend.emails.send({
        from: fromEmail,
        to: adminEmail,
        subject: emailSubject,
        html: emailHtml,
        text: emailText,
      });
      if (!result1.error) {
        console.log(`✅ Kontakt-Benachrichtigung an ${adminEmail} gesendet`);
        results.push({ email: adminEmail, id: result1.data?.id });
      } else {
        console.warn(`⚠️ ${adminEmail} Fehler:`, result1.error);
      }
    } catch (error) {
      console.error(`❌ Fehler beim Senden an ${adminEmail}:`, error);
    }
  }
  
  // Fallback an roland.luthi@gmail.com (nur wenn adminEmail nicht funktioniert)
  if (results.length === 0) {
    try {
      const result2 = await resend.emails.send({
        from: fromEmail,
        to: 'roland.luthi@gmail.com',
        subject: emailSubject,
        html: emailHtml,
        text: emailText,
      });
      if (!result2.error) {
        console.log('✅ Kontakt-Benachrichtigung an roland.luthi@gmail.com gesendet (Fallback)');
        results.push({ email: 'roland.luthi@gmail.com', id: result2.data?.id });
      }
    } catch (error) {
      console.error('❌ Fehler:', error);
    }
  }

  return results.length > 0 ? { id: results[0].id, data: { results } } : { error: 'Keine E-Mails versendet' };
}

export async function sendNewsletterOptIn(to: string, firstName: string, token: string) {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/10419aa7-e8ae-40cb-b044-efefcfde0373',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/resend.ts:203',message:'sendNewsletterOptIn called',data:{to,firstName,resendIsNull:resend===null,fromEmail},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
  // #endregion
  if (!resend) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/10419aa7-e8ae-40cb-b044-efefcfde0373',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/resend.ts:205',message:'Resend is null - returning error',data:{to,firstName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    return { error: 'Resend nicht konfiguriert' };
  }

  const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/newsletter/confirm?token=${token}`;

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/10419aa7-e8ae-40cb-b044-efefcfde0373',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/resend.ts:208',message:'Calling resend.emails.send',data:{from:fromEmail,to,confirmUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1,H2,H3,H5'})}).catch(()=>{});
  // #endregion
  
  let result;
  try {
    result = await resend.emails.send({
      from: fromEmail,
      to,
      subject: 'Bitte bestätige deine Newsletter-Anmeldung - Inclusions',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #ff00ff;">Hallo ${firstName}!</h1>
            <p>Vielen Dank für deine Anmeldung zum Inclusions Newsletter.</p>
            <p>Bitte bestätige deine E-Mail-Adresse, indem du auf den folgenden Link klickst:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${confirmUrl}" style="background-color: #ff00ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; display: inline-block;">
                Newsletter bestätigen
              </a>
            </p>
            <p>Der Link ist 7 Tage gültig.</p>
            <p>Bis bald,<br>Das Inclusions Team</p>
          </body>
        </html>
      `,
      text: `Hallo ${firstName}!\n\nVielen Dank für deine Anmeldung zum Inclusions Newsletter.\n\nBitte bestätige deine E-Mail-Adresse:\n${confirmUrl}\n\nDer Link ist 7 Tage gültig.\n\nBis bald,\nDas Inclusions Team`,
    });
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/10419aa7-e8ae-40cb-b044-efefcfde0373',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/resend.ts:270',message:'resend.emails.send result',data:{hasError:!!result.error,error:result.error,errorMessage:result.error?.message,errorName:result.error?.name,hasData:!!result.data,emailId:result.data?.id,fullResult:JSON.stringify(result)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1,H2,H3,H5'})}).catch(()=>{});
    // #endregion
    
    // Detailliertes Logging für Fehler
    if (result.error) {
      const errorDetails = {
        error: result.error,
        message: result.error?.message,
        name: result.error?.name,
        statusCode: (result.error as any)?.statusCode,
        from: fromEmail,
        to: to,
      };
      console.error('❌ Resend API Fehler (Newsletter Opt-In):', JSON.stringify(errorDetails, null, 2));
      
      // Spezifische Fehlermeldungen für häufige Probleme
      if (result.error?.message?.includes('not authorized') || result.error?.message?.includes('Not authorized')) {
        console.error('🔴 PROBLEM: Domain nicht verifiziert! Gehe zu https://resend.com/domains und verifiziere inclusions.zone');
      } else if (result.error?.message?.includes('Invalid API key') || (result.error as any)?.statusCode === 401) {
        console.error('🔴 PROBLEM: API Key ungültig! Prüfe RESEND_API_KEY in .env');
      } else if (result.error?.message?.includes('domain')) {
        console.error('🔴 PROBLEM: Domain-Problem! Prüfe Domain-Verifizierung in Resend Dashboard');
      }
    } else {
      console.log('✅ Newsletter Opt-In E-Mail gesendet:', result.data?.id);
    }
  } catch (err: any) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/10419aa7-e8ae-40cb-b044-efefcfde0373',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/resend.ts:285',message:'Exception in resend.emails.send',data:{error:err?.message,errorName:err?.name,errorStack:err?.stack,from:fromEmail,to},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
    console.error('❌ Exception beim Senden der Newsletter Opt-In E-Mail:', err);
    return { error: err?.message || String(err) };
  }
  
  return result;
}

export async function sendNewsletterWelcome(to: string, firstName: string) {
  if (!resend) return { error: 'Resend nicht konfiguriert' };

  return await resend.emails.send({
    from: fromEmail,
    to,
    subject: 'Willkommen beim Inclusions Newsletter!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #ff00ff;">Willkommen, ${firstName}!</h1>
          <p>Du erhältst jetzt die neuesten Infos zu unseren Events, exklusive Updates und wirst Teil einer Bewegung, die wirklich etwas bewegt.</p>
          <p>Bis bald,<br>Das Inclusions Team</p>
        </body>
      </html>
    `,
    text: `Willkommen, ${firstName}!\n\nDu erhältst jetzt die neuesten Infos zu unseren Events, exklusive Updates und wirst Teil einer Bewegung, die wirklich etwas bewegt.\n\nBis bald,\nDas Inclusions Team`,
  });
}

export async function sendNewsletterNotification(data: {
  email: string;
  firstName?: string;
  lastName?: string;
  hasDisability?: boolean;
  interests?: string[];
  sourceUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}) {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/10419aa7-e8ae-40cb-b044-efefcfde0373',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/resend.ts:262',message:'sendNewsletterNotification called',data:{email:data.email,resendIsNull:resend===null,fromEmail,adminEmail},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
  // #endregion
  if (!resend) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/10419aa7-e8ae-40cb-b044-efefcfde0373',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/resend.ts:274',message:'Resend is null - returning error',data:{email:data.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    return { error: 'Resend nicht konfiguriert' };
  }

  const emailSubject = `📬 Newsletter-Anmeldung${data.firstName || data.lastName ? `: ${[data.firstName, data.lastName].filter(Boolean).join(' ')}` : ''} - Inclusions`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #ff00ff;">📬 Neue Newsletter-Anmeldung</h2>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #333;">Kontaktinformationen</h3>
          <p><strong>E-Mail:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
          ${data.firstName ? `<p><strong>Vorname:</strong> ${data.firstName}</p>` : ''}
          ${data.lastName ? `<p><strong>Nachname:</strong> ${data.lastName}</p>` : ''}
          ${data.hasDisability !== undefined ? `<p><strong>Menschen mit Beeinträchtigung:</strong> ${data.hasDisability ? 'Ja' : 'Nein'}</p>` : ''}
        </div>

        ${data.interests && data.interests.length > 0 ? `
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #333;">Interessen</h3>
          <p>${data.interests.join(', ')}</p>
        </div>
        ` : ''}

        ${data.sourceUrl || data.utmSource || data.utmMedium || data.utmCampaign ? `
        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin-top: 20px; font-size: 12px; color: #666;">
          <h4 style="margin-top: 0; color: #666;">Tracking-Informationen</h4>
          ${data.sourceUrl ? `<p><strong>Quelle:</strong> <a href="${data.sourceUrl}">${data.sourceUrl}</a></p>` : ''}
          ${data.utmSource ? `<p><strong>UTM Source:</strong> ${data.utmSource}</p>` : ''}
          ${data.utmMedium ? `<p><strong>UTM Medium:</strong> ${data.utmMedium}</p>` : ''}
          ${data.utmCampaign ? `<p><strong>UTM Campaign:</strong> ${data.utmCampaign}</p>` : ''}
        </div>
        ` : ''}
      </body>
    </html>
  `;
  
  const emailText = `📬 Neue Newsletter-Anmeldung\n\nKontaktinformationen:\nE-Mail: ${data.email}\n${data.firstName ? `Vorname: ${data.firstName}\n` : ''}${data.lastName ? `Nachname: ${data.lastName}\n` : ''}${data.hasDisability !== undefined ? `Menschen mit Beeinträchtigung: ${data.hasDisability ? 'Ja' : 'Nein'}\n` : ''}\n${data.interests && data.interests.length > 0 ? `Interessen: ${data.interests.join(', ')}\n\n` : ''}${data.sourceUrl ? `Quelle: ${data.sourceUrl}\n` : ''}${data.utmSource ? `UTM Source: ${data.utmSource}\n` : ''}${data.utmMedium ? `UTM Medium: ${data.utmMedium}\n` : ''}${data.utmCampaign ? `UTM Campaign: ${data.utmCampaign}\n` : ''}`;

  // Sende E-Mails einzeln
  const results = [];
  
  // Primär an info@inclusions.zone
  if (adminEmail) {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/10419aa7-e8ae-40cb-b044-efefcfde0373',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/resend.ts:321',message:'Sending notification email to admin',data:{from:fromEmail,to:adminEmail},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1,H2,H3,H5'})}).catch(()=>{});
      // #endregion
      const result1 = await resend.emails.send({
        from: fromEmail,
        to: adminEmail,
        subject: emailSubject,
        html: emailHtml,
        text: emailText,
      });
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/10419aa7-e8ae-40cb-b044-efefcfde0373',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/resend.ts:330',message:'Notification email result',data:{hasError:!!result1.error,error:result1.error,errorMessage:result1.error?.message,errorName:result1.error?.name,errorStatusCode:(result1.error as any)?.statusCode,hasData:!!result1.data,emailId:result1.data?.id,fullResult:JSON.stringify(result1)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1,H2,H3,H5'})}).catch(()=>{});
      // #endregion
      if (!result1.error) {
        console.log(`✅ Newsletter-Benachrichtigung an ${adminEmail} gesendet`);
        results.push({ email: adminEmail, id: result1.data?.id });
      } else {
        const errorDetails = {
          error: result1.error,
          message: result1.error?.message,
          name: result1.error?.name,
          statusCode: (result1.error as any)?.statusCode,
          from: fromEmail,
          to: adminEmail,
        };
        console.error(`❌ ${adminEmail} Fehler (Newsletter Notification):`, JSON.stringify(errorDetails, null, 2));
        
        // Spezifische Fehlermeldungen für häufige Probleme
        if (result1.error?.message?.includes('not authorized') || result1.error?.message?.includes('Not authorized')) {
          console.error('🔴 PROBLEM: Domain nicht verifiziert! Gehe zu https://resend.com/domains und verifiziere inclusions.zone');
        } else if (result1.error?.message?.includes('Invalid API key') || (result1.error as any)?.statusCode === 401) {
          console.error('🔴 PROBLEM: API Key ungültig! Prüfe RESEND_API_KEY in .env');
        } else if (result1.error?.message?.includes('domain')) {
          console.error('🔴 PROBLEM: Domain-Problem! Prüfe Domain-Verifizierung in Resend Dashboard');
        }
      }
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/10419aa7-e8ae-40cb-b044-efefcfde0373',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/resend.ts:337',message:'Exception sending notification email',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
      // #endregion
      console.error(`❌ Fehler beim Senden an ${adminEmail}:`, error);
    }
  }
  
  // Fallback an roland.luthi@gmail.com (nur wenn adminEmail nicht funktioniert)
  if (results.length === 0) {
    try {
      const result2 = await resend.emails.send({
        from: fromEmail,
        to: 'roland.luthi@gmail.com',
        subject: emailSubject,
        html: emailHtml,
        text: emailText,
      });
      if (!result2.error) {
        console.log('✅ Newsletter-Benachrichtigung an roland.luthi@gmail.com gesendet (Fallback)');
        results.push({ email: 'roland.luthi@gmail.com', id: result2.data?.id });
      }
    } catch (error) {
      console.error('❌ Fehler:', error);
    }
  }

  return results.length > 0 ? { id: results[0].id, data: { results } } : { error: 'Keine E-Mails versendet' };
}

export async function sendVIPConfirmation(to: string, name: string, eventDate?: string, eventLocation?: string) {
  if (!resend) {
    console.error('❌ Resend nicht konfiguriert in sendVIPConfirmation');
    return { error: 'Resend nicht konfiguriert' };
  }

  try {
    // Vorname extrahieren (erster Teil des Namens)
    const firstName = name.split(' ')[0];
    
    // Event-Info zusammenstellen (Format: "am [Datum] bei Inclusions 2 im [Ort]")
    let eventInfo = '';
    if (eventDate && eventLocation) {
      eventInfo = `am ${eventDate} bei Inclusions 2 im ${eventLocation}`;
    } else if (eventDate) {
      eventInfo = `am ${eventDate}`;
    } else if (eventLocation) {
      eventInfo = `bei Inclusions 2 im ${eventLocation}`;
    }
    
    console.log(`📧 Sende VIP-Bestätigung an: ${to}`);
    const result = await resend.emails.send({
      from: fromEmail,
      to,
      reply_to: adminEmail,
      subject: 'Ihre VIP-Anmeldung ist angekommen - Inclusions',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.8; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; font-size: 16px;">
            <h1 style="color: #ff00ff; font-size: 24px; margin-bottom: 20px;">Liebe / Lieber ${firstName}</h1>
            <p style="font-size: 18px; margin-bottom: 15px;">vielen Dank für deine Anmeldung. Wir freuen uns sehr, dass du${eventInfo ? ` ${eventInfo} dabei bist` : ' dabei bist'}.</p>
            <p style="margin-bottom: 15px;">Falls es vorab noch Unklarheiten gibt, melden wir uns bei dir.</p>
            <p style="margin-bottom: 15px;">Kurz vor dem Event erhältst du von uns alle wichtigen Infos zu Anreise, Einlass und Ablauf der Party.</p>
            <p style="margin-top: 30px;">Bis bald – wir freuen uns auf dich.</p>
            <p style="margin-top: 20px;">Herzlich<br>Dein Inclusions Team</p>
          </body>
        </html>
      `,
      text: `Liebe / Lieber ${firstName}\n\nvielen Dank für deine Anmeldung. Wir freuen uns sehr, dass du${eventInfo ? ` ${eventInfo} dabei bist` : ' dabei bist'}.\n\nFalls es vorab noch Unklarheiten gibt, melden wir uns bei dir.\nKurz vor dem Event erhältst du von uns alle wichtigen Infos zu Anreise, Einlass und Ablauf der Party.\n\nBis bald – wir freuen uns auf dich.\n\nHerzlich\nDein Inclusions Team`,
    });

    if (result.error) {
      console.error('❌ Resend API Fehler:', result.error);
      return { error: result.error };
    }

    console.log('✅ VIP-Bestätigung gesendet, ID:', result.data?.id);
    return { id: result.data?.id, data: result.data };
  } catch (error) {
    console.error('❌ Fehler beim Senden der VIP-Bestätigung:', error);
    return { error: error instanceof Error ? error.message : 'Unbekannter Fehler' };
  }
}

export async function sendVIPNotification(data: {
  name: string;
  email: string;
  phone?: string;
  eventDate?: string;
  eventLocation?: string;
  eventType?: string;
  message?: string;
  company?: string;
  numberOfGuests?: number | string;
  specialRequirements?: string;
  sourceUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}) {
  if (!resend) {
    console.error('❌ Resend nicht konfiguriert in sendVIPNotification');
    return { error: 'Resend nicht konfiguriert' };
  }

  try {
    // E-Mail-Template für Benachrichtigung
    const emailSubject = `🎫 VIP-Anmeldung${data.eventDate ? `: ${data.eventDate}` : ''}${data.name ? ` - ${data.name}` : ''} - Inclusions`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ff00ff;">🎫 Neue VIP-Anmeldung</h2>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #333;">Kontaktinformationen</h3>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>E-Mail:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
            ${data.phone ? `<p><strong>Telefon:</strong> <a href="tel:${data.phone}">${data.phone}</a></p>` : ''}
            ${data.company ? `<p><strong>Firma:</strong> ${data.company}</p>` : ''}
          </div>

          ${data.eventDate || data.eventLocation || data.eventType || data.numberOfGuests || data.specialRequirements ? `
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #333;">Event-Details</h3>
            ${data.eventDate ? `<p><strong>Event-Datum:</strong> ${data.eventDate}</p>` : ''}
            ${data.eventLocation ? `<p><strong>Event-Ort:</strong> ${data.eventLocation}</p>` : ''}
            ${data.eventType ? `<p><strong>Event-Typ:</strong> ${data.eventType}</p>` : ''}
            ${data.numberOfGuests ? `<p><strong>Anzahl Gäste:</strong> ${data.numberOfGuests}</p>` : ''}
            ${data.specialRequirements ? `<p><strong>Besondere Anforderungen:</strong><br>${data.specialRequirements.replace(/\n/g, '<br>')}</p>` : ''}
          </div>
          ` : ''}

          ${data.message ? `
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #333;">Nachricht</h3>
            <p style="white-space: pre-wrap;">${data.message.replace(/\n/g, '<br>')}</p>
          </div>
          ` : ''}

          ${data.sourceUrl || data.utmSource || data.utmMedium || data.utmCampaign ? `
          <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin-top: 20px; font-size: 12px; color: #666;">
            <h4 style="margin-top: 0; color: #666;">Tracking-Informationen</h4>
            ${data.sourceUrl ? `<p><strong>Quelle:</strong> <a href="${data.sourceUrl}">${data.sourceUrl}</a></p>` : ''}
            ${data.utmSource ? `<p><strong>UTM Source:</strong> ${data.utmSource}</p>` : ''}
            ${data.utmMedium ? `<p><strong>UTM Medium:</strong> ${data.utmMedium}</p>` : ''}
            ${data.utmCampaign ? `<p><strong>UTM Campaign:</strong> ${data.utmCampaign}</p>` : ''}
          </div>
          ` : ''}
        </body>
      </html>
    `;
    
    const emailText = `🎫 Neue VIP-Anmeldung\n\nKontaktinformationen:\nName: ${data.name}\nE-Mail: ${data.email}\n${data.phone ? `Telefon: ${data.phone}\n` : ''}${data.company ? `Firma: ${data.company}\n` : ''}\n${data.eventDate || data.eventLocation || data.eventType || data.numberOfGuests || data.specialRequirements ? `Event-Details:\n${data.eventDate ? `Event-Datum: ${data.eventDate}\n` : ''}${data.eventLocation ? `Event-Ort: ${data.eventLocation}\n` : ''}${data.eventType ? `Event-Typ: ${data.eventType}\n` : ''}${data.numberOfGuests ? `Anzahl Gäste: ${data.numberOfGuests}\n` : ''}${data.specialRequirements ? `Besondere Anforderungen: ${data.specialRequirements}\n` : ''}\n` : ''}${data.message ? `Nachricht:\n${data.message}\n\n` : ''}${data.sourceUrl ? `Quelle: ${data.sourceUrl}\n` : ''}${data.utmSource ? `UTM Source: ${data.utmSource}\n` : ''}${data.utmMedium ? `UTM Medium: ${data.utmMedium}\n` : ''}${data.utmCampaign ? `UTM Campaign: ${data.utmCampaign}\n` : ''}`;

    // Sende E-Mails einzeln
    const results = [];
    
    // Primär an info@inclusions.zone
    if (adminEmail) {
      console.log(`📧 Sende VIP-Benachrichtigung an: ${adminEmail}`);
      try {
        const result1 = await resend.emails.send({
          from: fromEmail,
          to: adminEmail,
          reply_to: data.email,
          subject: emailSubject,
          html: emailHtml,
          text: emailText,
        });
        
        if (result1.error) {
          console.warn(`⚠️ ${adminEmail} Fehler:`, result1.error);
        } else {
          console.log(`✅ Benachrichtigung an ${adminEmail} gesendet, ID:`, result1.data?.id);
          results.push({ email: adminEmail, id: result1.data?.id });
        }
      } catch (error) {
        console.error(`❌ Fehler beim Senden an ${adminEmail}:`, error);
      }
    }
    
    // Fallback an roland.luthi@gmail.com (nur wenn adminEmail nicht funktioniert)
    if (results.length === 0) {
      console.log(`📧 Sende VIP-Benachrichtigung an: roland.luthi@gmail.com (Fallback)`);
      try {
        const result2 = await resend.emails.send({
          from: fromEmail,
          to: 'roland.luthi@gmail.com',
          reply_to: data.email,
          subject: emailSubject,
          html: emailHtml,
          text: emailText,
        });
        
        if (result2.error) {
          console.error('❌ Fehler bei roland.luthi@gmail.com:', result2.error);
        } else {
          console.log('✅ Benachrichtigung an roland.luthi@gmail.com gesendet (Fallback), ID:', result2.data?.id);
          results.push({ email: 'roland.luthi@gmail.com', id: result2.data?.id });
        }
      } catch (error) {
        console.error('❌ Fehler beim Senden an roland.luthi@gmail.com:', error);
      }
    }

    // Rückgabe: Erfolg, wenn mindestens eine E-Mail gesendet wurde
    if (results.length > 0) {
      return { id: results[0].id, data: { results }, success: true };
    } else {
      return { error: 'Keine E-Mails konnten versendet werden' };
    }
  } catch (error) {
    console.error('❌ Fehler beim Senden der VIP-Benachrichtigung:', error);
    return { error: error instanceof Error ? error.message : 'Unbekannter Fehler' };
  }
}


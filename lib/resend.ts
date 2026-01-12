import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@inclusions.zone';
const adminEmail = process.env.RESEND_ADMIN_EMAIL || 'info@inclusions.zone';

if (!resendApiKey || resendApiKey === 're_your-resend-api-key-here') {
  console.warn('⚠️ RESEND_API_KEY ist nicht gesetzt oder ist ein Platzhalter. E-Mail-Versand wird nicht funktionieren.');
  console.warn('⚠️ Formulare funktionieren trotzdem, aber keine E-Mails werden versendet.');
}

export const resend = (resendApiKey && resendApiKey !== 're_your-resend-api-key-here') ? new Resend(resendApiKey) : null;

// Export für Prüfung in anderen Dateien
export { resendApiKey, fromEmail, adminEmail };

// E-Mail Templates
export async function sendContactConfirmation(to: string, name: string) {
  if (!resend) return { error: 'Resend nicht konfiguriert' };

  return await resend.emails.send({
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
}

export async function sendBookingConfirmation(to: string, name: string, bookingItem?: string, eventDate?: string, eventLocation?: string) {
  if (!resend) return { error: 'Resend nicht konfiguriert' };

  return await resend.emails.send({
    from: fromEmail,
    to,
    subject: 'Vielen Dank für deine Buchungsanfrage - Inclusions',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #ff00ff;">Vielen Dank, ${name}!</h1>
          <p>Wir haben deine Buchungsanfrage erhalten${bookingItem ? ` für ${bookingItem}` : ''}.</p>
          ${eventDate ? `<p><strong>Event-Datum:</strong> ${eventDate}</p>` : ''}
          ${eventLocation ? `<p><strong>Event-Ort:</strong> ${eventLocation}</p>` : ''}
          <p>Wir prüfen deine Anfrage und melden uns bald bei dir mit weiteren Details.</p>
          <p>Bis dahin,<br>Das Inclusions Team</p>
        </body>
      </html>
    `,
    text: `Vielen Dank, ${name}!\n\nWir haben deine Buchungsanfrage erhalten${bookingItem ? ` für ${bookingItem}` : ''}.\n${eventDate ? `Event-Datum: ${eventDate}\n` : ''}${eventLocation ? `Event-Ort: ${eventLocation}\n` : ''}\nWir prüfen deine Anfrage und melden uns bald bei dir mit weiteren Details.\n\nBis dahin,\nDas Inclusions Team`,
  });
}

export async function sendContactNotification(data: {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  bookingType?: string;
  bookingItem?: string;
}) {
  if (!resend) return { error: 'Resend nicht konfiguriert' };

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #ff00ff;">Neue Kontaktanfrage</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>E-Mail:</strong> ${data.email}</p>
        ${data.phone ? `<p><strong>Telefon:</strong> ${data.phone}</p>` : ''}
        ${data.bookingType ? `<p><strong>Booking-Typ:</strong> ${data.bookingType}</p>` : ''}
        ${data.bookingItem ? `<p><strong>Gebuchtes Item:</strong> ${data.bookingItem}</p>` : ''}
        ${data.message ? `<p><strong>Nachricht:</strong><br>${data.message.replace(/\n/g, '<br>')}</p>` : ''}
      </body>
    </html>
  `;
  
  const emailText = `Neue Kontaktanfrage\n\nName: ${data.name}\nE-Mail: ${data.email}\n${data.phone ? `Telefon: ${data.phone}\n` : ''}${data.message ? `Nachricht: ${data.message}\n` : ''}`;
  const emailSubject = `Neue Kontaktanfrage: ${data.bookingItem || 'Allgemein'}`;

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
  if (!resend) return { error: 'Resend nicht konfiguriert' };

  const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/newsletter/confirm?token=${token}`;

  return await resend.emails.send({
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
}) {
  if (!resend) return { error: 'Resend nicht konfiguriert' };

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #ff00ff;">Neue Newsletter-Anmeldung</h2>
        <p><strong>E-Mail:</strong> ${data.email}</p>
        ${data.firstName ? `<p><strong>Vorname:</strong> ${data.firstName}</p>` : ''}
        ${data.lastName ? `<p><strong>Nachname:</strong> ${data.lastName}</p>` : ''}
        ${data.hasDisability !== undefined ? `<p><strong>Menschen mit Beeinträchtigung:</strong> ${data.hasDisability ? 'Ja' : 'Nein'}</p>` : ''}
        ${data.interests && data.interests.length > 0 ? `<p><strong>Interessen:</strong> ${data.interests.join(', ')}</p>` : ''}
      </body>
    </html>
  `;
  
  const emailText = `Neue Newsletter-Anmeldung\n\nE-Mail: ${data.email}\n${data.firstName ? `Vorname: ${data.firstName}\n` : ''}${data.lastName ? `Nachname: ${data.lastName}\n` : ''}${data.hasDisability !== undefined ? `Menschen mit Beeinträchtigung: ${data.hasDisability ? 'Ja' : 'Nein'}\n` : ''}${data.interests && data.interests.length > 0 ? `Interessen: ${data.interests.join(', ')}\n` : ''}`;

  // Sende E-Mails einzeln
  const results = [];
  
  // Primär an info@inclusions.zone
  if (adminEmail) {
    try {
      const result1 = await resend.emails.send({
        from: fromEmail,
        to: adminEmail,
        subject: 'Neue Newsletter-Anmeldung - Inclusions',
        html: emailHtml,
        text: emailText,
      });
      if (!result1.error) {
        console.log(`✅ Newsletter-Benachrichtigung an ${adminEmail} gesendet`);
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
        subject: 'Neue Newsletter-Anmeldung - Inclusions',
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

export async function sendVIPConfirmation(to: string, name: string, eventDate?: string) {
  if (!resend) {
    console.error('❌ Resend nicht konfiguriert in sendVIPConfirmation');
    return { error: 'Resend nicht konfiguriert' };
  }

  try {
    // Einfache Sprache für Menschen mit Beeinträchtigung
    const eventInfo = eventDate ? ` für den ${eventDate}` : '';
    
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
            <h1 style="color: #ff00ff; font-size: 24px; margin-bottom: 20px;">Liebe oder lieber ${name}!</h1>
            <p style="font-size: 18px; margin-bottom: 15px;"><strong>Vielen Dank für Ihre Anmeldung.</strong></p>
            <p style="margin-bottom: 15px;">Wir haben Ihre VIP-Anmeldung erhalten${eventInfo}.</p>
            <p style="margin-bottom: 15px;">Wir melden uns bald bei Ihnen.</p>
            <p style="margin-bottom: 15px;">Wir geben Ihnen dann alle wichtigen Informationen.</p>
            <p style="margin-top: 30px;">Mit freundlichen Grüssen<br>Das Inclusions Team</p>
          </body>
        </html>
      `,
      text: `Liebe oder lieber ${name}!\n\nVielen Dank für Ihre Anmeldung.\n\nWir haben Ihre VIP-Anmeldung erhalten${eventInfo}.\n\nWir melden uns bald bei Ihnen.\n\nWir geben Ihnen dann alle wichtigen Informationen.\n\nMit freundlichen Grüssen\nDas Inclusions Team`,
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
  message?: string;
}) {
  if (!resend) {
    console.error('❌ Resend nicht konfiguriert in sendVIPNotification');
    return { error: 'Resend nicht konfiguriert' };
  }

  try {
    // E-Mail-Template für Benachrichtigung
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ff00ff;">Neue VIP-Anmeldung</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>E-Mail:</strong> ${data.email}</p>
          ${data.phone ? `<p><strong>Telefon:</strong> ${data.phone}</p>` : ''}
          ${data.eventDate ? `<p><strong>Event-Datum:</strong> ${data.eventDate}</p>` : ''}
          ${data.eventLocation ? `<p><strong>Event-Ort:</strong> ${data.eventLocation}</p>` : ''}
          ${data.message ? `<p><strong>Nachricht:</strong><br>${data.message.replace(/\n/g, '<br>')}</p>` : ''}
        </body>
      </html>
    `;
    
    const emailText = `Neue VIP-Anmeldung\n\nName: ${data.name}\nE-Mail: ${data.email}\n${data.phone ? `Telefon: ${data.phone}\n` : ''}${data.eventDate ? `Event-Datum: ${data.eventDate}\n` : ''}${data.message ? `Nachricht: ${data.message}\n` : ''}`;
    
    const emailSubject = `Neue VIP-Anmeldung${data.eventDate ? `: ${data.eventDate}` : ''}`;

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


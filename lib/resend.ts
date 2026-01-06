import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@inclusions.zone';
const adminEmail = process.env.RESEND_ADMIN_EMAIL || 'info@inclusions.zone';

if (!resendApiKey) {
  console.warn('RESEND_API_KEY ist nicht gesetzt. E-Mail-Versand wird nicht funktionieren.');
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

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

export async function sendContactNotification(data: {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  bookingType?: string;
  bookingItem?: string;
}) {
  if (!resend) return { error: 'Resend nicht konfiguriert' };

  return await resend.emails.send({
    from: fromEmail,
    to: adminEmail,
    subject: `Neue Kontaktanfrage: ${data.bookingItem || 'Allgemein'}`,
    html: `
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
    `,
    text: `Neue Kontaktanfrage\n\nName: ${data.name}\nE-Mail: ${data.email}\n${data.phone ? `Telefon: ${data.phone}\n` : ''}${data.message ? `Nachricht: ${data.message}\n` : ''}`,
  });
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

export async function sendVIPConfirmation(to: string, name: string, eventDate?: string) {
  if (!resend) return { error: 'Resend nicht konfiguriert' };

  return await resend.emails.send({
    from: fromEmail,
    to,
    subject: 'VIP-Anmeldung erhalten - Inclusions',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #ff00ff;">Vielen Dank, ${name}!</h1>
          <p>Wir haben deine VIP-Anmeldung erhalten${eventDate ? ` für ${eventDate}` : ''}.</p>
          <p>Wir melden uns bald bei dir mit weiteren Details.</p>
          <p>Bis dahin,<br>Das Inclusions Team</p>
        </body>
      </html>
    `,
    text: `Vielen Dank, ${name}!\n\nWir haben deine VIP-Anmeldung erhalten${eventDate ? ` für ${eventDate}` : ''}.\n\nWir melden uns bald bei dir mit weiteren Details.\n\nBis dahin,\nDas Inclusions Team`,
  });
}

export async function sendVIPNotification(data: {
  name: string;
  email: string;
  phone?: string;
  eventDate?: string;
  eventLocation?: string;
  message?: string;
}) {
  if (!resend) return { error: 'Resend nicht konfiguriert' };

  return await resend.emails.send({
    from: fromEmail,
    to: adminEmail,
    subject: `Neue VIP-Anmeldung${data.eventDate ? `: ${data.eventDate}` : ''}`,
    html: `
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
    `,
    text: `Neue VIP-Anmeldung\n\nName: ${data.name}\nE-Mail: ${data.email}\n${data.phone ? `Telefon: ${data.phone}\n` : ''}${data.eventDate ? `Event-Datum: ${data.eventDate}\n` : ''}${data.message ? `Nachricht: ${data.message}\n` : ''}`,
  });
}


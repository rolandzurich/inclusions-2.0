# Frontend-Integration Guide

## Formulare anpassen

### 1. Booking-Formular

Die bestehende `/app/booking/page.tsx` muss angepasst werden, um die neue `/api/contact` Route zu nutzen.

**Beispiel-Integration:**

```typescript
import { submitForm } from '@/lib/form-helpers';
import { trackFormSubmit } from '@/lib/umami';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const { response, result } = await submitForm('/api/contact', {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
      booking_type: selectedType,
      booking_item: selectedBookingName,
      event_date: formData.eventDate,
      event_location: formData.eventLocation,
      event_type: formData.eventType,
    }, {
      trackEvent: trackFormSubmit,
    });

    if (response.ok) {
      trackFormSubmit('contact', true);
      // Erfolg anzeigen
    } else {
      trackFormSubmit('contact', false);
      // Fehler anzeigen
    }
  } catch (error) {
    trackFormSubmit('contact', false);
    // Fehler anzeigen
  }
};
```

### 2. Newsletter-Formular

**Beispiel für `/app/newsletter/page.tsx`:**

```typescript
import { submitForm } from '@/lib/form-helpers';
import { trackFormSubmit } from '@/lib/umami';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validate()) return;

  try {
    const { response, result } = await submitForm('/api/newsletter', {
      email: formData.email,
      first_name: formData.vorname,
      last_name: formData.nachname,
      has_disability: formData.beeintraechtigung === 'ja',
      interests: formData.interessiert,
    }, {
      trackEvent: trackFormSubmit,
    });

    if (response.ok) {
      trackFormSubmit('newsletter', true);
      // Erfolg anzeigen
      alert('Bitte bestätige deine E-Mail-Adresse. Wir haben dir eine E-Mail gesendet.');
    } else {
      trackFormSubmit('newsletter', false);
      // Fehler anzeigen
    }
  } catch (error) {
    trackFormSubmit('newsletter', false);
    // Fehler anzeigen
  }
};
```

### 3. VIP-Anmeldung

**Beispiel für `/app/anmeldung/vip/page.tsx`:**

```typescript
import { submitForm } from '@/lib/form-helpers';
import { trackFormSubmit } from '@/lib/umami';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const { response, result } = await submitForm('/api/vip', {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      event_date: formData.eventDate,
      event_location: formData.eventLocation,
      message: formData.message,
    }, {
      trackEvent: trackFormSubmit,
    });

    if (response.ok) {
      trackFormSubmit('vip', true);
      // Erfolg anzeigen
    } else {
      trackFormSubmit('vip', false);
      // Fehler anzeigen
    }
  } catch (error) {
    trackFormSubmit('vip', false);
    // Fehler anzeigen
  }
};
```

## Honeypot-Feld hinzufügen

Füge in jedem Formular ein verstecktes Honeypot-Feld hinzu:

```tsx
{/* Honeypot - für Bots unsichtbar */}
<input
  type="text"
  name="website"
  style={{ display: 'none' }}
  tabIndex={-1}
  autoComplete="off"
  aria-hidden="true"
/>
```

**Wichtig:** Das Feld sollte:
- Mit CSS versteckt sein (`display: none`)
- Kein `tabIndex` haben
- Kein `label` haben
- Von Screenreadern ignoriert werden (`aria-hidden`)

## UTM-Parameter Tracking

UTM-Parameter werden automatisch aus der URL extrahiert und mitgesendet. Keine zusätzliche Implementierung nötig.

**Beispiel-URLs:**
- `https://inclusions.zone/newsletter?utm_source=facebook&utm_medium=social&utm_campaign=event2026`
- `https://inclusions.zone/booking?utm_source=email&utm_medium=newsletter`

## Umami Event Tracking

Events werden automatisch getrackt, wenn `trackEvent` in `submitForm` verwendet wird.

**Manuelle Events:**

```typescript
import { trackEvent } from '@/lib/umami';

// Custom Event
trackEvent('button_click', { button: 'cta-hero' });

// Pageview
trackEvent('pageview', { path: '/booking' });
```

## Content Blocks (Mini-CMS)

### Content im Frontend laden

```typescript
// Einzelner Block
const response = await fetch('/api/content?key=hero-title');
const block = await response.json();

// Alle Blocks
const response = await fetch('/api/content');
const { blocks } = await response.json();
```

### Beispiel-Komponente

```tsx
'use client';

import { useEffect, useState } from 'react';

export function ContentBlock({ key }: { key: string }) {
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/content?key=${key}`)
      .then(res => res.json())
      .then(data => setContent(data));
  }, [key]);

  if (!content) return null;

  return (
    <div>
      {content.title && <h2>{content.title}</h2>}
      {content.body_html && (
        <div dangerouslySetInnerHTML={{ __html: content.body_html }} />
      )}
    </div>
  );
}
```

## Newsletter Bestätigung

Nach der Newsletter-Anmeldung wird der User zur Bestätigungsseite weitergeleitet.

**Beispiel-Seite `/app/newsletter/confirm/page.tsx`:**

```tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NewsletterConfirmPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      return;
    }

    // Bestätigung wird automatisch via GET /api/newsletter/confirm?token=... gehandhabt
    // Diese Seite zeigt nur den Status
    const error = searchParams.get('error');
    if (error) {
      setStatus('error');
    } else {
      setStatus('success');
    }
  }, [searchParams]);

  if (status === 'loading') {
    return <div>Wird bestätigt...</div>;
  }

  if (status === 'error') {
    return (
      <div>
        <h1>Fehler bei der Bestätigung</h1>
        <p>Der Bestätigungslink ist ungültig oder abgelaufen.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Newsletter erfolgreich bestätigt!</h1>
      <p>Du erhältst jetzt die neuesten Infos zu unseren Events.</p>
    </div>
  );
}
```

## Fehlerbehandlung

### Rate Limiting

Wenn zu viele Anfragen kommen, wird ein 429 Status zurückgegeben:

```typescript
if (response.status === 429) {
  alert('Zu viele Anfragen. Bitte versuche es später erneut.');
}
```

### Validierung

Die API validiert:
- E-Mail-Format
- Pflichtfelder
- Honeypot (Bots werden stillschweigend abgelehnt)

### Fehler-Anzeige

```typescript
if (!response.ok) {
  const error = await response.json();
  alert(error.message || 'Ein Fehler ist aufgetreten.');
}
```

## Testing

### Lokal testen

1. Backend starten: `cd backend && docker-compose up -d`
2. Next.js starten: `npm run dev`
3. Formulare testen:
   - Booking-Formular ausfüllen
   - Newsletter anmelden
   - VIP-Anmeldung testen
4. Admin-Bereich prüfen: `http://localhost:3000/admin/login`

### E-Mail-Testing

- Resend bietet einen Test-Modus
- E-Mails werden in Resend Dashboard angezeigt
- Keine echten E-Mails im Test-Modus

## Checkliste

- [ ] Booking-Formular angepasst
- [ ] Newsletter-Formular angepasst
- [ ] VIP-Anmeldung angepasst
- [ ] Honeypot-Felder hinzugefügt
- [ ] Umami Script im Layout
- [ ] Event Tracking implementiert
- [ ] Fehlerbehandlung implementiert
- [ ] Success/Error Messages angezeigt
- [ ] Content Blocks integriert (optional)


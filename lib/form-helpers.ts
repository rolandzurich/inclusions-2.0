// Helper für Formular-Submission mit Honeypot, UTM-Tracking, etc.

export function getUTMParams(): {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  source_url: string;
} {
  if (typeof window === 'undefined') {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      source_url: 'unknown',
    };
  }

  const params = new URLSearchParams(window.location.search);
  const utm_source = params.get('utm_source');
  const utm_medium = params.get('utm_medium');
  const utm_campaign = params.get('utm_campaign');
  const source_url = window.location.href;

  return {
    utm_source,
    utm_medium,
    utm_campaign,
    source_url,
  };
}

export function addHoneypotToForm(formData: Record<string, any>): Record<string, any> {
  // Honeypot-Feld hinzufügen (sollte leer bleiben, sonst ist es ein Bot)
  return {
    ...formData,
    honeypot: '', // Leer lassen für echte User
  };
}

// Helper für Form-Submission mit Tracking
export async function submitForm(
  endpoint: string,
  formData: Record<string, any>,
  options?: {
    trackEvent?: (eventName: string, data?: Record<string, any>) => void;
  }
) {
  const utmParams = getUTMParams();
  const dataWithTracking = {
    ...addHoneypotToForm(formData),
    ...utmParams,
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataWithTracking),
    });

    const result = await response.json();

    // Umami Event Tracking
    if (options?.trackEvent) {
      options.trackEvent(`form_submit_${endpoint.split('/').pop()}`, {
        success: response.ok,
      });
    }

    return { response, result };
  } catch (error) {
    console.error('Form submission error:', error);
    throw error;
  }
}


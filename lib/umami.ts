// Umami Analytics Helper
// Für Event Tracking im Frontend

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, any>) => void;
    };
  }
}

export function trackEvent(eventName: string, eventData?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.umami) {
    window.umami.track(eventName, eventData);
  }
}

// Spezifische Event-Helper
export function trackFormSubmit(formType: 'contact' | 'newsletter' | 'vip', success: boolean) {
  trackEvent(`form_submit_${formType}`, { success });
}

export function trackPageView(path: string) {
  trackEvent('pageview', { path });
}


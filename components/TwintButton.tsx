'use client';

import { useEffect } from 'react';

export function TwintButton() {
  useEffect(() => {
    // Prüfen ob der Button bereits gerendert wurde
    const container = document.getElementById('rnw-paylink-button-tkzmp');
    if (!container || container.hasChildNodes()) {
      return;
    }

    // Script-Tag für das ES-Modul erstellen
    const script = document.createElement('script');
    script.type = 'module';
    script.innerHTML = `
      import {TwintButton} from "https://unpkg.com/@raisenow/paylink-button@2/dist/TwintButton.js"
      TwintButton.render("#rnw-paylink-button-tkzmp", {
        "solution-id": "tkzmp",
        "solution-type": "donate",
        "language": "de",
        "size": "large",
        "width": "fixed",
        "color-scheme": "light",
      })
    `;
    
    document.head.appendChild(script);

    return () => {
      // Cleanup beim Unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return <div id="rnw-paylink-button-tkzmp"></div>;
}

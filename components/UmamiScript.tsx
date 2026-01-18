'use client';

import Script from 'next/script';

export default function UmamiScript() {
  const umamiUrl = process.env.NEXT_PUBLIC_UMAMI_URL;
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

  if (!umamiUrl || !umamiWebsiteId) {
    return null;
  }

  return (
    <Script
      src={`${umamiUrl}/script.js`}
      data-website-id={umamiWebsiteId}
      strategy="lazyOnload"
    />
  );
}


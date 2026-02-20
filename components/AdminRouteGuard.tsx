'use client';

import { usePathname } from 'next/navigation';

/**
 * Blendet Kinder-Elemente im Admin-Bereich aus.
 * Wird verwendet um Header/Footer auf Admin-Seiten zu verstecken.
 */
export function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith('/admin-v2') || pathname.startsWith('/admin') || pathname.startsWith('/crew')) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Entfernt die dunkle Website-Hintergrundfarbe im Admin/Crew-Bereich.
 */
export function AdminBodyClass({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isProtected = pathname.startsWith('/admin-v2') || pathname.startsWith('/admin') || pathname.startsWith('/crew');

  if (isProtected) {
    return (
      <div className="admin-area" style={{ backgroundColor: '#f9fafb', color: '#111827', minHeight: '100vh' }}>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}

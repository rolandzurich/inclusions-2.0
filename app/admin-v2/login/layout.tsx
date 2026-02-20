'use client';

/**
 * Login hat eigenes Layout OHNE Admin-Sidebar/Header.
 * Muss 'use client' sein weil parent layout auch client ist.
 */
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

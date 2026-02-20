import { ReactNode } from 'react';
import { redirect } from 'next/navigation';

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Alter Admin wird auf neuen Admin umgeleitet
  redirect('/admin-v2/dashboard');

  return <>{children}</>;
}

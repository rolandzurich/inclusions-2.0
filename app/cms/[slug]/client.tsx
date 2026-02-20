'use client';

import { PageRenderer } from '@/components/cms/SectionRenderer';

export function CMSPageClient({ sections }: { sections: any[] }) {
  return <PageRenderer sections={sections} />;
}

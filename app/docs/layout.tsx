import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { getMaxUnlockedIndex } from '@/lib/session';
import { SidebarLockIndicator } from '@/components/sidebar-lock-indicator';

export default async function Layout({ children }: LayoutProps<'/docs'>) {
  const maxUnlockedIndex = await getMaxUnlockedIndex();

  return (
    <DocsLayout tree={source.getPageTree()} {...baseOptions()} sidebar={{ enabled: true }}>
      <SidebarLockIndicator maxUnlockedIndex={maxUnlockedIndex} />
      {children}
    </DocsLayout>
  );
}

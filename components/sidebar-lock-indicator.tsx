'use client';

/**
 * Client component that adds lock icons to locked sidebar items
 * Intercepts clicks on locked items and redirects to unlock page
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SidebarLockIndicatorProps {
  maxUnlockedIndex: number;
}

export function SidebarLockIndicator({ maxUnlockedIndex }: SidebarLockIndicatorProps) {
  const router = useRouter();

  useEffect(() => {
    // Function to check if a URL is locked
    const isLocked = (url: string): boolean => {
      const match = url.match(/workshop\/(\d+)-/);
      if (!match) return false;

      const chapterIndex = parseInt(match[1], 10) - 1;
      return chapterIndex > maxUnlockedIndex;
    };

    // Function to add lock icons to locked sidebar items
    const applyLockIcons = () => {
      // Try multiple selectors to find sidebar links
      const selectors = [
        'nav a[href*="/docs/"]',
        'aside a[href*="/docs/"]',
        'nav a[href*="/workshop/"]',
        'aside a[href*="/workshop/"]',
        '[data-sidebar] a[href*="/docs/"]',
        'div[class*="sidebar"] a[href*="/docs/"]',
        'div[class*="nav"] a[href*="/docs/"]',
      ];

      selectors.forEach((selector) => {
        const links = document.querySelectorAll(selector);

        links.forEach((link) => {
          const href = link.getAttribute('href');
          if (!href) return;

          // Skip if already processed
          if (link.hasAttribute('data-workshop-processed')) return;

          // CRITICAL: Skip links in main content (next/prev buttons are there)
          if (link.closest('main')) return;

          // Skip links that contain "Next" or "Previous" text
          const linkText = link.textContent?.trim().toLowerCase() || '';
          if (linkText.includes('next') || linkText.includes('previous')) return;

          // Mark as processed
          link.setAttribute('data-workshop-processed', 'true');

          if (isLocked(href)) {
            // Create lock icon
            const lockIcon = document.createElement('span');
            lockIcon.innerHTML = '🔒';
            lockIcon.className = 'lock-icon';
            lockIcon.style.marginRight = '8px';
            lockIcon.style.fontSize = '0.9em';
            lockIcon.setAttribute('aria-label', 'Locked chapter');

            // Insert lock icon before the link content
            link.insertBefore(lockIcon, link.firstChild);

            // Mark as locked
            link.setAttribute('data-locked', 'true');
            link.setAttribute('aria-label', 'Locked chapter - password required');

            // Intercept click to redirect to unlock page
            const clickHandler = (e: MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/unlock?next=${encodeURIComponent(href)}`);
            };

            link.addEventListener('click', clickHandler, true);
          }
        });
      });
    };

    // Run multiple times with delays to catch late-rendering content
    const timeouts = [
      setTimeout(applyLockIcons, 100),
      setTimeout(applyLockIcons, 500),
      setTimeout(applyLockIcons, 1000),
      setTimeout(applyLockIcons, 2000),
    ];

    // Also observe DOM changes
    const observer = new MutationObserver(() => {
      applyLockIcons();
    });

    // Observe the entire document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      timeouts.forEach(clearTimeout);
      observer.disconnect();
    };
  }, [maxUnlockedIndex, router]);

  // This component doesn't render anything visible
  return null;
}

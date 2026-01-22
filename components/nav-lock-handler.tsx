'use client';

/**
 * Client component that intercepts locked next/prev navigation clicks
 * Redirects to unlock page if target doc is locked
 * Does NOT blur - keeps buttons fully visible and clickable
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface NavLockHandlerProps {
  maxUnlockedIndex: number;
}

export function NavLockHandler({ maxUnlockedIndex }: NavLockHandlerProps) {
  const router = useRouter();

  useEffect(() => {
    // Function to check if a URL is locked
    const isLocked = (url: string): boolean => {
      const match = url.match(/workshop\/(\d+)-/);
      if (!match) return false;

      const chapterIndex = parseInt(match[1], 10) - 1;
      return chapterIndex > maxUnlockedIndex;
    };

    // Function to intercept locked next/prev links
    const interceptNavLinks = () => {
      // ONLY process links in main content, NOT sidebar
      const mainContent = document.querySelector('main');
      if (!mainContent) return;

      const navLinks = mainContent.querySelectorAll('a[href*="/docs/"]');

      navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (!href) return;

        // Skip if already processed
        if (link.hasAttribute('data-nav-processed')) return;
        link.setAttribute('data-nav-processed', 'true');

        // Check if this is a next/prev link
        const isNextOrPrev =
          link.textContent?.includes('Next') ||
          link.textContent?.includes('Previous') ||
          link.closest('[data-page-direction]');

        if (isNextOrPrev && isLocked(href)) {
          // Mark as locked
          link.setAttribute('data-nav-locked', 'true');

          // Intercept click to redirect to unlock page
          const clickHandler = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            router.push(`/unlock?next=${encodeURIComponent(href)}`);
          };

          link.addEventListener('click', clickHandler, true);
        }
      });
    };

    // Run after DOM is ready
    const timeout = setTimeout(interceptNavLinks, 100);

    // Use MutationObserver to watch main content only
    const mainContent = document.querySelector('main');
    if (mainContent) {
      const observer = new MutationObserver(() => {
        interceptNavLinks();
      });

      observer.observe(mainContent, {
        childList: true,
        subtree: true,
      });

      return () => {
        clearTimeout(timeout);
        observer.disconnect();
      };
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [maxUnlockedIndex, router]);

  return null;
}

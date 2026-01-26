import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <div className="flex items-center gap-2">
          <img
            src="/logo.svg"
            alt="Beetroot Logo"
            className="w-6 h-6 translate-x-1 -translate-y-1 dark:invert"
          />
          <span>Beetroot</span>
        </div>
      ),
    },
  };
}

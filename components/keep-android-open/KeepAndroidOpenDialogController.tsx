"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ExternalLink, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const OPEN_EVENT = "kao:open";
const ICON_LINK_SELECTOR = 'a[href="#keep-android-open"]';
const SEEN_STORAGE_KEY = "kao_seen_v1";
const DISMISSED_STORAGE_KEY = "kao_dismissed_v1";
const BANNER_HOST_ID = "kao-banner-host";
const BANNER_SCRIPT_ID = "kao-banner-script";
const BANNER_SCRIPT_SRC =
  "https://keepandroidopen.org/banner.js?lang=en&size=mini&id=kao-banner-host&hidebutton=off&animation=on&link=https%3A%2F%2Fkeepandroidopen.org";
const ANIM_MS = 10;

function getDaysLeft() {
  const target = new Date("Sep 1, 2026 00:00:00").getTime();

  return Math.max(0, Math.ceil((target - Date.now()) / 86400000));
}

function markAsSeen() {
  try {
    localStorage.setItem(SEEN_STORAGE_KEY, "1");
    localStorage.setItem(DISMISSED_STORAGE_KEY, String(Date.now()));
  } catch {
    // Storage can be unavailable in private modes; closing should still work.
  }
}

export function KeepAndroidOpenDialogController() {
  const [open, setOpen] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [bannerReady, setBannerReady] = useState(false);
  const [bannerFailed, setBannerFailed] = useState(false);
  const [mounted, setMounted] = useState(false);

  const openDialog = useCallback(() => {
    setDaysLeft(getDaysLeft());
    setBannerReady(false);

    setMounted(true);

    window.requestAnimationFrame(() => setOpen(true));
  }, []);

  const closeAndPersist = useCallback(() => {
    markAsSeen();

    setBannerReady(false);
    setOpen(false);

    window.setTimeout(() => setMounted(false), ANIM_MS);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setDaysLeft(getDaysLeft());

      try {
        if (localStorage.getItem(SEEN_STORAGE_KEY) !== "1") {
          openDialog();
        }
      } catch {
        openDialog();
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [openDialog]);

  useEffect(() => {
    function handleOpenEvent() {
      openDialog();
    }

    window.addEventListener(OPEN_EVENT, handleOpenEvent);
    document.addEventListener(OPEN_EVENT, handleOpenEvent);

    return () => {
      window.removeEventListener(OPEN_EVENT, handleOpenEvent);
      document.removeEventListener(OPEN_EVENT, handleOpenEvent);
    };
  }, [openDialog]);

  useEffect(() => {
    function updateIconAnchors() {
      const anchors =
        document.querySelectorAll<HTMLAnchorElement>(ICON_LINK_SELECTOR);

      for (const anchor of anchors) {
        anchor.setAttribute("title", "Keep Android Open");
        anchor.setAttribute("role", "button");
      }
    }

    function handleClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;

      const anchor = event.target.closest(ICON_LINK_SELECTOR);
      if (!anchor) return;

      event.preventDefault();
      openDialog();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== " " && event.key !== "Enter") return;
      if (!(event.target instanceof Element)) return;

      const anchor = event.target.closest(ICON_LINK_SELECTOR);
      if (!anchor) return;

      event.preventDefault();
      openDialog();
    }

    updateIconAnchors();

    const observer = new MutationObserver(updateIconAnchors);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("click", handleClick, true);
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      observer.disconnect();
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [openDialog]);

  useEffect(() => {
    if (!open) return;

    let observer: MutationObserver | null = null;

    const frame = window.requestAnimationFrame(() => {
      const host = document.getElementById(BANNER_HOST_ID);
      if (!host) return;

      setBannerReady(false);
      setBannerFailed(false);

      observer = new MutationObserver(() => {
        if (host.childElementCount > 0) {
          setBannerReady(true);
        }
      });
      observer.observe(host, { childList: true, subtree: true });

      const existingScript = document.getElementById(BANNER_SCRIPT_ID);
      if (existingScript && host.childElementCount > 0) {
        setBannerReady(true);
        return;
      }
      existingScript?.remove();

      const script = document.createElement("script");
      script.id = BANNER_SCRIPT_ID;
      script.src = BANNER_SCRIPT_SRC;
      script.async = true;
      script.onerror = () => {
        setBannerFailed(true);
        setBannerReady(true);
      };

      document.body.appendChild(script);
    });

    return () => {
      observer?.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [open]);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      openDialog();
      return;
    }

    closeAndPersist();
  }

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }

    if (!mounted) return;

    const t = window.setTimeout(() => setMounted(false), ANIM_MS);
    return () => window.clearTimeout(t);
  }, [open, mounted]);

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      {mounted ? (
        <Dialog.Portal>
          <Dialog.Overlay
            className={cn(
              "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm",
              "transition-opacity duration-20 ease-out",
              "data-[state=open]:opacity-100 data-[state=closed]:opacity-0",
              "data-[state=closed]:pointer-events-none",
            )}
          />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg",
              "-translate-x-1/2 -translate-y-1/2",
              "rounded-lg border border-fd-border bg-fd-background p-6 text-fd-foreground shadow-xl outline-none sm:p-7",
              "transition-[opacity,transform] duration-200 ease-out will-change-[opacity,transform]",
              "data-[state=open]:opacity-100 data-[state=closed]:opacity-0",
              "data-[state=open]:scale-100 data-[state=closed]:scale-95",
              "rounded-lg border bg-fd-background text-fd-foreground shadow-xl outline-none",
              "border-fd-border",
              "ring-1 ring-red-600/30",
              "shadow-[0_20px_60px_-20px_rgba(0,0,0,0.65)]",
            )}
          >
            <div className="relative px-8 text-center">
              <div className="space-y-1.5">
                <Dialog.Title className="text-xl font-semibold">
                  KEEP ANDROID OPEN
                </Dialog.Title>
                <Dialog.Description className="text-sm font-semibold text-red-500">
                  {daysLeft === null
                    ? "Loading countdown"
                    : `${daysLeft} DAYS LEFT`}
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close Keep Android Open"
                  className="absolute right-0 top-0 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-foreground/30"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </Dialog.Close>
            </div>

            <div
              className={cn(
                "relative mt-6 min-h-16 overflow-hidden rounded-lg border border-fd-border bg-fd-accent/30 p-2 transition-opacity duration-200 sm:min-h-14",
                !open && "opacity-0",
              )}
            >
              <div
                aria-hidden="true"
                className={cn(
                  "absolute inset-2 rounded-md bg-fd-muted transition-opacity duration-200",
                  bannerReady ? "opacity-0" : "animate-pulse opacity-100",
                )}
              />
              <div
                id={BANNER_HOST_ID}
                className={cn(
                  "relative transition-all duration-300 ease-out",
                  bannerReady
                    ? "translate-y-0 opacity-100"
                    : "translate-y-1 opacity-0",
                  "[&_.kao-banner]:block [&_.kao-banner]:w-full [&_.kao-banner]:border-0",
                )}
              />
              {bannerFailed ? (
                <p className="relative p-3 text-sm text-fd-muted-foreground">
                  The official banner could not be loaded.
                </p>
              ) : null}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={closeAndPersist}
                className="inline-flex h-9 items-center justify-center rounded-md border border-fd-border px-4 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-foreground/30"
              >
                Dismiss
              </button>
              <a
                href="https://keepandroidopen.org"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-fd-accent px-4 text-sm font-medium text-fd-accent-foreground transition-colors hover:bg-fd-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-foreground/30"
              >
                Learn more
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      ) : null}
    </Dialog.Root>
  );
}

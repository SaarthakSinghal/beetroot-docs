'use client';

/**
 * Unlock page for workshop chapters
 * Users enter a password to unlock the next chapter
 */

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { getDocInfo } from '@/lib/workshopAccess';

function UnlockPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/docs';

  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Get doc info from the next path
  const [docTitle, setDocTitle] = useState<string>('');
  const [docSlug, setDocSlug] = useState<string>('');

  useEffect(() => {
    // Extract slug from next path
    const slug = nextPath.replace(/^\/docs\//, '').replace(/\.mdx$/, '');
    setDocSlug(slug);

    // Get doc info
    const docInfo = getDocInfo(slug);
    if (docInfo) {
      setDocTitle(docInfo.title);
    }
  }, [nextPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: docSlug,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        setSuccess(true);
        // Redirect after a short delay
        setTimeout(() => {
          router.push(nextPath);
        }, 500);
      } else {
        setError(data.error || 'Incorrect password');
        setSuccess(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipToHome = () => {
    // Get the chapter they're trying to access
    const docInfo = getDocInfo(docSlug);

    if (docInfo && docInfo.index > 0) {
      // They're trying to access a workshop chapter, send them to the previous one
      const previousIndex = docInfo.index - 1;
      const { workshopDocs } = require('@/lib/workshopAccess');
      const previousChapter = workshopDocs.find((doc: any) => doc.index === previousIndex);

      if (previousChapter) {
        router.push(previousChapter.fullPath);
        return;
      }
    }

    // Default: send them to the first workshop chapter
    router.push('/docs/workshop/01-overview');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Unlock Chapter</h1>
          <p className="text-muted-foreground">
            {docTitle ? `Enter password to access: ${docTitle}` : 'Enter password to continue'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter chapter password"
              disabled={isLoading || success}
              autoFocus
            />
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Unlocked! Redirecting...
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading || success || !password}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                'Verifying...'
              ) : success ? (
                'Unlocked!'
              ) : (
                <>
                  Unlock
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSkipToHome}
              disabled={isLoading || success}
              className="px-4 py-2 rounded-md border border-input bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Back to Docs
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Workshop access is password-protected.</p>
          <p className="mt-1">Contact your workshop instructor for the password.</p>
        </div>
      </div>
    </div>
  );
}

export default function UnlockPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <UnlockPageContent />
    </Suspense>
  );
}

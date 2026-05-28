'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[global-error]', error);
    // TODO(analytics): track('app_error', { digest: error.digest, scope: 'global' })
    // — left as a marker to avoid importing analytics in the degraded root-layout
    //   failure context; console.error is the reliable capture here.
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '2rem',
        }}
      >
        <div style={{ maxWidth: '28rem', textAlign: 'center' }} className="mx-auto">
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>
            Something went wrong
          </h1>
          <p style={{ marginTop: '0.75rem', color: '#374151' }}>
            We&apos;ve logged the error and will look into it. Try again, or head back home.
          </p>
          <div
            style={{
              marginTop: '1.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                borderRadius: '0.75rem',
                background: '#111827',
                color: '#fff',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
            {/* Intentional <a>, not next/link: global-error replaces the root
                layout, so the Next.js router context may be unavailable here.
                A full-page navigation is the only reliable way home. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                borderRadius: '0.75rem',
                border: '1px solid #d1d5db',
                background: '#fff',
                color: '#111827',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}

"use client";

import Link from "next/link";

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md text-center py-16">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="mt-3 text-gray-700">We&apos;ve logged the error and will look into it.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button onClick={() => reset()} className="btn btn-primary">Try again</button>
        <Link href="/" className="btn">Home</Link>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-md text-center py-16" role="status" aria-label="Loading">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
      <p className="mt-4 text-sm text-gray-600">Loading…</p>
      <span className="sr-only">Loading</span>
    </div>
  );
}

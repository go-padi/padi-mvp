import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md text-center py-16">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-3 text-gray-700">We couldn&apos;t find the page you were looking for.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">Home</Link>
        <Link href="/teacher" className="btn">Teacher dashboard</Link>
      </div>
    </div>
  );
}

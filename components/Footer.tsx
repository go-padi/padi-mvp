import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200 py-4 text-xs text-gray-500">
      <div className="container flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <span>© 2026 Padi</span>
        <span aria-hidden="true">·</span>
        <Link href="/privacy" className="hover:text-gray-700">Privacy</Link>
        <span aria-hidden="true">·</span>
        <Link href="/terms" className="hover:text-gray-700">Terms</Link>
        <span aria-hidden="true">·</span>
        <a href="mailto:hello@go-padi.com" className="hover:text-gray-700">hello@go-padi.com</a>
      </div>
    </footer>
  );
}

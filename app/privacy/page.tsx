export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl">
      <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
        <strong>Placeholder text</strong> — pending counsel review before public launch.
      </div>

      <h1 className="mt-6 text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-gray-700">
        Padi takes the privacy of teachers, parents, and their students seriously. This page describes what we collect, why, and how to contact us. Final language is pending review by counsel before public launch.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Data we collect</h2>
      <p className="mt-2 text-gray-700">
        Email address, optional display name, the first name and grade level of students you create, your lesson activity (which modules you start and complete), and standard account/session metadata.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Why we collect it</h2>
      <p className="mt-2 text-gray-700">
        To give you access to your account, to remember which lessons you&apos;ve started, to support you when you contact us, and to maintain the security of the service.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Where it&apos;s stored</h2>
      <p className="mt-2 text-gray-700">
        Supabase-managed Postgres (Padi&apos;s database provider). Application traffic is served via Vercel (Padi&apos;s hosting provider). Both are reputable providers with their own security practices.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Third parties</h2>
      <p className="mt-2 text-gray-700">
        Supabase and Vercel as described above. Neither has access to your data for advertising or marketing purposes. We do not share data with third-party advertisers.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Retention</h2>
      <p className="mt-2 text-gray-700">
        We hold your account data until you request deletion. Server-side logs are short-lived and automatically rotated.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Children&apos;s data</h2>
      <p className="mt-2 text-gray-700">
        We treat student information with special care. We do not sell student data, and we do not use it for advertising. If you are a parent or guardian and have concerns about data tied to a child, contact us using the address below.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Your rights</h2>
      <p className="mt-2 text-gray-700">
        You can request access to, correction of, or deletion of your account data at any time by emailing the address below. We aim to respond within a reasonable time frame.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Contact</h2>
      <p className="mt-2 text-gray-700">
        Email <a href="mailto:hello@go-padi.com" className="text-blue-600 hover:underline">hello@go-padi.com</a> for any privacy questions or requests.
      </p>
    </article>
  );
}

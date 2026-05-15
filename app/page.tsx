'use client';
import Link from "next/link";
import { useAuth } from "@/lib/auth-store";

export default function Page(){
  const { isLoggedIn } = useAuth();
  const openSignIn = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('padi-open-signin'));
    }
  };
  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#eef2ff] via-white to-[#e3f1ff] px-6 py-14 shadow-sm">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-purple-200/30 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />
        </div>
        <div className="relative grid gap-10 md:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-6 min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-medium text-blue-700 shadow-sm">
              <span className="md:hidden">Now in free early access</span>
              <span className="hidden md:inline">Now in free early access for ages 3–7</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
              Accelerate <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">your child&apos;s reading</span>.
            </h1>
            <p className="max-w-full md:max-w-2xl text-lg text-gray-700">
              A multisensory reading program for ages 3–7, built on the Science of Reading. Padi adapts to every child — moving ready readers forward faster, and giving emerging readers exactly the practice they need.
            </p>
            <div className="flex flex-wrap gap-3">
              {isLoggedIn ? (
                <Link href="/teacher" className="btn btn-primary">
                  Continue to your dashboard
                </Link>
              ) : (
                <button type="button" onClick={openSignIn} className="btn btn-primary">
                  Get Free Early Access
                </button>
              )}
              <Link href="/teacher/curriculum" className="btn">
                Browse curriculum
              </Link>
            </div>
            <p className="text-xs text-gray-500">
              Built on the Science of Reading · Multisensory · Designed by a 25-year reading specialist
            </p>
            <p className="text-xs text-gray-500">
              Free during early access. No credit card needed.
            </p>
          </div>
          <div className="relative rounded-2xl bg-white/80 p-6 shadow-lg ring-1 ring-blue-100 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Everything You Need for Reading Success</h3>
            <p className="text-sm text-gray-600 mb-6">
              Comprehensive tools and resources designed specifically for early reading intervention.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Multisensory Lessons",
                  bullet: [
                    "Phonics-focused instruction",
                    "Visual word matching",
                    "Progress tracking",
                  ],
                  icon: "📘",
                },
                {
                  title: "Zero Prep Time",
                  bullet: [
                    "Ready-to-use lesson plans",
                    "Printable worksheets (coming soon)",
                    "Student progress reports",
                    "Curriculum alignment",
                  ],
                  icon: "🧑‍🏫",
                },
                {
                  title: "Science of Reading",
                  bullet: [
                    "Ages 3–7 focus",
                    "Systematic phonics approach",
                    "Multi-sensory learning",
                    "Confidence building",
                  ],
                  icon: "🎯",
                },
              ].map(card => (
                <div key={card.title} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
                    {card.icon}
                  </div>
                  <h4 className="font-semibold text-gray-900">{card.title}</h4>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600 list-disc list-inside">
                    {card.bullet.map(item => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-10 text-white shadow-lg">
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] items-center">
          <div>
            <h2 className="text-3xl font-semibold mb-3">Ready to Transform Reading Time?</h2>
            <p className="text-lg text-blue-50">
              Join teachers and parents helping children build confidence and reading skills.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/teacher" className="rounded-xl bg-white px-4 py-2 text-blue-700 font-semibold shadow-sm hover:bg-blue-50">
              Start Teaching Today
            </Link>
            <Link href="/teacher/curriculum" className="rounded-xl bg-white/10 px-4 py-2 font-semibold text-white ring-1 ring-white/40 hover:bg-white/15">
              View Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

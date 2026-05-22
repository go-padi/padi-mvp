'use client';
import Link from "next/link";
import { useAuth } from "@/lib/auth-store";

const FEATURES = [
  {
    icon: "🎨",
    title: "Multisensory Lessons",
    body: "Visual, auditory, and kinesthetic activities that engage every learner — grounded in Orton-Gillingham methodology.",
  },
  {
    icon: "📊",
    title: "Real-Time Student Signals",
    body: "See at a glance which students are on track and who needs extra support. No manual tracking needed.",
  },
  {
    icon: "🔄",
    title: "Adaptive Learning Paths",
    body: "Lessons adjust automatically based on each student's progress — every child moves at their own pace.",
  },
  {
    icon: "⏱️",
    title: "Zero Prep Time",
    body: "Structured, ready-to-teach lessons that fit your existing schedule. Open the app and go.",
  },
  {
    icon: "🔗",
    title: "Seamless Referrals",
    body: "When a student needs specialist support, Padi generates the data to make that handoff smooth.",
  },
  {
    icon: "📚",
    title: "Science of Reading",
    body: "Every lesson is built on evidence-based reading research — phonemic awareness, phonics, fluency, and comprehension.",
  },
];

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
        <div className="relative space-y-6 min-w-0">
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
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold text-gray-900">Everything an early childhood teacher needs</h2>
          <p className="text-lg text-gray-700">Structured lessons, real-time insights, and zero prep time.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(feature => (
            <div key={feature.title} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">{feature.icon}</div>
              <h3 className="mt-2 font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-700">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6 rounded-3xl bg-white/80 p-8 shadow-sm ring-1 ring-blue-100">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold text-gray-900">Why Padi</h2>
          <h3 className="text-xl font-semibold text-gray-900">Most reading programs teach every child the same way.</h3>
          <p className="text-base text-gray-700">Kids ready to fly get held back. Kids who need more time get rushed. By kindergarten, the differences add up. Padi gives every child the right pace — and gives teachers a clear view of where each one is, in real time.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
            <p className="text-base font-semibold text-green-800">🟢 Accelerating</p>
            <p className="mt-1 text-sm text-green-700">On track to read sooner</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-base font-semibold text-amber-900">🟡 Practicing</p>
            <p className="mt-1 text-sm text-amber-800">Locking in foundational skills</p>
          </div>
          <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
            <p className="text-base font-semibold text-violet-900">🔴 Specialist Track</p>
            <p className="mt-1 text-sm text-violet-800">Recommended for closer review</p>
          </div>
        </div>
        <p className="italic text-sm text-gray-600">A clear signal for every student, every lesson.</p>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold text-gray-900">Simple for you. Powerful for your students.</h2>
          <p className="text-lg text-gray-700">Get started in minutes, not hours.</p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-3">
          <li className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">1</div>
            <h3 className="mt-3 font-semibold text-gray-900">Sign up & add your students</h3>
            <p className="mt-2 text-sm text-gray-700">Create your free account and add your class roster. It takes less than five minutes.</p>
          </li>
          <li className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">2</div>
            <h3 className="mt-3 font-semibold text-gray-900">Teach with structured lessons</h3>
            <p className="mt-2 text-sm text-gray-700">Open a lesson and follow the multisensory prompts. Each session is 10–15 minutes, ready to go.</p>
          </li>
          <li className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">3</div>
            <h3 className="mt-3 font-semibold text-gray-900">See every student’s path — instantly</h3>
            <p className="mt-2 text-sm text-gray-700">After each lesson, Padi shows you exactly where each student is — accelerating, practicing, or ready for closer review.</p>
          </li>
        </ol>
      </section>

      <section className="space-y-3 rounded-3xl bg-white/80 p-8 shadow-sm ring-1 ring-blue-100">
        <h2 className="text-3xl font-semibold text-gray-900">Built by a teacher, for teachers.</h2>
        <p className="text-base text-gray-700">Padi was created by Mona Iyer, a reading specialist with over 25 years of classroom experience and certifications including AMS, CDT, and CALT. After decades of teaching, Mona built Padi to give every early childhood teacher the tools to accelerate every reader — and recognize early which kids deserve more time, so they get it before kindergarten.</p>
      </section>

      <section className="rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-10 text-white shadow-lg">
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] items-center">
          <div>
            <h2 className="text-3xl font-semibold mb-3">Start accelerating today.</h2>
            <p className="text-lg text-blue-50">
              A free account, the next lesson for every child, ready to teach in minutes.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/teacher" className="rounded-xl bg-white px-4 py-2 text-blue-700 font-semibold shadow-sm hover:bg-blue-50">
              Get Free Early Access
            </Link>
            <Link href="/teacher/curriculum" className="rounded-xl bg-white/10 px-4 py-2 font-semibold text-white ring-1 ring-white/40 hover:bg-white/15">
              Browse curriculum
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

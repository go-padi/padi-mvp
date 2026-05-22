'use client';
import { useAuth } from '@/lib/auth-store';
import { rolePhrase } from '@/lib/copy/roleCopy';

const coreConcepts = [
  {
    title: 'Phonological Awareness',
    bullets: [
      'Understanding sounds in spoken language before reading begins.',
      'Recognizing words, syllables, rhymes, and individual sounds.',
      'Oral activities come before written work.',
      'Foundation for connecting sounds to letters.',
    ],
  },
  {
    title: 'Multisensory Learning (VAKT)',
    bullets: [
      'Use Visual, Auditory, Kinesthetic, and Tactile pathways.',
      'Trace sandpaper letters while saying sounds.',
      'Listen for and identify sounds in words.',
      'Use movement and gestures to anchor concepts.',
    ],
  },
  {
    title: 'MSLE Principles',
    bullets: [
      'Systematic and explicit instruction.',
      'Sequential skill building with cumulative review.',
      'Diagnostic teaching that responds to each child.',
    ],
  },
  {
    title: 'Montessori Alignment',
    bullets: [
      'Tactile, concrete exploration flows into phonics and decoding.',
      'Self-paced progress with hands-on materials.',
      'Concrete-to-abstract transitions for confident readers.',
    ],
  },
];

const programStructure = [
  {
    title: 'Daily Routine',
    description: 'Each day begins with a review of previous concepts before introducing new material.',
    tone: 'bg-purple-50',
  },
  {
    title: 'Periodic Assessments',
    description: 'Assess students periodically to determine readiness for the next curriculum stage.',
    tone: 'bg-blue-50',
  },
  {
    title: 'Flexible Grouping',
    description:
      'Students are regrouped based on assessment results. Groups are dynamic and responsive to individual progress.',
    bullets: [
      'Use app assessments to track mastery',
      'Regroup students based on progress',
      'Some students may need to repeat certain lessons',
      'Others may advance more quickly',
    ],
    tone: 'bg-amber-50',
  },
];

const dailyUse = [
  "Review today's lesson plan and gather materials",
  "Teach multisensory activities following the app's guided steps",
  'Enter assessment results as you observe student performance',
  'Run group reviews using suggested activities',
  'Track which students need repetition and who is ready to move forward',
];

export default function AboutPage(){
  const { role } = useAuth();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-blue-100 bg-white/80 p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Why Padi</h3>
        <p className="mt-2 text-sm text-gray-700">
          Most reading programs teach every child the same way. Kids ready to fly get held back. Kids who need more time get rushed. By kindergarten, the differences add up. Padi gives every child the right pace — and gives {rolePhrase(role, 'teachers', 'you')} a clear view of where each one is, in real time.
        </p>
      </section>
      <section className="rounded-2xl border border-blue-100 bg-white/80 p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Built by a teacher, for teachers</h3>
        <p className="mt-2 text-sm text-gray-700">
          Padi was created by Mona Iyer, a reading specialist with over 25 years of classroom experience and certifications including AMS, CDT, and CALT. After decades of teaching, Mona built Padi to give every early childhood teacher the tools to accelerate every reader — and recognize early which kids deserve more time, so they get it before kindergarten.
        </p>
      </section>
      <div className="rounded-2xl border border-blue-100 bg-white/80 p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">About the Padi Method</h3>
        <p className="mt-2 text-sm text-gray-700">
          Padi helps young learners build strong reading, writing, and comprehension skills using a proven multisensory method.
          It blends phonological awareness, phonics, vocabulary building, reading fluency, and comprehension strategies so every child moves at the right pace.
        </p>
      </div>
      <div className="space-y-4">
        <h4 className="text-base font-semibold text-gray-900">Core Concepts</h4>
        <div className="grid gap-4 md:grid-cols-2">
          {coreConcepts.map(concept => (
            <div key={concept.title} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h5 className="text-sm font-semibold text-gray-900">{concept.title}</h5>
              <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
                {concept.bullets.map(b => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="text-base font-semibold text-gray-900">How the Program Works</h4>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Program Structure</p>
            <p className="text-xs text-gray-600">12 months of structured curriculum across developmental areas</p>
          </div>
          <div className="space-y-3">
            {programStructure.map(item => (
              <div key={item.title} className={`rounded-xl border border-gray-100 p-4 ${item.tone}`}>
                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                <p className="mt-1 text-sm text-gray-700">{item.description}</p>
                {item.bullets && (
                  <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
                    {item.bullets.map(b => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <section className="space-y-4">
        <h4 className="text-base font-semibold text-gray-900">Three signals at a glance</h4>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
          <div className="space-y-3">
            <div className="rounded-xl border p-4 bg-green-50 text-green-800 border-green-100">
              <p className="text-sm">🟢 <span className="font-semibold">Accelerating</span> — On track to read sooner — has mastered all core skills</p>
            </div>
            <div className="rounded-xl border p-4 bg-amber-50 text-amber-900 border-amber-100">
              <p className="text-sm">🟡 <span className="font-semibold">Practicing</span> — Locking in foundational skills — building confidence with practice</p>
            </div>
            <div className="rounded-xl border p-4 bg-violet-50 text-violet-900 border-violet-100">
              <p className="text-sm">🔴 <span className="font-semibold">Specialist Track</span> — Recommended for closer review with a reading specialist</p>
            </div>
          </div>
          <p className="text-sm italic text-gray-700">A clear signal for every student, every lesson.</p>
        </div>
      </section>
      <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h4 className="text-base font-semibold text-gray-900">Using This App Daily</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
          {dailyUse.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

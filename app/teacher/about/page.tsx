'use client';

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

const outcomes = [
  {
    label: 'Ready',
    description: 'On track for first grade — has mastered all core skills',
    tone: 'bg-green-50 text-green-800 border-green-100',
  },
  {
    label: 'Needs Help',
    description: 'Requires targeted support in specific areas before progressing',
    tone: 'bg-amber-50 text-amber-900 border-amber-100',
  },
  {
    label: 'Needs Intervention',
    description: 'Requires serious, immediate specialist support',
    tone: 'bg-red-50 text-red-900 border-red-100',
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

  return (
    <div className="space-y-6">
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
      <div className="space-y-4">
        <h4 className="text-base font-semibold text-gray-900">Final Outcomes (After 12 Months)</h4>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
          <p className="text-sm text-gray-700">Students will be placed into one of three groups:</p>
          <div className="grid gap-3 md:grid-cols-3">
            {outcomes.map(o => (
              <div key={o.label} className={`rounded-xl border p-4 ${o.tone}`}>
                <p className="text-sm font-semibold">{o.label}</p>
                <p className="mt-1 text-sm">{o.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
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

import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Outcome = { label: string; description: string; tone: string };

const phases = [
  {
    code: 'K_P1',
    title: 'Phase 1',
    description: 'Phonological Awareness Foundation',
    months: 'Months 1-3',
    lesson_range: 'Lessons 1-60',
    summary: 'Build early listening and sound awareness before formal phonics.',
    is_locked: false,
    display_order: 1,
    outcomes: [
      { label: 'First Grade', description: 'Students ready for mainstream Grade 1 curriculum', tone: 'bg-green-50 text-green-800 border-green-100' },
      { label: 'Group Literacy', description: 'Students needing continued small-group support', tone: 'bg-yellow-50 text-yellow-900 border-yellow-100' },
      { label: 'One-on-One SIS Program', description: 'Students requiring individualized intervention', tone: 'bg-orange-50 text-orange-900 border-orange-100' },
    ] as Outcome[],
    groups: [
      {
        code: 'K_P1_LS',
        title: 'Learning Sensorially',
        description: 'Sharpen listening skills and auditory discrimination',
        module_count: 13,
        is_locked: false,
        display_order: 1,
        modules: [
          {
            code: 'LS-1',
            title: 'The Silence Game',
            subtitle: 'Module LS-1',
            summary: 'Sharpen listening skills with intentional silence and sound awareness.',
            is_locked: false,
            display_order: 1,
            lesson: {
              materials: ['A quiet classroom'],
              aims: ['Sharpen listening skills', 'Build attention span', 'Strengthen auditory discrimination'],
              presentation_steps: [
                'Tell students they are going to play the Silence Game.',
                'Ask each child to close their eyes and listen to the sounds in the room, outside the room, and within themselves.',
                'Set a timer for 2 minutes.',
                'After 2 minutes, ask students to share what they heard.',
              ],
              examples: [
                'Clock ticks',
                'Footsteps',
                'Coughing',
                'Cars',
                'Air conditioner',
                'Voices',
                'Animals',
                'Faucet',
                'Breathing',
              ],
              extension: ['Play in a different room or outdoors', 'Use recordings of birds or animals and ask students to guess the animal'],
            },
          },
          {
            code: 'LS-2',
            title: 'Module 2',
            subtitle: 'Module LS-2',
            summary: 'Coming soon',
            is_locked: true,
            display_order: 2,
          },
          {
            code: 'LS-3',
            title: 'Module 3',
            subtitle: 'Module LS-3',
            summary: 'Coming soon',
            is_locked: true,
            display_order: 3,
          },
        ],
      },
      {
        code: 'K_P1_RHY',
        title: 'Rhyming',
        description: 'Develop rhyming discrimination and production',
        module_count: 10,
        is_locked: true,
        display_order: 2,
        modules: [],
      },
      {
        code: 'K_P1_WS',
        title: 'Words and Sentences',
        description: 'Build word and sentence awareness',
        module_count: 10,
        is_locked: true,
        display_order: 3,
        modules: [],
      },
    ],
  },
  {
    code: 'K_P2',
    title: 'Phase 2',
    description: 'Coming soon',
    months: 'Months 3-6',
    lesson_range: 'Lessons 60-120',
    summary: null,
    is_locked: true,
    display_order: 2,
    outcomes: [] as Outcome[],
    groups: [],
  },
  {
    code: 'K_P3',
    title: 'Phase 3',
    description: 'Coming soon',
    months: 'Months 6-9',
    lesson_range: 'Lessons 120-180',
    summary: null,
    is_locked: true,
    display_order: 3,
    outcomes: [] as Outcome[],
    groups: [],
  },
];

async function run() {
  // seed phases
  for (const p of phases) {
    const { data: phaseRow, error: phaseErr } = await supabase
      .from('phase')
      .upsert(
        {
          code: p.code,
          title: p.title,
          description: p.description,
          months: p.months,
          lesson_range: p.lesson_range,
          summary: p.summary,
          is_locked: p.is_locked,
          display_order: p.display_order,
          outcomes: p.outcomes,
        },
        { onConflict: 'code' }
      )
      .select()
      .single();
    if (phaseErr) throw phaseErr;

    for (const g of p.groups) {
      const { data: groupRow, error: groupErr } = await supabase
        .from('module_group')
        .upsert(
          {
            code: g.code,
            phase_id: phaseRow.id,
            title: g.title,
            description: g.description,
            module_count: g.module_count,
            is_locked: g.is_locked,
            display_order: g.display_order,
          },
          { onConflict: 'code' }
        )
        .select()
        .single();
      if (groupErr) throw groupErr;

      for (const m of g.modules) {
        const { error: moduleErr } = await supabase.from('module_detail').upsert(
          {
            code: m.code,
            phase_id: phaseRow.id,
            group_id: groupRow.id,
            title: m.title,
            subtitle: m.subtitle,
            summary: m.summary,
            is_locked: m.is_locked,
            display_order: m.display_order,
            lesson: m.lesson || null,
            metadata: {},
          },
          { onConflict: 'code' }
        );
        if (moduleErr) throw moduleErr;
      }
    }
  }

  console.log('Seeded phases, groups, and modules');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

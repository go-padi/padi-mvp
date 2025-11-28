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
    summary: `Phonological Awareness is one of the key predictors and a vital prerequisite for learning to read and spell. It is the ability to identify and manipulate units of sound.

The basic phonological awareness ability is detecting rhyme. The students with competent phonological awareness will easily recognize that the rime part is the same and only the onset is changed in words like pat, sat, and mat. The students with language learning disability often do not have this ability. Early intervention with exposure to rhymes is vital.

Phonological awareness involves the understanding that sentences are made up of words, that words are created from syllables, and syllables from sounds. When counting words, students with language learning disability may think that "Atlantic" is three words, not being aware that the components are syllables that make up one word. This knowledge cannot be assumed but must be taught directly.

Once the students are aware of the syllable components, they can learn to manipulate them, by adding, deleting, and reversing them. Only after extensive practice with syllables are the students able to identify and manipulate sounds in syllables. The awareness of phonemes is the highest skill and requires daily practice. The students who can accurately detect and manipulate the sounds in syllables are well equipped for reading and spelling activities.`,
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
            subtitle: 'LS1',
            summary: 'Sharpen listening skills with intentional silence and sound awareness.',
            is_locked: false,
            display_order: 1,
            lesson: {
              materials: ['A quiet classroom'],
              aims: ['Sharpen the students listening skills', 'Develop good attention span', 'Build auditory discrimination'],
              presentation_steps: [
                'Tell the students that they are going to play a game called Silence Game.',
                'Ask each of them to close their eyes and listen to the sounds in the room, outside the room, and within themselves.',
                'Set a timer for 2 minutes.',
                'After 2 minutes of listening quietly, ask them to share what they heard (clock ticks, voices, footsteps, animals, coughing, faucet, flush, cars, breathing, air conditioner, etc.).',
              ],
              examples: [
                'Clock ticks',
                'Voices',
                'Footsteps',
                'Animals',
                'Coughing',
                'Faucet',
                'Flush',
                'Cars',
                'Breathing',
                'Air conditioner',
              ],
              extension: [
                'Play the game in a different room or outdoors.',
                'Use recordings of birds or other animals and ask students to guess the animal.',
              ],
            },
          },
          ...Array.from({ length: 12 }).map((_, idx) => {
            const n = idx + 2;
            return {
              code: `LS-${n}`,
              title: `Module ${n}`,
              subtitle: `LS${n}`,
              summary: 'Content coming soon',
              is_locked: true,
              display_order: n,
            };
          }),
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
      {
        code: 'K_P1_SYL',
        title: 'Syllables',
        description: 'Clap, segment, and blend syllables',
        module_count: 10,
        is_locked: true,
        display_order: 4,
        modules: [],
      },
      {
        code: 'K_P1_PA',
        title: 'Phonemic Awareness',
        description: 'Work with individual sounds',
        module_count: 10,
        is_locked: true,
        display_order: 5,
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

export type DemoPhase = {
  code: string;
  title: string;
  description: string;
  months?: string | null;
  lesson_range?: string | null;
  is_locked?: boolean | null;
  summary?: string | null;
};

export type DemoLesson = {
  materials?: string[];
  aims?: string[];
  presentation_steps?: string[];
  examples?: string[];
  extension?: string[];
};

export type DemoGroup = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  module_count: number | null;
  is_locked: boolean | null;
  teaching_mode: 'group' | 'individual';
};

export type DemoModule = {
  id: string;
  code: string;
  title: string;
  subtitle: string | null;
  summary: string | null;
  is_locked: boolean | null;
  display_order: number | null;
  teaching_mode: 'group' | 'individual';
  lesson?: DemoLesson | null;
};

export const previewPhases: DemoPhase[] = [
  {
    code: 'K_P1',
    title: 'Phase 1: Foundations & Phonological Awareness',
    description: 'Preview available (1 sample lesson unlocked)',
    months: 'Months 1-3',
    lesson_range: 'Lessons 1-12',
    is_locked: false,
  },
  {
    code: 'K_P2',
    title: 'Phase 2: Blending & Early Decoding',
    description: 'Preview structure only. Log in to unlock.',
    months: 'Months 4-6',
    lesson_range: 'Lessons 13-24',
    is_locked: true,
  },
  {
    code: 'K_P3',
    title: 'Phase 3: Fluency & Comprehension',
    description: 'Preview structure only. Log in to unlock.',
    months: 'Months 7-9',
    lesson_range: 'Lessons 25-36',
    is_locked: true,
  },
];

export const previewPhaseByCode = Object.fromEntries(previewPhases.map(p => [p.code, p]));

const sampleLesson: DemoLesson = {
  materials: ['A quiet classroom'],
  aims: ['Sharpen the students listening skills', 'Develop good attention span', 'Build auditory discrimination'],
  presentation_steps: [
    'Tell the students that they are going to play a game called Silence Game.',
    'Ask each of them to close their eyes and listen to the sounds in the room, outside the room, and within themselves.',
    'Set a timer for 2 minutes.',
    'After 2 minutes of listening quietly, ask them to share what they heard (clock ticks, voices, footsteps, animals, coughing, faucet, flush, cars, breathing, air conditioner, etc.).',
  ],
  examples: ['Clock ticks', 'Voices', 'Footsteps', 'Animals', 'Coughing', 'Faucet', 'Flush', 'Cars', 'Breathing', 'Air conditioner'],
  extension: ['Play the game in a different room or outdoors.', 'Use recordings of birds or other animals and ask students to guess the animal.'],
};

export const previewGroupsByPhase: Record<string, DemoGroup[]> = {
  K_P1: [
    { id: 'fallback-ls', code: 'K_P1_LS', title: 'Learning Sensorially', description: 'Sharpen listening skills and auditory discrimination', module_count: 13, is_locked: false, teaching_mode: 'group' },
    { id: 'fallback-rhy', code: 'K_P1_RHY', title: 'Rhyming', description: 'Develop rhyming discrimination and production', module_count: 10, is_locked: true, teaching_mode: 'group' },
    { id: 'fallback-ws', code: 'K_P1_WS', title: 'Words and Sentences', description: 'Build word and sentence awareness', module_count: 10, is_locked: true, teaching_mode: 'group' },
    { id: 'fallback-syl', code: 'K_P1_SYL', title: 'Syllables', description: 'Clap, segment, and blend syllables', module_count: 10, is_locked: true, teaching_mode: 'group' },
    { id: 'fallback-pa', code: 'K_P1_PA', title: 'Phonemic Awareness', description: 'Work with individual sounds', module_count: 10, is_locked: true, teaching_mode: 'group' },
    { id: 'fallback-ind-sa', code: 'K_P1_IND_SA', title: 'Sound Awareness (Individual)', description: 'One-on-one listening and sound identification activities', module_count: 10, is_locked: false, teaching_mode: 'individual' },
    { id: 'fallback-ind-rhy', code: 'K_P1_IND_RHY', title: 'Individual Rhyme Practice', description: 'Personalized rhyme detection and creation', module_count: 6, is_locked: true, teaching_mode: 'individual' },
  ],
  K_P2: [
    { id: 'fallback-p2-1', code: 'K_P2_DEC', title: 'Decoding Routines', description: 'Preview of blending and decoding routines', module_count: 8, is_locked: true, teaching_mode: 'group' },
    { id: 'fallback-p2-2', code: 'K_P2_FLU', title: 'Fluency Warmups', description: 'Timed practice structure overview', module_count: 6, is_locked: true, teaching_mode: 'group' },
  ],
  K_P3: [
    { id: 'fallback-p3-1', code: 'K_P3_COMP', title: 'Comprehension', description: 'Preview of comprehension routines', module_count: 6, is_locked: true, teaching_mode: 'group' },
    { id: 'fallback-p3-2', code: 'K_P3_VOCAB', title: 'Vocabulary', description: 'Preview of vocabulary-building activities', module_count: 5, is_locked: true, teaching_mode: 'group' },
  ],
};

export const previewModulesByGroup: Record<string, DemoModule[]> = {
  K_P1_LS: [
    { id: 'fallback-ls-1', code: 'LS-1', title: 'The Silence Game', subtitle: 'LS1', summary: 'Sharpen listening skills with intentional silence and sound awareness.', is_locked: false, display_order: 1, teaching_mode: 'group', lesson: sampleLesson },
    { id: 'fallback-ls-2', code: 'LS-2', title: 'Module 2', subtitle: 'LS2', summary: 'Coming soon', is_locked: true, display_order: 2, teaching_mode: 'group', lesson: null },
    { id: 'fallback-ls-3', code: 'LS-3', title: 'Module 3', subtitle: 'LS3', summary: 'Coming soon', is_locked: true, display_order: 3, teaching_mode: 'group', lesson: null },
  ],
  K_P1_RHY: [
    { id: 'fallback-rhy-1', code: 'RHY-1', title: 'Rhyme Intro', subtitle: 'R1', summary: 'Coming soon', is_locked: true, display_order: 1, teaching_mode: 'group', lesson: null },
  ],
  K_P1_WS: [
    { id: 'fallback-ws-1', code: 'WS-1', title: 'Words & Sentences Intro', subtitle: 'WS1', summary: 'Coming soon', is_locked: true, display_order: 1, teaching_mode: 'group', lesson: null },
  ],
  K_P1_SYL: [
    { id: 'fallback-syl-1', code: 'SYL-1', title: 'Syllables Intro', subtitle: 'SYL1', summary: 'Coming soon', is_locked: true, display_order: 1, teaching_mode: 'group', lesson: null },
  ],
  K_P1_PA: [
    { id: 'fallback-pa-1', code: 'PA-1', title: 'Phonemic Awareness Intro', subtitle: 'PA1', summary: 'Coming soon', is_locked: true, display_order: 1, teaching_mode: 'group', lesson: null },
  ],
  K_P1_IND_SA: [
    { id: 'fallback-ind-sa-1', code: 'K_P1_IND_SA_1', title: 'Individual Sound Awareness 1', subtitle: 'Ind 1', summary: 'Foundational sound awareness practice for individual sessions.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
    { id: 'fallback-ind-sa-2', code: 'K_P1_IND_SA_2', title: 'Individual Sound Awareness 2', subtitle: 'Ind 2', summary: 'Coming soon', is_locked: true, display_order: 2, teaching_mode: 'individual', lesson: null },
  ],
  K_P1_IND_RHY: [
    { id: 'fallback-ind-rhy-1', code: 'K_P1_IND_RHY_1', title: 'Individual Rhyme Practice 1', subtitle: 'Ind R1', summary: 'Coming soon', is_locked: true, display_order: 1, teaching_mode: 'individual', lesson: null },
  ],
  K_P2_DEC: [
    { id: 'fallback-p2-dec-1', code: 'P2-DEC-1', title: 'Blending Routine', subtitle: 'P2-1', summary: 'Structure preview only. Log in for full lessons.', is_locked: true, display_order: 1, teaching_mode: 'group', lesson: null },
  ],
  K_P2_FLU: [
    { id: 'fallback-p2-flu-1', code: 'P2-FLU-1', title: 'Fluency Warmup', subtitle: 'P2-2', summary: 'Structure preview only. Log in for full lessons.', is_locked: true, display_order: 1, teaching_mode: 'group', lesson: null },
  ],
  K_P3_COMP: [
    { id: 'fallback-p3-comp-1', code: 'P3-COMP-1', title: 'Comprehension Routine', subtitle: 'P3-1', summary: 'Structure preview only. Log in for full lessons.', is_locked: true, display_order: 1, teaching_mode: 'group', lesson: null },
  ],
  K_P3_VOCAB: [
    { id: 'fallback-p3-vocab-1', code: 'P3-VOCAB-1', title: 'Vocabulary Routine', subtitle: 'P3-2', summary: 'Structure preview only. Log in for full lessons.', is_locked: true, display_order: 1, teaching_mode: 'group', lesson: null },
  ],
};

export const previewModuleByCode = Object.fromEntries(
  Object.values(previewModulesByGroup).flat().map(mod => [mod.code, mod])
);

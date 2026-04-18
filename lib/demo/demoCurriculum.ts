export type DemoLesson = {
  materials?: string[];
  aims?: string[];
  presentation_steps?: string[];
  examples?: string[];
  extension?: string[];
};

export type DemoChapter = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  display_order: number;
  teaching_mode: 'group' | 'individual';
  group_count: number;
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

export const previewChapters: DemoChapter[] = [
  { id: 'ch-pa', code: 'phonological-awareness', title: 'Phonological Awareness', description: 'Develop listening, rhyming, syllable, and phonemic awareness skills', display_order: 1, teaching_mode: 'group', group_count: 8 },
  { id: 'ch-al', code: 'alphabet', title: 'Alphabet', description: 'Learn letter names, shapes, and formations', display_order: 2, teaching_mode: 'group', group_count: 1 },
  { id: 'ch-ph', code: 'phonics', title: 'Phonics', description: 'Connect letters to their sounds', display_order: 3, teaching_mode: 'group', group_count: 1 },
  { id: 'ch-rd', code: 'reading', title: 'Reading', description: 'Apply decoding skills to connected text', display_order: 4, teaching_mode: 'group', group_count: 2 },
  { id: 'ch-hw', code: 'handwriting', title: 'Handwriting', description: 'Develop letter formation and writing skills', display_order: 5, teaching_mode: 'group', group_count: 1 },
  { id: 'ch-sp', code: 'spelling', title: 'Spelling', description: 'Encode words using sound-letter knowledge', display_order: 6, teaching_mode: 'group', group_count: 2 },
  { id: 'ch-vcf', code: 'vocab-comprehension-fluency', title: 'Vocabulary, Comprehension & Fluency', description: 'Build vocabulary, comprehension, and reading fluency', display_order: 7, teaching_mode: 'group', group_count: 1 },
  { id: 'ch-ind-pa', code: 'ind-phonological-awareness', title: 'Phonological Awareness', description: 'Develop listening, rhyming, syllable, and phonemic awareness skills', display_order: 1, teaching_mode: 'individual', group_count: 8 },
  { id: 'ch-ind-al', code: 'ind-alphabet', title: 'Alphabet', description: 'Learn letter names, shapes, and formations', display_order: 2, teaching_mode: 'individual', group_count: 1 },
  { id: 'ch-ind-ph', code: 'ind-phonics', title: 'Phonics', description: 'Connect letters to their sounds', display_order: 3, teaching_mode: 'individual', group_count: 1 },
  { id: 'ch-ind-rd', code: 'ind-reading', title: 'Reading', description: 'Apply decoding skills to connected text', display_order: 4, teaching_mode: 'individual', group_count: 2 },
  { id: 'ch-ind-hw', code: 'ind-handwriting', title: 'Handwriting', description: 'Develop letter formation and writing skills', display_order: 5, teaching_mode: 'individual', group_count: 1 },
  { id: 'ch-ind-sp', code: 'ind-spelling', title: 'Spelling', description: 'Encode words using sound-letter knowledge', display_order: 6, teaching_mode: 'individual', group_count: 2 },
  { id: 'ch-ind-vcf', code: 'ind-vocab-comprehension-fluency', title: 'Vocabulary, Comprehension & Fluency', description: 'Build vocabulary, comprehension, and reading fluency', display_order: 7, teaching_mode: 'individual', group_count: 1 },
];

export const previewGroups: DemoGroup[] = [
  { id: 'fallback-ls', code: 'learning-sensorially', title: 'Learning Sensorially', description: 'Sharpen listening skills and auditory discrimination', module_count: 11, is_locked: false, teaching_mode: 'group' },
  { id: 'fallback-rmg', code: 'rhyming', title: 'Rhyming', description: 'Develop rhyming discrimination and production', module_count: 19, is_locked: false, teaching_mode: 'group' },
  { id: 'fallback-ws', code: 'words-and-sentences', title: 'Words and Sentences', description: 'Build word and sentence awareness', module_count: 9, is_locked: false, teaching_mode: 'group' },
  { id: 'fallback-syl', code: 'syllables', title: 'Syllables', description: 'Clap, segment, and blend syllables', module_count: 17, is_locked: false, teaching_mode: 'group' },
  { id: 'fallback-is', code: 'initial-sounds', title: 'Initial Sounds', description: 'Identify and isolate initial sounds', module_count: 17, is_locked: false, teaching_mode: 'group' },
  { id: 'fallback-fs', code: 'final-sounds', title: 'Final Sounds', description: 'Identify and isolate final sounds', module_count: 7, is_locked: false, teaching_mode: 'group' },
  { id: 'fallback-ms', code: 'medial-sounds', title: 'Medial Sounds', description: 'Identify medial vowel sounds', module_count: 2, is_locked: false, teaching_mode: 'group' },
  { id: 'fallback-cs', code: 'combining-sounds', title: 'Combining Sounds', description: 'Work with blends and digraphs', module_count: 6, is_locked: false, teaching_mode: 'group' },
  { id: 'fallback-al', code: 'alphabet', title: 'Alphabet Letters', description: 'Letter recognition and formation', module_count: 22, is_locked: false, teaching_mode: 'group' },
  { id: 'fallback-p', code: 'phonics', title: 'Phonics', description: 'Letter-sound correspondences', module_count: 7, is_locked: false, teaching_mode: 'group' },
  { id: 'fallback-r', code: 'reading', title: 'Reading', description: 'Connected text reading practice', module_count: 8, is_locked: false, teaching_mode: 'group' },
  { id: 'fallback-re', code: 'reading-exercises', title: 'Reading Extension', description: 'Extended reading activities', module_count: 9, is_locked: false, teaching_mode: 'group' },
  { id: 'fallback-hw', code: 'handwriting', title: 'Handwriting', description: 'Letter and word writing practice', module_count: 11, is_locked: false, teaching_mode: 'group' },
  { id: 'fallback-s', code: 'spelling', title: 'Spelling', description: 'Encoding and spelling patterns', module_count: 9, is_locked: false, teaching_mode: 'group' },
  { id: 'fallback-se', code: 'spelling-exercises', title: 'Spelling Extension', description: 'Extended spelling activities', module_count: 9, is_locked: false, teaching_mode: 'group' },
  { id: 'fallback-vcf', code: 'vocab-comprehension-fluency', title: 'Vocabulary, Comprehension & Fluency', description: 'Oral language and fluency building', module_count: 9, is_locked: false, teaching_mode: 'group' },
  { id: 'fallback-ind-ls', code: 'ind-learning-sensorially', title: 'Learning Sensorially (Individual)', description: 'One-on-one listening and sound identification activities', module_count: 6, is_locked: false, teaching_mode: 'individual' },
  { id: 'fallback-ind-rmg', code: 'ind-rhyming', title: 'Individual Rhyme Practice', description: 'Personalized rhyme detection and creation', module_count: 19, is_locked: false, teaching_mode: 'individual' },
  { id: 'fallback-ind-ws', code: 'ind-words-and-sentences', title: 'Words & Sentences (Individual)', description: 'Build word and sentence awareness', module_count: 7, is_locked: false, teaching_mode: 'individual' },
  { id: 'fallback-ind-syl', code: 'ind-syllables', title: 'Syllables (Individual)', description: 'Clap, segment, and blend syllables', module_count: 15, is_locked: false, teaching_mode: 'individual' },
  { id: 'fallback-ind-is', code: 'ind-initial-sounds', title: 'Initial Sounds (Individual)', description: 'Identify and manipulate initial sounds in words', module_count: 14, is_locked: false, teaching_mode: 'individual' },
  { id: 'fallback-ind-fs', code: 'ind-final-sounds', title: 'Final Sounds (Individual)', description: 'Identify and manipulate final sounds in words', module_count: 6, is_locked: false, teaching_mode: 'individual' },
  { id: 'fallback-ind-ms', code: 'ind-medial-sounds', title: 'Medial Sounds (Individual)', description: 'Identify and manipulate medial sounds in words', module_count: 2, is_locked: false, teaching_mode: 'individual' },
  { id: 'fallback-ind-cs', code: 'ind-combining-sounds', title: 'Combining Sounds (Individual)', description: 'Blend and segment sounds to form words', module_count: 4, is_locked: false, teaching_mode: 'individual' },
  { id: 'fallback-ind-al', code: 'ind-alphabet', title: 'Alphabet (Individual)', description: 'Learn letter names, sounds, and formation', module_count: 22, is_locked: false, teaching_mode: 'individual' },
  { id: 'fallback-ind-p', code: 'ind-phonics', title: 'Phonics (Individual)', description: 'Connect letters to sounds for reading and spelling', module_count: 7, is_locked: false, teaching_mode: 'individual' },
  { id: 'fallback-ind-r', code: 'ind-reading', title: 'Reading (Individual)', description: 'Develop decoding and reading skills', module_count: 8, is_locked: false, teaching_mode: 'individual' },
  { id: 'fallback-ind-re', code: 'ind-reading-exercises', title: 'Reading Exercises (Individual)', description: 'Practice reading with guided exercises', module_count: 9, is_locked: false, teaching_mode: 'individual' },
  { id: 'fallback-ind-hw', code: 'ind-handwriting', title: 'Handwriting (Individual)', description: 'Develop proper letter formation and handwriting skills', module_count: 10, is_locked: false, teaching_mode: 'individual' },
  { id: 'fallback-ind-s', code: 'ind-spelling', title: 'Spelling (Individual)', description: 'Learn spelling patterns and rules', module_count: 9, is_locked: false, teaching_mode: 'individual' },
  { id: 'fallback-ind-se', code: 'ind-spelling-exercises', title: 'Spelling Exercises (Individual)', description: 'Practice spelling with guided exercises', module_count: 9, is_locked: false, teaching_mode: 'individual' },
  { id: 'fallback-ind-vcf', code: 'ind-vocab-comprehension-fluency', title: 'Vocab/Comprehension/Fluency (Individual)', description: 'Build vocabulary, comprehension, and reading fluency', module_count: 9, is_locked: false, teaching_mode: 'individual' },
];

export const previewGroupsByChapter: Record<string, DemoGroup[]> = {
  'phonological-awareness': previewGroups.filter(g => g.teaching_mode === 'group' && ['learning-sensorially', 'rhyming', 'words-and-sentences', 'syllables', 'initial-sounds', 'final-sounds', 'medial-sounds', 'combining-sounds'].includes(g.code)),
  'alphabet': previewGroups.filter(g => g.teaching_mode === 'group' && g.code === 'alphabet'),
  'phonics': previewGroups.filter(g => g.teaching_mode === 'group' && g.code === 'phonics'),
  'reading': previewGroups.filter(g => g.teaching_mode === 'group' && ['reading', 'reading-exercises'].includes(g.code)),
  'handwriting': previewGroups.filter(g => g.teaching_mode === 'group' && g.code === 'handwriting'),
  'spelling': previewGroups.filter(g => g.teaching_mode === 'group' && ['spelling', 'spelling-exercises'].includes(g.code)),
  'vocab-comprehension-fluency': previewGroups.filter(g => g.teaching_mode === 'group' && g.code === 'vocab-comprehension-fluency'),
  'ind-phonological-awareness': previewGroups.filter(g => g.teaching_mode === 'individual' && ['ind-learning-sensorially', 'ind-rhyming', 'ind-words-and-sentences', 'ind-syllables', 'ind-initial-sounds', 'ind-final-sounds', 'ind-medial-sounds', 'ind-combining-sounds'].includes(g.code)),
  'ind-alphabet': previewGroups.filter(g => g.teaching_mode === 'individual' && g.code === 'ind-alphabet'),
  'ind-phonics': previewGroups.filter(g => g.teaching_mode === 'individual' && g.code === 'ind-phonics'),
  'ind-reading': previewGroups.filter(g => g.teaching_mode === 'individual' && ['ind-reading', 'ind-reading-exercises'].includes(g.code)),
  'ind-handwriting': previewGroups.filter(g => g.teaching_mode === 'individual' && g.code === 'ind-handwriting'),
  'ind-spelling': previewGroups.filter(g => g.teaching_mode === 'individual' && ['ind-spelling', 'ind-spelling-exercises'].includes(g.code)),
  'ind-vocab-comprehension-fluency': previewGroups.filter(g => g.teaching_mode === 'individual' && g.code === 'ind-vocab-comprehension-fluency'),
};

export const previewModulesByGroup: Record<string, DemoModule[]> = {
  'learning-sensorially': [
    { id: 'fallback-ls-1', code: 'learning-sensorially-1', title: 'The Silence Game', subtitle: 'learning-sensorially-1', summary: 'Sharpen listening skills with intentional silence and sound awareness.', is_locked: false, display_order: 1, teaching_mode: 'group', lesson: sampleLesson },
    { id: 'fallback-ls-2', code: 'learning-sensorially-2', title: 'Guessing the Instrument', subtitle: 'learning-sensorially-2', summary: 'Auditory sound discrimination and vocabulary development.', is_locked: false, display_order: 2, teaching_mode: 'group', lesson: null },
    { id: 'fallback-ls-3', code: 'learning-sensorially-3', title: 'Sequencing Sounds Game', subtitle: 'learning-sensorially-3', summary: 'Develop sequencing memory for sounds.', is_locked: false, display_order: 3, teaching_mode: 'group', lesson: null },
  ],
  'rhyming': [
    { id: 'fallback-rmg-1', code: 'rhyming-1', title: 'Rhyme Intro', subtitle: 'rhyming-1', summary: 'Introduction to rhyming words.', is_locked: false, display_order: 1, teaching_mode: 'group', lesson: null },
  ],
  'words-and-sentences': [
    { id: 'fallback-ws-1', code: 'words-and-sentences-1', title: 'Words & Sentences Intro', subtitle: 'words-and-sentences-1', summary: 'Build word and sentence awareness.', is_locked: false, display_order: 1, teaching_mode: 'group', lesson: null },
  ],
  'syllables': [
    { id: 'fallback-syl-1', code: 'syllables-1', title: 'Syllables Intro', subtitle: 'syllables-1', summary: 'Clap and count syllables.', is_locked: false, display_order: 1, teaching_mode: 'group', lesson: null },
  ],
  'ind-learning-sensorially': [
    { id: 'fallback-ind-ls-1', code: 'ind-learning-sensorially-1', title: 'Individual Sound Awareness 1', subtitle: 'ind-learning-sensorially-1', summary: 'Foundational sound awareness practice for individual sessions.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
    { id: 'fallback-ind-ls-2', code: 'ind-learning-sensorially-2', title: 'Individual Sound Awareness 2', subtitle: 'ind-learning-sensorially-2', summary: 'Continued sound awareness practice.', is_locked: false, display_order: 2, teaching_mode: 'individual', lesson: null },
  ],
  'ind-rhyming': [
    { id: 'fallback-ind-rmg-1', code: 'ind-rhyming-1', title: 'Individual Rhyme Practice 1', subtitle: 'ind-rhyming-1', summary: 'Personalized rhyme practice.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
  ],
  'ind-words-and-sentences': [
    { id: 'fallback-ind-ws-1', code: 'ind-words-and-sentences-1', title: 'Long and Short Words', subtitle: 'ind-words-and-sentences-1', summary: 'Recognize long/short words auditorily.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
  ],
  'ind-syllables': [
    { id: 'fallback-ind-syl-1', code: 'ind-syllables-1', title: 'Clapping Syllables', subtitle: 'ind-syllables-1', summary: 'Clap and count syllables in words.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
  ],
  'ind-initial-sounds': [
    { id: 'fallback-ind-is-1', code: 'ind-initial-sounds-1', title: 'What Sound Does It Start With?', subtitle: 'ind-initial-sounds-1', summary: 'Identify and isolate initial sounds in words.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
  ],
  'ind-final-sounds': [
    { id: 'fallback-ind-fs-1', code: 'ind-final-sounds-1', title: 'Ending Sound Match', subtitle: 'ind-final-sounds-1', summary: 'Identify and isolate final sounds in words.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
  ],
  'ind-medial-sounds': [
    { id: 'fallback-ind-ms-1', code: 'ind-medial-sounds-1', title: 'Middle Sound Detective', subtitle: 'ind-medial-sounds-1', summary: 'Identify medial vowel sounds in CVC words.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
  ],
  'ind-combining-sounds': [
    { id: 'fallback-ind-cs-1', code: 'ind-combining-sounds-1', title: 'Blend It Together', subtitle: 'ind-combining-sounds-1', summary: 'Blend individual sounds to form words.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
  ],
  'ind-alphabet': [
    { id: 'fallback-ind-al-1', code: 'ind-alphabet-1', title: 'Letter Names A-E', subtitle: 'ind-alphabet-1', summary: 'Learn letter names and recognition for A through E.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
  ],
  'ind-phonics': [
    { id: 'fallback-ind-p-1', code: 'ind-phonics-1', title: 'Letter Sounds: m, t, a, s', subtitle: 'ind-phonics-1', summary: 'Connect letters to their sounds.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
  ],
  'ind-reading': [
    { id: 'fallback-ind-r-1', code: 'ind-reading-1', title: 'Decoding CVC Words', subtitle: 'ind-reading-1', summary: 'Apply phonics skills to decode simple CVC words.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
  ],
  'ind-reading-exercises': [
    { id: 'fallback-ind-re-1', code: 'ind-reading-exercises-1', title: 'Reading Exercise 1', subtitle: 'ind-reading-exercises-1', summary: 'Guided reading practice.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
  ],
  'ind-handwriting': [
    { id: 'fallback-ind-hw-1', code: 'ind-handwriting-1', title: 'Pencil Grip and Posture', subtitle: 'ind-handwriting-1', summary: 'Develop proper pencil grip and writing posture.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
  ],
  'ind-spelling': [
    { id: 'fallback-ind-s-1', code: 'ind-spelling-1', title: 'Spelling CVC Words', subtitle: 'ind-spelling-1', summary: 'Encode simple CVC words using sound-letter knowledge.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
  ],
  'ind-spelling-exercises': [
    { id: 'fallback-ind-se-1', code: 'ind-spelling-exercises-1', title: 'Spelling Exercise 1', subtitle: 'ind-spelling-exercises-1', summary: 'Guided spelling practice.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
  ],
  'ind-vocab-comprehension-fluency': [
    { id: 'fallback-ind-vcf-1', code: 'ind-vocab-comprehension-fluency-1', title: 'Building Vocabulary', subtitle: 'ind-vocab-comprehension-fluency-1', summary: 'Build vocabulary through read-alouds and discussion.', is_locked: false, display_order: 1, teaching_mode: 'individual', lesson: null },
  ],
};

export const previewModuleByCode = Object.fromEntries(
  Object.values(previewModulesByGroup).flat().map(mod => [mod.code, mod])
);

export const groupToChapterCode: Record<string, string> = Object.fromEntries(
  Object.entries(previewGroupsByChapter).flatMap(([chapterCode, groups]) =>
    groups.map(g => [g.code, chapterCode])
  )
);

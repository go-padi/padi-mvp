export type ChapterSection = {
  title: string;
  description: string;
  estimate: string;
};

export type ChapterOverview = {
  code: string;
  title: string;
  blurb: string;
  sections?: ChapterSection[];
  inlineNote?: string;
};

export const CURRICULUM_INTRO =
  "~140 lessons (Individual, 1:1) or ~180 lessons (Group, classroom) across a 9-month program. Three phases, three signals — Accelerating, Practicing, or Specialist Track. Padi shows you which, every lesson.";

export const CURRICULUM_OVERVIEW: ChapterOverview[] = [
  {
    code: "phonological-awareness",
    title: "Phonological Awareness",
    blurb:
      "Hearing the sounds in words. Before children can read written words, they need to hear how spoken words are built from rhymes, syllables, and individual sounds. This is the foundation everything else rests on.",
    sections: [
      {
        title: "Learning Sensorially",
        description:
          "A gentle introduction to listening carefully and noticing sound.",
        estimate: "short — about 5–10 lessons",
      },
      {
        title: "Rhyming",
        description:
          "Recognizing and producing rhymes, the first phonological awareness skill children master.",
        estimate: "about 8–12 lessons",
      },
      {
        title: "Words & Sentences",
        description:
          "Counting words in a sentence, hearing where one word ends and the next begins.",
        estimate: "about 8–12 lessons",
      },
      {
        title: "Syllables",
        description: "Clapping out, blending, and segmenting syllables.",
        estimate: "about 8–12 lessons",
      },
      {
        title: "Phonemic Awareness",
        description:
          "Hearing the smallest sounds inside syllables. The most advanced phonological skill — required before phonics can take hold. Split into four parts: hearing initial sounds, final sounds, medial (middle) sounds, and combining sounds into words.",
        estimate: "about 25–35 lessons total across the four parts",
      },
    ],
  },
  {
    code: "alphabet",
    title: "Alphabet",
    blurb:
      "Letter names, letter shapes, letter order. Children learn the 26 letters of the alphabet through play — tracing, naming, matching, and sequencing — before any letter-to-sound work begins.",
    inlineNote: "Roughly 20 lessons in this chapter.",
  },
  {
    code: "phonics",
    title: "Phonics",
    blurb:
      "Linking sounds to letters. Children connect what they hear (a phoneme) to what they see (a grapheme). Letters are taught in six carefully ordered color-coded clusters — red, yellow, green, orange, blue, purple — three sounds at a time, with each new sound built on top of the ones already mastered.",
    inlineNote: "Roughly 30–40 lessons in this chapter.",
  },
  {
    code: "reading",
    title: "Reading",
    blurb:
      "From sounds to words to sentences. Children blend the phonics they've learned into real words, then into short sentences, then into the first small booklets they can read on their own. This is where decoding becomes automatic.",
    sections: [
      {
        title: "Reading Exercises",
        description:
          "A graduated series of reading practice passages, beginning with closed syllables and building toward fluent sentence reading.",
        estimate: "about 20–30 lessons",
      },
    ],
  },
  {
    code: "handwriting",
    title: "Handwriting",
    blurb:
      "Building muscle memory for writing. Children trace, copy, and write letters with proper formation — small enough to write easily, large enough to feel the shape. Tactile-kinesthetic work reinforces what they've learned about letter shapes in earlier chapters.",
    inlineNote: "Roughly 25–30 lessons in this chapter.",
  },
  {
    code: "spelling",
    title: "Spelling",
    blurb:
      "Hearing a word, writing a word. Children sound out spoken words and write them. Spelling lessons are graduated by accumulated mastery — each exercise uses only sounds the child has already learned, so spelling becomes a confidence builder rather than a stumbling block.",
    sections: [
      {
        title: "Spelling Exercises",
        description:
          "Nine graduated spelling sequences (SE-1 through SE-9), each introducing a small set of new sounds. The child moves to the next exercise when they can sound-spell the current set correctly.",
        estimate: "about 30–40 lessons total",
      },
    ],
  },
  {
    code: "vocabulary-comprehension-fluency",
    title: "Vocabulary, Comprehension and Fluency",
    blurb:
      "Reading for meaning. Children build the vocabulary they need to understand what they read, develop comprehension strategies, and read with the rhythm and expression of fluent readers. This is where the foundations come together.",
    inlineNote: "Roughly 15–25 lessons in this chapter.",
  },
];

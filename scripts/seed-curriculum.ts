import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type ModuleData = {
  code: string;
  title: string;
  subtitle: string;
  summary: string;
  is_locked: boolean;
  teaching_mode: 'group' | 'individual';
  display_order: number;
  lesson: {
    materials: string[];
    aims: string[];
    presentation_steps: string[];
    examples: string[];
    extension: string[];
  };
};

// Source data jams every teaching move into presentation_steps[0] as one
// paragraph and run-on aims into aims[0]. Split into discrete entries so
// the lesson page can render a numbered timeline / one aim per line.
function splitSteps(raw: string[]): string[] {
  if (!raw?.length) return [];
  const cleaned = raw.map(s => s.trim()).filter(Boolean);
  if (cleaned.length >= 2) return cleaned;
  return cleaned[0]
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map(s => s.trim())
    .filter(Boolean);
}

function splitAims(raw: string[]): string[] {
  if (!raw?.length) return [];
  if (raw.length > 1) return raw.map(s => s.trim()).filter(Boolean);
  return raw[0]
    .split(/(?<=[a-z])\s+(?=[A-Z])|\.\s+/)
    .map(s => s.trim().replace(/\.$/, ''))
    .filter(Boolean);
}

function normalizeLesson(lesson: ModuleData['lesson']): ModuleData['lesson'] {
  return {
    ...lesson,
    aims: splitAims(lesson.aims || []),
    presentation_steps: splitSteps(lesson.presentation_steps || []),
  };
}

type GroupData = {
  code: string;
  title: string;
  description: string;
  module_count: number;
  is_locked: boolean;
  teaching_mode: 'group' | 'individual';
  display_order: number;
  modules: ModuleData[];
};

type ChapterData = {
  code: string;
  title: string;
  description: string;
  display_order: number;
  teaching_mode: 'group' | 'individual';
  group_codes: string[];
};

const groups: GroupData[] = [
  {
    code: 'learning-sensorially',
    title: 'Learning Sensorially',
    description: 'Sharpen listening skills and auditory discrimination',
    module_count: 11,
    is_locked: false,
    teaching_mode: 'group' as const,
    display_order: 1,
    modules: [
      {
        code: 'learning-sensorially-1',
        title: 'The Silence Game',
        subtitle: 'learning-sensorially-1',
        summary: 'Sharpen the students\' listening skills',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 1,
        lesson: {
          materials: [
            'A quiet classroom',
          ],
          aims: [
            'To sharpen the students\' listening skills Develop good attention span Auditory discrimination',
          ],
          presentation_steps: [
            'Tell the students that they are going to play a game called \'Silence Game\'. Ask each of them to close their eyes and listen to the sounds in the room, outside the room and within themselves. Set a timer for 2 minutes. After 2 minutes of listening very quietly, ask them to share what they heard. They could have heard clock ticks, voices, footsteps, animals, children coughing, faucet, flush, cars, their own breathing, air conditioner, etc.',
          ],
          examples: [],
          extension: [
            'This game can be played in a different room or outdoors.',
            'Use tape recordings of birds, or other animals and ask to guess the animal.',
          ],
        },
      },
      {
        code: 'learning-sensorially-2',
        title: 'Guessing the Instrument',
        subtitle: 'learning-sensorially-2',
        summary: 'A quiet classroom',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 2,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'A quiet classroom Musical instruments like rhythm sticks, drums, tambourine Auditory sound discrimination Develop good attention span Vocabulary development',
          ],
          presentation_steps: [
            'Introduce the names of each instrument and show them what sounds they make. Have the names written on small cards beside each instrument. Ask students to close their eyes and listen to the sounds and guess the name of instrument that was played. Play each instrument in different sequences and ask them to guess the sequence.',
          ],
          examples: [],
          extension: [
            'Have three instruments. Ask the students to close their eyes and listen to the one sound you make. Ask one student to come and play the instrument you played. This game can be done with several other instruments or two sounds at a time and follow the same procedure as above.',
          ],
        },
      },
      {
        code: 'learning-sensorially-3',
        title: 'Sequencing Sounds Game',
        subtitle: 'learning-sensorially-3',
        summary: 'Develop sequencing memory for sounds and',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 3,
        lesson: {
          materials: [
            'Objects that make distinctive sounds',
            'Examples: clapping, stomping, ringing a bell,',
            'paper to crumple, writing on board with chalk,',
            'cutting with scissors, chewing food noisily,',
            'opening the faucet, tearing paper, throwing a ball,',
            'coughing, sneezing',
          ],
          aims: [
            'To develop sequencing memory for sounds and expressing them Auditory discrimination Vocabulary development',
          ],
          presentation_steps: [
            'Ask students to close their eyes. Teacher will make one sound at a time and ask the students to guess the sound. After the single sounds are heard, start with two sounds. Ask the students to identify the first sound and the next sound. When they can do this, present three sounds and then four sounds and see if the students can identify the sequence and the correct sound. Use the language first, second, third or last and use full sentences while responding.',
          ],
          examples: [],
          extension: [
            'Give three different sounds, ask the students to repeat the sequence. Now omit one sound and see if the student can identify the omitted sound. Ask students to make noises and ask their friends to guess.',
          ],
        },
      },
      {
        code: 'learning-sensorially-4',
        title: 'Guess the Direction',
        subtitle: 'learning-sensorially-4',
        summary: 'Successfully locate the direction where the',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 4,
        lesson: {
          materials: [
            'Students making different sounds',
            'Musical instruments',
          ],
          aims: [
            'To successfully locate the direction where the sound is coming from Auditory discrimination Vocabulary development',
          ],
          presentation_steps: [
            'Before starting this lesson, teach the students the four directions: north, south, east, west and place cards with names in each direction. Pick a student to be the \'maker\' of the sound. All the other students close their eyes. The \'maker\' goes to a different part of the room and makes a clapping sound. The students will guess where the sound is coming from. He must name the direction: n, s, e, w. The student who guessed will get to be the \'maker\' of the new sound. This student can make any other sound from a different part of the room. The students will guess where the sound is coming from.',
          ],
          examples: [],
          extension: [
            'Students can use musical instruments to repeat the same game.',
          ],
        },
      },
      {
        code: 'learning-sensorially-5',
        title: 'Guessing the Sounds',
        subtitle: 'learning-sensorially-5',
        summary: 'Guess which object makes the sound',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 5,
        lesson: {
          materials: [
            'Basket with whistle, rattle, bell, paper, rhythm',
            'sticks, sandpaper pieces and blocks',
          ],
          aims: [
            'To guess which object makes the sound Auditory discrimination Vocabulary development',
          ],
          presentation_steps: [
            'First introduce the names of all the objects and make the sounds of each object. Choose a student to go behind a screen and make the sound by using one of the objects while all the other students have their eyes closed. The students will guess which object made the sound. Give a chance to every student. This can be done in two groups.',
          ],
          examples: [],
          extension: [
            'Have small food jars each filled with rice, pennies, beans, sand, tacks, and paper clips. Cover the jars with paper so that the students cannot see the objects in the jars. Each student can shake the jar and guess what the sound is.',
          ],
        },
      },
      {
        code: 'learning-sensorially-6',
        title: 'Play the Exact Number',
        subtitle: 'learning-sensorially-6',
        summary: 'Listening attentively to the number of',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 6,
        lesson: {
          materials: [
            'Rhythm sticks',
          ],
          aims: [
            'Listening attentively to the number of sounds made Auditory and kinesthetic discrimination',
          ],
          presentation_steps: [
            'Bring the rhythm sticks in a basket. Demonstrate how to use rhythm sticks. Distribute the rhythm sticks to all the children. Now choose a child to be the \'player\' and ask him/her to choose two rhythm sticks and play it 5 times. The students in the circle will have to play',
            'times exactly as they heard. Choose different students to do the same but they can choose the number of times to play.',
          ],
          examples: [],
          extension: [
            'Use the same instruments but ask the player to go to a corner of the room and play the instrument. The children in the circle will guess where the sound is coming from. Let them use the correct terminologies, like the north corner, south corner, etc. Ask a student to sit in the center of the circle. Blindfold the student. Now pick another student from the circle and ask him to move to a different part of the room and say, \'hello or good morning.\' The blindfolded student will have to guess where the sound is coming from.',
          ],
        },
      },
      {
        code: 'learning-sensorially-7',
        title: 'Simon Says Game',
        subtitle: 'learning-sensorially-7',
        summary: 'Follow directions',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 7,
        lesson: {
          materials: [
            'None',
          ],
          aims: [
            'To follow directions Auditory and kinesthetic discrimination',
          ],
          presentation_steps: [
            'Play Simon Says starting with very simple to more complex directions.',
          ],
          examples: [],
          extension: [
            'Have a student give the directions and ask the other students to follow.',
          ],
        },
      },
      {
        code: 'learning-sensorially-8',
        title: 'Telephone Game',
        subtitle: 'learning-sensorially-8',
        summary: 'Auditory memory recall',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 8,
        lesson: {
          materials: [
            'None',
          ],
          aims: [
            'Auditory memory recall Learn \'left and right\'',
          ],
          presentation_steps: [
            'Have the students sit in a circle. Whisper into the first student\'s ear a simple phrase or a sentence, like, \'Today is a cloudy day.\' This child will whisper this sentence to the next student either to the left or right. The last child will tell the class what he hears.',
          ],
          examples: [],
          extension: [
            'Repeat the same game with two sentences and play it to the right or left. This also helps them to learn left and right.',
          ],
        },
      },
      {
        code: 'learning-sensorially-9',
        title: 'Clapping Game',
        subtitle: 'learning-sensorially-9',
        summary: 'Auditory memory',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 9,
        lesson: {
          materials: [
            'None',
          ],
          aims: [
            'Auditory memory Auditory and kinesthetic discrimination',
          ],
          presentation_steps: [
            'Students sit in a circle. Pick a leader and ask him/her to clap a rhythm. The students in the circle will have to produce the same rhythm. Give a turn to several students to produce their own rhythm. Ex. Clap, clap, clap Clap, pause, clap, pause Clap, stomp, clap, stomp Stomp, clap, clap, clap Stomp, stomp, clap, clap ……so on This game can also be played using rhythm sticks.',
          ],
          examples: [],
          extension: [
            'Another game is to tell the students that: One clap means stand on their knees; two claps mean jumping twice; three claps mean turning around three times. Students take turns giving commands.',
          ],
        },
      },
      {
        code: 'learning-sensorially-10',
        title: 'Name That Object',
        subtitle: 'learning-sensorially-10',
        summary: 'Auditory memory',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 10,
        lesson: {
          materials: [
            'little objects in a basket',
          ],
          aims: [
            'Auditory memory Auditory, visual, kinesthetic discrimination Vocabulary development',
          ],
          presentation_steps: [
            'Students sit in a circle. Have one student come and pull out three objects from the basket while naming each object. The student then places these three objects away from the other students\' sight. This student will call on a student who must name the three objects pulled. If he answers correctly, he gets to pull out three more objects from the basket. This game will continue till the children can name the objects correctly and in the same order.',
          ],
          examples: [],
          extension: [
            'Increase the number of objects to be pulled out of the basket. This can be done using pictures instead of objects.',
          ],
        },
      },
      {
        code: 'learning-sensorially-11',
        title: 'Matching Game',
        subtitle: 'learning-sensorially-11',
        summary: 'Auditory memory; following directions;',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 11,
        lesson: {
          materials: [
            'Numbers 1,2,3,4 written on small square',
            'paper',
          ],
          aims: [
            'Auditory memory; following directions; visual & kinesthetic discrimination',
          ],
          presentation_steps: [
            'Prerequisite for this work requires the students to know their numbers 1-4. Students sit in a circle. Teacher gives numbers 1,2,3,4 to each student. Teach the numbers if they haven\'t still learned. Continue in this fashion until all the students get a number 1,2,3, or 4. The teacher calls on number 2 to jump up. All the students with no. 2 will jump up. Then the teacher calls on another number. The students with that number will stand up. This is a great auditory memory exercise. It also makes them do different movements and learn their numbers.',
          ],
          examples: [],
          extension: [
            'Do the same type of game with colors, animal names or fruits or vegetables. These can be given to students, and they must stand up when their respective color, name is called. This can be played with any color song.',
          ],
        },
      },
    ],
  },
  {
    code: 'rhyming',
    title: 'Rhyming',
    description: 'Develop rhyming discrimination and production',
    module_count: 19,
    is_locked: false,
    teaching_mode: 'group' as const,
    display_order: 2,
    modules: [
      {
        code: 'rhyming-1',
        title: 'Same and Different',
        subtitle: 'rhyming-1',
        summary: 'Visual, auditory, kinesthetic discrimination',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 1,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Visual, auditory, kinesthetic discrimination Vocabulary development',
          ],
          presentation_steps: [
            'This should be done in smaller groups. Have the 2 circle cards on the table or on board. Ask each student to trace the circle. Their hands go around both times. Tell them that therefore these two are the same. Now ask the students to trace the circle and then the triangle. Is it the same? No, they are not the same. They are different. Now place both circle, circle and circle, triangle cards on the table. Ask the student to show the \'same cards,\' then the \'different cards.\' Point out to the \'same or different cards\' and ask them, \'what is this?\' The answer will be \'same or different.\' This is called a \'three period lesson.\' Make 2 copies of different shapes like hearts, diamonds, squares, rectangles. Mix the shapes into same and different cards. For example, have heart and heart; diamond and square; rectangle and rectangle spread on the table. Show the students the \'same and different\' cards. Students can tell you if they are \'same\' or \'different.\' Note how students are doing and take notes for future repetitions of this lesson.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'rhyming-2',
        title: 'Listen to Same and Different',
        subtitle: 'rhyming-2',
        summary: 'Auditory, kinesthetic, visual',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 2,
        lesson: {
          materials: [
            'Same and different cards',
          ],
          aims: [
            'Auditory, kinesthetic, visual discrimination; vocabulary development',
          ],
          presentation_steps: [
            'Show the students \'same\' and \'different\' cards. Ask them to point to the \'same and different\' cards. Now ask the students to make same or different sounds like \'clap, clap\' or \'clap, snap\' or \'clap, snap, clap, etc.\' If the sounds are the same, point to the \'same\' card or give thumbs up; and if they are different, point to the \'different\' card or thumbs down. Few sounds could be: Clap, clap Snap, clap Clap, snap; clap Clap, clap; clap',
          ],
          examples: [],
          extension: [
            'Ask students to turn to close their eyes. The teacher makes similar sounds as above and the students say \'same\' or \'different\' instead of pointing out to the cards.',
          ],
        },
      },
      {
        code: 'rhyming-3',
        title: 'Same Ending Sounds',
        subtitle: 'rhyming-3',
        summary: 'Recognize that the ending sounds for',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 3,
        lesson: {
          materials: [
            'Maracas; rhythm sticks; tambourine;',
            'drums; cymbals or 4-5 different musical',
            'instruments',
          ],
          aims: [
            'To recognize that the ending sounds for rhymes are same and only the beginning sound changes Reinforce the listening skills Vocabulary development',
          ],
          presentation_steps: [
            'Teacher produces a pair of sounds with the instruments. First: maracas and the cymbals Second: rhythm sticks and cymbals Third: drums and cymbals Now ask the students what was the instrument that they heard in all the three different sounds. Where did you hear the cymbals - beginning or end? This shows that the ending sounds are the same in rhyming.',
          ],
          examples: [],
          extension: [
            'Use different mediums of sounds to show them that the ending sounds are the same in rhyming words.',
          ],
        },
      },
      {
        code: 'rhyming-4',
        title: 'Visual Awareness of Rhyming',
        subtitle: 'rhyming-4',
        summary: 'Show visually that rhyming changes',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 4,
        lesson: {
          materials: [
            '-6 Red, 1 blue,1 green,1 yellow, 1 brown,',
            'orange square construction paper/ sticky',
            'note pieces that can be placed on a board',
          ],
          aims: [
            'To show visually that rhyming changes only in the initial position Auditory, kinesthetic discrimination',
          ],
          presentation_steps: [
            'This module can be useful for students who have difficulty with rhyming. Place the 5 red construction paper squares on the board one below the other. Tell the students that these squares are \'at\'. Now place the blue, green, brown, white, and yellow square pieces to the left of the red squares. Teacher: Where do they look the same? At the end. Teacher: Where do they look different? At the beginning. Teacher: Rhyming words sound the same at the end and different at the beginning. The red squares are \'at\'. Point and ask the students to repeat each red square. Point to each different color and running the finger from left to right teacher says: M-at, c-at, r-at, s-at, b-at. Show them that only the initial sound changes. On the second day, ask the students to generate the words. This same activity can be done with different color paper or tiles or cubes. Note how students are doing and take notes for future repetitions of this lesson as necessary.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'rhyming-5',
        title: 'Rhyming Words',
        subtitle: 'rhyming-5',
        summary: 'Develop the phonological cues to make',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 5,
        lesson: {
          materials: [
            'Story books/nursery rhymes',
          ],
          aims: [
            'Develop the phonological cues to make rhymes Auditory discrimination Vocabulary development The teacher gives two rhyming words and students echo them. Continue this exercise for a few days. When the students are familiar with rhyming, the teacher gives 2 rhyming words and students can echo and generate',
            'more rhyming words. For example, Teacher: pig, jig Student: pig, jig, rig, dig',
          ],
          presentation_steps: [
            'This can be done with movement or passing a ball to each other.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'rhyming-6',
        title: 'Stories with Rhymes',
        subtitle: 'rhyming-6',
        summary: 'Train the student\'s ears to listen and',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 6,
        lesson: {
          materials: [
            'See next page for list of books',
          ],
          aims: [
            'To train the student\'s ears to listen and predict rhyming words First time, read a story normally to the students with all the rhyming words. Stop after each rhyming word and repeat the rhyming words.',
          ],
          presentation_steps: [
            'Second time, read the same story and exaggerate the rhyming words. Next, read the first line with the rhyming word and let the students provide the rhyming word in the second line. Finally, read the same book and omit the final rhyming words in both first and second lines. Ask the students to guess the words. Students love listening to the same stories repeatedly.',
          ],
          examples: [],
          extension: [
            'Start off with simple books with stories.',
          ],
        },
      },
      {
        code: 'rhyming-7',
        title: 'Odd One Out',
        subtitle: 'rhyming-7',
        summary: 'Increasing the phonological cues to',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 7,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Increasing the phonological cues to generate rhymes Auditory discrimination',
          ],
          presentation_steps: [
            'The teacher says three words. Students echo the words. Say that only two words rhyme, and one does not. Ask them to tell you which word does not rhyme.',
          ],
          examples: [
            'rhyme',
            'and one\ndoes not',
            'does not\nrhyme',
          ],
          extension: [
            'Extend this to four and five letter words.',
          ],
        },
      },
      {
        code: 'rhyming-8',
        title: 'Pick the Rhymes',
        subtitle: 'rhyming-8',
        summary: 'Build the visual cues for generating',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 8,
        lesson: {
          materials: [
            'Pictures with rhymes* (RMG -8)',
            'Scissors, glue',
          ],
          aims: [
            'To build the visual cues for generating rhymes Visual, auditory discrimination Vocabulary development',
          ],
          presentation_steps: [
            'Give pictures to the students. Ask them to cut out only the ones that rhyme. They glue the rhyming pictures on plain paper. They read them to the class.',
          ],
          examples: [],
          extension: [
            'Give more pictures to the students, two that rhyme and one that doesn\'t rhyme. Ask them to look at the pictures and they will give you the correct rhymes.',
          ],
        },
      },
      {
        code: 'rhyming-9',
        title: 'Rhyme Time',
        subtitle: 'rhyming-9',
        summary: 'Visual identification of rhymes',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 9,
        lesson: {
          materials: [
            '-square template and rhyme pictures *',
            '(RMG-9)',
          ],
          aims: [
            'Visual identification of rhymes Kinesthetic, auditory discrimination',
          ],
          presentation_steps: [
            'This is done in smaller groups. Give 9-square templates to each student. Teacher places one picture on top of each square. Spread out six pictures that rhyme with each of the pictures on the square. Students pick the appropriate pictures that rhyme with the picture on the square. They glue two rhyming pictures to each of the squares. Each group of students can read their rhymes to the group or class.',
          ],
          examples: [],
          extension: [
            'More rhyming discrimination can be done with several other pictures.',
          ],
        },
      },
      {
        code: 'rhyming-10',
        title: 'Rhyme Hunting',
        subtitle: 'rhyming-10',
        summary: 'Working on the Phonological cues for',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 10,
        lesson: {
          materials: [
            'None',
          ],
          aims: [
            'Working on the Phonological cues for rhyming Kinesthetic, visual, auditory discrimination',
          ],
          presentation_steps: [
            'Teacher: Today we are going on a rhyme hunt in the classroom. I see a \'pear.\' What other words rhyme with \'pear?\' Students guess \'chair, hair, etc.\' Continue with other words. Choose any object in the room, ask to come up with rhyming words. E.g., I see a \'pen\' and the students will come up with \'ten\' or \'men\' etc. \'I see a block! What do you see in the classroom that rhymes with block?\' - sock, clock. Continue with more words.',
          ],
          examples: [
            'rhyme with',
          ],
          extension: [
            'Give a chance to a student to come up with a word and let the others find rhyming words to that word. Rhyme hunting can be done on trips to a farm; camping; or vacations.',
          ],
        },
      },
      {
        code: 'rhyming-11',
        title: 'Rhyme or Not',
        subtitle: 'rhyming-11',
        summary: 'Auditory discrimination',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 11,
        lesson: {
          materials: [
            'some that do not',
          ],
          aims: [
            'Auditory discrimination',
          ],
          presentation_steps: [
            'Dictate a pair of words to the students. Students echo the words and tell if they rhyme or not.',
          ],
          examples: [
            'to the students',
            'and tell if they\nrhyme or not',
          ],
          extension: [],
        },
      },
      {
        code: 'rhyming-12',
        title: 'What rhymes with --Materials:',
        subtitle: 'rhyming-12',
        summary: 'Be able to generate rhyming words',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 12,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'To be able to generate rhyming words Auditory discrimination Vocabulary development',
          ],
          presentation_steps: [
            'Teacher dictates a word to the students. Students echo the word and either in a group or individually name a word that rhymes with the given word. See below for the words.',
          ],
          examples: [
            'to the students',
            'as in',
            'as in',
          ],
          extension: [
            'Students can act out verbs and rhyme. For e.g., clapping/slapping; seeding/weeding/; feeding/reading; feeling/peeling; tanning/fanning; etc. This can be done for color words as in: Red/bed; blue/clue; yellow/mellow; brown/frown; gray/pray; green/screen; White/might; black/slack; etc. Also, can use number words as in: One/fun; two/moo; three/free; four/pour; Five/dive; six/fix; seven/eleven; eight/weight; nine/fine; ten/men; etc.',
          ],
        },
      },
      {
        code: 'rhyming-13',
        title: 'Go Fish',
        subtitle: 'rhyming-13',
        summary: 'Recognize rhyming words',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 13,
        lesson: {
          materials: [
            'Deck of rhyming picture cards * (RMG-13)',
          ],
          aims: [
            'To recognize rhyming words',
          ],
          presentation_steps: [
            'Shuffle the cards and deal 5 cards to each player. Place the rest of the cards face down in the pile. The first student says, \'I have a bug\'. The student with the rhyming card says, \'I have a mug\'. These cards are put in a pile in the center. If there is no match available, the student must go fish a card out of the pile until a match is made. Whoever runs out of cards first is the winner.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'rhyming-14',
        title: 'Rhyme Your Name',
        subtitle: 'rhyming-14',
        summary: 'Auditory discrimination',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 14,
        lesson: {
          materials: [
            'None',
          ],
          aims: [
            'Auditory discrimination',
          ],
          presentation_steps: [
            'Teacher: Today we are going to rhyme your name. The teacher can start off with her name and make a rhyme. Then each student can stand up and take a turn to rhyme their name.',
          ],
          examples: [],
          extension: [
            'Now this time, the other students can come up with rhyming names for their friends. Rhyme pet names.',
          ],
        },
      },
      {
        code: 'rhyming-15',
        title: 'Rhyming Memory Game',
        subtitle: 'rhyming-15',
        summary: 'Visual discrimination',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 15,
        lesson: {
          materials: [
            'Rhyming pictures- use the same cards as',
            '(RMG-13)',
          ],
          aims: [
            'Visual discrimination',
          ],
          presentation_steps: [
            'Copy the pictures on cardstock and cut out each of the pictures. Two to four children can play this game. Place all the cards facedown. The first player turns over two cards at a time. If the pictures on the two cards rhyme, the player keeps the cards and takes another turn. If the pictures on the two cards do not rhyme, the player places the cards facedown, and the next player takes a turn.',
          ],
          examples: [],
          extension: [
            'Play the same game with other rhyming words.',
          ],
        },
      },
      {
        code: 'rhyming-16',
        title: 'Rhyming Sentences',
        subtitle: 'rhyming-16',
        summary: 'Auditory discrimination',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 16,
        lesson: {
          materials: [
            'rhymes (RMG 16a, b, c)',
          ],
          aims: [
            'Auditory discrimination Improving the phonological cues to generate rhymes',
          ],
          presentation_steps: [
            'The teacher reads each sentence and pauses at the slash. Students complete the rhyme by giving an appropriate rhyming word.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'rhyming-17',
        title: 'Guess the Onset',
        subtitle: 'rhyming-17',
        summary: 'Recognize sounds within a syllable',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 17,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'To recognize sounds within a syllable Indirect preparation for reading For the teacher: An Onset is all the sounds in a word that come before the first vowel sound.',
          ],
          presentation_steps: [
            'T: I am going to give you a few words. Listen and echo each word. Then tell me what sound you hear that is the same in all these words before the vowel. T: Echo, sill, sip, sing, sand, sack S: Echo the words. T: what is the same sound that you hear in these words before the vowel? S: /s/ T: Give more words for students to practice the initial sound called \'Onsets.\' This can be done with pictures or objects.',
          ],
          examples: [
            'before the\nvowel',
            'before the vowel',
          ],
          extension: [],
        },
      },
      {
        code: 'rhyming-18',
        title: 'Rhyme family Game',
        subtitle: 'rhyming-18',
        summary: 'Automaticity of rhyme production',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 18,
        lesson: {
          materials: [
            'Ball or bean bag or anything to throw to',
            'each student',
          ],
          aims: [
            'Automaticity of rhyme production Auditory, kinesthetic discrimination Vocabulary development',
          ],
          presentation_steps: [
            'The students sit in a circle. Review the rhyme families to be played today. To begin the game, the teacher says, "My house is filled with mats." Toss the ball to any student in the circle. This student must produce a rhyme (e.g. "my house is filled with cats") and throw the ball back to the teacher. The teacher repeats the original rhyme and then tosses it to another student. This continues until the students run out of rhymes. Then begin the game with a new object in the house. See example below. * The children can throw the ball to each other and choose a new word to rhyme when they run out of rhymes. They can rhyme things in a farm, school, camp or any a special trip.',
          ],
          examples: [
            'below',
          ],
          extension: [],
        },
      },
      {
        code: 'rhyming-19',
        title: 'words-and-sentences-5',
        subtitle: 'rhyming-19',
        summary: 'Practice and develop skills through WS-5.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 19,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through WS-5.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
    ],
  },
  {
    code: 'words-and-sentences',
    title: 'Words & Sentences',
    description: 'Build word and sentence awareness',
    module_count: 9,
    is_locked: false,
    teaching_mode: 'group' as const,
    display_order: 3,
    modules: [
      {
        code: 'words-and-sentences-1',
        title: 'Word Length',
        subtitle: 'words-and-sentences-1',
        summary: 'Recognize long and short words',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 1,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'To recognize long and short words Auditorily and visually Vocabulary development',
          ],
          presentation_steps: [
            'In this exercise, we will concentrate on the concept of a word as separate from the thing that the word describes. Teacher says, \'I will say two words. You echo the words and tell me which word is longer.\' Truck or grasshopper? Students echo the words. Students may tell the teacher \'truck\' from the size it resembles. To show them visually, draw a line for each letter of the word or use small square pieces of paper. Place 5 lines for truck. Place 11 lines for grasshopper. Now ask them which is longer. Tell them that the word with more letters is also longer. See next page for word pairs. These words can be written on the board or printed on a paper in bold. They can be printed side to side or above and below, so the students can see the length.',
          ],
          examples: [
            'pairs',
          ],
          extension: [],
        },
      },
      {
        code: 'words-and-sentences-2',
        title: 'Word Length',
        subtitle: 'words-and-sentences-2',
        summary: 'Auditory development of long and short',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 2,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Auditory development of long and short words Development of vocabulary',
          ],
          presentation_steps: [
            'This game is very similar to the above game but without the use of visual aids. Teacher first reads the words from the cards. The students echo the words. Ask the students to tell which word is longer. Show long and short by arm motions. For the students having difficulty, practice lesson WS -1.',
          ],
          examples: [
            'from the\ncards',
            'is\nlonger',
          ],
          extension: [
            'Revisit this lesson after the introduction of syllables. They can clap the syllables or use body movements and verify by looking at the cards to see if they were correct.',
          ],
        },
      },
      {
        code: 'words-and-sentences-3',
        title: 'Two in One',
        subtitle: 'words-and-sentences-3',
        summary: 'Recognize that two words can be put',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 3,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'To recognize that two words can be put together to make a new word Vocabulary development Auditory discrimination Teacher says the words: baseball, basketball, softball. Besides being different kinds of balls, what do these words have in common? These are \'compound words\'... i.e. made of two small words that are combined to form a new word, with its own meaning. Compound means \'putting together.\' For example, take the words \'cup\' and \'cake.\' If we put these two together, we get the compound word \'cupcake.\' Let us think of other delicious compound words. How about \'black …. berry, straw … berry?\' This can be done with hand motion. Teacher pulls out fist for the first word and another fist for the second word and combine them to form the compound word. The students repeat the same. Have puzzle cards of compound words to put together.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'words-and-sentences-4',
        title: 'Pull Them Apart',
        subtitle: 'words-and-sentences-4',
        summary: 'Identifying the two words in a compound',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 4,
        lesson: {
          materials: [
            'Pictures of words is optional',
          ],
          aims: [
            'Identifying the two words in a compound word Kinesthetic, visual, auditory discrimination',
          ],
          presentation_steps: [
            'Teacher dictates a compound word. Ask the students to listen to the two words inside that word. Students echo the word slowly. The students then name the two new words inside the compound word. Students can have the two fists together and then pull each fist apart as they say each word.',
          ],
          examples: [
            'inside that word',
            'slowly',
            'inside the compound word',
          ],
          extension: [],
        },
      },
      {
        code: 'words-and-sentences-5',
        title: 'Add a Word',
        subtitle: 'words-and-sentences-5',
        summary: 'Making compound words.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 5,
        lesson: {
          materials: [
            'Optional - felts',
          ],
          aims: [
            'Making compound words.',
          ],
          presentation_steps: [
            'Teacher dictates the first part of a compound word. Ask the students to echo and give you the last part. They make a new compound word. Multiple answers are correct. Use of fists or felts make it more fun.',
          ],
          examples: [],
          extension: [
            'Have some mixed words or pictures that the students can glue together to make compound words.',
          ],
        },
      },
      {
        code: 'words-and-sentences-6',
        title: 'Deletion of Words',
        subtitle: 'words-and-sentences-6',
        summary: '*List of Compound words',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 6,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            '*List of Compound words Pictures of the first part of the compound word (optional) To increase awareness of two words within a compound word.',
          ],
          presentation_steps: [
            'The teacher gives the word, \'raincoat.\' The students echo the word. She then asks the students to say it without \'coat.\' Students say \'rain.\' Can have a picture of rain. Do more examples as given below.',
          ],
          examples: [
            'as given below',
          ],
          extension: [
            'Do the same exercise with compound words from stories being read in class.',
          ],
        },
      },
      {
        code: 'words-and-sentences-7',
        title: 'Words in a Sentence',
        subtitle: 'words-and-sentences-7',
        summary: 'Recognize how many words are in a',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 7,
        lesson: {
          materials: [
            '-8 Small cubes; * list of sentences',
          ],
          aims: [
            'To recognize how many words are in a sentence.',
          ],
          presentation_steps: [
            'Give the small cubes (about 7-8) to each student. Each cube represents a word. These are placed in a straight line in front of the student. Teacher dictates a sentence. E.g. I have a blue car. Students echo the sentence. As the students repeats the sentence, they move a cube down as they say each word. Students then count the number of cubes and tell the number of words in a sentence.',
          ],
          examples: [
            'I have a blue car',
            'in a sentence',
            'on the board',
          ],
          extension: [
            'Show pictures to students and ask them to generate full sentences. Do the same as above with the cubes. The teacher gives the sentences as the students place the cubes for each word. Now the teacher places the printed words on the board. The students can then check to see if they are correct.',
          ],
        },
      },
      {
        code: 'words-and-sentences-8',
        title: 'Long or Short Sentence?',
        subtitle: 'words-and-sentences-8',
        summary: 'Reinforces the idea that a sentence is made',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 8,
        lesson: {
          materials: [
            'Cubes',
          ],
          aims: [
            'Reinforces the idea that a sentence is made up of different number of words.',
          ],
          presentation_steps: [
            'Teacher distributes 7-8 cubes to students. She starts producing barebone sentences, that is, sentences made of only two monosyllabic words. Students echo and tell how many words are in the sentence. Teacher can write and box each word for the students to see them. After a few 2- word sentences, start giving them 3 words, 4 words, (monosyllabic) and so on. Now give them two different sentences with different number of words. T: If the sentence has only 4 words, it is a short sentence. If there are more than 4 words, it is a long sentence. S: will count the number of words in each sentence and tell whether it is long or short. Place word cards on board for the visual reinforcement of this concept. This is a good time to show that words have space between them in a sentence. Also show them how placing the words in a different order can change the meaning. Note how students are doing and take notes for future repetitions of this lesson.',
          ],
          examples: [
            'are in the sentence',
            'for\nthe students to see them',
            'sentences',
            'start giving\nthem',
            'it is a\nshort sentence',
            'it is a long\nsentence',
          ],
          extension: [],
        },
      },
      {
        code: 'words-and-sentences-9',
        title: 'Sentence Bingo',
        subtitle: 'words-and-sentences-9',
        summary: 'Practice and develop skills through Sentence Bingo.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 9,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Sentence Bingo.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
    ],
  },
  {
    code: 'syllables',
    title: 'Syllables',
    description: 'Clap, segment, and blend syllables',
    module_count: 17,
    is_locked: false,
    teaching_mode: 'group' as const,
    display_order: 4,
    modules: [
      {
        code: 'syllables-1',
        title: 'What is a Syllable?',
        subtitle: 'syllables-1',
        summary: 'Teach what a syllable is and how the',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 1,
        lesson: {
          materials: [
            'syllables',
          ],
          aims: [
            'To teach what a syllable is and how the words are made of smaller units of speech Auditory, kinesthetic discrimination',
          ],
          presentation_steps: [
            'Teacher asks the students to echo the word, \'Da/vid\' and the students echo it. Teacher asks the students, \'how many times did my jaw open when I said the word \'David?\' Yes, two times. A syllable is a word or a part of a word. It contains a single vowel accompanied by consonants. Words may have one, two, three or more syllables. Our jaw opens and closes for each syllable in a word. Ask them to place a hand below the chin and see how many times the jaw touches the hand. Each time the jaw touches the hand, it is counted as a syllable. Tell them that each syllable relates to the opening and closing of the jaw.',
          ],
          examples: [
            'or a part of a word',
            'may have one',
            'two',
            'three or more syllables',
          ],
          extension: [
            'Use more words that the children are familiar with.',
          ],
        },
      },
      {
        code: 'syllables-2',
        title: 'Counting Syllables',
        subtitle: 'syllables-2',
        summary: 'Practice and develop skills through Counting Syllables.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 2,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Counting Syllables.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'syllables-3',
        title: 'Clapping Names',
        subtitle: 'syllables-3',
        summary: 'Visual, Auditory, kinesthetic reinforcement',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 3,
        lesson: {
          materials: [
            'List of names of students in class',
            'The rectangular foams (optional)',
          ],
          aims: [
            'Visual, Auditory, kinesthetic reinforcement of Syllable',
          ],
          presentation_steps: [
            'Teacher says that some of the students have short names, and some have long names. Say some of their first names. Now the teacher chooses a student\'s name and says it while clapping it out.',
            'g. Li/nus; Ed/na; Jack; etc. After each name has been clapped, ask the students how many syllables they heard. Once they become comfortable with this, ask them to clap the syllables in their own name. They may use the felts which represent each syllable.',
            'Do the same activity with the students\' last names.',
            'Ask the students to sit in a circle. Point to a student. Ask the students to: clap their hands or whisper or silently find the number of syllables in the name of the student who has been picked.',
            'Have the students say their names and stand in groups according to the number of syllables in their names. Now write their names on a card and write the nos. 1-5 on cards. Challenge the students to sort their names according to the number of syllables. Note how students are doing and take notes for future repetitions of this lesson.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'syllables-4',
        title: 'Objects in a Basket',
        subtitle: 'syllables-4',
        summary: 'Visual, Auditory, Kinesthetic reinforcement',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 4,
        lesson: {
          materials: [
            'A basket with several objects; examples of',
            'objects that may be used:',
            'Pen, pencil, eraser, crayon, marker, book,',
            'cube, marble, small ball, ruler, paper, small',
            'box, etc.',
            'Rectangular foams are optional.',
          ],
          aims: [
            'Visual, Auditory, Kinesthetic reinforcement of Syllables Vocabulary development',
          ],
          presentation_steps: [
            'Invite a student to close his/her eyes and pick an object from the basket and name it. E.g., this is a \'crayon.\' Other students repeat the name as they clap out the syllables. Then ask the students how many syllables they heard. Each student then takes turns to find an object, say the name, and clap the syllables.',
          ],
          examples: [],
          extension: [
            'Do the same activity with the objects in the classroom.',
            'This activity can be done with things in a park.',
            'Continue the same activity with things in the home. Instead of clapping, they can do different physical movements.',
          ],
        },
      },
      {
        code: 'syllables-5',
        title: 'Syllable Sorting with Pictures',
        subtitle: 'syllables-5',
        summary: '* Pictures with different number of',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 5,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            '* Pictures with different number of syllables A pocket chart (optional) Rectangular foams (optional) Visual. kinesthetic reinforcement of Syllables Vocabulary development',
          ],
          presentation_steps: [
            'Place the numeral cards 1-4 in the top row of a pocket chart. Have students each select a picture card, say its name, and then clap and count the number of syllables. For students who need more reinforcement, use the foams. Students then place the card in the pocket chart below the corresponding number of syllables. Review the pictures in each column after the pictures have been sorted.',
          ],
          examples: [],
          extension: [
            'Pictures of the unit or theme being learned in the class can be used.',
            'When the students are comfortable, give them any picture card, and challenge them to sort it without saying the name or clapping. This may be challenging for some as the kinesthetic aspect is removed.',
          ],
        },
      },
      {
        code: 'syllables-6',
        title: 'Syllable Bingo',
        subtitle: 'syllables-6',
        summary: 'Practice and develop skills through Syllable Bingo.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 6,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Syllable Bingo.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'syllables-7',
        title: 'Syllable Graphing',
        subtitle: 'syllables-7',
        summary: 'Visual/kinesthetic reinforcement of',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 7,
        lesson: {
          materials: [
            'Graphing paper reproducible (SYL-7)',
            'Syllable pictures; scissors, glue stick',
          ],
          aims: [
            'Visual/kinesthetic reinforcement of Syllables Each student can do this activity. Students place the graph paper on a flat surface. Teacher distributes syllable pictures to each student. Student picks a picture and places it in the column on the graph with the same number as the number of syllables in the word. Have the students repeat this process until all the syllable cards have been placed. Ask the students questions about the graph. How many syllables do most of the words have? How many 2 syllable words do we have? etc.',
            'Students can play the card game \'War\' with the syllable cards.',
            'They can play \'Go Fish\' with the syllable cards.',
            'A game of \'Concentration\' can also be played with these cards.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'syllables-8',
        title: 'Syllable Tower',
        subtitle: 'syllables-8',
        summary: 'Practice and develop skills through Syllable Tower.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 8,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Syllable Tower.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'syllables-9',
        title: 'Syllable Blending',
        subtitle: 'syllables-9',
        summary: 'Show how to blend syllables one by one',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 9,
        lesson: {
          materials: [
            'Rectangular foams / hands',
          ],
          aims: [
            'To show how to blend syllables one by one into familiar words Preparation for reading, writing',
          ],
          presentation_steps: [
            'Teacher can say that she is going to say words in a different way today. The students must guess the right word. Teacher says \'pic\' and shows her left hand and now says \'nic\' and shows the right hand. Now ask the students, \'what word is this?\' She brings the hands together saying \'pic/nic.\' Students echo the same. Teacher continues to give two-word syllables distinctly for the students to blend and find the new syllable.',
          ],
          examples: [
            'in a different way today',
            'is this',
          ],
          extension: [
            'Can extend this activity to showing pictures of words.',
            'Teacher gives the whole syllable, and the students pull them apart.',
          ],
        },
      },
      {
        code: 'syllables-10',
        title: 'Syllable Recall',
        subtitle: 'syllables-10',
        summary: 'Recall of Syllables',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 10,
        lesson: {
          materials: [
            'Numeral cards with 1, 2, 3, 4, 5, 6 or dice',
          ],
          aims: [
            'Recall of Syllables Preparation for reading, writing',
          ],
          presentation_steps: [
            'This is a very abstract exercise and may be challenging for some students. Teacher asks a student to pick a number. If dice is used, students roll the dice and decide the number. The student produces a word with that many numbers of syllables. For simplicity, you can have a category like states, countries, objects, restaurant, etc. If this is very challenging, start off with one or two syllables and fold in more as the students get proficient at it. Vary the lesson with different movements for different number of syllables.',
          ],
          examples: [],
          extension: [
            'The variation can be to show pictures. The student picks a number from the dice or paper. The student will point to the picture with the same number of syllables. For e.g., if he picks 3, he will show the picture of an elephant.',
          ],
        },
      },
      {
        code: 'syllables-11',
        title: 'Syllable Bingo with Pictures',
        subtitle: 'syllables-11',
        summary: 'Practice and develop skills through Syllable Bingo with Pictures.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 11,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Syllable Bingo with Pictures.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'syllables-12',
        title: 'Syllable Accents',
        subtitle: 'syllables-12',
        summary: 'Learning how to accent a syllable',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 12,
        lesson: {
          materials: [
            'List of syllables or pictures',
          ],
          aims: [
            'Learning how to accent a syllable To help in preparation for reading, writing',
          ],
          presentation_steps: [
            'Review alphabet accenting lesson, AL-20. T: Names a few students\' names, overemphasizing the accented syllables in their names. E.g. Sta\' cy; Ka\' ra; Ja\' son; A\'dam Ask if they heard a difference in the way one part of the name was said. We said some parts louder than the others. When one part is accented, the mouth opens wider and hence said louder and the tone is higher. The accented part can be modeled with hands up in the air and down for unaccented syllable. The students can look in the mirror to see the accents in their names. Practice with all the students\' names by accenting the syllable.',
          ],
          examples: [
            'Sta',
          ],
          extension: [
            'Practice words with accent in the second syllable in two syllable words; and multisyllabic words',
          ],
        },
      },
      {
        code: 'syllables-13',
        title: 'Syllable Deletion - I (last syllable)',
        subtitle: 'syllables-13',
        summary: 'Encourage awareness of syllables within',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 13,
        lesson: {
          materials: [
            'Rectangular Foams',
          ],
          aims: [
            'To encourage awareness of syllables within words Preparation for reading, writing It is best to use the names of the students in the class for this exercise. On the second day, the given list can be used. Teacher says a name, Johnny. Then she says Johnny without \'nee\' - which will be \'john.\' T: Say Johnny and put out the rectangles for each syllable. S: Say Johnny and put out 2 rectangles. T: Now say Johnny without \'nee\'. S: Take out the second rectangle and say \'John\'. T: will continue with other names. Use the foam rectangle pieces only if needed. This can also be done with hand movements. Put one hand out for each syllable. When the syllable is deleted, take that hand off.',
            'Do the above with different names or names of students in class.',
            'Teacher can say the name, leave out a syllable and ask the student which syllable she left out. Note how students are doing and take notes for future repetitions of this lesson as necessary.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'syllables-14',
        title: 'Syllable Deletion - II (first syllable)',
        subtitle: 'syllables-14',
        summary: 'Encourage awareness of syllables within',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 14,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'To encourage awareness of syllables within words; preparation for reading and writing',
          ],
          presentation_steps: [
            'This can be done with rectangular foams or hand/head movements. Teacher says a name, Johnny. Then she says Johnny without \'john\' - which is \'ny\' Teacher gives several names to the students and asks them to say the names without the first syllable.',
          ],
          examples: [],
          extension: [
            'Can extend this activity to multi syllabic words.',
            'Do the above with different names or names of students in class.',
            'Teacher can say the name, leave out a syllable and ask the student which syllable she left out.',
          ],
        },
      },
      {
        code: 'syllables-15',
        title: 'Syllable Substitution',
        subtitle: 'syllables-15',
        summary: 'Learning to substitute syllables',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 15,
        lesson: {
          materials: [
            'Foam pieces cut into rectangular shapes',
          ],
          aims: [
            'Learning to substitute syllables Auditory discrimination',
          ],
          presentation_steps: [
            'Students will enjoy this activity if their names are used and one of their syll. is substituted. Use foams or hand/head movements. Teacher gives a syllable and a new syllable to substitute the last syllable. Students find the new word. Say \'MaryAnn.\' Students echo MaryAnn and pull out three foam pieces down. Take the syllable \'Ann\' out. Take out one foam representing \'Ann.\' What is left? Point to the two foams and say \'Mary.\' Now add \'Beth\' to \'Mary.\' Add another foam to represent \'Beth.\' Say the new syllable…. \'Marybeth.\'',
          ],
          examples: [],
          extension: [
            'None',
          ],
        },
      },
      {
        code: 'syllables-16',
        title: 'Playing with Syllables',
        subtitle: 'syllables-16',
        summary: 'Learning to add to a detached syllable and',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 16,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Learning to add to a detached syllable and reverse the new syllable Preparation for reading, writing',
          ],
          presentation_steps: [
            'Use movements with hand or head or use rectangular foams. Teacher asks the students to echo the word corn. Add pop to the end of corn…. cornpop Switch the parts and say the new word… popcorn. Repeat with all the given words.',
          ],
          examples: [
            'corn',
          ],
          extension: [],
        },
      },
      {
        code: 'syllables-17',
        title: 'Syllable Order',
        subtitle: 'syllables-17',
        summary: 'Focus on syllables and learn to',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 17,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'To focus on syllables and learn to manipulate their order Auditory reinforcement',
          ],
          presentation_steps: [
            'Teacher asks the students to listen to the syllables. They are not in the right order.',
            'g., nus/Li is Li/nus Tell the students to listen to these syllables and unscramble them to make the correct name. Once the students show proficiency, give them multisyllabic words.',
          ],
          examples: [],
          extension: [
            'After the students are comfortable, use their names in the classroom.',
          ],
        },
      },
    ],
  },
  {
    code: 'initial-sounds',
    title: 'Initial Sounds',
    description: 'Identify and manipulate initial sounds in words',
    module_count: 17,
    is_locked: false,
    teaching_mode: 'group' as const,
    display_order: 5,
    modules: [
      {
        code: 'initial-sounds-1',
        title: 'Sound Pictures',
        subtitle: 'initial-sounds-1',
        summary: 'Show visually how sounds feel in one\'s',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 1,
        lesson: {
          materials: [
            'Mirror; pictures of lips, tongue, teeth',
            '(optional)',
          ],
          aims: [
            'To show visually how sounds feel in one\'s mouth to help with phoneme articulation The use of mirror is engaging but also this is how your brain recognizes those sounds. Auditory features and gestures are part of identification. Louisa Moats called this \'Mouth awareness.\' Teacher gives each student a mirror. Direct the students to place the mirror on their desks and lift it only when they are asked to make a sound. // refers to sounds; ____ refers to names Mirrors up, echo the sound /m/ while you look in the mirror. Are your lips together? Yes/no responses. Can you see your lips together? Mirrors up and echo the sound /s/ as you look in the mirror. Are your teeth together? Can you see your teeth together? Do the same as above with the sound /a/ and ask the children: Is your mouth open? Can you see your mouth open?',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [
            'Continue to review the above concepts for a few days until the students are very familiar with it. As an option, pictures of lips closed, teeth together and mouth open can be used to reinforce this concept.',
          ],
        },
      },
      {
        code: 'initial-sounds-2',
        title: 'Same or Different Shapes? - Review',
        subtitle: 'initial-sounds-2',
        summary: 'Teach \'same\' and \'different\' visually',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 2,
        lesson: {
          materials: [
            'Different (circle, triangle) cards (RMG-1)',
          ],
          aims: [
            'To teach \'same\' and \'different\' visually',
          ],
          presentation_steps: [
            'This module has already been done earlier in rhyming. It is repeated here for reinforcement. Place the \'same\' card (two circles) on the board or table. Point to the two circles and say - circle, circle. The students can trace the circles in the air while saying it. They are the same. Teacher places the \'different\' cards on the board/table. The students trace the circle, triangle in the air while saying - \'circle, triangle.\' They are different. The teacher asks the students to point to the same card. The teacher asks the students to point to the different cards. The teacher shows the same and different cards and asks the students, \'what is this?\' The students respond, same, different. Continue this exercise until the students can identify these \'same and different\' cards well. Repeat with different shapes (provided) if the students need more practice. Can use same and different objects or counters or pictures.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'initial-sounds-3',
        title: 'Same or Different Sound Shapes?',
        subtitle: 'initial-sounds-3',
        summary: '**Same and different cards (RMG 1,2)',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 3,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            '**Same and different cards (RMG 1,2) *Examples To show visually how sounds feel in one\'s mouth to help with phoneme articulation',
          ],
          presentation_steps: [
            'Review the same and different cards before this activity and place them on the board. Teacher: Watch my mouth as I say some sounds. If my mouth looks the same, say \'same\' while pointing to the \'same\' card. If my mouth looks different, point to the \'different\' card, and say \'different.\' Use sounds given below.',
          ],
          examples: [],
          extension: [
            'Do the same as above. The teacher can give a turn to each student to echo the sounds while looking in the mirror and ask other students to say whether it is same or different.',
          ],
        },
      },
      {
        code: 'initial-sounds-4',
        title: 'Discovery of Consonants',
        subtitle: 'initial-sounds-4',
        summary: 'Show visually how sounds feel in one\'s',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 4,
        lesson: {
          materials: [
            'Mirror',
          ],
          aims: [
            'To show visually how sounds feel in one\'s mouth to help with phoneme articulation',
          ],
          presentation_steps: [
            'The teacher reviews the \'lips closed, open, tongue and teeth\' concept. I am going to say a sound; you will echo the sound and look at your mouth in the mirror and tell me how your mouth feels. Now, mirrors up. Say /t/ sound. Students echo looking in the mirror. T: What part of your mouth is used to make the sound. The tip of your tongue and teeth. The air flow is blocked by the tongue and teeth. /t/ is a blocked sound. A blocked sound is called a Consonant. Do this with several Consonant sounds.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'initial-sounds-5',
        title: 'Discovery of Vowels',
        subtitle: 'initial-sounds-5',
        summary: 'Show visually how sounds feel in one\'s',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 5,
        lesson: {
          materials: [
            'Mirror',
          ],
          aims: [
            'To show visually how sounds feel in one\'s mouth to help with phoneme articulation The teacher reviews the \'lips closed, open, tongue and teeth\' concept. Listen and echo the sound; look at your mouth in the mirror and say how your mouth feels. Now, mirrors up. Teacher: Say /a/- (closed vowel sound - like in the beginning of \'apple.\')Students echo it while looking in the mirror. T: Is your mouth open or closed? S: Mouth is open. T: Is the air flow blocked by the tongue, teeth, or lips? S: It is not blocked by anything. So, it is an unblocked sound. An unblocked sound is a Vowel. Do this with all the vowel sounds. T: Place your hands on your throat. She asks the students if it is buzzing or vibrating. Yes, it is buzzing. So, it is a voiced sound. Try it with all vowels. They will discover that all vowels are voiced and unblocked. The teacher gives turn to the students to echo the sounds while looking in the mirror. The other students say whether it is blocked or unblocked, voiced or unvoiced. Note how students are doing and take notes for future repetitions of this lesson.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'initial-sounds-6',
        title: 'Pulling Down Sounds',
        subtitle: 'initial-sounds-6',
        summary: '*Card with three squares (IS-6)',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 6,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            '*Card with three squares (IS-6)',
            'Counters (counters represent sounds) ** List of sounds Auditory discrimination of the beginning sounds and to master left to right sequencing Preparation for reading, writing',
          ],
          presentation_steps: [
            'Give 3 counters to each student and ask them to place them on their desk. Teacher: Listen and echo the sounds and move one counter for each sound starting from the square with the star. Start with single sounds and slowly add more sounds. Teacher says /m/ Student echoes /m/ and then pulls down one counter as he makes the sound /m/. He places it on the left most side of the square (square with star). After a few single sounds, say /t/, /a/ First teacher says /t/. Next the teacher says /a/ and the student echoes /a/ and pulls down and places one more counter to the right of /t/, as he makes the sound /a/. Continue the same activity with 2,3, or 4 sounds.',
          ],
          examples: [],
          extension: [
            'Can do this activity with more sounds.',
          ],
        },
      },
      {
        code: 'initial-sounds-7',
        title: 'Name Game',
        subtitle: 'initial-sounds-7',
        summary: 'Practice and develop skills through Name Game.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 7,
        lesson: {
          materials: [
            'Names of students in the classroom',
          ],
          aims: [
            'Practice and develop skills through Name Game.',
          ],
          presentation_steps: [
            'Isolation of phonemes in their names The teacher chooses one of the names of the students in the classroom. She must enunciate the initial sound very distinctly. Teacher says, \'I am going to say the beginning sound of one of your names.\' Teacher says /n/ Whose name begins with /n/? Students may come up with two or three names that begin with that sound. Encourage the students to guess all the possible names beginning with that sound in the class. Introduce synonyms for \'beginning\'. Say that \'Initial\' and \'first\' mean the same as beginning. Play this game with different initial sounding names. Sing with the student\'s names isolating the initial sound to the tune of \'If you are happy and you know it clap your hands.\' If your name begins with /s/ stand up If your name begins with /s/ stand up If your name begins with /s/ Stand up and take a bow If your name begins with /s/ stand up… Sarah, Sandy, etc.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'initial-sounds-8',
        title: 'Sorting Objects/Pictures',
        subtitle: 'initial-sounds-8',
        summary: 'Auditory discrimination of the initial',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 8,
        lesson: {
          materials: [
            'sound (IS-8)',
          ],
          aims: [
            'Auditory discrimination of the initial sounds; preparation for reading This is an activity to be done with smaller groups of students. Teacher picks three pictures beginning with the same sound. She picks one picture and emphasize the initial sound, e.g., /m-m-m/ for mitten. The students take turns doing the same with the remaining two pictures. When the students feel comfortable, add three pictures of another sound beginning with another sound, each time asking the students to identify the name and initial sounds. Repeat, but this time mix pictures with different initial sounds. Introduce only single consonant sounds at a time. Do the same activity with objects in the room. Point to an object in the room and ask the student to give the initial sound of that object.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'initial-sounds-9',
        title: 'Guessing Game',
        subtitle: 'initial-sounds-9',
        summary: 'Objects in the environment; Bag of',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 9,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Objects in the environment; Bag of objects/pictures beginning with different sounds (IS-8 pictures) Reinforcement of initial sounds',
          ],
          presentation_steps: [
            'Teacher says, \'we are going to play a guessing game.\' You must guess the name of the object after I give you some clues. T: says, \'I am thinking of an object that begins with the sound /t/ The students echo the sound /t/ Say, \'this object is a piece of furniture. It is made of wood or metal. You need to use it to eat your dinner. Mostly it is found in the dining room or kitchen or sometimes it may be found outside. What object is it?\' A table. You can Continue with several objects from the environment; a farm; classroom; home, etc.',
          ],
          examples: [],
          extension: [
            'Do the above game with objects in a box. Teacher can line up the object and follow the above presentation.',
            'This can also be done with pictures displayed on the board; or objects in the school or home. Reuse IS-8 pictures.',
          ],
        },
      },
      {
        code: 'initial-sounds-10',
        title: 'Initial Sound Game of Names',
        subtitle: 'initial-sounds-10',
        summary: 'Learn to identify the initial sound of the',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 10,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Learn to identify the initial sound of the names in class Auditory reinforcement of sounds',
          ],
          presentation_steps: [
            '(Research has shown that using the students\' names is more effective than arbitrary names.) Teacher: \'I am going to say one of your names without the initial sound. You must guess the initial sound.\' T: Eel for Neal; Ran for Fran, etc. Students will guess Neal and Fran. Continue with several other names in class. Extend this to the people in their homes or some new names as given in the list below.',
          ],
          examples: [
            'Say Neal',
            'this way',
          ],
          extension: [
            'This time the teacher can give the full names and say it without the initial sound. The students can guess the sound that is missing. E.g. Say Neal; now say eel; what sound is missing? Yes, the initial sound is n-n-n-n-n. Give several examples this way.',
          ],
        },
      },
      {
        code: 'initial-sounds-11',
        title: 'Deleting Initial Sounds',
        subtitle: 'initial-sounds-11',
        summary: 'Identify the missing initial sounds',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 11,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'To identify the missing initial sounds',
          ],
          presentation_steps: [
            'Teacher says a name and then says it without the initial sound. Students guess. Teacher: Say Helen without the /h/….Elen Say Barry without the /b/…...Arry Continue with other names.',
          ],
          examples: [],
          extension: [
            'This game can be done with names of people, objects, countries, pets, etc.',
          ],
        },
      },
      {
        code: 'initial-sounds-12',
        title: 'Changing Initial Sounds',
        subtitle: 'initial-sounds-12',
        summary: 'Focus on initial sounds and be able to',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 12,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'To focus on initial sounds and be able to manipulate it.',
          ],
          presentation_steps: [
            'Teacher asks the students to echo the name Page. Students echo Page. Now she asks them to change /p/ in Page to /s/ Students will replace /p/ with /s/ in Page. Yes, it will be Sage. Work with several names in this way. Some children may have problems with this. Break it down more. Say Page. Say Page without/p/………./age/ Now add /s/ to /age/……………………./sage/ Different faces of people cut out from magazines, or newspapers can be used.',
          ],
          examples: [],
          extension: [
            'This exercise can be done with names of objects; names of countries; names of pets, etc.',
          ],
        },
      },
      {
        code: 'initial-sounds-13',
        title: 'Identify Initial Sounds',
        subtitle: 'initial-sounds-13',
        summary: 'Auditory reinforcement of initial sounds',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 13,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Auditory reinforcement of initial sounds',
          ],
          presentation_steps: [
            'Teacher dictates a word, dog. Students echo - dog. Teacher: what is the first/initial sound that you heard? Students: /d/ Continue with many different words with single initial consonants. Do not introduce words with blends or digraphs during this time.',
          ],
          examples: [],
          extension: [
            'Do the same work with the unit being studied that month; or words that belong to parts of a house.',
          ],
        },
      },
      {
        code: 'initial-sounds-14',
        title: 'Sound Pictures',
        subtitle: 'initial-sounds-14',
        summary: 'Isolate initial sounds',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 14,
        lesson: {
          materials: [
            'Card with three squares',
            'One counter',
          ],
          aims: [
            'To isolate initial sounds Visual reinforcement of words starting from left to right Preparation for reading, writing',
          ],
          presentation_steps: [
            'Teacher gives a bag of pictures to each student. Students take turns to pull out a picture and place it above the square. Students will say the name of the picture and the initial sound of the picture. They will pull out one counter and place it in the left square. This will help them to see that words go from left to right.',
          ],
          examples: [
            'go from left to right',
            'given by the\nteacher orally',
          ],
          extension: [
            'This can be done with words given by the teacher orally; this can be done with 2,3, or',
            'letter words.',
          ],
        },
      },
      {
        code: 'initial-sounds-15',
        title: '\'Take Away\' Game',
        subtitle: 'initial-sounds-15',
        summary: 'Separate the initial sounds of words and',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 15,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'To separate the initial sounds of words and form a new word without the initial sound.',
          ],
          presentation_steps: [
            'Teacher will say that today we are going to play a game called \'Take Away\'. The teacher will say the word, \'fan\' and Students echo the word. Now the teacher asks the students to take away the initial sound /f/ and say the new word left. Students will say \'an\' which is a different word. Continue with the list of words in the same fashion.',
          ],
          examples: [
            'left',
            'in the same\nfashion',
          ],
          extension: [
            'Ask the students to guess their friend\'s name when the teacher says it without their initial sound.',
            'g., Barry without /b/---arry Teacher can also take away /at/ of /cat/ and ask the students what she took away. Continue with other words.',
          ],
        },
      },
      {
        code: 'initial-sounds-16',
        title: 'Odd Man Out',
        subtitle: 'initial-sounds-16',
        summary: 'Reinforce the understanding of initial',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 16,
        lesson: {
          materials: [
            'initial sounds and one with a different',
            'initial sound',
          ],
          aims: [
            'To reinforce the understanding of initial phonemes',
          ],
          presentation_steps: [
            'Here the students pick out the word that doesn\'t begin with the same sound. Teacher will say four words. Students echo them. Teacher asks them to take out the word that begins with a different initial sound. Teacher: \'cat, cap, cad, map\' Students echo these. Now teacher asks them to pick out the word with a different beginning sound ….\'map\'. Continue with the words on the next page. (Some students may have retrieval issues. Give only 3 words at a time to these students.)',
          ],
          examples: [
            'that\ndoesn',
            'on the next page',
            'at a time to these\nstudents',
          ],
          extension: [
            'This exercise can be done with names of students, pets, or objects in class.',
          ],
        },
      },
      {
        code: 'initial-sounds-17',
        title: 'Scavenger Hunt',
        subtitle: 'initial-sounds-17',
        summary: 'Reinforce the understanding of initial',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 17,
        lesson: {
          materials: [
            'Several assorted objects/pictures taken',
            'from magazines or from the collections',
            'provided in this book',
            'A small paper bag.',
          ],
          aims: [
            'To reinforce the understanding of initial phonemes',
          ],
          presentation_steps: [
            'Have the students in groups of 3 or 4 depending on the class size. Each group gets a bag with a picture or an object in it. Teacher needs to make sure that the students know the name of the picture/object and its beginning sound. For ex. if it is a picture of an \'alligator, the student will say \'alligator - /a/\'. Each group then goes around the class and looks for items that begin with that same initial sound /a/ that is in their bag. When the group has found about 3-4 objects, they bring it to their tables. When the whole class is done, each group can share their findings.',
          ],
          examples: [],
          extension: [
            'T. will give an initial sound to a student. The student will bring students whose name begins with that initial sound.',
          ],
        },
      },
    ],
  },
  {
    code: 'final-sounds',
    title: 'Final Sounds',
    description: 'Identify and manipulate final sounds in words',
    module_count: 7,
    is_locked: false,
    teaching_mode: 'group' as const,
    display_order: 6,
    modules: [
      {
        code: 'final-sounds-1',
        title: 'Same Ending',
        subtitle: 'final-sounds-1',
        summary: 'Auditory and visual reinforcement of',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 1,
        lesson: {
          materials: [
            'Basket of objects/pictures ending in the',
            'same phoneme',
          ],
          aims: [
            'Auditory and visual reinforcement of ending sounds',
          ],
          presentation_steps: [
            'Teacher takes out three objects/pictures ending in the same phoneme. She asks the students to say the name of the objects/pictures. Ask the students if they can hear the last/final phoneme in cat, bat, hat Continue with three more objects/pictures with the same ending. Now mix the two sets of objects/pictures and ask them to sort it out by the same ending sound.',
          ],
          examples: [
            'ending in the same sound',
          ],
          extension: [
            'This can be done orally by giving words ending in the same sound.',
          ],
        },
      },
      {
        code: 'final-sounds-2',
        title: 'Name Ending',
        subtitle: 'final-sounds-2',
        summary: 'Reinforce the understanding of final',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 2,
        lesson: {
          materials: [
            'Student names from the classroom or see',
            'the *list of student names below',
          ],
          aims: [
            'To reinforce the understanding of final phonemes',
          ],
          presentation_steps: [
            'This game is very similar to the one played with the initial sounds. Teacher must enunciate the final sound very distinctly and say, \'I am thinking of someone\'s name that ends in /n/ sound. Can you guess whose name ends in /n/? Yes, Ethan Students find this to be a fun game.',
          ],
          examples: [],
          extension: [
            'Ask a student to be the leader and play the above game. When they are comfortable with this exercise, give them the initial or final sounds of the student and guess the name.',
          ],
        },
      },
      {
        code: 'final-sounds-3',
        title: 'Deletion of Final Sounds in Syllables',
        subtitle: 'final-sounds-3',
        summary: 'Become aware of individual sounds',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 3,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'To become aware of individual sounds within syllables',
          ],
          presentation_steps: [
            'Teacher says a name, Jane. Students echo Jane. Now the teacher asks them to say it without /n/ and they will say, Jay.',
          ],
          examples: [
            'from the unit being studied',
          ],
          extension: [
            'This game can be done with objects in the room or words from the unit being studied.',
          ],
        },
      },
      {
        code: 'final-sounds-4',
        title: 'Deletion of Initial/Final Sounds in Syllables',
        subtitle: 'final-sounds-4',
        summary: 'Reinforce the understanding of final and',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 4,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'To reinforce the understanding of final and initial phonemes',
          ],
          presentation_steps: [
            'Teacher mixes both initial and final sounds deletion. Teacher says a name, Jane. Students echo Jane. Now the teacher asks them to say it without /n/ and they will say, \'jay\'. Do the above with the initial sound missing.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'final-sounds-5',
        title: 'Deleting and Changing Sounds',
        subtitle: 'final-sounds-5',
        summary: 'Reinforce and manipulate final',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 5,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'To reinforce and manipulate final phonemes',
          ],
          presentation_steps: [
            'Teacher can point to a picture on a magazine page or just say a name, Page. Students echo Page. Now replace /j/ in Page to /l/. Students say pale. Work with several names in this way. A magazine, or a poster of different faces can be used.',
          ],
          examples: [],
          extension: [
            'Once they are comfortable with this exercise, give them the initial or final sounds of the student and guess the name.',
          ],
        },
      },
      {
        code: 'final-sounds-6',
        title: 'Take It Out',
        subtitle: 'final-sounds-6',
        summary: 'Reinforce the understanding of final',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 6,
        lesson: {
          materials: [
            'endings and one with a different ending',
          ],
          aims: [
            'To reinforce the understanding of final phonemes',
          ],
          presentation_steps: [
            'Teacher says four words. Students echo them. Teacher asks them to take out the word with a different ending. Teacher says, \'cat, mat, pan, fat\' Students echo these. Now teacher asks them to pick out the word with a different ending….\'pan\'',
          ],
          examples: [
            'with a different ending',
            'with a different ending',
          ],
          extension: [
            'This exercise can be done with names of students, pets, pictures, or objects in class.',
          ],
        },
      },
      {
        code: 'final-sounds-7',
        title: 'Final Sound Addition',
        subtitle: 'final-sounds-7',
        summary: 'Reinforce the understanding of final',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 7,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'To reinforce the understanding of final phonemes',
          ],
          presentation_steps: [
            'Teacher says sometimes a new word can be created by adding a sound to the end of a word like in, \'boo.\' Students echo \'boo.\' If you add /t/ to it what is the word? Students echo boo-t and say boot. Continue with the list of words in the same fashion.',
          ],
          examples: [
            'in the same\nfashion',
          ],
          extension: [],
        },
      },
    ],
  },
  {
    code: 'medial-sounds',
    title: 'Medial Sounds',
    description: 'Identify and manipulate medial sounds in words',
    module_count: 2,
    is_locked: false,
    teaching_mode: 'group' as const,
    display_order: 7,
    modules: [
      {
        code: 'medial-sounds-1',
        title: 'Find the Vowel Sounds',
        subtitle: 'medial-sounds-1',
        summary: 'Auditory reinforcement of the',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 1,
        lesson: {
          materials: [
            'Pictures/objects optional',
          ],
          aims: [
            'Auditory reinforcement of the understanding of medial phonemes',
          ],
          presentation_steps: [
            'T: Explain what medial sound is. This has been given during alphabet time…A is initial letter; Z is the final letter and all the letters between A and Z are medial letters. Teacher: Say \'bag\' (saying the /a/ little louder.) Students: Echo \'bag\'. Teacher: What medial sound did you hear? Students: Say /a/. Examples of words are given on the next page.',
          ],
          examples: [],
          extension: [
            'This exercise can be done with pictures of cvc words and ask the students to identify the medial sound after echoing the words in the pictures. Give a vowel and ask students to make a cvc word.',
          ],
        },
      },
      {
        code: 'medial-sounds-2',
        title: 'Change the Vowel Sounds',
        subtitle: 'medial-sounds-2',
        summary: 'Visual reinforcement of medial phonemes',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 2,
        lesson: {
          materials: [
            'Counters to represent sounds',
          ],
          aims: [
            'Visual reinforcement of medial phonemes',
          ],
          presentation_steps: [
            'Teacher says the word, net. Place the 3 counters touching each one saying /n/ /e/ /t/ Students echo the word, net. Teacher says, what medial sound did you hear? Yes, /e/ Now change /e/ to /i/, what is it? Teacher can take the medial sound out and place another counter to represent /i/. Students say the new word, \'nit.\' Continue with other words.',
          ],
          examples: [],
          extension: [
            'Once they are comfortable with this exercise, give them pictures where the medial sound changes. Examples: cat to cot pig to peg mat to mud nut to net More games can be found in the book, "Listening Games for Elementary Grades" By M. J. Maxwell',
          ],
        },
      },
    ],
  },
  {
    code: 'combining-sounds',
    title: 'Combining Sounds',
    description: 'Blend and segment sounds to form words',
    module_count: 6,
    is_locked: false,
    teaching_mode: 'group' as const,
    display_order: 8,
    modules: [
      {
        code: 'combining-sounds-1',
        title: 'How Many Sounds Do You Hear?',
        subtitle: 'combining-sounds-1',
        summary: 'Practice and develop skills through How Many Sounds Do You Hear?.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 1,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through How Many Sounds Do You Hear?.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'combining-sounds-2',
        title: 'Put the Sounds Together',
        subtitle: 'combining-sounds-2',
        summary: 'Practice and develop skills through Put the Sounds Together.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 2,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Put the Sounds Together.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'combining-sounds-3',
        title: 'Count the Sounds',
        subtitle: 'combining-sounds-3',
        summary: 'Practice and develop skills through Count the Sounds.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 3,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Count the Sounds.',
          ],
          presentation_steps: [
            '*Pictures/**Words with 1,2,3 sounds Counters Card with three square template (IS-6) Awareness of phonemes Direct preparation for reading, writing Today we are going to count the sounds in the words. Counters represent the sounds. T: says \'ta\' very slowly and deliberately, /t/-/a/. What is the first sound you hear? Yes, \'t\' and pulls down a counter. What is the other sound you hear in /ta/? Yes, \'a\' and pulls down another counter. /t/……………./a/. Show them the two counters that represent the sounds /t/,/a/. Repeat the same procedure with the other pictures/words.',
          ],
          examples: [
            'with',
          ],
          extension: [
            'Show pictures or objects and ask them to name and count the sounds.',
          ],
        },
      },
      {
        code: 'combining-sounds-4',
        title: 'Make a word -Body Coda Blending (with objects)',
        subtitle: 'combining-sounds-4',
        summary: 'Learn to blend words using body coda',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 4,
        lesson: {
          materials: [
            'Set of objects with one syllable words',
          ],
          aims: [
            'To learn to blend words using body coda Preparation for reading',
          ],
          presentation_steps: [
            'Today we will look at some objects and learn to divide the words into \'body\' and \'coda.\' \'Body\' is all the sounds up to and including the Vowel. \'Coda\' is all the sounds after the vowel. Teacher: This is a \'hat\'. We will divide \'hat\' into body and coda. Body is /ha/ Coda is /t/ Ha---t Now your turn. This is a \'pig\'. Body is \'pi\' Coda is \'g\' Pi---g Continue with several one syllable objects.',
          ],
          examples: [
            'into',
          ],
          extension: [
            'Practice with the names of objects in the classroom. Teachers may want to start off with /a/ as the vowel and slowly move on to the other vowels. This is great preparation for reading.',
          ],
        },
      },
      {
        code: 'combining-sounds-5',
        title: 'Make a word -Body Coda Blending (with pictures)',
        subtitle: 'combining-sounds-5',
        summary: 'Learn to blend words using body coda;',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 5,
        lesson: {
          materials: [
            'and Word list**',
          ],
          aims: [
            'To learn to blend words using body coda; Preparation for reading Today we will look at some pictures and learn to divide the words into \'body\' and \'coda.\' Body is all the sounds up to and including the Vowel. Coda is all the sounds after the vowel. Teacher: This is a \'net\'. We will divide \'net\' into body and coda. Body is /ne/ Coda is /t/ Ne---t Now your turn. The picture is \'mat\'. Body is \'ma\' Coda is \'t\' Ma---t Continue with several words with one syll. pictures. Give clues for words and students can guess the word and then divide into body and coda. For example, I am thinking of an animal that slithers and could be poisonous. What is it? Yes, snake. Sna-ke',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'combining-sounds-6',
        title: 'Combining Sounds - Module 6',
        subtitle: 'combining-sounds-6',
        summary: 'Combining Sounds module 6.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 6,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Complete Combining Sounds module 6.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
    ],
  },
  {
    code: 'alphabet',
    title: 'Alphabet',
    description: 'Learn letter names, sounds, and formation',
    module_count: 22,
    is_locked: false,
    teaching_mode: 'group' as const,
    display_order: 9,
    modules: [
      {
        code: 'alphabet-1',
        title: 'Introduction to the Alphabet Uppercase',
        subtitle: 'alphabet-1',
        summary: 'Familiarize the students with the letters and',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 1,
        lesson: {
          materials: [
            'The ALPHABET MAT',
            'a set of blue upper-case plastic letters',
          ],
          aims: [
            'To familiarize the students with the letters and sequence of the alphabet; To introduce the terms first/initial, last/final, middle, and medial; 26 letters in total; 13 letters in the first half and 13 letters in the last half.',
          ],
          presentation_steps: [
            'T: Points to the letters on the \'Upper Case\' side and say these are the letters of the alphabet. Each letter has a name. The name of the letter will always stay the same. Ask the students to get their mats out to the \'Upper Case\' side. Let\'s count the letters. There are 26 letters in the alphabet. A is the first or initial or beginning letter of the alphabet. Z is the last or final or the ending letter. Place A and Z on the mat. Let\'s find the middle of the alphabet. Touch one finger on A and one finger on Z at the same time. Now touch each letter as you move toward the middle. Stop when you get to M. The middle is between M and N. The middle means something should divide into two equal parts or halves. Place the letters M and N on the mat. Let\'s count the letters A through M. There are 13. Now the letters between N and Z. There are 13. All letters between A and Z are called medial.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'alphabet-2',
        title: 'Sequential Placement Uppercase',
        subtitle: 'alphabet-2',
        summary: 'Sharpen the student\'s knowledge of the',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 2,
        lesson: {
          materials: [
            'The ALPHABET MAT',
            'A set of blue upper-case plastic letters',
          ],
          aims: [
            'To sharpen the student\'s knowledge of the names of the letters of the alphabet and the sequence of the alphabet.',
          ],
          presentation_steps: [
            'Students must have their mats out. T: Touch each letter of the alphabet as I say the name. Together: A is the first/initial letter Z is the last/final letter M and N are the middle letters All the letters between A and Z are called medial letters There are 26 letters in all',
            'in the first half and 13 in the last half Take out all the blue upper-case plastic letters and lay them on the mat. Turn all letters to the smooth side. Place A and Z on the mat; Then place M and N on the mat; Touch A again and start to name and place each letter.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'alphabet-3',
        title: 'Sequential Placement : Review',
        subtitle: 'alphabet-3',
        summary: 'Sharpen the student\'s knowledge of the',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 3,
        lesson: {
          materials: [
            'The ALPHABET MAT',
            'A set of blue upper-case plastic letters',
          ],
          aims: [
            'To sharpen the student\'s knowledge of the names of the letters of the alphabet and the sequence of the alphabet. The goal is for each student to finish in 3 minutes or less. Students must have their Upper-Case side of the mats out. T: Touch each letter of the alphabet as I say the name. Together: A is the first/initial letter; Z is the last/final letter; M and N are the middle letters; All the letters between A and Z are called medial letters; There are 26 letters in all;',
            'in the first half and 13 in the last half; Take out all the blue upper-case plastic letters and lay them on the mat. Turn all letters to the smooth side. Place A and Z on the mat; Then place M and N on the mat; Touch A again and start to name and place each letter on the arc. Review by touching each letter with left hand until \'M\' and use the right hand to go from \'N through Z\'. None Note how students are doing and take notes for future repetitions of this lesson as necessary.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'alphabet-4',
        title: 'Sequential Placement Lowercase',
        subtitle: 'alphabet-4',
        summary: 'Introduce the lower-case letters to the',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 4,
        lesson: {
          materials: [
            'The alphabet mat on the lower-case side',
            'A set of red lower-case plastic letters.',
          ],
          aims: [
            'To introduce the lower-case letters to the students.',
          ],
          presentation_steps: [
            'Look at the new mat and discuss the new features. Then review concepts taught previously. a is the first/initial letter; z is the last/final letter; m and n are the middle letters; All the letters between a and z are called medial letters; There are 26 letters in all;',
            'in the first half and 13 in the last half; Take out all the red lower-case plastic letters and lay them on the mat. Turn all letters to the smooth side. Place a and z on the mat; Then place m and n on the mat; Touch a again and start to name and place each letter on the mat.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'alphabet-5',
        title: 'Lowercase and Uppercase letter placement Review',
        subtitle: 'alphabet-5',
        summary: 'Introduce the lower-case letters to the',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 5,
        lesson: {
          materials: [
            'The alphabet mat',
            'a set of (blue) upper-case plastic letters',
            'a set of (red) lower-case plastic letters',
          ],
          aims: [
            'To introduce the lower-case letters to the students and compare them to the uppercase letters. The goal is for every student to finish in',
            'minutes or less.',
          ],
          presentation_steps: [
            'Review concepts taught previously. a is the first/initial letter; z is the last/final letter; m and n are the middle letters; All the letters between a and z are called medial letters; There are 26 letters in all;',
            'in the first half and 13 in the last half; Take out all the red lower-case plastic letters and lay them on the mat. Turn all letters to the smooth side. Place \'a and z\' on the mat; Then place \'m and n\' on the mat; Touch \'a\' again and start to name and place each letter on the mat. When finished lay the upper-case letters above/below the lower-case letters.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'alphabet-6',
        title: 'Names of Vowels',
        subtitle: 'alphabet-6',
        summary: 'Teach the names of Vowels',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 6,
        lesson: {
          materials: [
            'The alphabet mat',
            'A set of red lower-case plastic letters',
            'Purple vowels',
            'Mirrors for each student',
          ],
          aims: [
            'To teach the names of Vowels',
          ],
          presentation_steps: [
            'Ask each student to place the alphabet mat on the lower-case side of the table. Turn all letters to the smooth side. Look at the two different colors. Go over concepts already taught as in AL-4. Let us look at the purple letters, name each one of them. a, e, i, o, u These letters are called \'Vowels.\' The students echo, \'Vowels.\'',
          ],
          examples: [],
          extension: [
            'For variation, teach them the name of the vowels through the nursery rhyme, BINGO. Mix the consonants and vowels and ask the students to pick a letter and identify if it is a vowel or a consonant.',
          ],
        },
      },
      {
        code: 'alphabet-7',
        title: 'Before and After Hand',
        subtitle: 'alphabet-7',
        summary: 'Teach the concept of before and after',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 7,
        lesson: {
          materials: [
            'alphabet mat- lower case side',
            'Students\' hands (Left Hand, Right Hand)',
          ],
          aims: [
            'To teach the concept of before and after',
          ],
          presentation_steps: [
            'This lesson can be done in groups of 4-5 students. T: Place your mats in front and place both your hands on the mat. Point to the letter m. Your left hand is on the letter m. This is called the \'beforehand.\' Do 3-Period lesson. Demonstrate that l comes before m; d comes before e, etc. Do lots of examples and review daily. Your right hand is on letter n. This is called the after hand. Do a 3-Period lesson. Demonstrate that \'n\' comes after \'m\'; p comes after o, etc. Do lots of examples and review daily. For some students this concept may take longer to understand than others. In that case, do only before concept for a few days and introduce the after concept.',
          ],
          examples: [
            'and review daily',
            'and review daily',
          ],
          extension: [
            'Place the students in a line and ask them who are before and after. This can be done daily when they go out.',
          ],
        },
      },
      {
        code: 'alphabet-8',
        title: 'New Alphabet Review',
        subtitle: 'alphabet-8',
        summary: 'Reinforce alphabet concepts taught so',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 8,
        lesson: {
          materials: [
            'alphabet mat- lower-case Side',
            'Foam shaped hands with before and after',
            'written on them/ students can use their',
            'hands',
          ],
          aims: [
            'To reinforce alphabet concepts taught so far: before, after, initial, final, medial, middle, vowels, consonants.',
          ],
          presentation_steps: [
            'T: Place your alphabet mat showing lowercase side on the table. T: Echo after me. S: Echo the following mantra. There are 26 letters in the alphabet There are two kinds of letters in the alphabet: Vowels and Consonants The vowels are \'a e i o u\' a is the initial letter z is the final letter m and n are the middle letters The letters between a and z are medial letters My left hand is my \'before hand\' My right hand is my \'after hand\'',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'alphabet-9',
        title: 'Shapes of the letters',
        subtitle: 'alphabet-9',
        summary: 'Pipe cleaners shaped as: horizontal,',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 9,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Pipe cleaners shaped as: horizontal, vertical lines; diagonal; crisscross; up-down; full circle; half circle; *song sheet To introduce the shapes/lines found in the',
            'letters; indirect preparation for writing',
          ],
          presentation_steps: [
            'Teacher will hold up each shape and ask the students to point to their shapes and echo the names. This is \'Horizontal\' This is \'Vertical\' This is \'Diagonal\' This is \'Criss-Cross" ( with 2 diagonals) This is \'Half circle\' This is \'Full Circle\' This is \'Camel hump\' These are the strokes and curves used to make all the manuscript letters. Do a 3-period lesson with these strokes. Practice this for a few days in different ways.',
          ],
          examples: [],
          extension: [
            'This activity can be done using their arms or full body or wikki stix; playdoh, or yarn . *Review the shapes by using a nursery rhyme, \'Frere Jacques.\'',
          ],
        },
      },
      {
        code: 'alphabet-10',
        title: 'Look and Say',
        subtitle: 'alphabet-10',
        summary: 'ALPHABET MAT',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 10,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'ALPHABET MAT Set of blue plastic upper-case letters in a bag To identify letters by looking Review of the previous lesson Indirect preparation for reading, writing',
          ],
          presentation_steps: [
            'This can be done in small groups. Give each student an ALPHABET MAT, showing the upper-case side. T: I will take a letter out of my bag and describe the strokes in it. You will tell me what letter is being described. This letter has a vertical line and a short horizontal line on the top. What letter is it? S: can look at the mat and think. The letter is \'T\'. This letter will now be placed on the mat while naming it. Teacher will describe several letters using the same verbiage as in module AL-9. This goes on for a few days.',
          ],
          examples: [],
          extension: [
            'Students can form partners and pick a letter and describe it to each other.',
          ],
        },
      },
      {
        code: 'alphabet-11',
        title: 'Guess What?',
        subtitle: 'alphabet-11',
        summary: 'Identify letters by feel',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 11,
        lesson: {
          materials: [
            'Alphabet Mat',
            'Set of plastic upper-case/ lower-case',
            'letters in a bag',
          ],
          aims: [
            'To identify letters by feel Internalization of the shape of the letters',
          ],
          presentation_steps: [
            'This can be a game played with a small group of students or the whole class. The teacher will have one mat and a bag of letters. T: Places the Alphabet Mat on the table. S #1: Pulls out a letter from the bag, feels the shape of the letter and tries to guess the name of the letter. He then places it on the mat while naming it. S #2: Pulls out another letter and feels it and guesses the name. He will place it on the mat while naming it. This game can continue until all the letters are gone.',
          ],
          examples: [],
          extension: [
            'None',
          ],
        },
      },
      {
        code: 'alphabet-12',
        title: 'Let Go of the \'Z\'',
        subtitle: 'alphabet-12',
        summary: 'Players',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 12,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Players',
            'Alphabet mats',
            'Dry erase markers To reinforce the sequencing skills by sight Indirect preparation for reading, writing',
          ],
          presentation_steps: [
            'Each player will take turns saying the letters in two or three. Player number one says \'ab\' and marks off the letters on his mat. The player number two will also mark off the \'ab\' and now will say \'cde\' and mark it off. Player number one then says \'\'fg\' or \'fgh\' As the letter names have been said they are marked off so that the students remember which letters have been said already. The ultimate object of this game is not to say \'z\'.',
          ],
          examples: [],
          extension: [
            'This game can be played in another way. It is called \'take the z\'. This game is played the same way as above. The only variation is that the player who says the \'z\' will be the winner.',
          ],
        },
      },
      {
        code: 'alphabet-13',
        title: 'Race To Finish',
        subtitle: 'alphabet-13',
        summary: 'Identify the position of letters in the',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 13,
        lesson: {
          materials: [
            'Alphabet Mat',
            'One set of upper/lower-case letters in a',
            'bag to be used as the draw bag',
            'Two players',
          ],
          aims: [
            'To identify the position of letters in the alphabet Before and after',
          ],
          presentation_steps: [
            'Teacher picks 2 letters from the bag and places them on the Alphabet Mat - e.g. G, S Each player draws 12 letters from the bag of upper/lower-case letters. Each player places the letters in front of him. Now the player looks at his letters to see if he has a letter that goes before or after one of the letters placed on the mat i.e., G or S. If he has the letter that goes before or after the placed letter, he places it in the appropriate place on the mat and say…. F/f comes before G/g or T/t comes after S/s. The players take turns placing the letters. The first player to place all his letters on the mat wins the game.',
          ],
          examples: [
            'S\nEach player draws',
          ],
          extension: [
            'Teacher picks a letter and ask what comes before and after that letter. Note how students are doing and take notes for future repetitions of this lesson.',
          ],
        },
      },
      {
        code: 'alphabet-14',
        title: 'Nearest to Z or A',
        subtitle: 'alphabet-14',
        summary: 'Identify the position of letters in the',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 14,
        lesson: {
          materials: [
            'Alphabet Mat',
            'One set of lower/upper-case letters in a',
            'bag to be used as the draw bag.',
          ],
          aims: [
            'To identify the position of letters in the alphabet Before and after',
          ],
          presentation_steps: [
            'Each player draws one letter from a bag of letters. Both the players place the letters in front of them. The player that has a letter nearer to Z will say \'s\' is nearer to \'z\' than the opponent\'s letter which may be \'f\'. This player puts both the letters in his pile. This continues until all the letters are used. The player with the greatest number of letters wins.',
          ],
          examples: [],
          extension: [
            'This game can be played \'nearer to A\' in a very similar manner.',
          ],
        },
      },
      {
        code: 'alphabet-15',
        title: 'Letter Snoop',
        subtitle: 'alphabet-15',
        summary: 'Identify the position of letters in the',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 15,
        lesson: {
          materials: [
            'Alphabet Mat',
            'One set of plastic lower-case / upper-case',
            'letters',
          ],
          aims: [
            'To identify the position of letters in the alphabet Fluency in naming letters.',
          ],
          presentation_steps: [
            'This game can be played with a student and a teacher or between 2 students. Student places all 26 letters on the arc. Student should touch and say the letters. Student closes his eyes, and the teacher takes off one letter. The teacher pushes back the letters so that there are no gaps on the arc. The student opens his eyes and names the missing letter. If he cannot name the letter, then have him touch each letter and say until he discovers the missing letter. Put the letter back on the arc and play again. It will help the teacher to write the letters already done.',
          ],
          examples: [],
          extension: [
            'None',
          ],
        },
      },
      {
        code: 'alphabet-16',
        title: 'Ten Questions',
        subtitle: 'alphabet-16',
        summary: 'Identify the position of letters in the',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 16,
        lesson: {
          materials: [
            'Alphabet Mat',
            'A set of blue or red plastic letters.',
          ],
          aims: [
            'To identify the position of letters in the alphabet and fluency in naming letters.',
          ],
          presentation_steps: [
            'Students will place letters on the mat. Touch and name the letters. Teacher: I am thinking of a letter. I want you to guess it. You may ask me questions but the answers to them may only be "yes" or "no" answers. You will get ten turns to guess the name of the letter. For example, "is your letter in the first half of the alphabet?" Take off the letters as they are eliminated. Examples of questions to ask: Is the letter made up of only straight lines; does it have 2 humps; or curve? Is the letter a vowel? Does it come before ______? The object of the game is to guess the letter by asking ten questions or less.',
          ],
          examples: [
            'of questions to ask',
          ],
          extension: [
            'Students can play against another student. When the letters are eliminated, they can be crossed out using a dry erase marker. If using a temporary paper strip, the eliminated letters can be cut off. The last letter will remain.',
          ],
        },
      },
      {
        code: 'alphabet-17',
        title: 'Alphabet Dice Roll and Name',
        subtitle: 'alphabet-17',
        summary: 'Practice and develop skills through Alphabet Dice Roll and Name.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 17,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Alphabet Dice Roll and Name.',
          ],
          presentation_steps: [
            'Alphabet Mat Alphabet Dice A set of upper-case/lower-case plastic letters To become more fluent in naming letters. Place the alphabet mat on the table. Place all the uppercase/lowercase letters on the mat but not on the arc. Roll the dice and name the letter. Find the plastic letter and place it on the mat. Another variation would be to place all the letters on the arc of the alphabet mat before rolling the dice. When the dice is rolled that letter could be taken out of the mat.',
          ],
          examples: [],
          extension: [
            'Another game is where there are several dice with letters on them. Roll all the dice and the student takes 2 dice. The dice will be placed on the table, and the student must name the letters from the first die to the next. If a student picks \'g\' and \'k\' he will have to name all the letters from \'g\' to \'k\'. One more extension will be to roll the dice. Name the letter that comes before/after that rolled letter.',
          ],
        },
      },
      {
        code: 'alphabet-18',
        title: 'Bean Bag Toss',
        subtitle: 'alphabet-18',
        summary: 'Become more fluent in naming letters.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 18,
        lesson: {
          materials: [
            'Alphabet Mat or Strip',
          ],
          aims: [
            'To become more fluent in naming letters.',
          ],
          presentation_steps: [
            'Place the alphabet mat / strip between the two players. Teacher and the student will toss the bean bag to each other in these 3 games. Game #1 T: Toss the beanbag to your student and say "A". S: says "B" and tosses the beanbag back to the teacher. Continue until a player gets to "Z". This game will finish in one round. Game #2 Players say two letters of the alphabet. "AB---CD---EF-" This game will finish in one round. Game #3 Players name three letters. "ABC---def--ghi-". This game will finish in three rounds.',
          ],
          examples: [],
          extension: [
            'This game can be done with cluster of 4-5 letters like: ABCD---EFGH-etc.',
          ],
        },
      },
      {
        code: 'alphabet-19',
        title: 'Alphabet Talk',
        subtitle: 'alphabet-19',
        summary: 'Practice and develop skills through Alphabet Talk.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 19,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Alphabet Talk.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'alphabet-20',
        title: 'Alphabet Accent',
        subtitle: 'alphabet-20',
        summary: 'Recite alphabet with accents with a',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 20,
        lesson: {
          materials: [
            'Alphabet strip/alphabet mat',
          ],
          aims: [
            'To recite alphabet with accents with a visual reference; movements; indirect preparation for syllables, writing and reading T: will say A B C D E F G H I J K L M N O P Q RSTUVWXYZ I recited the alphabet with a change, what is it? S: One was loud and the other one was soft. T: Yes, I said A louder and B softer. My voice went higher. This is called an Accent. In English words are said with an accent. Let us accent the first and not accent the second and so on. ABCDEFGHIJKLMNOPQRSTUV WXYZ Next is to accent on the second letter and not on the first. ABCDEFGHIJKLMNOPQRSTUV WXYZ This can be done by looking at the strip. It can be done by jumping up for accent and on the floor for no accent. Make it fun by doing movements.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [
            'Say the alphabet in pairs (AB, CD)and accent the first pair and not accent the second and so on. Say the alphabet in threes (ABC, DEF)and accent the first and not the second chunk. Do these also with movements.',
          ],
        },
      },
      {
        code: 'alphabet-21',
        title: 'Alphabet Triplets - Missing letter',
        subtitle: 'alphabet-21',
        summary: 'Alphabet strip/ alphabet mat',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 21,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Alphabet strip/ alphabet mat Alphabet deck with the end letter missing (ab--, cd--) Reinforce the sequence',
          ],
          presentation_steps: [
            'Have the alphabet mat in front of the student. Show one card at a time and ask the student to name the sequence. Present it in order the first time.',
            'g., abc, def, ghi, etc Even though only one letter is missing, the student will say the letters on the card and the missing letter. If the student accurately names the sequence, shuffle the cards and present the cards randomly.',
          ],
          examples: [],
          extension: [
            'This can be done with the first letter missing or the middle card missing. This may be a challenge for some students.',
          ],
        },
      },
      {
        code: 'alphabet-22',
        title: 'Alphabet Recognition',
        subtitle: 'alphabet-22',
        summary: 'Practice and develop skills through Alphabet Recognition.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 22,
        lesson: {
          materials: [
            'AL22a, AL22b, AL22c',
            'Charts on following pages',
          ],
          aims: [
            'Practice and develop skills through Alphabet Recognition.',
          ],
          presentation_steps: [
            'Recognition of letters Teacher shows the charts to the students. Students read and name the letters from left to right.',
          ],
          examples: [],
          extension: [],
        },
      },
    ],
  },
  {
    code: 'phonics',
    title: 'Phonics',
    description: 'Connect letters to sounds for reading and spelling',
    module_count: 7,
    is_locked: false,
    teaching_mode: 'group' as const,
    display_order: 10,
    modules: [
      {
        code: 'phonics-1',
        title: 'Sound Introduction',
        subtitle: 'phonics-1',
        summary: 'Develop auditory, visual, and kinesthetic',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 1,
        lesson: {
          materials: [
            'Sandpaper lowercase manuscript letters',
            'Keyword cards for letters t,m,a',
          ],
          aims: [
            'To develop auditory, visual, and kinesthetic perception of letter sounds',
          ],
          presentation_steps: [
            'This activity should be done in smaller groups. Bring two or three letters (t,m,a) to the table. Letters should be different in shape and sound. Seat students to your right for presentation. Discovery Give a mirror to each student. Look at your mouth in the mirror as you echo \'tiger, top, table\'. What initial sound do you hear in tiger, top, table? Students say…… /t/ Airflow blocked by? - tongue, teeth, or lips? Students say tongue. Bring the sandpaper letter \'t\' out. T: This is letter \'t\' that makes the sound /t/. Show the key word and sound card for letter \'t.\' t, table , /t/; Students echo t, table, /t/ Tell the students that these special words trigger the sound of each letter. Trace the letter \'t\' while making the sound /t/. Say this is how we write it. Now students echo and trace the sound /t/. *Be very precise in tracing the letter, using the first and second fingers of your dominant hand. Invite the students to take turns tracing the /t/ while saying the sound three times. (Continued on next page)',
            'Repeat procedure with letters (m, a). For review, do a three-period lesson.',
            'Place the three letters t, m, a on the table.',
            'Say \'show me or point to /m/, /t/, /a/\' asking them to show/point to each sound. Student points and echoes the sound.',
            'While pointing out the letters the teacher asks: what is this? starting with /a/, /t/, /m/. Start with the last letter you asked him to point in step #2. Tracing, showing, and asking are three components of the three-period lesson. The three-period lesson can be thought of as association; recognition; recall.',
          ],
          examples: [
            'and sound card for\nletter',
          ],
          extension: [],
        },
      },
      {
        code: 'phonics-2',
        title: 'Sound Review',
        subtitle: 'phonics-2',
        summary: 'Practice and develop skills through Sound Review.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 2,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Sound Review.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'phonics-3',
        title: 'Foam Sticks in a Jar Game',
        subtitle: 'phonics-3',
        summary: 'Reinforce the beginning sounds',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 3,
        lesson: {
          materials: [
            'Foam Sticks with the letters written',
            'Objects (optional)',
          ],
          aims: [
            'To reinforce the beginning sounds To develop auditory and visual memory To prepare for reading',
          ],
          presentation_steps: [
            'Bring the foam sticks with the letters presented so far. The foam sticks are color coded according to the order of sounds presented. Each student will pick a stick and say the name, keyword, and the sound of the letter. This continues until there are no more sticks in the jar.',
          ],
          examples: [
            'beginning with this sound',
          ],
          extension: [
            'For an added variation the student will pick a stick, say the name, and give two more words, beginning with this sound. Bring objects with these beginning sounds and ask to sort them out according to the foam stick that is picked.',
          ],
        },
      },
      {
        code: 'phonics-4',
        title: 'The Phonogram Card Game',
        subtitle: 'phonics-4',
        summary: 'Visual and auditory reinforcement of the',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 4,
        lesson: {
          materials: [
            'so far',
          ],
          aims: [
            'Visual and auditory reinforcement of the beginning sounds To prepare for reading and writing Bring the cards of the letters presented to the table. Teacher will hold the card one at a time. Give me the name, keyword, and sound as you skywrite. The students will say the name, keyword, and the sound of each letter while skywriting. This continues until there are no more cards.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [
            'and sound',
          ],
          extension: [
            'This can be done in smaller groups of 3-5 students. Place all the cards done so far, face down. Students will take turns to pick up one card and say the name, keyword, and sound. Second extension is for the teacher to give the key word and sound and ask the students to guess the name of the letter. Another variation will be for the teacher to give the name and ask the students to respond with the keyword and sound.',
          ],
        },
      },
      {
        code: 'phonics-5',
        title: 'The Picture Game',
        subtitle: 'phonics-5',
        summary: 'Practice and develop skills through The Picture Game.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 5,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through The Picture Game.',
          ],
          presentation_steps: [
            '*Pictures (IS-8/IS-14/P-5) corresponding to the letter sounds introduced, phonogram cards Develops visual and auditory memory To refine auditory perception of simple words To prepare for reading, writing Teacher will bring the pictures and phonogram cards to the table. The teacher places the three cards t, m ,a and the pictures face down on the table. The students take turns to pick a picture and say \'top,\' /t/ and place it under the letter t. This continues until there are no more pictures left. Do about 3 different sounds. This lesson can also be done to identify the final sounds or medial sounds. Ask the students to sort them by ending or medial sounds. In the beginning, when working with (medial) vowels, choose only two different vowels at a time.',
          ],
          examples: [
            'To prepare for reading',
          ],
          extension: [
            'The students really enjoy this exercise when it is done with objects.',
          ],
        },
      },
      {
        code: 'phonics-6',
        title: 'Vowels or Consonants?',
        subtitle: 'phonics-6',
        summary: 'Concept of vowels and consonants',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 6,
        lesson: {
          materials: [
            'Mirror',
          ],
          aims: [
            'Concept of vowels and consonants Preparation for reading and writing',
          ],
          presentation_steps: [
            'The teacher says: mirrors up. Say the sound /t/. Students echo /t/ looking at their mouth in the mirror. T: What part of the mouth was used to make the sound. Was your mouth open? Is the air flow blocked by the tongue, teeth, throat, or lips? If it is blocked, it is called a Consonant. If it is not blocked, for e.g., /a/, then it is unblocked and is called a Vowel. Do this with all the letters that are introduced.',
          ],
          examples: [],
          extension: [
            'Ask the students to come up with vowels or consonants. Teacher will ask to give the names of the vowels or consonants learned so far. Place phonogram cards facing down. Students will pick a card and give name, keyword and sound and say if it is a consonant or vowel.',
          ],
        },
      },
      {
        code: 'phonics-7',
        title: 'Digraphs',
        subtitle: 'phonics-7',
        summary: 'Concept of digraphs; preparation for',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 7,
        lesson: {
          materials: [
            'Mirror',
            'Pictures/objects optional',
          ],
          aims: [
            'Concept of digraphs; preparation for reading; writing Teacher: Today we will learn a unique sound. Teacher says: mirrors up. Say words: chair, chips, chat. Students echo the words while looking in mirror. T: what is the sound you hear in the beginning in all these words? S: /ch/ c, h come together to make /ch/. /ch/ is a digraph. /ch/ makes you smile by showing your teeth. Sometimes two letters come together to make one sound. Show hand motions for digraph. These are called \'digraphs.\'',
          ],
          presentation_steps: [
            'Do similar introductions for the digraphs /ck/ , /th/ , /th/, /sh/ /sh/ makes the \'quiet\' sound /th/ makes you put your tongue out',
          ],
          examples: [],
          extension: [],
        },
      },
    ],
  },
  {
    code: 'reading',
    title: 'Reading',
    description: 'Develop decoding and reading skills',
    module_count: 8,
    is_locked: false,
    teaching_mode: 'group' as const,
    display_order: 11,
    modules: [
      {
        code: 'reading-1',
        title: 'Word Patterns - 1',
        subtitle: 'reading-1',
        summary: 'Practice and develop skills through Word Patterns - 1.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 1,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Word Patterns - 1.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'reading-2',
        title: 'Word Patterns - 2',
        subtitle: 'reading-2',
        summary: 'Learn forming words',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 2,
        lesson: {
          materials: [
            'sets of lower-case plastic letters with',
            'extra purple vowels (m, t, a, s, b, c)',
          ],
          aims: [
            'To learn forming words Preparation for reading, writing, spelling Vocabulary development When the student is successful with R-1 module, move on to R-2. Review body coda for words with /a/ in the medial position. We will build more words today. T: Places /a/ one below the other on the table. Keep the initial sounds constant and change only the final sounds to make words. E.g., tac, tam, tas, tab, tat Let the student read from left to right after building the body and finish with coda and read again. This is repeated for several days and when they are ready, begin giving words with vowel /a/ constant and changing the initial and final //s. E.g., cam, tab, sat, bat, mat, cat, etc.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'reading-3',
        title: 'Word Patterns-3',
        subtitle: 'reading-3',
        summary: 'Learn word building',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 3,
        lesson: {
          materials: [
            'sets of small plastic letters with extra',
            'vowels',
          ],
          aims: [
            'To learn word building Preparation for reading, writing, spelling Vocabulary development When the second set of sounds is done, the next vowel /i/ can be introduced. Follow the same procedures as in R-1, R-2 modules. When the student can hear the initial, medial, and final sounds, keep only /i/ constant and change both initial and final sounds. Remember to use only the sounds that have been presented and learned so far. T: Places 5 lower-case letters/i/ from top to bottom. The word is /fin/. Tell me the body and coda for /fin/. S: /fi/ /n/. T: What initial sound do you hear in \'fin\'? S: /f/; Places /f/ on the left of /i/. T: What is the final sound? S: /n/ T: Runs hand from left to right, says, /fin/. Now give a turn to the students to do the same as above with sim, tin, fib, pit This is repeated for several days.',
          ],
          presentation_steps: [
            'When student is doing well, move on to the next vowels /o/, /e/ and /u/. Repeat the same procedures as above. By now, some students may start decoding. When they become very comfortable with this procedure, start giving words with mixed vowels like pat, tin, fog, bed, sun.',
          ],
          examples: [
            'with mixed\nvowels like pat',
            'tin',
            'fog',
            'bed',
            'sun',
          ],
          extension: [],
        },
      },
      {
        code: 'reading-4',
        title: 'Word Builders',
        subtitle: 'reading-4',
        summary: '* Pictures/Objects with each short vowel',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 4,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            '* Pictures/Objects with each short vowel (cvc) words -(CS-5 pictures)',
            'sets of lower-case plastic letters with extra vowels Star card with three spaces Focus on word building Preparation for reading, writing, spelling Vocabulary development',
          ],
          presentation_steps: [
            'This lesson is done in small groups (3-5). Start with objects/pictures with vowel /a/constant. Teacher places pictures on the table from top to bottom. Build the words on the star card. T: Pointing to picture of cat, ask, \'what is the body coda for /cat/? /ca/ /t/. Let us build /ca/ first. What is the initial sound of /ca/? S: /c/ and will place the /c/. T: What is the next sound in /ca/? S: /a/? T: What is the final sound? S: /t/ T: Runs hand from left to right, says, /cat/. S: Will do the same. Continue with the other pictures. This exercise is repeated for several days with all the other vowels taking one vowel at a time. When the students hear the initial, final and the medial sounds, they are ready to move on to mixed vowel sounds.',
          ],
          examples: [
            'on the star card',
          ],
          extension: [],
        },
      },
      {
        code: 'reading-5',
        title: 'CVC Words',
        subtitle: 'reading-5',
        summary: 'Writing cvc words',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 5,
        lesson: {
          materials: [
            'Star Card with three spaces',
          ],
          aims: [
            'Writing cvc words Auditory reinforcement Preparation for spelling, reading, writing',
          ],
          presentation_steps: [
            'T: Today we are going to practice writing more words. I will dictate words and you will echo and pull down the sounds and read. The word is \'mad\' saying each sound distinctly, \'ma d.\' Students echo the same and pull down a letter for each sound from left to right. Teacher can use a pattern of words ending in the same sounds; same vowels and keeping the initial letter different in the beginning. This exercise should be repeated many times with CVC words. Do not use digraphs or blends at this time.',
          ],
          examples: [
            'ending\nin the same sounds',
          ],
          extension: [
            'Use pictures/objects to do the above. Show a picture to the students and ask them to name it. Now ask them to pull down a letter for each sound they hear in the name.',
          ],
        },
      },
      {
        code: 'reading-6',
        title: 'Secret Word Game',
        subtitle: 'reading-6',
        summary: 'Reading cvc words; visual reinforcement;',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 6,
        lesson: {
          materials: [
            'List of two/three letter words printed on',
            'small pieces of paper and folded',
          ],
          aims: [
            'Reading cvc words; visual reinforcement; preparation for spelling, and reading',
          ],
          presentation_steps: [
            'This game must be played when the students have done some of the Reading Exercises that are done below. This is a good review. The teacher places several short vowel (CVC) words printed on paper and folded in a bag or a box. Two students can play this game. One student first picks one paper at a time and reads. If he reads it correctly, he gets one point and places the paper outside the bag. If he doesn\'t read it correctly, he puts the paper back in the bag. The next student takes a turn. This continues until all the words are done.',
          ],
          examples: [
            'are done',
          ],
          extension: [],
        },
      },
      {
        code: 'reading-7',
        title: 'Building Syllable game',
        subtitle: 'reading-7',
        summary: 'Building syllable one sound at a time by',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 7,
        lesson: {
          materials: [
            'Lower case consonant letters (red) with',
            'vowels (either red or purple)',
          ],
          aims: [
            'Building syllable one sound at a time by adding, changing, substituting, reversing, and deleting Reading cvc words Visual reinforcement Preparation for spelling, and reading This game must be played when the students have done some of the Reading Exercises. Teacher will begin with one consonant and make only one sound change at a time. This exercise should always begin and end with a consonant. Teacher: Pull down or say show me /m/; Student: Echoes and pulls down /m/ and will say /m/ pointing to it with his pointer. T: Now change /m/ to /am/. S: Echoes /am/ and pulls down /a/ and places it in front of /m/ and runs his fingers from left to right and echoes /am/. T: Now change /am/ to /pam/ S: Echoes /pam/ and pulls down /p/ and runs his fingers left to right and echoes /pam/. T: Now change /pam/ to /map/. S: Echoes and switches and echoes /map/. T: Now change /map/ to /ap/. S: Echoes /ap/ and changes to /ap/ and runs fingers from left to right while echoing. T: Now show me /p/. S: Echoes /p/ and takes away /a/ and shows /p/. Do this exercise with several combinations. Note how students are doing and take notes for future repetitions of this lesson.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'reading-8',
        title: 'Vowel Switch',
        subtitle: 'reading-8',
        summary: 'Auditory discrimination of vowel sounds',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 8,
        lesson: {
          materials: [
            'Lower case consonant letters (red) with',
            'vowels (either red or purple)',
          ],
          aims: [
            'Auditory discrimination of vowel sounds Reading cvc words, Vowel reinforcement Preparation for spelling, reading',
          ],
          presentation_steps: [
            'This game must be played when the students have done some of the Reading Exercises. Teacher asks Student to make a word /tap/. Student echoes and makes the word /tap/. T: Now switch /tap/ to /tip/. S: Echoes and switches /tap/ to /tip/. T: Now switch /tip/ to /top/. S: Echoes /top/ and switches /tip/ to /top/. T: Switch /top/ to /tup/. S: Echoes /tup/ and switches /top/ to /tup/. T: Switch /tup/ to /tep/. S: Echoes /tep/ and switches /tup/ to /tep/.',
          ],
          examples: [],
          extension: [],
        },
      },
    ],
  },
  {
    code: 'reading-exercises',
    title: 'Reading Exercises',
    description: 'Practice reading with guided exercises',
    module_count: 9,
    is_locked: false,
    teaching_mode: 'group' as const,
    display_order: 12,
    modules: [
      {
        code: 'reading-exercises-1',
        title: 'New introduction: m, t, a',
        subtitle: 'reading-exercises-1',
        summary: 'Practice and develop skills through New introduction: m, t, a.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 1,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through New introduction: m, t, a.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'reading-exercises-2',
        title: 'Review: m, t, a New introduction: s, b, c',
        subtitle: 'reading-exercises-2',
        summary: 'Practice and develop skills through Review: m, t, a New introduction: s, b, c.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 2,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Review: m, t, a New introduction: s, b, c.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'reading-exercises-3',
        title: 'Review: m, t, a, s, b, c New introduction: n, l, i',
        subtitle: 'reading-exercises-3',
        summary: 'Practice and develop skills through Review: m, t, a, s, b, c New introduction: n, l, i.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 3,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Review: m, t, a, s, b, c New introduction: n, l, i.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'reading-exercises-4',
        title: 'Review: m, t, a, s, b, c, n, l, i New introduction: r, f, p',
        subtitle: 'reading-exercises-4',
        summary: 'Practice and develop skills through Review: m, t, a, s, b, c, n, l, i New introduction: r, f, p.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 4,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Review: m, t, a, s, b, c, n, l, i New introduction: r, f, p.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'reading-exercises-5',
        title: 'Review: m, t, a, s, b, c, n, l, i, r, f, p New introduction: h, g, o',
        subtitle: 'reading-exercises-5',
        summary: 'Practice and develop skills through Review: m, t, a, s, b, c, n, l, i, r, f, p New introduction: h, g, o.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 5,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Review: m, t, a, s, b, c, n, l, i, r, f, p New introduction: h, g, o.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'reading-exercises-6',
        title: 'Review: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o New Introduction: k, d',
        subtitle: 'reading-exercises-6',
        summary: 'Practice and develop skills through Review: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o New Introduction: k, d.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 6,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Review: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o New Introduction: k, d.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'reading-exercises-7',
        title: 'Review: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o, k, d New introduction: j, x, e, v, z',
        subtitle: 'reading-exercises-7',
        summary: 'Practice and develop skills through Review: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o, k, d New introduction: j, x, e, v, z.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 7,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Review: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o, k, d New introduction: j, x, e, v, z.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'reading-exercises-8',
        title: 'Review: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o, k, d, j, x, e, v, z New Introduction: w, u, y, qu',
        subtitle: 'reading-exercises-8',
        summary: 'Practice and develop skills through Review: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o, k, d, j, x, e, v, z New Introduction: w, u, y, qu.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 8,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Review: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o, k, d, j, x, e, v, z New Introduction: w, u, y, qu.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'reading-exercises-9',
        title: 'Review: ch, ck, th, th, sh',
        subtitle: 'reading-exercises-9',
        summary: 'Practice and develop skills through Review: ch, ck, th, th, sh.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 9,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Review: ch, ck, th, th, sh.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
    ],
  },
  {
    code: 'handwriting',
    title: 'Handwriting',
    description: 'Develop proper letter formation and handwriting skills',
    module_count: 11,
    is_locked: false,
    teaching_mode: 'group' as const,
    display_order: 13,
    modules: [
      {
        code: 'handwriting-1',
        title: 'Fine Motor Skills',
        subtitle: 'handwriting-1',
        summary: 'Work on the fine motor skills; eye-hand',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 1,
        lesson: {
          materials: [
            'scissors, push pins, carpet squares;',
            'Newspaper strips; scissors',
          ],
          aims: [
            'Work on the fine motor skills; eye-hand coordination; develop the hand muscles; Indirect preparation for writing',
          ],
          presentation_steps: [
            'Make small tears of the newspaper strips using the thumb, index, and middle fingers. This helps with the development of fine motor skills. In the beginning scissors are used for cutting strips of paper. Then move on to the following lines. Start with straight lines to zigzag lines to spirals. Draw some simple shapes on a 5" 5" paper. Ask students to pin punch the shape. The students hold the push pin, and punch along the outline of the given shape. This exercise helps the students to refine their fine motor skills. The following exercises will help improve fine motor skills. Touching thumb to each finger exercise can be done every day; Drop and pick up the pencil with tripod grip several times; Move pennies/beads from palm to fingertips; Necklace making with straws; Coin sorting, stacking and polishing.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'handwriting-2',
        title: 'Different Shapes',
        subtitle: 'handwriting-2',
        summary: 'Introduce the different shapes found in',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 2,
        lesson: {
          materials: [
            'Pipe cleaners in the shape of horizontal and',
            'vertical lines, up-down, full circle, half',
            'circle, diagonal, crisscross',
          ],
          aims: [
            'To introduce the different shapes found in different letters Indirect preparation to reading, writing This is a very important prerequisite to handwriting. Teacher holds up each shape and asks the students to point to their shapes and echo the names. This is \'Horizontal\' This is \'Up-down\' This is \'Diagonal\' This is \'Criss-Cross" (with 2 diagonals) This is \'Half circle\' This is \'Full Circle\' This is \'Camel Hump\' These are the strokes and curves used to make all the manuscript letters. Do a 3-period lesson with these strokes. Practice this for a few days in different ways. Can be practiced with \'wikki stix\' which the students can make on their own. The students can be encouraged to make these shapes with their bodies for variation. Use *\'Frere Jacques\' nursery rhyme to sing the different shapes. Kids learn quickly through songs. Note how students are doing and take notes for future repetitions of this lesson.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'handwriting-3',
        title: 'Gross Motor Activities',
        subtitle: 'handwriting-3',
        summary: 'Work on the gross motor skills',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 3,
        lesson: {
          materials: [
            'Chalk Board/Dry Erase Board',
            'Large paper, newsprint',
            'Chalk, Crayons, Paints',
          ],
          aims: [
            'To work on the gross motor skills To feel the movement in the shoulder and arm and thus improve the kinesthetic memory',
          ],
          presentation_steps: [
            'These strokes can be practiced by using :',
            'Large strokes in the air using straight arms',
            'Long strokes on the chalk board/ Dry erase board',
            'Wet sponge on chalk board',
            'With finger paints',
            'Large unlined paper with crayons',
            'Wide lined paper',
          ],
          examples: [],
          extension: [
            'A sand tray can be used. A tray with shaving cream is another option. Note how students are doing and take notes for future repetitions of this lesson as necessary.',
          ],
        },
      },
      {
        code: 'handwriting-4',
        title: 'Drawing geometric shapes',
        subtitle: 'handwriting-4',
        summary: 'Aids in control of pencil',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 4,
        lesson: {
          materials: [
            'Geometric shape stencils',
          ],
          aims: [
            'Aids in control of pencil Muscular movements to form distinct letters Work on the fine motor skills, eye-hand coordination Vocabulary development',
          ],
          presentation_steps: [
            'Have simple geometric shaped stencils. Begin with the simplest shape like a triangle or circle. T: Show and name the shape. S: echoes the name of the shape. T: Trace the shape with a crayon or chalk if using a chalk board. This shape can be colored in with up and down strokes. Students can repeat this lesson with many different shapes.',
          ],
          examples: [],
          extension: [
            'Introduce other shapes according to the unit involved.',
          ],
        },
      },
      {
        code: 'handwriting-5',
        title: 'Good Posture & Correct Pencil Grip',
        subtitle: 'handwriting-5',
        summary: 'Practice and develop skills through Good Posture & Correct Pencil Grip.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 5,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Good Posture & Correct Pencil Grip.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'handwriting-6',
        title: 'Lines on Paper',
        subtitle: 'handwriting-6',
        summary: 'Practice and develop skills through Lines on Paper.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 6,
        lesson: {
          materials: [
            'Lined paper and pencil',
          ],
          aims: [
            'Practice and develop skills through Lines on Paper.',
          ],
          presentation_steps: [
            'To teach the three lines on the lined paper Each student has a lined paper in front of him. Teacher introduces the three lines with a three-period lesson. First period: The teacher introduces the terminology \'Top Line\' and asks the students to trace the top line with the index finger from the dot to the end of the line. Next, teach that the middle line is called, \'Midline\'. Ask the students to trace from the dot to the end of the line. Finally, teach that the bottom line is called, \'Base Line\'. Ask the students to trace from the dot to the end of the line. This must be reinforced every day before the start of handwriting practice. Second period: The teacher says, \'show me\' the top line, the midline, and the base lines.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'handwriting-7',
        title: 'Tall, Short, and Down Letters',
        subtitle: 'handwriting-7',
        summary: 'Teach the different sizes of letters',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 7,
        lesson: {
          materials: [
            'Lined paper',
            'Lower Case Plastic letters',
          ],
          aims: [
            'To teach the different sizes of letters',
          ],
          presentation_steps: [
            'Bring the lower-case plastic letters to the table. Teacher places the lined paper and the letters on the table. Tell the students that there are different sizes of letters. Let us see how they fit on this lined paper. Tall Letters Take the letter \'t\' and ask them to name it. Place it on the lined paper. Now show how it touches the top line. Say that \'t\' is a tall letter because it touches the top line. Ask the students to pick up all the other tall letters while naming and placing them on the lined paper. Motion - Thumbs Up. Do a similar presentation as above for the Short and Under letters. Short letters Short letters touch the midline. Motion - Closed Fist.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'handwriting-8',
        title: 'Beginning Strokes',
        subtitle: 'handwriting-8',
        summary: 'Introduce the different strokes involved',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 8,
        lesson: {
          materials: [
            'Unlined paper or dry erase board or chalk',
            'board',
          ],
          aims: [
            'To introduce the different strokes involved in the print letters Preparation for writing',
          ],
          presentation_steps: [
            'Notes to the Teacher Practice one stroke per day. Each stroke is practiced for a few days before moving on to the next stroke. Repeat this process multiple times. Using large whole arm movements help improve kinesthetic memory. Teacher shows how to make:',
            'Up and down strokes',
            'Down and up strokes',
            'Circle strokes',
            'Half circle strokes',
            'Diagonal strokes',
            'Hump strokes',
          ],
          examples: [],
          extension: [
            'The students like drawing with different mediums. Include chalk, crayons, markers, etc.',
          ],
        },
      },
      {
        code: 'handwriting-9',
        title: 'Drawing the Strokes',
        subtitle: 'handwriting-9',
        summary: 'Teach the different lines for writing on',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 9,
        lesson: {
          materials: [
            'Wide lined paper and pencil',
          ],
          aims: [
            'To teach the different lines for writing on the lined paper',
          ],
          presentation_steps: [
            'After several practices with chalk board, unlined paper students are ready to start with wide lined paper practice. Tell the students that lower case print letters start from the top. Before touching the pencil, students skywrite each shape. Each stroke must be introduced one day at a time. Before introducing the next stroke, review the previous stroke. If the student is ready, introduce the next stroke. Ask students to draw:',
            'Short horizontal stroke on midline',
            'Tall up-down (vertical) stroke from topline to baseline',
            'Short up-down (vertical) stroke from midline to baseline',
            'Down letters from midline to below the baseline',
            'Half circles at the midline',
            'Full circles at the midline',
            'Camel humps at the midline This lesson will go on for several days before the writing of letters.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'handwriting-10',
        title: 'Letter Forms and Groups',
        subtitle: 'handwriting-10',
        summary: 'Teach the letters grouped by similar',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 10,
        lesson: {
          materials: [
            'Wide-lined paper, pencil',
          ],
          aims: [
            'To teach the letters grouped by similar strokes Preparation for writing Group the letters that are simplest to write. This is a sample group. You may follow whichever suits you. l, t, i h, m, n, u, y b, p, o, s a, c, d, e, g, q r, f, j v, w, x, k, z While giving the mantra for each letter, follow the (horizontal, vertical, half circle, etc.) terminologies taught earlier. Students should repeat as they write. Remind the students that these lower-case letters will start at the top. For example: letter \'b\' - \'down, up, and around\'; letter \'m\' - \'down, up-down, up-down.\' While writing on paper, teacher traces a letter first with the mantra. Student traces the letter three times; makes a copy next to it. Now he/she will make a copy from memory (TCM). Students only write the same letter about 5 times and move on to the next. Once the introduction is done, the next day each of the previously presented letters can be done by skywriting first and then on paper. Repeat as many times as needed. Note how students are doing and take notes for future repetitions of this lesson.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'handwriting-11',
        title: 'Practice, Practice, Practice',
        subtitle: 'handwriting-11',
        summary: 'Practice all the Lower Case and UpperCase letters',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 11,
        lesson: {
          materials: [
            'Wide-lined paper, pencil',
          ],
          aims: [
            'To practice all the Lower Case and UpperCase letters Preparation for writing Give the students a journal. Give each student a written sample of upper and lower-case letters. In the beginning students must write lower case letters only following the lines in the journal. After they master the lower-case letters, they can move on to the upper-case letters. After they master the upper-case letters, they can write upper and lower-case letters together. This can go on until they are ready to spell words and sentences.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
    ],
  },
  {
    code: 'spelling',
    title: 'Spelling',
    description: 'Learn spelling patterns and rules',
    module_count: 9,
    is_locked: false,
    teaching_mode: 'group' as const,
    display_order: 14,
    modules: [
      {
        code: 'spelling-1',
        title: 'Listen to the Sounds',
        subtitle: 'spelling-1',
        summary: 'Auditory reinforcements',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 1,
        lesson: {
          materials: [
            'Paper and pencil',
          ],
          aims: [
            'Auditory reinforcements Preparation for writing words, phrases, sentences on paper',
          ],
          presentation_steps: [
            'After about 4-5 sounds have been introduced the teacher can start giving two letter words to become familiar with the procedures. Once the students master this procedure move on to SP-3 procedure. This procedure can be dropped. T: Look at my mouth and echo the sound Teacher gives one sound at a time to the student. For example: the word is /ox/ T: Say the sound as you write /o/. S: Echoes the sound /o/ sounding out as he writes it. (Student must have eye contact with the teacher when the sound is dictated.) S: Looks up at the teacher and waits for the next sound. T: Dictates /x/ S: Writes /x/ while sounding the letter. Student will now read the word /ox/. None Note how students are doing and take notes for future repetitions of this lesson.',
          ],
          examples: [
            'the word is',
          ],
          extension: [],
        },
      },
      {
        code: 'spelling-2',
        title: 'Finger Tapping',
        subtitle: 'spelling-2',
        summary: 'Kinesthetic reinforcement of spelling',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 2,
        lesson: {
          materials: [
            'Paper and pencil',
          ],
          aims: [
            'Kinesthetic reinforcement of spelling words Preparation for spelling sentences and stories To sound spell VC and CVC words on paper.',
          ],
          presentation_steps: [
            'T: Look at my mouth and echo the word /am/ S: Echoes /am/ T: Using the non-dominant hand, tap each sound at your fingertips to your thumb starting with the pinky. S: taps /a/ with pinky and /m/ with ringer while saying the sounds. T: Say the word. S: /am/ T: Now sound as you write the word. S: /a/ /m/ T: Read the word. S: /am/ If a student is left-handed, use the right hand for tapping starting from the thumb. This is a very kinesthetic reinforcement of spelling. Reading what is written is critical for student to develop as it leads to accurate proof-reading habits. Correcting errors by proof-reading should be encouraged.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'spelling-3',
        title: 'Sound Out',
        subtitle: 'spelling-3',
        summary: 'Auditory reinforcement',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 3,
        lesson: {
          materials: [
            'Paper and pencil',
          ],
          aims: [
            'Auditory reinforcement Preparation for writing sentences and stories To sound spell VC and CVC words on paper',
          ],
          presentation_steps: [
            'The final goal for each student is to master this procedure and use it for all writing. T: Look at my mouth and echo the word /am/ S: Echoes /am/ T: Now sound out as you write the word /am/. S: /a/ /m/ T: Read the word. S: /am/ Reading what is written is critical for student to develop as it leads to accurate proof-reading habits. Correcting errors by proof-reading should be encouraged.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'spelling-4',
        title: 'What are Phrases and Sentences?',
        subtitle: 'spelling-4',
        summary: 'Understanding of phrases and sentences',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 4,
        lesson: {
          materials: [
            'Paper and pencil',
          ],
          aims: [
            'Understanding of phrases and sentences Preparation for reading, writing',
          ],
          presentation_steps: [
            'Phrases are two or more words that do not contain the subject-predicate to communicate a complete thought. A Phrase is incomplete on its own. A phrase can be short or long. A Phrase does not begin with a capital letter or end in punctuation. An example: on the bed A Sentence is a group of words that are put together to mean something. It expresses a complete thought. Teach sentence motion to the S. A Sentence always begins with a capital letter and ends in punctuation depending upon the sentence. An example: A cat sat on the bed.',
          ],
          examples: [
            'A cat sat on the bed',
          ],
          extension: [
            'None',
          ],
        },
      },
      {
        code: 'spelling-5',
        title: 'Multi Syllables',
        subtitle: 'spelling-5',
        summary: 'Auditory reinforcement for spelling two or',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 5,
        lesson: {
          materials: [
            'Paper and pencil; rectangular foams',
            'represent syllables',
          ],
          aims: [
            'Auditory reinforcement for spelling two or more syllables on paper',
          ],
          presentation_steps: [
            'This procedure can be done with foams or head bobbing or using arms or hands. T: Say the word slowly but naturally Then pronounce each syllable for /catnip/. S: Echoes the syllable /catnip/. T: Place a felt to represent each syllable. S: Places the two rectangular foams for each syllable as he says the syllable /cat/ /nip/. T: Point to the foam and say the first syllable and sound spell it. S: Points to the left most foam and says /cat/. S: He writes the syllable /cat/ while sounding it out on paper. T: Repeat the same for the second syllable. S: After both the syllables are written, the student reads the whole syllable, \'catnip\'.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'spelling-6',
        title: 'Spelling - Module 6',
        subtitle: 'spelling-6',
        summary: 'Spelling module 6.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 6,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Complete Spelling module 6.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'spelling-7',
        title: 'Spelling - Module 7',
        subtitle: 'spelling-7',
        summary: 'Spelling module 7.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 7,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Complete Spelling module 7.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'spelling-8',
        title: 'Spelling - Module 8',
        subtitle: 'spelling-8',
        summary: 'Spelling module 8.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 8,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Complete Spelling module 8.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'spelling-9',
        title: 'Spelling - Module 9',
        subtitle: 'spelling-9',
        summary: 'Spelling module 9.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 9,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Complete Spelling module 9.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
    ],
  },
  {
    code: 'spelling-exercises',
    title: 'Spelling Exercises',
    description: 'Practice spelling with guided exercises',
    module_count: 9,
    is_locked: false,
    teaching_mode: 'group' as const,
    display_order: 15,
    modules: [
      {
        code: 'spelling-exercises-1',
        title: 'Presented sounds: m, t, a Listen to the Sounds: Finger Tapping:',
        subtitle: 'spelling-exercises-1',
        summary: 'Practice and develop skills through Presented sounds: m, t, a Listen to the Sounds: Finger Tapping:.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 1,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Presented sounds: m, t, a Listen to the Sounds: Finger Tapping:.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'spelling-exercises-2',
        title: 'Presented sounds: m, t, a, s, b, c Listen to the Sounds:',
        subtitle: 'spelling-exercises-2',
        summary: 'Practice and develop skills through Presented sounds: m, t, a, s, b, c Listen to the Sounds:.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 2,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Presented sounds: m, t, a, s, b, c Listen to the Sounds:.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'spelling-exercises-3',
        title: 'Presented sounds: m, t, a, s, b, c, n, l, i Listen to the Sounds:',
        subtitle: 'spelling-exercises-3',
        summary: 'Practice and develop skills through Presented sounds: m, t, a, s, b, c, n, l, i Listen to the Sounds:.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 3,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Presented sounds: m, t, a, s, b, c, n, l, i Listen to the Sounds:.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'spelling-exercises-4',
        title: 'Presented sounds: m, t, a, s, b, c, n, l, i, r, f, p Listen to the Sounds:',
        subtitle: 'spelling-exercises-4',
        summary: 'Practice and develop skills through Presented sounds: m, t, a, s, b, c, n, l, i, r, f, p Listen to the Sounds:.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 4,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Presented sounds: m, t, a, s, b, c, n, l, i, r, f, p Listen to the Sounds:.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'spelling-exercises-5',
        title: 'Presented sounds: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o Listen to the Sounds:',
        subtitle: 'spelling-exercises-5',
        summary: 'Practice and develop skills through Presented sounds: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o Listen to the Sounds:.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 5,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Presented sounds: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o Listen to the Sounds:.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'spelling-exercises-6',
        title: 'Presented sounds: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o, k, d Listen to the Sounds:',
        subtitle: 'spelling-exercises-6',
        summary: 'Practice and develop skills through Presented sounds: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o, k, d Listen to the Sounds:.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 6,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Presented sounds: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o, k, d Listen to the Sounds:.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'spelling-exercises-7',
        title: 'Presented sounds:',
        subtitle: 'spelling-exercises-7',
        summary: 'Practice and develop skills through Presented sounds:.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 7,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Presented sounds:.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'spelling-exercises-8',
        title: 'Presented sounds: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o, k, d, j, x, e, v, z w, u, y, qu Listen to the Sounds:',
        subtitle: 'spelling-exercises-8',
        summary: 'Practice and develop skills through Presented sounds: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o, k, d, j, x, e, v, z w, u, y, qu Listen to the Sounds:.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 8,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Presented sounds: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o, k, d, j, x, e, v, z w, u, y, qu Listen to the Sounds:.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'spelling-exercises-9',
        title: 'Presented sounds:',
        subtitle: 'spelling-exercises-9',
        summary: 'Practice and develop skills through Presented sounds:.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 9,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Presented sounds:.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
    ],
  },
  {
    code: 'vocab-comprehension-fluency',
    title: 'Vocab/Comprehension/Fluency',
    description: 'Build vocabulary, comprehension, and reading fluency',
    module_count: 9,
    is_locked: false,
    teaching_mode: 'group' as const,
    display_order: 16,
    modules: [
      {
        code: 'vocab-comprehension-fluency-1',
        title: 'Multiple Meanings',
        subtitle: 'vocab-comprehension-fluency-1',
        summary: 'Practice and develop skills through Multiple Meanings.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 1,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Multiple Meanings.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'vocab-comprehension-fluency-2',
        title: 'Word of the Day',
        subtitle: 'vocab-comprehension-fluency-2',
        summary: 'Increase the student\'s vocabulary.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 2,
        lesson: {
          materials: [
            'List of words to be introduced.',
          ],
          aims: [
            'To increase the student\'s vocabulary.',
          ],
          presentation_steps: [
            'Write the Word of the Day on the board. Discuss the meaning of the word with the children. Use the word in a sentence. Ask a student to come up with a sentence as well. Have them keep a ring of 3x5 index cards in their desk to use in their writing. Or students can write word of the day in their journals.',
          ],
          examples: [
            'of the Day on the board',
            'with the\nchildren',
            'in a sentence',
            'of the day in\ntheir journals',
            'of\nthe DAY',
          ],
          extension: [
            'Get a big jar or box that is marked" Word of the DAY". As the words are introduced in class write the new word on a piece of paper and put it in the jar/box. Review them periodically with the students. Let a student pull a slip out and read the word and have the class discuss the word.',
          ],
        },
      },
      {
        code: 'vocab-comprehension-fluency-3',
        title: 'Other Vocabulary builders',
        subtitle: 'vocab-comprehension-fluency-3',
        summary: 'Increase the student\'s vocabulary.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 3,
        lesson: {
          materials: [
            'List of other vocabulary builders:',
            'Prefixes; Suffixes; Synonyms; Antonyms',
          ],
          aims: [
            'To increase the student\'s vocabulary.',
          ],
          presentation_steps: [
            'Common prefixes, suffixes, synonyms, and antonyms could be introduced at this stage as and when required. *Some examples are provided on the next page. Discuss the meaning of these. Write it on cards and review every week. Use the word in a sentence. Ask a student to come up with a sentence.',
          ],
          examples: [
            'are provided on the next\npage',
            'in a sentence',
          ],
          extension: [
            'Get a big jar or box that is marked "Prefix/suffix/synonyms/antonyms." As these are introduced in class write it on a piece of paper and put it in the jar/box. Review them periodically. Let a student pull a slip out and give it to the teacher and have the class discuss the meaning.',
          ],
        },
      },
      {
        code: 'vocab-comprehension-fluency-4',
        title: 'Reading a Book',
        subtitle: 'vocab-comprehension-fluency-4',
        summary: 'Introduce the children to new words.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 4,
        lesson: {
          materials: [
            'A story book',
          ],
          aims: [
            'To introduce the children to new words.',
          ],
          presentation_steps: [
            'The teacher shows the class the cover of the picture book that is chosen. Discuss with the students what they think the story might be about. Read the story to the students. After reading, choose some of the words the students might not be familiar with and talk about the meaning of the words. This exercise helps the students expand their vocabulary.',
          ],
          examples: [],
          extension: [
            'Continue with a variety of books on different topics.',
          ],
        },
      },
      {
        code: 'vocab-comprehension-fluency-5',
        title: 'Read Diary of a Wombat',
        subtitle: 'vocab-comprehension-fluency-5',
        summary: 'Practice and develop skills through Read Diary of a Wombat.',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 5,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Read Diary of a Wombat.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'vocab-comprehension-fluency-6',
        title: 'The Five Ws & How- Comprehension',
        subtitle: 'vocab-comprehension-fluency-6',
        summary: 'Help students develop identifying the',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 6,
        lesson: {
          materials: [
            'Sentences',
          ],
          aims: [
            'To help students develop identifying the questions - 5Ws (what, when, where, why, who) and how of sentences Prerequisite for this activity is that the student must be able to repeat 5-7word sentences. Begin with bare bone (2-3 word) sentences and slowly add up to 7-8 words. T: Echo the sentence after me. T: Jack ran. S: Echo sentence. T: Who ran? S: Jack T: What did Jack do? S: Jack ran. In the next sentence, add \'when, where, why\' questions adding one or two concepts each day. T: Jack ran to the pool in the morning. S: echo T: Where did Jack run? S: Jack ran to the pool. T: When did Jack run to the pool? S: Jack ran to the pool in the morning. T: Echo, Jack ran quickly. S: Echo T: How did Jack run? S: Jack ran quickly. Teachers can practice where, when, phrases before introducing these sentences. When phrases: Yesterday, tomorrow, today night, morning, afternoon; ; after, before, etc. Where phrases: at the store; in the house, on the bench, etc. Note how students are doing and take notes for future repetitions of this lesson.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'vocab-comprehension-fluency-7',
        title: 'Comprehension Skills',
        subtitle: 'vocab-comprehension-fluency-7',
        summary: 'Help students refine understanding of',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 7,
        lesson: {
          materials: [
            'A book',
          ],
          aims: [
            'To help students refine understanding of the parts of a story Read a book. The teacher can discuss the following: What outcomes can you predict? What is the problem in the story? Can you identify the details? What is the sequence of the story? Describe a character. What words describe his/her feelings? What is the ending of the story? Did feelings change from beginning to end? How do you summarize the story? Cause/Effect or Fact/Opinion? Can you compare and contrast? What is the mood of the story? Where does it take place? Can you give some real-life examples? Students can act out the story. Students can tell the story in their own words. Discuss the multiple meanings. They can draw pictures for the story.',
            'Read other books with or without words.',
            'Some of these ideas that are used in most of the stories can be drawn and placed on a poster board. For e.g., pictures of a house, sky/tree to indicate outside, a boy, a girl, numbers to indicate the sequence, etc. Note how students are doing and take notes for future repetitions of this lesson.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'vocab-comprehension-fluency-8',
        title: 'Comprehension Dice Game',
        subtitle: 'vocab-comprehension-fluency-8',
        summary: 'Help students refine understanding of',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 8,
        lesson: {
          materials: [
            'A book',
            'A dice that has the words: character,',
            'setting, problem, events, beginning; ending,',
            'predicting outcome',
          ],
          aims: [
            'To help students refine understanding of the parts of a story',
          ],
          presentation_steps: [
            'Read a book. A student can roll the dice and the teacher tells the class what to answer. The students discuss the area of the story that was rolled.',
          ],
          examples: [],
          extension: [
            'Read other books with or without words. In the beginning read short passages ideal for the younger students and slowly move on to story books.',
          ],
        },
      },
      {
        code: 'vocab-comprehension-fluency-9',
        title: 'Developing Fluency',
        subtitle: 'vocab-comprehension-fluency-9',
        summary: 'Help students develop fluency',
        is_locked: false,
        teaching_mode: 'group' as const,
        display_order: 9,
        lesson: {
          materials: [
            'A book',
          ],
          aims: [
            'To help students develop fluency',
          ],
          presentation_steps: [
            'Some methods to help with fluency are: Teachers model how to read Students reread loud the same Students can read to partners Give students book on tape Students can record themselves reading Time the students and note accuracy and speed; note improvement by re-reading Have students pretend to be tv/radio announcers Teach proper punctuation Practice Sight words reading by using games or flash cards Poetry reciting, singing songs Select words, sentences, short paragraphs, passages, short stories to match student\'s ability level. Fluency record keeping will help in improving speed and accuracy. Practice reading fluency every day for about five minutes.',
          ],
          examples: [
            'singing songs\nSelect words',
            'sentences',
            'short paragraphs',
            'passages',
          ],
          extension: [],
        },
      },
    ],
  },
];

const individualGroups: GroupData[] = [
  {
    code: 'ind-learning-sensorially',
    title: 'Learning Sensorially (Individual)',
    description: 'Sharpen listening skills and auditory discrimination',
    module_count: 6,
    is_locked: false,
    teaching_mode: 'individual' as const,
    display_order: 1,
    modules: [
      {
        code: 'ind-learning-sensorially-1',
        title: 'The Silence Game',
        subtitle: 'ind-learning-sensorially-1',
        summary: 'Sharpen the listening skills',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 1,
        lesson: {
          materials: [
            'A quiet room',
          ],
          aims: [
            'To sharpen the listening skills Develop good attention span Auditory discrimination',
          ],
          presentation_steps: [
            'Teacher: We are going to play a game called the Silence Game. Close your eyes and listen to the sounds in the room, outside the room and within yourself. Set a timer for 2 minutes. After 2 minutes of listening very quietly, ask the student to share what he heard. Student: Could have heard clock ticks, voices, footsteps, animals, someone coughing, faucet, lush, his own breathing, air conditioner, etc.',
          ],
          examples: [],
          extension: [
            'This game can be played in a different room or outdoors.',
            'Use tape recordings of birds, or other animals and ask to guess the animal.',
          ],
        },
      },
      {
        code: 'ind-learning-sensorially-2',
        title: 'Guessing the Instrument',
        subtitle: 'ind-learning-sensorially-2',
        summary: 'Auditory sound discrimination',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 2,
        lesson: {
          materials: [
            'A quiet room',
            'Musical instruments - rhythm sticks, drums,',
            'tambourine, maracas, bells, triangles',
          ],
          aims: [
            'Auditory sound discrimination Develop good attention span Vocabulary development',
          ],
          presentation_steps: [
            'Teacher: Introduces the names of each instrument (use 3 instruments at a time) and the sounds they make. Student: Echoes the names and listens to the sounds that the instruments make. Teacher: Close your eyes and listen to the sound and guess the name of instrument that is played. (Play one instrument at a time.) Student: Guesses the name.',
          ],
          examples: [],
          extension: [
            'Teacher: Places three instruments on the table. Close your eyes and listen to the sounds. Makes a sound with one instrument. Student: With closed eyes student listens to the sound. Opens eyes and picks up the instrument that was played and plays it once.',
            'Sequencing Sounds Game',
          ],
        },
      },
      {
        code: 'ind-learning-sensorially-3',
        title: 'learning-sensorially-4',
        subtitle: 'ind-learning-sensorially-3',
        summary: 'Follow directions',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 3,
        lesson: {
          materials: [
            'None',
          ],
          aims: [
            'To follow directions Auditory and kinesthetic discrimination To develop body awareness, crossing the midline, gross motor skills, listening skills, memory skills',
          ],
          presentation_steps: [
            'Play Simon Says Simon says* game is a fun way to develop the following: Body awareness: Touch your toes, Touch your elbows, Touch your ankles, Blink 3 times, etc. Crossing midline: Hug yourself, Touch both elbows at the same time, Touch your right knee with your left hand, Touch your right toe with your left hand, Touch your left shoulder with your right hand, Wave your arms above your head, Twist from side to side, etc. Gross motor skills: Walk backwards in a straight line, Act like an elephant and swing your trunk, Jog around the circle, Roll over on the ground 2 times, Jump up and down 10 times, etc. Listening Skills: Bend over to touch toes 3 times, clap 5 times, Do 6 jumping jacks, close your eyes and balance on one foot, etc. Memory skills: Wiggle your nose and smile and show your teeth, touch your left elbow with right hand and touch your right knee with your left hand, etc.',
          ],
          examples: [],
          extension: [
            '*https://empoweredparents.co \'70 Simon says ideas that are fun and educational\' by Tanja McIlroy',
          ],
        },
      },
      {
        code: 'ind-learning-sensorially-4',
        title: 'Learning Sensorially - Module 4',
        subtitle: 'ind-learning-sensorially-4',
        summary: 'Learning Sensorially module 4.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 4,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Complete Learning Sensorially module 4.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-learning-sensorially-5',
        title: 'Clapping Game',
        subtitle: 'ind-learning-sensorially-5',
        summary: 'Auditory memory',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 5,
        lesson: {
          materials: [
            'None',
          ],
          aims: [
            'Auditory memory Auditory and kinesthetic discrimination',
          ],
          presentation_steps: [
            'Teacher: I will produce sounds in a rhythm. Listen carefully and produce the same sounds with the same rhythm. Clap, clap, clap Clap, pause, clap, pause Clap, stomp, clap, stomp Stomp, clap, clap, clap Stomp, stomp, clap, clap ……so on',
          ],
          examples: [],
          extension: [
            'Another game is to tell the student that: One clap means stand on your knees; two claps mean jumping twice; three claps mean turning around three times. Student take turns giving commands to the teacher.',
          ],
        },
      },
      {
        code: 'ind-learning-sensorially-6',
        title: 'Name That Object',
        subtitle: 'ind-learning-sensorially-6',
        summary: 'Auditory memory',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 6,
        lesson: {
          materials: [
            'little objects in a basket',
          ],
          aims: [
            'Auditory memory Auditory, visual, kinesthetic discrimination Vocabulary development',
          ],
          presentation_steps: [
            'Teacher: There are ten objects in this basket. Listen to the names and echo. Student: Echoes the name of each object. Teacher: Places three objects on the table. Name these three objects. Now I will cover them, and you will name them again. Student: Recalls the three objects and their names. Teacher: I will add two more objects. You will name them. I will now cover all ive objects. You will recall all the ive objects in the same order that I placed. Student: Recalls all ive objects in the same order that it was placed. This game will continue till all the ten objects are placed. At the end, student should be able to recall all ten objects placed in the same order that it was placed.',
          ],
          examples: [],
          extension: [
            'Increase the number of objects to be pulled out of the basket. This can be done using pictures instead of objects.',
            'LS - 7',
          ],
        },
      },
    ],
  },
  {
    code: 'ind-rhyming',
    title: 'Rhyming (Individual)',
    description: 'Develop rhyming discrimination and production',
    module_count: 19,
    is_locked: false,
    teaching_mode: 'individual' as const,
    display_order: 2,
    modules: [
      {
        code: 'ind-rhyming-1',
        title: 'Same and Different',
        subtitle: 'ind-rhyming-1',
        summary: 'Visual, auditory, kinesthetic discrimination',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 1,
        lesson: {
          materials: [
            'circle cards*',
            '-triangle card',
          ],
          aims: [
            'Visual, auditory, kinesthetic discrimination Vocabulary development',
          ],
          presentation_steps: [
            'Bring 2 circle cards to the table. Teacher: Traces each circle with hands while saying circle, circle. These two cards are the \'same\'. Student: echoes \'same.\' Teacher: Traces the circle and triangle cards while saying circle, triangle. These two cards are \'different.\' Student: echoes \'different.\'',
            'Teacher places both the circle, circle and circle, triangle cards on the table and reviews \'same and different\'.',
            'Teacher asks the student to point to the \'same and then the different cards.\'',
            'Teacher points to different set of cards and asks: \'What is this?\' The answer will be \'same or different.\' This is called a \'three period lesson.\'',
          ],
          examples: [],
          extension: [
            'Make 2 copies of different shapes like hearts, diamonds, squares, rectangles. Mix the shapes into same and different cards. For example, have heart and heart; diamond and square; rectangle and rectangle spread on the table. Show the student same and different cards. Student can point to same or different cards and say if they are same or different.',
            '*See picture titled \'RMG-1\' RMG - 2',
          ],
        },
      },
      {
        code: 'ind-rhyming-2',
        title: 'Listen to same and different',
        subtitle: 'ind-rhyming-2',
        summary: 'Auditory, kinesthetic, visual discrimination',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 2,
        lesson: {
          materials: [
            'Same and different cards',
          ],
          aims: [
            'Auditory, kinesthetic, visual discrimination Vocabulary development',
          ],
          presentation_steps: [
            'Teacher reviews the \'same\' and \'different\' cards with the student. Now make \'same or different\' sounds: clap, clap clap, snap clap, snap, clap snap, clap, clap snap, snap If the sounds are the same, point to the \'same\' card or give thumbs up; and if they are different, point to the \'different\' card or thumbs down. Few sounds could be tap, stomp, click,',
          ],
          examples: [],
          extension: [
            'Ask the student to listen with closed eyes. Teacher makes similar sounds as above and the student will say \'same\' or \'different\' instead of pointing out to the cards.',
            'RMG - 3',
          ],
        },
      },
      {
        code: 'ind-rhyming-3',
        title: 'Same Ending Sounds',
        subtitle: 'ind-rhyming-3',
        summary: 'Recognize that the ending sounds for',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 3,
        lesson: {
          materials: [
            '-5 different musical instruments',
            'Maracas; rhythm sticks; tambourine;',
            'drums; cymbals',
          ],
          aims: [
            'To recognize that the ending sounds for rhymes are same and only the beginning sound changes Reinforce listening skills Vocabulary development',
          ],
          presentation_steps: [
            'Teacher: Produces a pair of sounds with the instruments. First: maracas and the cymbals Second: rhythm sticks and cymbals Third: drums and cymbals Teacher: Which instrument was heard in all the three different pairs of sounds. Where did you hear the cymbals - beginning or end? This shows the student that the ending sounds are the same in rhyming.',
          ],
          examples: [],
          extension: [
            'Use different mediums of sounds to show that the ending sounds are the same in rhyming words.',
            'RMG - 4',
          ],
        },
      },
      {
        code: 'ind-rhyming-4',
        title: 'Visual Awareness of Rhyming',
        subtitle: 'ind-rhyming-4',
        summary: 'Show visually that rhyming changes only',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 4,
        lesson: {
          materials: [
            '-6 Red, 1 blue,1 green,1 yellow, 1 brown, 1',
            'orange square construction paper placed',
            'on a board',
          ],
          aims: [
            'To show visually that rhyming changes only in the initial position Auditory, kinesthetic discrimination',
          ],
          presentation_steps: [
            'Some students may still not understand rhyming. Visual Awareness may help with the students who have dif iculty understanding rhyming. Teacher: Places 5 red construction paper squares on the board, one below the other. Tells the student that these red squares are \'at\'. Teacher: Places the blue, green, brown, white, and yellow square pieces to the left of the red squares. Teacher: Where do they look the same? Student: At the end. Teacher: Where do they look different? Student: At the beginning. Teacher: Rhyming words sound the same at the end and different at the beginning. The red squares are \'at\'. Teacher: Points to each red square and says \'at\'. Student: echoes \'at\'. Teacher: Points to each different color and running the inger from left to right and says: M-at, c-at, r-at, s-at, b-at. Student: echoes the above. Show that only the initial sound changes. On the second day, ask the student to generate the words.',
          ],
          examples: [],
          extension: [
            'RMG - 5',
          ],
        },
      },
      {
        code: 'ind-rhyming-5',
        title: 'Rhyming Words',
        subtitle: 'ind-rhyming-5',
        summary: 'Develop phonological cues to make rhymes',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 5,
        lesson: {
          materials: [
            'Nursery rhymes',
            'List of nursery rhymes*',
          ],
          aims: [
            'Develop phonological cues to make rhymes Auditory discrimination Vocabulary development',
          ],
          presentation_steps: [
            'Teacher: Say mat, sat; pig, jig Student: Echoes mat, sat; pig, jig Continue this exercise for a few days. When the student becomes familiar with rhyming, the teacher gives 2 rhyming words and student can echo and generate 2 more rhyming words. For example, Teacher: pig, jig Student: pig, jig, rig, dig Read nursery rhymes and ind words to rhyme. This can be done with movement or passing a ball to each other.',
          ],
          examples: [
            'to\nrhyme',
          ],
          extension: [
            'Rhyming can be done with action. Teacher: Echo the words \'cat, mat, sat, bat.\' Let us act out these words. Teacher acts out and student repeats Cat - snap and clap Mat- tap and clap Sat - jump and clap Bat - skip and clap What action was the same in all these words? Yes, it was \'clap\' at the end. Where was it different? Yes, at the beginning. Rhyming words end the same and are different in the beginning.',
            '*See examples of Nursery Rhymes on next page \'RMG-5\'',
            'List of Nursery Rhymes (RMG-5) Twinkle, Twinkle, Little Star Hickory Dickory Dock One Two, Buckle My Shoe Peas Porridge Hot Jack Be Nimble, Jack Be Quick Hey Diddle Diddle Humpty Dumpty The Muf in Man Itsy Bitsy Spider Mary Had A Little Lamb The Wheels On The Bus Frere Jacques Baa Baa Black Sheep I\'m A Little Teapot Jack and Jill',
            'Stories with Rhymes',
          ],
        },
      },
      {
        code: 'ind-rhyming-6',
        title: 'Books with Rhymes',
        subtitle: 'ind-rhyming-6',
        summary: 'Read aloud books with rhyming patterns to build phonological awareness.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 6,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Develop phonological awareness through exposure to rhyming books.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-rhyming-7',
        title: 'Odd One Out',
        subtitle: 'ind-rhyming-7',
        summary: 'Increasing the phonological cues to',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 7,
        lesson: {
          materials: [
            'Examples of words to read *',
          ],
          aims: [
            'Increasing the phonological cues to generate rhymes Auditory discrimination',
          ],
          presentation_steps: [
            'Teacher: Say the words: cat, bat, big Student: Echoes the words: cat, bat, big Teacher: Only two words rhyme, and one does not. Tell me the word that doesn\'t rhyme. Student: Says big',
          ],
          examples: [
            'cat',
            'bat',
            'big\nStudent',
            'cat',
            'bat',
            'big\nTeacher',
            'rhyme',
            'and one\ndoes not',
            'that doesn',
            'with one\nodd word that doesn',
            'of words on next page',
          ],
          extension: [
            'Try giving a group of four words with one odd word that doesn\'t rhyme. This may be challenging for some students.',
            '*See examples of words on next page \'RMG-7\'',
            'Odd One Out (RMG - 7) Cat, rat, leg',
            'Box, mud, fox',
            'Bug, rug, rat',
            'Bed, log, led',
            'Bit, bat, sit',
            'Map, nap, nit',
            'Mat, pig, fat',
            'Big, bug, jig',
            'Car, bat, hat',
            'Sun, rug, run',
            'Dog, fat, log',
            'Set, bell, get',
            'Sat, mop, mat',
            'rot, got, box',
            'Sat, bat, cat, in',
            'tod, mod, pen, sod',
            'Peg, meg, fed, leg',
            'mud, fad, sud, bud',
            'Rip, lap, dip, lip',
            'blot, clot, slid, slot',
            'RMG - 8',
          ],
        },
      },
      {
        code: 'ind-rhyming-8',
        title: 'Pick the Rhymes',
        subtitle: 'ind-rhyming-8',
        summary: 'Build the visual cues for generating',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 8,
        lesson: {
          materials: [
            'Pictures with rhymes*',
            'Scissors',
            'Glue',
          ],
          aims: [
            'To build the visual cues for generating rhymes Visual and auditory discrimination Vocabulary development',
          ],
          presentation_steps: [
            'Teacher: Gives pictures to the student. Cut out only the ones that rhyme. Then glue the rhyming pictures on plain paper. Student: inishes gluing and reads them.',
          ],
          examples: [],
          extension: [
            'Give more pictures to the student, two that rhyme and one that doesn\'t rhyme. Ask student to look at the pictures and give you the correct rhymes.',
            '*See pictures titled \'RMG-8\'',
            'RMG - 9',
          ],
        },
      },
      {
        code: 'ind-rhyming-9',
        title: 'Rhyme Picture Match',
        subtitle: 'ind-rhyming-9',
        summary: 'Visual identi ication of rhymes',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 9,
        lesson: {
          materials: [
            '-square template and rhyme pictures*',
          ],
          aims: [
            'Visual identi ication of rhymes Kinesthetic, auditory discrimination',
          ],
          presentation_steps: [
            'Give 9-square templates to the student. Teacher places one picture in the irst square. Teacher: Spread out six pictures that rhyme with each of the pictures on the square. Student: Picks the appropriate pictures that rhyme with the picture on the square. Student glues two rhyming pictures to each of the squares. Reads the rhymes that has been glued.',
          ],
          examples: [],
          extension: [
            'More rhyming discrimination can be done with other pictures.',
            '*See pictures and 9-square template titled \'RMG-9\'',
            'RMG - 10',
          ],
        },
      },
      {
        code: 'ind-rhyming-10',
        title: 'Rhyme Hunting',
        subtitle: 'ind-rhyming-10',
        summary: 'Working on the Phonological cues for',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 10,
        lesson: {
          materials: [
            'None',
          ],
          aims: [
            'Working on the Phonological cues for rhyming Kinesthetic, visual, auditory discrimination',
          ],
          presentation_steps: [
            'Teacher: Today you are going on a rhyme hunt in this room (any room). Teacher says: \'I see a chair.\' What other words rhyme with \'chair?\' Student: Guesses \'pear, hair, mare, etc.\' Continue with more words. Choose any object in the room, ask to come up with rhyming words. Some examples: I see a pen - rhymes with ten, men, den. I see a block - rhymes with sock, clock, etc. Continue with more words.',
          ],
          examples: [
            'rhyme with',
            'I see a pen',
          ],
          extension: [
            'Rhyme hunts can be done on imaginary trips to a farm; camping; zoo; beach; car rides; or vacations.',
            'RMG - 11',
          ],
        },
      },
      {
        code: 'ind-rhyming-11',
        title: 'Rhyme or Not',
        subtitle: 'ind-rhyming-11',
        summary: 'Auditory discrimination',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 11,
        lesson: {
          materials: [
            'Pairs of words* (some that rhyme and',
            'some that don\'t)',
          ],
          aims: [
            'Auditory discrimination',
          ],
          presentation_steps: [
            'Teacher: Dictates a pair of words that rhyme. E.g., cake, bake Student: Echoes the words and tells if they rhyme or not. When the student is comfortable, give some words that rhyme and some that do not rhyme. Movement or thumbs up and down signs can be used to indicate rhyming and nonrhyming words.',
          ],
          examples: [
            'that\nrhyme',
            'on the next page',
          ],
          extension: [
            '*See examples on the next page \'RMG-11\'',
            'Rhyme or Not? (RMG -11) cat/hat',
            'fox/box',
            'pig/big',
            'log/bog',
            'stop/pop',
            'show/snow',
            'bed/red',
            'rest/best',
            'mad/sad',
            'lad/bad',
            'get/bet',
            'cap/map',
            'rip/sip',
            'fox/sox',
            'hop/mop',
            'tree/bee',
            'chair/bear',
            'block/sock',
            'thin/pin',
            'lake/cake',
            'shoe/blue',
            'miss/soup',
            'light/bite',
            'back/boss',
            'kid/sid',
            'ten/top',
            'night/day',
            'day/pay',
            'box/sox',
            'fun/run',
            'rug/bug',
            'mud/mut',
            'dig/lag',
            'bike/bone',
            'nut/tree',
            'chair/sit',
            'lip/slip',
            'shop/mop',
            'king/bing',
            'drip/sip',
            'RMG - 12',
          ],
        },
      },
      {
        code: 'ind-rhyming-12',
        title: 'What Rhymes With --Materials:',
        subtitle: 'ind-rhyming-12',
        summary: 'Be able to generate rhyming words',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 12,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'To be able to generate rhyming words Auditory discrimination Vocabulary development',
          ],
          presentation_steps: [
            'Teacher says: the word is \'cake.\' Student: echoes cake and gives more rhyming words. (Teacher and student can toss a ball to each other.) Try to see how many rhyming words you two can produce. (This activity can be timed.)',
          ],
          examples: [
            'you\ntwo can produce',
            'as in',
            'as in',
            'on next page',
          ],
          extension: [
            'Student can act out verbs and rhyme. For e.g., clapping/slapping; seeding/ weeding/; feeding/reading; feeling/ peeling; tanning/fanning; Sleeping/beeping; singing/ringing; Walking/talking; sitting/ itting; Wheezing/sneezing; crying/drying This can be done for color words as in: Red/bed; blue/clue; yellow/mellow; brown/frown; gray/pray; green/screen; White/might; black/slack; etc. Also, can use number words as in: One/fun; two/moo; three/free; four/pour; Five/dive; six/ ix; seven/eleven; eight/ weight; nine/ ine; ten/men; etc.',
            '*See examples on next page \'RMG-12\'',
            'What rhymes with……(RMG - 12)',
            'cat',
            'cake',
            'ball',
            'make',
            'tip',
            'rain',
            'bug',
            'top',
            'hot',
            'down',
            'big',
            'map',
            'dog',
            'bag',
            'coat',
            'save',
            'day',
            'leg',
            'leg',
            'feet',
            'round',
            'Pin',
            'tip',
            'rain',
            'pan',
            'hill',
            'hair',
            'hand',
            'red',
            'fun',
            'late',
            'get',
            'light',
            'dress',
            'cold',
            'dish',
            'tree',
            'jump',
            'nail',
            'book',
            'seat',
            'bet',
            'cry',
            'sick',
            'sun',
            'hug',
            'back',
            'car',
            'mud',
            'row',
            'RMG - 13',
          ],
        },
      },
      {
        code: 'ind-rhyming-13',
        title: 'Memory Game',
        subtitle: 'ind-rhyming-13',
        summary: 'Recognize rhyming words',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 13,
        lesson: {
          materials: [
            'Deck of rhyming picture cards*',
          ],
          aims: [
            'To recognize rhyming words',
          ],
          presentation_steps: [
            'Memory Game: Teacher: Places all the cards facedown. Student: Turns over two cards at a time. If the pictures on the two cards rhyme, he keeps the cards and takes another turn. If the pictures on the two cards do not rhyme, he places the cards facedown, and the teacher takes a turn. Whoever gets the greatest number of rhyming cards wins the game.',
          ],
          examples: [],
          extension: [
            'Another game to play is \'Go Fish\'.',
            '*See picture titled \'RMG-13\'',
            'RMG - 14',
          ],
        },
      },
      {
        code: 'ind-rhyming-14',
        title: 'Rhyme Your Name',
        subtitle: 'ind-rhyming-14',
        summary: 'Auditory discrimination',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 14,
        lesson: {
          materials: [
            'None',
          ],
          aims: [
            'Auditory discrimination',
          ],
          presentation_steps: [
            'Teacher: Today you are going to rhyme your name. Teacher can start off with her name and make a rhyme. Student: Takes a turn to rhyme his/her name. Choose other names in the family, pets, friends, relatives and rhyme all names.',
          ],
          examples: [
            'Point to your hand and say',
          ],
          extension: [
            'Can make this a silly rhyming game by using nonwords and silly words to rhyme their name. Point to a part of your body and say: for example: Point to your hand and say, \'this is my band.\' The student will say \'this is your hand.\' Tin for chin; beg for leg; deck for neck, etc.',
            'RMG - 15',
          ],
        },
      },
      {
        code: 'ind-rhyming-15',
        title: 'Rhyming Sentences',
        subtitle: 'ind-rhyming-15',
        summary: 'Auditory discrimination',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 15,
        lesson: {
          materials: [
            'Rhyming sentences with the following*',
            'Color rhymes',
            'Number rhymes',
            'General rhymes',
          ],
          aims: [
            'Auditory discrimination',
          ],
          presentation_steps: [
            'Teacher: Reads each sentence and pauses at the slash. Student: Completes the rhyme by giving an appropriate rhyming word. The rhymes with number can be done with placing plastic numbers or writing the numbers on the board. Color rhymes can be done by using color crayons or pencils.',
          ],
          examples: [
            'on next three pages',
          ],
          extension: [
            '*See examples on next three pages \'RMG 15A, 15B, 15C\'',
            'RMG -15A',
          ],
        },
      },
      {
        code: 'ind-rhyming-16',
        title: 'Rhyme family Game',
        subtitle: 'ind-rhyming-16',
        summary: 'Automaticity of rhyme production',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 16,
        lesson: {
          materials: [
            'Ball or bean bag to toss back and forth',
          ],
          aims: [
            'Automaticity of rhyme production Auditory, kinesthetic discrimination Vocabulary development',
          ],
          presentation_steps: [
            'To begin the game, Teacher says: "My house is illed with mats." Toss the ball to the student. Student: Says "my house is illed with cats" and tosses back the ball to the teacher. Teacher repeats: "my house is illed with mats", then tosses the ball to the student. This continues until the student runs out of rhymes. Then begin the game with a new object in the house. See example below.*',
          ],
          examples: [
            'below',
            'can be divided into syllables',
            'can be long or short',
          ],
          extension: [
            'The student can also rhyme things in a farm, school, camp or any a special trip. To work with short term memory, student will repeat: my house is illed with mats, cats. In the next turn, mats, cats, bats, etc.',
            '*My house is illed with chairs. (bears, stairs, mares, hares; pears, etc.) My house is illed with jars. (stars, bars, mars, cars, scars, etc.) My house is illed with tins. (pins, ins, bins, dins, skins, shins, etc.) My house is illed with rugs. (bugs, dugs, hugs, mugs, pugs, slugs, etc.)',
            '.3 Words & Sentences(WS) Words can be divided into syllables. Words can be long or short. Long words will have more letters than short words. Sentences are made of words. The introduction that sentences are made of words is the irst introduction to the structure of our language. Learning modules in this section deals with the understanding of the structure and meaning of sentences & words; introduction to comprehension which will be very essential in reading and writing.',
          ],
        },
      },
      {
        code: 'ind-rhyming-17',
        title: 'Rhyming - Module 17',
        subtitle: 'ind-rhyming-17',
        summary: 'Rhyming module 17.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 17,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Complete Rhyming module 17.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-rhyming-18',
        title: 'Rhyming - Module 18',
        subtitle: 'ind-rhyming-18',
        summary: 'Rhyming module 18.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 18,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Complete Rhyming module 18.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-rhyming-19',
        title: 'WS',
        subtitle: 'ind-rhyming-19',
        summary: 'Practice and develop skills through WS.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 19,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through WS.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
    ],
  },
  {
    code: 'ind-words-and-sentences',
    title: 'Words & Sentences (Individual)',
    description: 'Build word and sentence awareness',
    module_count: 7,
    is_locked: false,
    teaching_mode: 'individual' as const,
    display_order: 3,
    modules: [
      {
        code: 'ind-words-and-sentences-1',
        title: 'Word Length',
        subtitle: 'ind-words-and-sentences-1',
        summary: 'Recognize long/short words auditorily',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 1,
        lesson: {
          materials: [
            'Word pairs*',
          ],
          aims: [
            'To recognize long/short words auditorily and visually Vocabulary development',
          ],
          presentation_steps: [
            'This exercise concentrates on the concept of a word as separate from the thing that the word describes. Teacher: Echo the two words I say and tell me which word is longer.\' Truck or grasshopper? Student: Echoes the words. Student: Says grasshopper Some may say \'truck\' from the size it resembles. To show visually, take either counters or small square pieces of paper. Place 5 counters for truck. Place 11 counters for grasshopper. Now ask which is longer. Say that the word with more letters is also longer. See next page for word pairs.',
          ],
          examples: [
            'pairs',
            'on next page',
            'Pairs',
          ],
          extension: [
            'These words can be printed on a paper in bold, so the student can see the length.',
            '*See examples on next page \'WS-1\'',
            'List of Word Pairs (WS - 1) Bus - Monkey Pizza - Hamburger Chair - mosquito Car - beetle Boy - candy bear - library home - elephant butter ly - grasshopper Bee - dragon ly Earth - Watermelon',
          ],
        },
      },
      {
        code: 'ind-words-and-sentences-2',
        title: 'Word Length',
        subtitle: 'ind-words-and-sentences-2',
        summary: 'Auditory development of long and short',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 2,
        lesson: {
          materials: [
            'Word pair cards*',
          ],
          aims: [
            'Auditory development of long and short words Vocabulary development',
          ],
          presentation_steps: [
            'This game is very similar to the above game but without the use of visual aids. Teacher: Reads the words from the cards. Student: Echoes the words. Teacher: Tell me which word is longer. Show long and short arm motions. For the student having dif iculty, practice lesson WS -1 few more times.',
          ],
          examples: [
            'from the cards',
            'is longer',
            'on next page',
          ],
          extension: [
            'Revisit this lesson after the introduction of syllables. The student can clap the syllables or use body movements and verify by the looking at the cards to see if it is correct.',
            '*See examples on next page \'WS-2\'',
            'List of Words (WS -2) Cow - ladybug Ant - brontosaurus Bus - motorcycle Dog - giraffe Mosquito - truck Tree - lower Bee - butter ly Elephant - cat Beaver - pig Goat - lizard',
          ],
        },
      },
      {
        code: 'ind-words-and-sentences-3',
        title: 'Two in One',
        subtitle: 'ind-words-and-sentences-3',
        summary: 'Recognize that two words can be put',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 3,
        lesson: {
          materials: [
            'List of Compound Words*',
          ],
          aims: [
            'To recognize that two words can be put together to make a new word Auditory discrimination Vocabulary development',
          ],
          presentation_steps: [
            'Teacher: Say baseball, basketball, softball. Besides being different kind of balls, what do these words have in common? These are \'compound words. They are made of two small words that are combined to form a new word, with its own meaning. Compound means \'putting together.\' For example, take the words \'cup\' and \'cake.\' If we put these two together, we get the compound word \'cupcake.\' Let us think of other delicious compound words. How about \'black …. berry, straw … berry?\' This can be done with hand motion. Teacher pulls out ist for the irst word and another ist for the second word and combine them to form the compound word. Student: Echoes the same.',
          ],
          examples: [
            'have in common',
            'with\nits own meaning',
            'to\nput together',
            'on next page',
          ],
          extension: [
            'Have puzzle cards of compound words to put together.',
            '*See examples on next page \'WS-3\'',
            'List of Compound Words (WS - 3) (Putting together words) Cup Pop Oat Water Grape Pea Break Apple Blue Black Bubble Cheese Corn Flap Fruit Ginger Corn Butter Bean Cheese Ham Meat Meat Pine',
            'cake corn meal melon fruit nut fast sauce berry berry gum burger bread jacks cake bread meal milk sprout cake burger ball loaf apple',
            'Pull Them Apart',
          ],
        },
      },
      {
        code: 'ind-words-and-sentences-4',
        title: 'Pull Them Apart (WS - 4) Paintbrush',
        subtitle: 'ind-words-and-sentences-4',
        summary: 'Practice and develop skills through Pull Them Apart (WS - 4) Paintbrush.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 4,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Pull Them Apart (WS - 4) Paintbrush.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-words-and-sentences-5',
        title: 'Add A Word',
        subtitle: 'ind-words-and-sentences-5',
        summary: 'Making compound words.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 5,
        lesson: {
          materials: [
            'List of Compound words*',
            'Optional - felts',
          ],
          aims: [
            'Making compound words.',
          ],
          presentation_steps: [
            'Teacher: Echo the word Eye Now add a second word to make a compound word. Student: Echoes \'eye\' and give the last part. E.g., eyelash/ eyeball/ eyeglasses Use of ists or felts make it more fun.',
          ],
          examples: [
            'on the next page',
          ],
          extension: [
            'Have some mixed words or pictures that the student can glue together to make compound words.',
            '*See examples on the next page \'WS-5\'',
            'Add A Word (WS-5) (Some ideas) Eye',
            'glasses/lashes',
            'Cow',
            'boy/girl',
            'Foot',
            'path/ball',
            'Black',
            'bird/berry',
            'Sun',
            'lower/shine',
            'Moon',
            'light/shine',
            'Basket',
            'ball/maker',
            'Cross',
            'walk/talk',
            'Fire',
            'works/men',
            'Foot',
            'print/stool',
            'Tooth',
            'brush/paste',
            'Ice',
            'cube/cream',
          ],
        },
      },
      {
        code: 'ind-words-and-sentences-6',
        title: 'Deletion of words',
        subtitle: 'ind-words-and-sentences-6',
        summary: 'Increase awareness of two words within',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 6,
        lesson: {
          materials: [
            'List of Compound words*',
            'Pictures of the irst part of the compound',
            'word (optional)',
          ],
          aims: [
            'To increase awareness of two words within a compound word',
          ],
          presentation_steps: [
            'Teacher: Say the word, \'raincoat.\' Student: Echoes \'raincoat.\' Teacher: Say it without \'coat.\' Student: Says \'rain.\' Can have a picture of rain. Do more examples as given below.',
          ],
          examples: [
            'as given below',
            'on next page',
          ],
          extension: [
            'Do the same exercise more concretely with pictures for the student that need more help.',
            '*See examples on next page \'WS-6\'',
            'List of Compound Words (WS - 6) Paintbrush Baseball Seesaw Classroom Seashore Bookcase Milkshake Backpack Playground Homework Suntan Sun lower Moonlight Haircut Raindrop Eyebrow Eyelash Mailman Flashlight Fireman Strawberry Doughnut Cupcake',
            '(without brush) (without ball) (without see) (without room) (without shore) (without case) (without shake) (without back) (without ground) (without work) (without sun) (without lower) (without light) (without hair) (without rain) (without brow) (without eye) (without mail) (without light) (without man) (without berry) (without nut) (without cake)',
          ],
        },
      },
      {
        code: 'ind-words-and-sentences-7',
        title: 'Words in a Sentence',
        subtitle: 'ind-words-and-sentences-7',
        summary: 'Recognize how many words are in a',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 7,
        lesson: {
          materials: [
            '-8 Small cubes (cubes represent words)',
            'List of sentences*',
          ],
          aims: [
            'To recognize how many words are in a sentence.',
          ],
          presentation_steps: [
            'Give about 7-8 small cubes to the student. These are placed in a straight line in front of the student. Teacher: Dictates a sentence. I have a blue car. Student: Echoes the sentence. Teacher: Move a cube down for each word. Student: Moves a cube for each word and then counts the number of cubes. The sentence has 5 words.',
          ],
          examples: [
            'generated',
            'on the board',
            'on next page',
          ],
          extension: [
            'Show pictures to the student and ask to generate full sentences. Student places the cubes for each word generated. Now the teacher places a line for each word on the board. The student can then check to see if the correct number of cubes were placed.',
            '*See examples on next page \'WS-7\'',
            'List of Sentences (WS - 7) Mark jumps. (2) Janet cries. (2) The dogs bark. (3) The car is blue. (4) Some birds ly. (3) The bell rang. (3) A frog hops. (3) The boat sailed away. (4) The boys will sing the song. (6) The girls and boys ran a race. (7) Our class played ball. (4) We want candies. (3) The farmer fed the chickens. (5)',
            'WS -8',
          ],
        },
      },
    ],
  },
  {
    code: 'ind-syllables',
    title: 'Syllables (Individual)',
    description: 'Clap, segment, and blend syllables',
    module_count: 15,
    is_locked: false,
    teaching_mode: 'individual' as const,
    display_order: 4,
    modules: [
      {
        code: 'ind-syllables-1',
        title: 'What is a Syllable?',
        subtitle: 'ind-syllables-1',
        summary: 'Teach:',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 1,
        lesson: {
          materials: [
            'List of words with varying syllables*',
          ],
          aims: [
            'To teach: What is a syllable? Words are made of smaller units of speech Auditory, kinesthetic discrimination',
          ],
          presentation_steps: [
            'Teacher: Today I will talk about a syllable. A syllable is a word or a part of a word. It contains a single vowel accompanied by consonants. Words may have one, two, three or more syllables. Teacher: Echo the word, \'Da/vid\' Student: Echoes \'Da/vid\' Teacher: Place your hand below your chin and see how many times your jaw touches your hand. Each time your jaw touches your hand, it is counted as a syllable. Teacher: How many times did my jaw open when I said the word \'David?\' Yes, two times. David has 2 syllables. Each syllable relates to opening and closing of the jaw. (To make counting easier, have one hand under the chin and use the other hand for counting.)',
          ],
          examples: [
            'or a part of a word',
            'may have one',
            'two',
            'three or more syllables',
            'on next page',
          ],
          extension: [
            'Use words that may be more familiar to the student.',
            '*See example on next page \'Syl-1\' List of Syllables (SYL-1) winter',
            'lotion',
            'car',
            'jungle',
            'table',
            'carpet',
            'napkin',
            'silver',
            'rose',
            'tablet',
            'number',
            'Iris',
            'pencil',
            'trumpet',
            'carnation',
            'Monday',
            'sister',
            'magnolia',
            'rooster',
            'target',
            'chrysanthemum',
            'empty',
            'camel',
            'lily',
            'Henry',
            'bone',
            'dinner',
            'Gabriel',
            'egg',
            'pin',
            'spider',
            'doe',
            'cake',
            'SYL - 2',
          ],
        },
      },
      {
        code: 'ind-syllables-2',
        title: 'Counting Syllables',
        subtitle: 'ind-syllables-2',
        summary: 'Auditory, Kinesthetic, Visual reinforcement',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 2,
        lesson: {
          materials: [
            'List of words with varying syllables*',
            'Rectangular foams represent syllables',
          ],
          aims: [
            'Auditory, Kinesthetic, Visual reinforcement of concept of syllables Vocabulary development',
          ],
          presentation_steps: [
            'Teacher: Say the word \'car.\' Look at your jaw to see how many times the jaw opens and shuts. Yes, one. \'Car\' has one syllable. Reinforce de inition of syllable. A syllable is a word or part of a word. It contains a single vowel accompanied by consonants Teacher: Rectangular foams represent syllables. Student gets 4-5 rectangular foams of the same/different colors. Each foam is a syllable. (Demonstrate how to place a foam for each syll.) The word is teacher. Pull down one foam for each syllable placing them from left to right. Student: Pulls down one foam for tea and another foam for cher. Teacher has 2 syllables. Do more examples as given below.',
          ],
          examples: [
            'or part of a word',
            'is teacher',
            'as given below',
            'on next page',
          ],
          extension: [
            'Another way to do this is with movement. First syllable - tap the head Second syllables - touch the neck Third syllables - touch the shoulder Fourth syllables - touch the tummy Fifth syllables - touch the knee Sixth syllables - touch the ankle',
            '*See example on next page \'Syl-2\'',
            'List of Syllables (SYL-2) car',
            'door',
            'carpet',
            'Ann teacher',
            'Abigail',
            'rose',
            'student',
            'Aristotle',
            'Iris',
            'writer',
            'Carnation',
            'principal',
            'Imelda',
            'magnolia',
            'window',
            'Jessica',
            'chair',
            'Veronica',
            'Elizabeth',
            'Lily',
            'chalk',
            'hemophilia',
            'Philadelphia',
            'Feliciano',
            'mathematical',
            'Caledonia',
            'Alexandria',
            'Glenda',
            'Glenda Kate',
            'Julietta hockey',
            'Jack band',
            'Electricity',
            'Lisa',
            'Gloria',
            'Valerie',
            'Olivia',
            'Luca',
            'pizzeria',
            'coral',
            'Yolanda',
          ],
        },
      },
      {
        code: 'ind-syllables-3',
        title: 'Clapping Names',
        subtitle: 'ind-syllables-3',
        summary: 'Visual, auditory, kinesthetic reinforcement',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 3,
        lesson: {
          materials: [
            'Names of student, family, pets, friends',
            'Rectangular foams (optional)',
          ],
          aims: [
            'Visual, auditory, kinesthetic reinforcement of Syllables',
          ],
          presentation_steps: [
            'Teacher: Some people have short names, and some have long names. Let us make a list of names . Say Linus. Find out how many syllables in the name Linus. Student: Li/nus Li/nus has two syll. Student may use the felts which represent each syllable or clap or chin touch. Teacher chooses more names from the list.',
          ],
          examples: [],
          extension: [
            'Take a basket with several objects like pen, pencil, eraser, crayon, marker, book, cube, marble, small ball, ruler, paper, small box, etc. Name the objects in the basket. Student will echo each of these names. Ask student to close his/her eyes and pick an object from the basket and name it. E.g., this is a \'crayon.\' Now Student claps out the syllables and says how many syllables are in that object.',
          ],
        },
      },
      {
        code: 'ind-syllables-4',
        title: 'Syllable Sorting with Pictures',
        subtitle: 'ind-syllables-4',
        summary: 'Visual, kinesthetic reinforcement of',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 4,
        lesson: {
          materials: [
            'Pictures with varying number of syllables*',
            'Numbers 1-4 written on each card',
          ],
          aims: [
            'Visual, kinesthetic reinforcement of Syllables Vocabulary development',
          ],
          presentation_steps: [
            'Teacher: Places the numeral cards 1-4 on the table. Pick a picture card and name it. Find the number of syll. and place the picture under the appropriate number on the table. Student: Selects a picture card, names it, and claps and counts the number of syllables. Student now places the card below the corresponding number of syllables. Review the pictures in each column after the pictures have been sorted.',
          ],
          examples: [],
          extension: [
            'When the student is comfortable, give any picture card, and challenge him to sort it by saying the name and without clapping. This may be challenging for some as the kinesthetic aspect is removed.',
            '*See picture titled \'SYL-4\'',
          ],
        },
      },
      {
        code: 'ind-syllables-5',
        title: 'Syllable Bingo',
        subtitle: 'ind-syllables-5',
        summary: 'Visual, auditory reinforcement of counting',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 5,
        lesson: {
          materials: [
            'Bingo card*',
            'Words**',
            'Counters or markers',
          ],
          aims: [
            'Visual, auditory reinforcement of counting syllables in words',
          ],
          presentation_steps: [
            'There are two different sets of bingo cards. The teacher and the student take one each. The teacher calls out the syllables. Student calls out the number of syllables in the word. Student and teacher mark the space with that number on the card.',
            'g., If the word is \'car\' the students will mark the number one on the bingo card. Whoever gets a vertical or horizontal or diagonal or four squares, will shout BINGO.',
          ],
          examples: [
            'for Bingo on next page',
          ],
          extension: [
            'Place pictures from any of the syllable activities face down. First the student picks a picture and names it. If it has 2 syllables, both place a counter on the \'2\' on their bingo card. Teacher takes turn choosing the picture. The game continues until someone gets a vertical or horizontal or diagonal or four squares, will shout BINGO.',
            '*See pictures titled \'Syl-4\' *See Bingo card titled \'Syl-5\'',
            '** See words for Bingo on next page \'Syl-5\'',
            'List of Syllables (SYL-5) Car (1) Carpet Rose (1) Iris (2) Carnation (3) Jessica Chair Veronica (4) Elizabeth (4) Lily (2) Caledonia (5) Glenda Kate (1) Electricity (5) Valerie Pizzeria (4) Alejandro (4) Teacher (2) Student (2) Jack (1) Window (2) Principal (3) Imelda Abigail Yolanda (3) Aristotle (4) Julietta',
            '(2)',
            '(3) (1)',
            '(2) (3)',
            '(3) (3) (4)',
          ],
        },
      },
      {
        code: 'ind-syllables-6',
        title: 'Syllable Graphing',
        subtitle: 'ind-syllables-6',
        summary: 'Visual, kinesthetic reinforcement of',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 6,
        lesson: {
          materials: [
            'Graphing paper reproducible*',
            'Syllable pictures*',
            'Scissors, glue stick',
          ],
          aims: [
            'Visual, kinesthetic reinforcement of Syllables',
          ],
          presentation_steps: [
            'Teacher: Today you will graph the syll. Gives the graph paper and syllable pictures to the student. Student: Picks a picture and places it in the column on the graph with the same number as the number of syllables in the word. Student repeats this process until all the syllable cards have been placed. Teacher: Discuss the graph with the student. Ask the student to look at the graph and answer some questions like: How many syllables do most of the words have? How many 2 syllable words are there? etc.',
          ],
          examples: [
            'have',
            'are there',
          ],
          extension: [
            'Another game called \'War\' can be played with syllable cards.',
            'Play \'Go Fish\' with the syllable cards.',
            'A game of \'Concentration\' can also be played with these cards.',
            '*See Graphing paper and pictures titled \'SYL- 6\'',
          ],
        },
      },
      {
        code: 'ind-syllables-7',
        title: 'Syllable Blending',
        subtitle: 'ind-syllables-7',
        summary: 'Show how to blend syllables one by one',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 7,
        lesson: {
          materials: [
            'List of two syllable words*',
          ],
          aims: [
            'To show how to blend syllables one by one into familiar words Preparation for reading, writing',
          ],
          presentation_steps: [
            'Teacher gives two syllables separately and asks the student to combine the 2 syll. Teacher: Say \'pic\' (shows left hand and now says \'nic\' and show the right hand.) When I bring the hands together, what word does it make. It makes \'pic/nic.\' Student: Brings hands together and says \'picnic.\' Teacher continues to give two-word syllables distinctly for the students to blend and ind the new syllable.',
          ],
          examples: [
            'does it make',
            'on next page',
          ],
          extension: [
            'Can extend this activity to showing pictures of words.',
            'Teacher gives the whole syllable, and the student pulls them apart.',
            '*See examples on next page \'Syl-7\'',
            'List of Syllables (SYL-7) Ap/ple Emp/ty Mar/ker Nap/kin Blis/ter Gar/bage Pub/lic Pic/ture Sum/mer Can/dle Mar/ble Sham/poo Cam/el Ea/gle Tem/per',
            'num/ber trum/pet sil/ver cop/per ba/by grand/ma hun/gry muf/ in o/cean ta/ble den/tist law/yer tea/cher roos/ter plas/tic',
            'Cor/ner tur/tle Spar/kle but/ter wat/er pa/per pen/cil but/ter id/dle lad/der am/ber pen/cil ro/bot bas/ket rab/bit',
          ],
        },
      },
      {
        code: 'ind-syllables-8',
        title: 'Syllable Recall',
        subtitle: 'ind-syllables-8',
        summary: 'Recall of Syllables',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 8,
        lesson: {
          materials: [
            'Numeral cards with 1, 2, 3, 4, 5, 6 or use',
            'dice',
          ],
          aims: [
            'Recall of Syllables Preparation for reading, writing',
          ],
          presentation_steps: [
            'This is a very abstract exercise and may be challenging for some students. Teacher: Pick a number and give me a word that has that many syll. (If using dice, student rolls the dice and gives the number.) Student: Picks number 3. The word is \'Maryland.\' For simplicity, have a category like States, Countries, objects, restaurant, animals, etc. If this is very challenging, start off with one, and two syllables and fold in more as the students get pro icient at it. Vary the lesson with different movements for different number of syllables.',
          ],
          examples: [
            'that has that many syll',
          ],
          extension: [
            'The variation can be to show pictures. The student picks a number from the dice or paper. The student will point to the picture with the same number of syllables. For e.g., if he picks 3, he will show the picture of an \'elephant.\'',
          ],
        },
      },
      {
        code: 'ind-syllables-9',
        title: 'Syllable Accents',
        subtitle: 'ind-syllables-9',
        summary: 'Learning how to accent a syllable',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 9,
        lesson: {
          materials: [
            'List of syllables or pictures',
          ],
          aims: [
            'Learning how to accent a syllable Helps in preparation for reading, writing',
          ],
          presentation_steps: [
            'Do Alphabet accenting module # AL-20 to review the accenting Teacher: Says a few names, overemphasizing the accented syllables in the names. E.g. Sta\' cy; Ka\' ra; Ja\' son; A\'dam Is there a difference in the way one part of the name is said. One part is louder than the other. When one part is accented, the mouth opens wider and hence said louder and the tone is higher. The accented part can be modeled with hands up in the air and down for unaccented syllable. Say your name e.g., Emma Would you say Em/ma or Em/ma? Student: Em/ma Practice with other names by accenting the syllable.',
          ],
          examples: [
            'Sta',
          ],
          extension: [
            'Show pictures and ask the student to say it with the correct accent.',
          ],
        },
      },
      {
        code: 'ind-syllables-10',
        title: 'Syllable Deletion - I (last syllable)',
        subtitle: 'ind-syllables-10',
        summary: 'Encourage awareness of syllables within',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 10,
        lesson: {
          materials: [
            'List of names of people*',
            'Rectangular foams',
          ],
          aims: [
            'To encourage awareness of syllables within words Preparation for reading, writing',
          ],
          presentation_steps: [
            'It is best to use the names of the student\'s family or friends or pet names. On the second day, the given list can be used. Teacher: Say \'Johnny\' and put out the rectangles for each syllable. Student: Says \'Johnny\' and puts out 2 rectangles. Teacher: Now say \'Johnny\' without \'nee\'. Student: Takes out the second rectangle and says \'John\'. Teacher will continue with other names. Use the foam rectangle pieces only if needed. This can also be done with hand movements. Put one hand out for each syllable. When the syllable is deleted, take that hand off.',
          ],
          examples: [
            'from a book\nbeing read',
            'on next page',
          ],
          extension: [
            'Do the above with words from a book being read.',
            'Teacher can say the name, leave out a syllable and ask the student which syllable she left out.',
            '*See examples on next page \'Syl-10\'',
            'List of Names (SYL-10) (Delete the last syllable) Say Bobbie',
            'Say it again, but don\'t say bee',
            'Bob',
            'Russell',
            'sell',
            'Rus',
            'Kendra',
            'druh',
            'Ken',
            'Baxter',
            'ter',
            'Bax',
            'Hadley',
            'lee',
            'Had',
            'Esther',
            'tur',
            'Velma',
            'muh',
            'Vel',
            'Mona',
            'nuh',
            'Henry',
            'ree',
            'Hen',
            'Ellen',
            'len',
            'Bella',
            'luh',
            'Bell',
            'Colby',
            'bee',
            'Coal',
            'Linden',
            'den',
            'Lin',
            'Dustin',
            'tin',
            'Dus',
          ],
        },
      },
      {
        code: 'ind-syllables-11',
        title: 'Syllable Deletion - II ( irst syllable)',
        subtitle: 'ind-syllables-11',
        summary: 'Encourage awareness of syllables within',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 11,
        lesson: {
          materials: [
            'List of names of people*',
            'Rectangular foams',
          ],
          aims: [
            'To encourage awareness of syllables within words Preparation for reading, writing',
          ],
          presentation_steps: [
            'This can be done with rectangular foams or hand/head movements. Teacher: Say Johnny. Now say Johnny without \'john\'. Yes, Johnny without John is \'ny.\' Teacher gives several names to the students and asks them to say the names without the irst syllable.',
          ],
          examples: [
            'on next page',
          ],
          extension: [
            'Can extend this activity to multi syllabic words.',
            'Do the above with different names',
            'Teacher can say the name, leave out a syllable and ask the student which syllable she left out.',
            '*See examples on next page \'Syl-11\'',
            'List of Names (SYL-11) (Delete the irst syllable) Say Nan/cy',
            'Say it again, but don\'t say',
            'Nan',
            'cee',
            'Bray/den',
            'Bray',
            'den',
            'Bro/dy',
            'Bro',
            'dee',
            'Grif/ in',
            'Grif',
            'Ca/leb',
            'Cay',
            'leb',
            'Co/dy',
            'dee',
            'Con/nor',
            'Con',
            'ner',
            'Dan/ny',
            'Dan',
            'nee',
            'Da/vid',
            'Day',
            'vid',
            'Dev/in',
            'Dev',
            'En/zo',
            'zoe',
            'E/than',
            'than',
            'Ev/an',
            'Gav/in',
            'Gav',
          ],
        },
      },
      {
        code: 'ind-syllables-12',
        title: 'Syllable Substitution',
        subtitle: 'ind-syllables-12',
        summary: 'Learning to substitute syllables',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 12,
        lesson: {
          materials: [
            'List of Syllables*',
          ],
          aims: [
            'Learning to substitute syllables Auditory discrimination',
          ],
          presentation_steps: [
            'Use foams or hand/head movements. Teacher: Say \'MaryAnn.\' Student: Echoes \'MaryAnn.\' Teacher: Say it without \'Ann\' Student: Mary Teacher: Now add \'Beth\' to \'Mary\' and say the new syllable. Student: MaryBeth E.g.',
          ],
          examples: [
            'MaryAnn',
            'on next page',
          ],
          extension: [
            'MaryAnn - Mary - Marybeth',
            'If the student can skip step 2, Say: MaryAnn - replace Ann with Beth.',
            '*See examples on next page \'Syl-12\'',
            'List of Syllables (SYL-12) Say',
            'Cowboy',
            'without',
            'boy',
            'add',
            'girl',
            'new word cowgirl',
            'Jason',
            'son',
            'cub',
            'Jacob',
            'Friday',
            'fri',
            'sun',
            'Sunday',
            'Tickle',
            'tic',
            'pic',
            'pickle',
            'Sandwich',
            'witch',
            'castle',
            'sandcastle',
            'Dishpan',
            'pan',
            'washer',
            'dishwasher',
            'Market',
            'mark',
            'buck',
            'bucket',
            'Homework',
            'work',
            'home',
            'homesick',
            'Needlework',
            'needle',
            'paper',
            'paperwork',
            'Nightgown',
            'gown',
            'mare',
            'nightmare',
            'Boldness',
            'bold',
            'cute',
            'cuteness',
            'Middle',
            'mid',
            'iddle',
            'Keypad',
            'pad',
            'hole',
            'keyhole',
            'Moonlit',
            'lit',
            'less',
            'moonless',
            'Party',
            'tee',
            'lor',
            'parlor',
            'Sister',
            'sis',
            'lit',
            'litter',
            'Baby',
            'bee',
            'sin',
            'basin',
          ],
        },
      },
      {
        code: 'ind-syllables-13',
        title: 'Playing with Syllables',
        subtitle: 'ind-syllables-13',
        summary: 'Learning to add to a detached syllable and',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 13,
        lesson: {
          materials: [
            'List of detached syllables*',
          ],
          aims: [
            'Learning to add to a detached syllable and reverse the new syllable Preparation for reading, writing',
          ],
          presentation_steps: [
            'Use movements with hand or head or use rectangular foams. Teacher: Echo the word corn. Add pop to the end of corn…. cornpop Switch the parts and say the new word… popcorn. Repeat with all the given words.',
          ],
          examples: [
            'corn',
            'on next page',
          ],
          extension: [
            'None',
            '*See examples on next page \'Syl-13\'',
            'List of Detached Syllables (SYL-13) echo the syll. school, add pre to the end of school switch the syllables',
            '(schoolpre) (preschool)',
            'echo the syll. man, add mail to the end of man switch the syllables',
            '(manmail) (mailman)',
            'echo the syll. boy, add cow to the end of boy switch the syllables',
            '(boycow) (cowboy)',
            'echo the syll. go, add car to the end of go switch the syllables',
            '(gocar) (cargo)',
            'echo the syll. tic, add plas to the end of tic switch the syllables',
            '(ticplas) (plastic)',
            'echo the syll. real, add un to the end of real switch the syllables',
            '(realun) (unreal)',
          ],
        },
      },
      {
        code: 'ind-syllables-14',
        title: 'Syllable Order',
        subtitle: 'ind-syllables-14',
        summary: 'Focus on syllables and learn to',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 14,
        lesson: {
          materials: [
            'List of syllables*',
          ],
          aims: [
            'To focus on syllables and learn to manipulate their order Auditory reinforcement',
          ],
          presentation_steps: [
            'Teacher: Listen to the syllables. They are not in the right order.',
            'g., nus/Li - Does this sound right? The name is Li/nus. (Always start with the student\'s name) Tell the student to listen to these syllables and unscramble them to make the correct name. Do examples below and use names that the student may be familiar with for the irst few days.',
          ],
          examples: [
            'on next page',
          ],
          extension: [
            '*See examples on next page \'Syl-14\'',
            'List of Names (SYL-14) lix/fee',
            'Felix',
            'Un/meg',
            'Megan',
            'Rick/pat',
            'Patrick',
            'En/Kar',
            'Karen',
            'Ber/am',
            'Amber',
            'Lie/les',
            'Leslie',
            'Den/Og',
            'Ogden',
            'See/nan',
            'Nancy',
            'Sun/jay',
            'Jayson',
            'Lee/bil',
            'Billie',
            'Seph/Jo',
            'Joseph',
            'Ter/Wal',
            'Walter',
            'Vin/Gal',
            'Galvin',
          ],
        },
      },
      {
        code: 'ind-syllables-15',
        title: 'Guess the Onset',
        subtitle: 'ind-syllables-15',
        summary: 'Recognize sounds within a syllable',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 15,
        lesson: {
          materials: [
            'List of words*',
          ],
          aims: [
            'To recognize sounds within a syllable Indirect preparation for reading',
          ],
          presentation_steps: [
            'For the teacher: An Onset is all the sounds in a word that come before the irst vowel sound. Teacher: Listen and echo each word. Then tell me what sound you hear that is the same in all these words before the vowel. Teacher: Echo, still, step, sting, stand, stack Student: Echoes the words. Teacher: What is the same sound that you hear in these words before the vowel? Student: /st/ Teacher: Give more words for students to practice the initial sound called \'Onsets.\'',
          ],
          examples: [
            'before the\nvowel',
            'before the vowel',
            'on next page',
            's e',
            'inding the same sound in cat',
            'can',
            'and cab',
            'Substitute',
          ],
          extension: [
            'This can be done with pictures or objects.',
            '*See examples on next page \'Syl-15\'',
            'blog, black, blot, blob, blue',
            'bl-',
            'black, blood, bloom, blog, blip',
            'bl-',
            'brag, brim, brush, bread, brick',
            'br-',
            'clock, clap, cloth, clam, clip',
            'cl-',
            'cram, crop, crud, crib, cross',
            'cr-',
            'drab, drip, drum, drill, drop',
            'dr-',
            'lip, loss, lat, lop, lame',
            'frost, frat, friend, fret, frill',
            'fr-',
            'glad, glum, gloss, glib, glen',
            'gl-',
            'grab, grunt, grass, great, grim',
            'gr-',
            'plan, plug, plead, plum, plot',
            'pl-',
            'List of words (SYL-15)',
            'List of words (SYL-15)- Cont\'d slick, slap, slum, slug, slow',
            'sl-',
            'small, smith, smog, smell, smart',
            'sm-',
            'spud, span, sped, spot, spill',
            'sp-',
            'stop, sting, stab, stuff, steam',
            'st-',
            'struck, strand, stream, straw, strength',
            'str-',
            'trim, trap, track, troll, truck',
            'tr-',
            '.5 Phonemic Awareness Phonemic Awareness is the most complex skills of all the Phonological Awareness activities. It is important to be able to hear and manipulate the oral sound patterns before identifying these patterns in print. Phonemic awareness deals with the sounds i.e., phonemes. A phoneme is the smallest unit of sound. Phonemic Awareness is the ability to hear, identify and manipulate individual phonemes in spoken words. It directs the attention to the arrangement of the sounds instead of the meaning of the spoken words. The activities involving phonemic awareness are aural and no print is involved. \'Aural\' relates to the ear or sense of hearing. \'Oral\' refers to speaking. Phonemic awareness instruction is sequential. Developmental learning modules pertaining to phonemic awareness covering Phoneme isolation, Phoneme blending, Phoneme segmenting, Phoneme deletion, Phoneme substitution and Phoneme manipulation are grouped under the following sections:',
            'Initial Sounds',
            'Final Sounds',
            'Medial Sounds',
            'Combining Sounds .5a Initial Sounds (IS) The Learning modules in this section help the students to: Isolate: initial, middle, and inal phonemes - inding individual sound in words e.g. the initial sound in cat is /c/; middle sound in man is /a/; inal sound in pop is /p/ Identify: phonemes in words: inding the same sound in cat, can, and cab - /c/ Blend: phonemes to form words: forming a word by listening to sequence of phonemes e.g. /c/ /a//b/ is cab Segment words: break apart a word into separate sounds - pan is / p//a//n/ Delete: changing of initial, middle, or inal phoneme in words Substitute: replace initial/middle/ inal phoneme with a different phoneme',
          ],
        },
      },
    ],
  },
  {
    code: 'ind-initial-sounds',
    title: 'Initial Sounds (Individual)',
    description: 'Identify and manipulate initial sounds in words',
    module_count: 14,
    is_locked: false,
    teaching_mode: 'individual' as const,
    display_order: 5,
    modules: [
      {
        code: 'ind-initial-sounds-1',
        title: 'Sound Pictures',
        subtitle: 'ind-initial-sounds-1',
        summary: 'Show visually how sounds feel in one\'s',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 1,
        lesson: {
          materials: [
            'Mirror',
            'Pictures of lips, tongue, teeth (optional)',
          ],
          aims: [
            'To show visually how sounds feel in one\'s mouth to help with phoneme articulation',
          ],
          presentation_steps: [
            'Teacher gives student a mirror asks him to lift it only when directed. The use of mirror is engaging but also this is how your brain recognizes those sounds. Auditory features and gestures are part of identi ication. Louisa Moats called this \'Mouth awareness.\' Teacher: Mirror up, echo the sound /m/ while you look in the mirror. Student: Echoes /m/. Teacher: Are your lips together? Can you see your lips together? Student: Yes Continue with other sounds. Teacher: Mirror up and echo the sound /s/ as you look in the mirror. Are your teeth together? Can you see your teeth together? Do the same as above with the sound /a/ and ask the children: Is your mouth open? Can you see your mouth open?',
          ],
          examples: [],
          extension: [
            'Continue to review the above concepts for a few days until the students are very familiar with it. As an option, pictures of lips closed, teeth together and mouth open can be used to reinforce this concept.',
          ],
        },
      },
      {
        code: 'ind-initial-sounds-2',
        title: 'Same or Different Shapes?-Review',
        subtitle: 'ind-initial-sounds-2',
        summary: 'Teach \'same\' and \'different\' visually',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 2,
        lesson: {
          materials: [
            'Same (2 circles); different(circle, triangle)',
            'cards*',
          ],
          aims: [
            'To teach \'same\' and \'different\' visually',
          ],
          presentation_steps: [
            'This module has already been done earlier in rhyming. It is repeated here for reinforcement. Teacher: Places the \'same\' card (two circles) on the board or table. Point to the two circles and say - circle, circle. Student: Traces the circles in the air while saying it. They are the same. Teacher: Places the \'different\' cards on the board/table. Student: Traces the circle, triangle in the air while saying - \'circle, triangle.\' They are different. Teacher: Point to the \'same\' card. Teacher: Point to the \'different\' card. Teacher: shows the same and different cards What is this? Students: same, different. Continue this exercise until the students can identify these \'same and different\' cards well.',
          ],
          examples: [],
          extension: [
            'Repeat with different shapes (provided) if the student needs more practice.',
            '*See picture titled \'RMG-1\'',
          ],
        },
      },
      {
        code: 'ind-initial-sounds-3',
        title: 'Same or Different Sound Shapes?',
        subtitle: 'ind-initial-sounds-3',
        summary: 'Show visually how sounds feel in one\'s',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 3,
        lesson: {
          materials: [
            'Examples*',
            'Same and different cards**',
          ],
          aims: [
            'To show visually how sounds feel in one\'s mouth to help with phoneme articulation',
          ],
          presentation_steps: [
            'Review same and different cards before this activity and place them on the board. Teacher: Watch my mouth as I say some sounds. If my mouth looks the same, say \'same\' while pointing to the \'same\' card. If my mouth looks different, point to the \'different\' card, and say \'different.\' Teacher: Echo /m/,/m/ Student: Echoes /m/,/m/ Teacher: Is it same or different? Student: Same Look at examples on next page and continue for a few days until students can listen and recognize the sounds easily.',
          ],
          examples: [
            'on next page',
          ],
          extension: [
            '*See examples on next page \'IS-3\' **See picture titled \'RMG-1\'',
            'List of sounds (IS-3) /s/, /s/',
            '/t/, /t/',
            '/m/, /m/',
            '/g/, /j/',
            '/s/, /m/ /m/, /m/ /m/, /s/',
            '/b/, /d/ /b/, /b/ /f/, /f/',
            '/m/, /m/, /m/',
            '/f/, /v/',
            '/s/, /s/, /m/',
            '/l/, /l/, /l/',
            '/s/, /s/, /s/',
            '/z/, /z/, /z/',
            '/m/, /s/, /m/',
            '/z/, /s/',
            '/m/, /s/, /s/',
            '/x/, /c/',
          ],
        },
      },
      {
        code: 'ind-initial-sounds-4',
        title: 'Discovery of Consonants',
        subtitle: 'ind-initial-sounds-4',
        summary: 'Show visually how sounds feel in one\'s',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 4,
        lesson: {
          materials: [
            'Mirror',
          ],
          aims: [
            'To show visually how sounds feel in one\'s mouth to help with phoneme articulation',
          ],
          presentation_steps: [
            'Teacher reviews the \'lips closed, open, tongue and teeth\' concept. Teacher: Listen and echo my sound; look at your mouth in the mirror and tell me how your mouth feels. Now, mirror up. Say /t/. Student: Echoes /t/ looking at the mirror. Teacher: What part of the mouth is used to make the sound. Student: Tongue and teeth. Teacher: Yes, the air low is blocked by the tongue. For all the Consonant sounds, the air low is blocked by either tongue, teeth or lips. /t/ is blocked by the tongue and teeth. Hence it is a blocked sound. A blocked sound is called a Consonant. Teacher: Put a hand on your throat. Say the sound again and tell me if there is any buzzing or vibration. Student: No buzzing or vibration Teacher: If there is no vibration, the sound is unvoiced. If there is vibration, the sound is voiced. Practice this with other consonant sounds.',
          ],
          examples: [],
          extension: [
            'Discovery of Vowels',
          ],
        },
      },
      {
        code: 'ind-initial-sounds-5',
        title: 'Module IS-5',
        subtitle: 'ind-initial-sounds-5',
        summary: 'Show visually how sounds feel in one\'s',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 5,
        lesson: {
          materials: [
            'Mirror',
          ],
          aims: [
            'To show visually how sounds feel in one\'s mouth to help with phoneme articulation',
          ],
          presentation_steps: [
            'Teacher reviews the \'lips closed, open, tongue and teeth\' concept. Teacher: Mirror up; Listen and echo the sound. Look at your mouth in the mirror and tell me how your mouth feels. Teacher: Say /a/ (closed vowel sound - like in the beginning of \'apple.\') Student: Echoes /a/ and looks in the mirror. Teacher: Is your mouth open or closed? Student: Mouth is open. Teacher: Is the air low blocked by the tongue, teeth, or lips? Student: It is not blocked by anything. So, it is an unblocked sound. An unblocked sound is a Vowel. Teacher: Put a hand on your throat. Say the sound again and tell me if there is any buzzing or vibration. Student: There is buzzing/vibration, Teacher: If there is vibration, the sound is Voiced. Try it with all vowels. Student will discover that all vowels are voiced and unblocked.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-initial-sounds-6',
        title: 'Pulling Down Sounds',
        subtitle: 'ind-initial-sounds-6',
        summary: 'Auditory discrimination of beginning',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 6,
        lesson: {
          materials: [
            'Card with three squares template*',
            'Counters',
            'List of sounds**',
          ],
          aims: [
            'Auditory discrimination of beginning sounds Master left to right sequencing Preparation for reading, writing',
          ],
          presentation_steps: [
            'Give 3 counters to the student to be placed on the desk. Each counter represents a sound. Teacher: Listen and echo the sounds and move one counter for each sound starting from the square with the star. (Start with single sounds and slowly add more sounds.) Teacher: Echo /m/ Student: Echoes /m/ and then pulls down one counter while making the sound /m/ and places it on the left most side of the square (square with star). (After few individual sounds, give two sounds) Teacher: Now I will give you two sounds. Say /t/ Student: Echoes /t/ and pulls down a counter for /t/. Teacher: Say /a/ Student: Echoes /a/ and pulls down and places one more counter to the right of /t/, as he makes the sound /a/. Continue the same activity with 2,3, or 4 sounds.',
          ],
          examples: [
            'on next page',
          ],
          extension: [
            'Do this activity with more sounds.',
            '*See template titled \'IS-6\' **See examples on next page \'IS-6\'',
            'Pulling down Sounds (IS-6) /m/ /a/ /t/, /a/ /m/, /a/ /a/, /m/ /d/, /a/ /t/, /n/ /s/, /a/, /f/ /p/, /c/ /t/, /i/, /p/ /h/,/a/,/t/',
          ],
        },
      },
      {
        code: 'ind-initial-sounds-7',
        title: 'Sorting Objects/Pictures',
        subtitle: 'ind-initial-sounds-7',
        summary: 'Auditory discrimination of initial sounds',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 7,
        lesson: {
          materials: [
            'Pictures beginning with the same initial',
            'sound*',
          ],
          aims: [
            'Auditory discrimination of initial sounds Preparation for reading',
          ],
          presentation_steps: [
            'Teacher picks three pictures beginning with the same sound. Teacher: Look at this picture of a \'mitten.\' Echo mitten Student: Echoes \'mitten.\' Teacher: What is the beginning sound you hear in \'mitten\'. Watch my mouth as I say it again. Emphasize the initial sound, e.g., mm-m for mitten. Student: Echoes m-m-m \'mitten.\' The sound is /m/. Teacher: Repeat the same with two other pictures- mop, monkey Student: Echoes \'mop\' /m/; \'monkey\' /m/ Review these three pictures next day. When the student feels comfortable, add three more pictures beginning with another sound, each time asking the student to identify the name and initial sounds. Repeat, but this time mix pictures with different initial sounds. Introduce only single consonant sounds at a time. Do the same activity with objects in the room. Point to an object in the room and ask the student to give the initial sound of that object.',
          ],
          examples: [],
          extension: [
            '*See picture titled \'IS-7\' IS-8',
          ],
        },
      },
      {
        code: 'ind-initial-sounds-8',
        title: 'Guessing Game',
        subtitle: 'ind-initial-sounds-8',
        summary: 'Reinforcement of initial sounds',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 8,
        lesson: {
          materials: [
            'Objects in the environment',
            'Bag of objects/pictures beginning with',
            'different sounds',
          ],
          aims: [
            'Reinforcement of initial sounds',
          ],
          presentation_steps: [
            'Teacher: We are going to play a guessing game. Listen to the clues and tell me the name of the object that I describe. Teacher: I am thinking of an object that begins with the sound t-t-t-t-t-t. Student: Echoes the sound /t/ Teacher: This object is a piece of furniture. It is made of wood or metal. You use this when at dinner time. Mostly it is found in the dining room or kitchen or sometimes it may be found outside. What object is it?\' Student: table. Teacher: That is correct. table /t/ Student: Echoes table /t/ You can Continue with several objects from the environment; a farm; home, etc.',
          ],
          examples: [],
          extension: [
            'Do the above game with objects in a basket. Teacher lines up the objects and follows the above presentation.',
            'This can also be done with pictures displayed on the board; or objects in the school or home. Reuse IS-7 pictures.',
          ],
        },
      },
      {
        code: 'ind-initial-sounds-9',
        title: 'Identify Initial Sounds',
        subtitle: 'ind-initial-sounds-9',
        summary: 'Auditory reinforcement of initial sounds',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 9,
        lesson: {
          materials: [
            'Sheet with words*',
          ],
          aims: [
            'Auditory reinforcement of initial sounds',
          ],
          presentation_steps: [
            'Teacher: Say the word \'dog.\' Student: Echoes - dog. Teacher: What is the irst/initial/beginning sound that you heard? Student: /d/ The concept of irst/initial/beginning would have been done with the Alphabet modules. Review that they all mean the same. (Continue with different words starting with cvc words and moving on to blends, digraphs)',
          ],
          examples: [
            'digraphs',
            'that belong to a house',
            'school',
            'farm',
            'or park',
            'on next page',
          ],
          extension: [
            'Use words that belong to a house, school, farm, or park.',
            '*See examples on next page \'IS-9\'',
            'List of words (IS-9) Hand',
            '/h/',
            'Mary',
            '/m/',
            'Feet',
            '/f/',
            'paper',
            '/p/',
            'Mouth',
            '/m/',
            'coin',
            '/c/',
            'Elbow',
            '/e/',
            'axe',
            '/a/',
            'Toe',
            '/t/',
            'barn',
            '/b/',
            'Fingers',
            '/f/',
            'yarn',
            '/y/',
            'Nose',
            '/n/',
            'wagon',
            '/w/',
            'Lips',
            '/l/',
            'under',
            '/u/',
            'Face',
            '/f/',
            '/u/',
            'Hair',
            '/h/',
            'snake',
            '/s/',
            'Head',
            '/h/',
            'insect',
            '/i/',
            'Tummy',
            '/t/',
            'gold',
            '/g/',
            'Nails',
            '/n/',
            'orange',
            '/o/',
            'Wrist',
            '/r/',
            'rainbow',
            '/r/',
          ],
        },
      },
      {
        code: 'ind-initial-sounds-10',
        title: 'Sound Pictures',
        subtitle: 'ind-initial-sounds-10',
        summary: 'Isolate initial sounds visually and show',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 10,
        lesson: {
          materials: [
            'Several pictures *',
            'Card with three squares template**',
            'One counter',
          ],
          aims: [
            'To isolate initial sounds visually and show where to place the sounds when you read Preparation for reading, writing',
          ],
          presentation_steps: [
            'Teacher: Pull out a picture from this bag. Place it above the card with the star. Student: pulls out a picture and places it above the card with the star. Teacher: Say the name of the picture. Student: Says the name of the picture- cup. Teacher: What is the initial sound? Student: Says the initial sound of the picture- /c/. Teacher: Say the initial sound and place the counter on the left most square (with star). Student: Places the counter on the left most square while saying the initial sound- /c/.',
          ],
          examples: [],
          extension: [
            'This can be done with objects.',
            '*Use same pictures as \'IS-7\' **Use card template titled \'IS-6\'',
          ],
        },
      },
      {
        code: 'ind-initial-sounds-11',
        title: 'Deleting Initial Sounds',
        subtitle: 'ind-initial-sounds-11',
        summary: 'Identify missing initial sounds',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 11,
        lesson: {
          materials: [
            'Names of people* or any objects',
          ],
          aims: [
            'To identify missing initial sounds',
          ],
          presentation_steps: [
            'Teacher: Echo Helen. Student: Echoes Helen. Teacher: Now say Helen without the initial sound /h/. Student: Elen. Teacher: Say Barry without /b/. Student: Arry. Continue this with other names as given below. If the student is unable to do this in one step, split it into several steps. Teacher: Say Helen. Student: Echoes Helen. Teacher: What is the initial sound in Helen? Student: /h/ Teacher: Now say it without the initial sound /h/. Student: Elen',
          ],
          examples: [
            'on next page',
          ],
          extension: [
            'This game can be done with names of people, objects, countries, pets, etc.',
            '*See examples on next page \'IS-11\'',
            'List of names and objects (IS-11) Matthew without',
            '/m/ is',
            'atthew',
            'Steve',
            '/s/',
            'teve',
            'John',
            '/j/',
            'Kathy',
            '/k/',
            'athy',
            'Laura',
            '/l/',
            'aura',
            'Monica',
            '/m/',
            'onica',
            'Denis',
            '/d/',
            'enis',
            'Pam',
            '/p/',
            'Dog',
            '/d/',
            'Fish',
            '/f/',
            'ish',
            'Cake',
            '/c/',
            'ake',
          ],
        },
      },
      {
        code: 'ind-initial-sounds-12',
        title: 'Substituting Initial Sounds',
        subtitle: 'ind-initial-sounds-12',
        summary: 'Focus on initial sounds and be able to',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 12,
        lesson: {
          materials: [
            'Names of people or pictures of people*',
          ],
          aims: [
            'To focus on initial sounds and be able to manipulate it.',
          ],
          presentation_steps: [
            'Teacher: Echo the name Page. Student: Echoes Page. Teacher: Change /p/ in Page to /s/ Student: Replaces /p/ with /s/ in Page. It is \'Sage.\' Work with several names in this way. Some students may have problems with this. Break it down more. Say Page. Say Page without/p/………./age/ Now add /s/ to /age/……………………./sage/ Different faces of people cut out from magazines, or newspaper can be used.',
          ],
          examples: [
            'on next page',
          ],
          extension: [
            'This exercise can be done with names of objects; names of countries; names of pets, etc.',
            '*See examples on next page \'IS-12\'',
            'List of people names (IS-12) Say Harry,',
            'change /h/ in',
            'Harry',
            'Larry',
            '/l/',
            'John',
            '/l/',
            '(Larry)',
            'Larry',
            '/b/',
            '(Barry)',
            '/j/',
            'John',
            '/d/',
            '(Don)',
            'Hal',
            '/h/',
            'Hal',
            '/s/',
            '(Sal)',
            'Laura',
            '/l/',
            'Laura',
            '/m/',
            '(Maura)',
            'Gail',
            '/g/',
            'Gail',
            '/l/',
            '(Lail)',
            'Jerry',
            '/j/',
            'Jerry',
            '/b/',
            '(Berry)',
            'Jordan',
            '/j/',
            'Jordan',
            '/g/',
            '(Gordon)',
            'Page',
            '/p/',
            'Page',
            '/s/',
            '(Sage)',
            'Felix',
            '/f/',
            'Felix',
            '/h/',
            '(Helix)',
            'Carla',
            '/c/',
            'Carla',
            '/m/',
            '(Marla)',
          ],
        },
      },
      {
        code: 'ind-initial-sounds-13',
        title: 'Odd Man Out',
        subtitle: 'ind-initial-sounds-13',
        summary: 'Reinforce the understanding of initial',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 13,
        lesson: {
          materials: [
            'List of words with sets of two/three same',
            'initial sounds and one with a different',
            'initial sound*',
          ],
          aims: [
            'To reinforce the understanding of initial phonemes',
          ],
          presentation_steps: [
            'The student picks out the word that doesn\'t begin with the same sound. Teacher: Echo the words after me. map, mad, cap Student: Echoes map, mad, cap Teacher: Tell me the word that begins with a different initial sound. Student may be unable to guess the word with the different initial sound. Teacher: what do map, mad begin with? Student: /m/ Teacher: what does cap begin with? Student: /c/ So cap begins with a different initial sound than map and mad. For some students you may have to use only two words instead of three words beginning with the same sound and one word with a different beginning sound. Continue with the words on the next page.',
          ],
          examples: [
            'that doesn',
            'after me',
            'on the next page',
            'on next page',
          ],
          extension: [
            'This exercise can be done with names of siblings, pets, or objects.',
            '*See examples on next page \'IS-13\' pig, pin, Jill, pit met, meg, bet, men dot, not, doll, dog gas, gap, gal, map Hal, had, hid, bed sun, sum, sub, luck dab, dam, dig, hid fun, fad,',
            'id, tip',
            'tee, tip, rap, tag in,',
            'ish, it,',
            'will',
            'bin, bill, bid, tat sit, sun, run, sin bag, sag, bat, ban',
            'List of words (IS-13)',
          ],
        },
      },
      {
        code: 'ind-initial-sounds-14',
        title: 'Scavenger Hunt',
        subtitle: 'ind-initial-sounds-14',
        summary: 'Reinforce the understanding of initial',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 14,
        lesson: {
          materials: [
            'Several assorted pictures taken from',
            'magazines or from the collections provided',
            'in this package',
          ],
          aims: [
            'To reinforce the understanding of initial phonemes',
          ],
          presentation_steps: [
            'Teacher: Pulls out a picture from the bag and says this is the picture of an apple. Echo the word and tell me the initial sound. Student: Echoes apple and says /a/. Teacher: Gives the student the picture. Go around the room and ind items that begin with the same sound. Student: Takes the picture of apple and looks around the room for objects that begin with /a/. Student: Returns to the table with 2-3 objects. Student places them on the table, names the pictures/objects and says the name of the object and its beginning sound.',
          ],
          examples: [
            'and tell me the initial sound',
          ],
          extension: [
            'This game can be done with an object in the bag instead of a picture.',
            '.5b Final Sounds (FS)',
          ],
        },
      },
    ],
  },
  {
    code: 'ind-final-sounds',
    title: 'Final Sounds (Individual)',
    description: 'Identify and manipulate final sounds in words',
    module_count: 6,
    is_locked: false,
    teaching_mode: 'individual' as const,
    display_order: 6,
    modules: [
      {
        code: 'ind-final-sounds-1',
        title: 'Same Ending',
        subtitle: 'ind-final-sounds-1',
        summary: 'Auditory and visual reinforcement of',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 1,
        lesson: {
          materials: [
            'Basket of objects/pictures ending in the',
            'same phoneme',
          ],
          aims: [
            'Auditory and visual reinforcement of ending sounds',
          ],
          presentation_steps: [
            'Teacher: Brings three objects/pictures ending in the same phoneme. Tell me the name of each object/picture. Student: Names each object-cat, hat, bat Teacher: What inal sound do you hear in cat, hat, bat? Student: Says the inal sound is /t/ in cat, hat, bat. Continue with three more objects/pictures with the same ending. Practice with several pictures/objects. When he can accurately say the inal sound in objects or pictures, mix the two different sets of objects/pictures and ask him to sort it out by the same ending sound.',
          ],
          examples: [
            'ending in the same sound',
          ],
          extension: [
            'This can be done orally by giving words ending in the same sound.',
          ],
        },
      },
      {
        code: 'ind-final-sounds-2',
        title: 'Deletion of Final Sounds in Syllables',
        subtitle: 'ind-final-sounds-2',
        summary: 'Become aware of individual sounds',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 2,
        lesson: {
          materials: [
            'People names*',
          ],
          aims: [
            'To become aware of individual sounds within syllables',
          ],
          presentation_steps: [
            'Teacher: Say Jane. Student: Echoes Jane. Teacher: Say Jane without /n/. Student: Jay Some students may have problems with this. Break it down more. Teacher: Echo Page and tell me the inal sound in Page. Student: Echoes Page and says /j/. Teacher: Now say Page without the inal sound /j/. Student: Says………./Pay/ Different faces of people cut out from magazines, or newspaper can be used. Examples are given on the next page.',
          ],
          examples: [
            'are given on the next page',
            'from the unit being studied',
            'on next page',
            'of names',
          ],
          extension: [
            'This game can be done with objects in the room or words from the unit being studied.',
            '*See examples on next page \'FS-2\'',
            'Some examples of names/objects (FS-2) Maid',
            'without',
            '/d/',
            'may',
            'Page',
            '/j/',
            'pay',
            'Grace',
            '/s/',
            'gray',
            'Dave',
            '/v/',
            'day',
            'Jake',
            '/k/',
            'Jay',
            'Ford',
            '/d/',
            'for',
            'Blake',
            '/k/',
            'blay',
            'Curt',
            '/t/',
            'cur',
            'Zain',
            '/n/',
            'Zay',
            'Kate',
            '/t/',
            'Kay',
            'Mike',
            '/k/',
            'Maine',
            '/n/',
            'May',
          ],
        },
      },
      {
        code: 'ind-final-sounds-3',
        title: 'Deletion of Initial/Final Sounds in Syllables',
        subtitle: 'ind-final-sounds-3',
        summary: 'Reinforce the understanding of inal and',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 3,
        lesson: {
          materials: [
            'Names of pets or any objects or people*',
          ],
          aims: [
            'To reinforce the understanding of inal and initial phonemes',
          ],
          presentation_steps: [
            'Teacher: Echo Jane. Student: Echoes Jane. Teacher: Say Jane without /J/. Student: Says \'ane.\' Teacher: Echo Jane. Student: Echoes Jane. Teacher: Say Jane without /n/. Student: Says Jay. Continue with examples below.',
          ],
          examples: [
            'below',
            'on next page',
          ],
          extension: [
            '*See examples on next page \'FS-3\'',
            'List of objects (FS-3) Cat',
            'without',
            '/c/',
            'Hal',
            '/h/',
            'Peter',
            '/p/',
            'eater',
            'Lane',
            '/n/',
            'lay',
            'Zoro',
            '/Z/',
            'oro',
            'Della',
            '/d/',
            'ella',
            'Nose',
            '/z/',
            'Feet',
            '/t/',
            'fee',
            'Dug',
            '/d/',
            'Soap',
            '/p/',
            'sow',
            'Dame',
            '/m/',
            'day',
            'Paid',
            '/d/',
            'pay',
            'Cane',
            '/c/',
            'ane',
          ],
        },
      },
      {
        code: 'ind-final-sounds-4',
        title: 'Deleting and Changing Sounds',
        subtitle: 'ind-final-sounds-4',
        summary: 'Reinforce and manipulate inal',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 4,
        lesson: {
          materials: [
            'People or pet or any names*',
          ],
          aims: [
            'To reinforce and manipulate inal phonemes',
          ],
          presentation_steps: [
            'Teacher: Echo Page Student: Echoes Page. Teacher: Say Page without /j/. Student: Says pay. Teacher: Add /l/ to pay. Student: Says pale. Some students may have problems with this. Break it down more. Teacher: Echo Page and tell me the inal sound in Page. Student: Echoes Page and says /j/. Teacher: Now say Page without the inal sound /j/. Student: Says………./Pay/ Teacher: Add /l/ to the end of /Pay/ Student: Pale Work with several names in this way. A magazine, or a poster of different faces can be used.',
          ],
          examples: [
            'on next page',
          ],
          extension: [
            'Once they are comfortable with this exercise, give them the initial or inal sounds of objects/pictures in the room and guess the name.',
            '*See examples on next page \'FS-4\'',
            'List of words (FS-4) Say maid',
            'instead of',
            '/d/',
            'say',
            '/l/',
            'mail',
            'Page',
            '/j/',
            '/d/',
            'paid',
            'Grace',
            '/s/',
            '/d/',
            'grade',
            'Dave',
            '/v/',
            '/m/',
            'dame',
            'Hope',
            '/p/',
            '/s/',
            'hose',
            'Class',
            '/s/',
            '/p/',
            'clap',
            'Sam',
            '/m/',
            '/d/',
            'sad',
            'Prod',
            '/d/',
            '/m/',
            'prom',
            'Seen',
            '/n/',
            '/d/',
            'seed',
          ],
        },
      },
      {
        code: 'ind-final-sounds-5',
        title: 'Take It Out',
        subtitle: 'ind-final-sounds-5',
        summary: 'Reinforce the understanding of inal',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 5,
        lesson: {
          materials: [
            'List of words with sets of two/three same',
            'endings and one with a different ending*',
          ],
          aims: [
            'To reinforce the understanding of inal phonemes',
          ],
          presentation_steps: [
            'Teacher: Echo cat, mat, pan, fat Student: Echoes cat, mat, pan, fat Teacher: Pick out the word with a different ending….\'pan\'. If the student is unable to pick out the correct word, present only three words. For some students, break it down even more. Teacher: Echo cat, mat, pan, fat Student: Echoes the words. Teacher: What sounds do cat, mat, fat have in the inal position? Student: /t/ Teacher: what does pan end in? Student: /n/ So, pan ends with a different inal sound than cat, mat and fat.',
          ],
          examples: [
            'with a different\nending',
            'on next page',
          ],
          extension: [
            'This exercise can be done with names of people, pets, pictures, or objects in class.',
            '*See examples on next page \'FS-5\'',
            'pig, jig, dig, Jill met, beg, bet, net dot, not, lot, log as,',
            'gas, gap, has',
            'had, hid, not, bed so,',
            'day, no, go',
            'cam, dam, ram, hid ruff, muff, rum, deaf tree, eat, three, be stack, back, pack, log ish, dish, ditch, wish shrill, bill, drill, it',
            'List of words (FS-5)',
          ],
        },
      },
      {
        code: 'ind-final-sounds-6',
        title: 'Final Sound Addition',
        subtitle: 'ind-final-sounds-6',
        summary: 'Reinforce the understanding of inal',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 6,
        lesson: {
          materials: [
            'List of words*',
          ],
          aims: [
            'To reinforce the understanding of inal phonemes',
          ],
          presentation_steps: [
            'Teacher: Sometimes a new word can be created by adding a sound to the end of a word. Teacher: Echo boo. Student: Echoes boo. Teacher: Add /t/ to boo. What is the new word? Student: Echoes boo-t and says boot. Continue with the list of words in the same fashion.',
          ],
          examples: [
            'in the same\nfashion',
            'on next page',
            'is\n\ncold\n\nBee',
          ],
          extension: [
            '*See examples on next page \'FS-6\'',
            'List of words (FS-6) Coal',
            'add',
            '/d/',
            'new word is',
            'cold',
            'Bee',
            '/t/',
            'beet',
            '/t/',
            'goat',
            'See',
            '/m/',
            'seem',
            'Bee',
            '/n/',
            'bean',
            'Far',
            '/m/',
            'farm',
            '/s/',
            'nose',
            'See',
            '/d/',
            'seed',
            'Tie',
            '/m/',
            'time',
            'Rye',
            '/d/',
            'ride',
            'Row',
            '/d/',
            'road',
            'Moo',
            '/n/',
            'moon',
            'Lay',
            '/t/',
            'late',
            'Tie',
            '/t/',
            'tight',
            'Bow',
            '/n/',
            'bone',
            '.5c Medial Sounds (MS)',
            'MS- 1',
          ],
        },
      },
    ],
  },
  {
    code: 'ind-medial-sounds',
    title: 'Medial Sounds (Individual)',
    description: 'Identify and manipulate medial sounds in words',
    module_count: 2,
    is_locked: false,
    teaching_mode: 'individual' as const,
    display_order: 7,
    modules: [
      {
        code: 'ind-medial-sounds-1',
        title: 'Find the Vowel Sounds',
        subtitle: 'ind-medial-sounds-1',
        summary: 'Auditory reinforcement of the',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 1,
        lesson: {
          materials: [
            'List of words*',
          ],
          aims: [
            'Auditory reinforcement of the understanding of medial phonemes',
          ],
          presentation_steps: [
            'Review medial sound from Alphabet modules. Teacher: Echo bag (say the /a/ little louder.) Student: Echoes bag. Teacher: What medial sound did you hear? Student: Says /a/. Examples of words are given on the next page. Work with all ive vowels.',
          ],
          examples: [
            'on next page',
          ],
          extension: [
            'This exercise can be done with pictures of cvc words and ask the student to identify the medial sound after echoing the words in the pictures. Give a vowel and ask student to make a cvc word.',
            '*See examples on next page \'MS-1\'',
            'List of words (MS-1) mad',
            'jig',
            'fax',
            'pad',
            'leg',
            'kit',
            'jam',
            'den',
            'lip',
            'Jim',
            'men',
            'dull',
            'rim',
            'sit',
            'pug',
            'dog',
            'sub',
            'log',
            'bin',
            'mop',
            'dip',
            'fog',
            'rod',
            'bed',
            'Don',
            'gas',
            'hen',
            'pog',
            'had',
            'sun',
            'fun',
            'beg',
            'mud',
            'dug',
          ],
        },
      },
      {
        code: 'ind-medial-sounds-2',
        title: 'Change the Vowel Sounds',
        subtitle: 'ind-medial-sounds-2',
        summary: 'Auditory & Visual reinforcement of medial',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 2,
        lesson: {
          materials: [
            'List of words with CVC sounds*',
            'Counters to represent sounds',
          ],
          aims: [
            'Auditory & Visual reinforcement of medial phonemes',
          ],
          presentation_steps: [
            'Teacher: Echo the word net. Student: Echoes net. Teacher: Place the 3 counters touching each one saying /n/ /e/ /t/ Teacher: What medial sound did you hear? Student: /e/ Teacher: Change /e/ to /i/, what is it? Student: Says the new word nit. For some students this may take some time to grasp. Change /a/ to /i/ for a few days and then move on to the next vowel and so on. Continue with other words.',
          ],
          examples: [
            'net',
            'nit',
            'on next page',
          ],
          extension: [
            'Once the student is comfortable with this exercise, give pictures with missing medial sounds for the student to ill. More games can be found in the book, "Listening Games for Elementary Grades" By M. J. Maxwell',
            '*See examples on next page \'MS-2\'',
            'List of words (MS-2) /a/',
            'mat',
            '/i/',
            'mitt',
            '/a/',
            'pan',
            '/i/',
            'pin',
            '/i/',
            'sit',
            '/a/',
            'sat',
            '/i/',
            'bit',
            '/a/',
            'bat',
            '/i/',
            'rip',
            '/a/',
            'rap',
            '/u/',
            'rub',
            '/i/',
            'rib',
            '/u/',
            'bud',
            '/e/',
            'bed',
            '/o/',
            'got',
            '/e/',
            'get',
            '/o/',
            'rot',
            '/a/',
            'rat',
            '/e/',
            'pet',
            '/a/',
            'pat',
            '/e/',
            'sip',
            '/a/',
            'sap',
            '/e/',
            'pen',
            '/i/',
            'pin',
            '.5d Combining Sounds(CS)',
            'CS - 1',
          ],
        },
      },
    ],
  },
  {
    code: 'ind-combining-sounds',
    title: 'Combining Sounds (Individual)',
    description: 'Blend and segment sounds to form words',
    module_count: 4,
    is_locked: false,
    teaching_mode: 'individual' as const,
    display_order: 8,
    modules: [
      {
        code: 'ind-combining-sounds-1',
        title: 'Put the Sounds Together',
        subtitle: 'ind-combining-sounds-1',
        summary: 'Auditory reinforcement of sounds',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 1,
        lesson: {
          materials: [
            'Pictures of words with 2 sounds*',
            'counters',
            'Card with three squares template**',
          ],
          aims: [
            'Auditory reinforcement of sounds Analyze syllables into phonemes Preparation for reading, writing',
          ],
          presentation_steps: [
            'Counters represent sounds. Teacher: shows a picture of an ax. Let us see how many sounds this word has. Say /a/……………./x/ (with a pause between the two letters) Student: Echoes /a/…………/x/ Teacher: Watch how I move the counters. Each counter represents a sound. Say /a/ and move one counter down and say /x/ and move it to the right of /a/. Student: echoes and does the same with the counters. It has two sounds. Teacher: Yes, it has two sounds. Run your ingers under from left to right and say /a/ and (hold your breath until you touch) /x/. Say /ax/. Student: Echoes /ax/. Student practices with several pictures. Show the next picture and ask the student to pull down a counter for each sound.',
          ],
          examples: [
            'has',
            'and\nthen expand to three',
            'with two sounds orally',
          ],
          extension: [
            'Start off with two (vc) sound words and then expand to three (cvc) sound words. This exercise can also be done by giving words with two sounds orally.',
            '*See pictures titled \'CS-1\' **See card template titled \'IS-6\'',
          ],
        },
      },
      {
        code: 'ind-combining-sounds-2',
        title: 'Count the Sounds',
        subtitle: 'ind-combining-sounds-2',
        summary: 'Awareness of phonemes',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 2,
        lesson: {
          materials: [
            'Pictures of words with 2 sounds*',
            'Words with 2 or 3 sounds**',
            'Counters',
            'Card with three squares template***',
          ],
          aims: [
            'Awareness of phonemes Direct preparation for reading, writing',
          ],
          presentation_steps: [
            'Teacher: Today you will count the sounds in the words. Counters represent the sounds. Teacher: Say ta- (closed sound for /a/) (very slowly and deliberately, t---a) Student: Echoes t-a. What is the irst sound you hear? Student: /t/ Teacher: Yes, it is /t/. Pull down a counter as you echo /t/. Student: Pulls down a counter saying /t/. Teacher: What is the second sound in t-a? (/a/ as in apple) Student: /a/. Teacher: Yes, /a/. Pull down another counter while saying /a/. Student: Pulls down another counter while saying /a/. Teacher: Run your inger from left to right and say /ta-/. Student: Do the same. Teacher: Two counters represent the two sounds /t/,/a/. Repeat the same procedure with the other pictures/words.',
          ],
          examples: [
            'on next page',
          ],
          extension: [
            'Show pictures or objects and ask to name and count the sounds.',
            '*See pictures titled \'CS-1\'',
            '**See examples on next page \'CS-2\' ***Use card template titled \'IS-6\'',
            'List of words (CS-2) Ta__ (2)',
            'Eye (1)',
            'cup (3)',
            'Ma__ (2)',
            'Knee (2)',
            'log (3)',
            'Pa__ (2)',
            'Bee (2)',
            'Pig (3)',
            'Pi__ (2)',
            'Tie (2)',
            'Sun (3)',
            'Si__ (2)',
            'See (2)',
            'Coat (3)',
            'Lo__(2)',
            'Bow (2)',
            'Log (3)',
            'Ro__(2)',
            'Egg (2)',
            'Row (2)',
            'Up (2)',
            'It (2)',
            'If (2)',
            'Key (2)',
            'Ad (2)',
            'Toe (2)',
            'Cat (3)',
            'Rag (3)',
            'Boat (3)',
          ],
        },
      },
      {
        code: 'ind-combining-sounds-3',
        title: 'Make a word -Body Coda Blending (with objects)',
        subtitle: 'ind-combining-sounds-3',
        summary: 'Learn to blend words using body coda',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 3,
        lesson: {
          materials: [
            'Set of objects with one syllable words',
          ],
          aims: [
            'To learn to blend words using body coda Preparation for reading',
          ],
          presentation_steps: [
            'Teacher: Today you will look at some objects and learn to divide the words into \'body\' and \'coda.\' \'Body\' is all the sounds up to and including the Vowel. \'Coda\' is all the sounds after the vowel. Teacher: This is a hat. We will divide hat into body and coda. Body is /ha/ Coda is /t/ Ha---t Student: Echoes ha---t. Now your turn. This is a pig. Body is pi Coda is g Pi---g Student: echoes pi---g. Continue with several one syllable objects.',
          ],
          examples: [
            'into',
          ],
          extension: [
            'Practice with the names of objects in the classroom. Teacher may want to start off with /a/ as the vowel and slowly move on to the other vowels. This is great preparation for reading.',
          ],
        },
      },
      {
        code: 'ind-combining-sounds-4',
        title: 'Make a word -Body Coda Blending (with pictures)',
        subtitle: 'ind-combining-sounds-4',
        summary: 'Learn to blend words using body coda',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 4,
        lesson: {
          materials: [
            'Set of one syllable picture cards*',
            'Word list**',
          ],
          aims: [
            'To learn to blend words using body coda Preparation for reading',
          ],
          presentation_steps: [
            'Teacher: This is the picture of a net. Teacher: Let us divide the word net into \'body\' and \'coda.\' Review: Body is all the sounds up to and including the Vowel. Coda is all the sounds after the vowel. Teacher: Body is /ne/ Coda is /t/ Ne---t Now your turn. The picture is mat Student: Mat Body is ma Coda is t Ma---t Continue with several words with one syll. pictures.',
          ],
          examples: [
            'net into',
            'with one syll',
            'and ask to divide it into',
            'examples on next page',
          ],
          extension: [
            'Give clues for words and student can guess the word and then divide into body and coda. For example, I am thinking of an animal that slithers and could be poisonous. What is it? Yes, snake. Sna-ke More abstract way is to give student some words and ask to divide it into \'body and coda.\' (List on next page) This is great preparation for reading.',
            '*See pictures titled \'CS-4\' **Word examples on next page \'CS-4\'',
            'List of words (CS-4) fo-x',
            'boo-k',
            'ba-t',
            'ne-t',
            'bo-x',
            'fee-t',
            'a-x',
            'se-t',
            'pi-n',
            'hea-t',
            'do-t',
            'lo-g',
            'ti-n',
            'do-g',
            'bee',
            'mu-g',
            'ta-p',
            'la-ss',
            'lo-ck',
            'pi-g',
            'ma-p',
            'ji-g',
            'ro-ck',
            'i-t',
            'ga-p',
            'bi-ll',
            'u-p',
            'ma-c',
            'ba-g',
            'see-d',
            'ba-ke',
            'li-ck',
            'cha-p',
            'dre-ss',
            'sna-ke',
            'ma-tch',
            'Alphabet (AL) The knowledge of letter names and their shapes is an important precursor and a predictor of future ability to read and spell. The alphabetic principle is critical in beginning reading and is the relationship between letters of the written language and spoken words. Students are not always automatically aware of the relationship between upper and lower-case letters. These must be taught at the preschool level. Learning modules in this section include the following and all are taught with fun games, songs and by auditory, visual, and kinesthetic ways. Names of letters Shapes of letters Sequencing Concept of Consonants Concept of Vowels Upper and Lower-case letters',
          ],
        },
      },
    ],
  },
  {
    code: 'ind-alphabet',
    title: 'Alphabet (Individual)',
    description: 'Learn letter names, sounds, and formation',
    module_count: 22,
    is_locked: false,
    teaching_mode: 'individual' as const,
    display_order: 9,
    modules: [
      {
        code: 'ind-alphabet-1',
        title: 'Introduction to the Alphabet Uppercase',
        subtitle: 'ind-alphabet-1',
        summary: 'Familiarize the student with the letters and',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 1,
        lesson: {
          materials: [
            'The Alphabet Mat',
            'A set of Upper-Case plastic letters (blue)',
          ],
          aims: [
            'Familiarize the student with the letters and sequence of the alphabet Introduce the terms irst/initial, last/ inal, middle, and medial',
            'letters in total; 13 letters in the irst half and 13 letters in the last half',
          ],
          presentation_steps: [
            'Teacher: Points to the uppercase letters on the chart and says these are the letters of the alphabet. Each letter has a name. The name of the letter will always stay the same. Get your mat out. Student: Gets the mat out. Teacher: Touch and count each letter. How many letters are in the alphabet? Student: There are 26 letters in the alphabet. Teacher: A is the irst or initial or beginning letter of the alphabet. Z is the last or inal or the ending letter. Place A and Z on the arc. Student: Places A and Z on the arc and echoes A is the initial letter and Z is the inal letter. Teacher: Let\'s ind the middle of the alphabet. Touch one inger on A and one inger on Z at the same time. Now touch each letter as you move toward the middle. Stop when you get to M. The middle is between M and N. The middle means something should divide into two equal parts or halves. Place the letters M and N on the arc. Student: follows directions. Teacher: Let\'s count the letters A through M. There are 13. Now the letters between N and Z. There are',
            'All letters between A and Z are called medial. Student: Echoes the same.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-alphabet-2',
        title: 'Sequential Placement - Uppercase',
        subtitle: 'ind-alphabet-2',
        summary: 'Sharpen the student\'s knowledge of the',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 2,
        lesson: {
          materials: [
            'The Alphabet Mat',
            'A set of Upper-Case plastic letters (blue)',
          ],
          aims: [
            'To sharpen the student\'s knowledge of the names of the letters of the alphabet The sequence of the alphabet',
          ],
          presentation_steps: [
            'Teacher: Take out your upper-case side of the alphabet mat. Student: Gets the mat out. Teacher: Touch each letter of the alphabet as I say the name. Together: Teacher and the student will say: A is the irst/initial letter; Z is the last/ inal letter; M and N are the middle letters; All the letters between A and Z are called medial letters; There are 26 letters in all;',
            'in the irst half and 13 in the last half; Teacher: Take out all the blue upper-case plastic letters and lay them on the mat. Turn all letters to the smooth side. Place A and Z on the arc; Then place M and N on the arc; Touch A again and start to name and place each letter. Student: Places the letters as above.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-alphabet-3',
        title: 'Sequential Placement - Review',
        subtitle: 'ind-alphabet-3',
        summary: 'Sharpen the student\'s knowledge of the names',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 3,
        lesson: {
          materials: [
            'The Alphabet Mat',
            'A set of Upper-Case plastic letters (blue)',
          ],
          aims: [
            'Sharpen the student\'s knowledge of the names of the letters of the alphabet and the sequence of the alphabet Goal is for each student to inish in 3 minutes or less.',
          ],
          presentation_steps: [
            'This is a more abstract review of the alphabet. Teacher: Take your alphabet mats out. Student: Takes out mat with the uppercase letters side. Teacher: Touch each letter of the alphabet as I say the name. Together: Teacher and Student A is the irst/initial letter; Z is the last/ inal letter; M and N are the middle letters; All the letters between A and Z are called medial letters; There are 26 letters in all;',
            'in the irst half and 13 in the last half Teacher: Take out all the blue upper-case plastic letters and lay them on the mat with the smooth side up. Student: Takes out all letters and places them on smooth side. Teacher: Place A and Z on the arc; Then place M and N on the arc; Touch A again and start to name and place each letter on the arc. Student: follows directions.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-alphabet-4',
        title: 'Sequential Placement - Lowercase',
        subtitle: 'ind-alphabet-4',
        summary: 'Introduce the lower-case letters',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 4,
        lesson: {
          materials: [
            'The alphabet mat',
            'A set of (red) lower-case plastic letters',
          ],
          aims: [
            'To introduce the lower-case letters',
          ],
          presentation_steps: [
            'Teacher: Look at the letters and see if there is any difference. These are called lower-case letters. Review concepts taught previously with the upper-case letters. Teacher and Student together: a is the irst/initial letter; z is the last/ inal letter; m and n are the middle letters; All the letters between a and z are called medial letters; There are 26 letters in all;',
            'in the irst half and 13 in the last half; Teacher: Take out all the red lower-case plastic letters and lay them with the smooth side on the mat. Place a and z on the arc; Then place m and n on the arc; Touch a again and start to name and place each letter on the arc. Student: Follows directions.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-alphabet-5',
        title: 'Uppercase and Lowercase letter placement Review',
        subtitle: 'ind-alphabet-5',
        summary: 'Compare the upper and lowercase',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 5,
        lesson: {
          materials: [
            'The Alphabet Mat with Upper-Case',
            'letters side',
            'A set of (blue) upper-case plastic letters',
            'A set of (red) lower-case plastic letters',
          ],
          aims: [
            'To compare the upper and lowercase letters Goal is for every student to inish in 4 minutes or under',
          ],
          presentation_steps: [
            'Teacher: Reviews concepts taught previously. A is the irst/initial letter; Z is the last/ inal letter; M and N are the middle letters; All the letters between A and Z are called medial letters; There are 26 letters in all;',
            'in the irst half and 13 in the last half; Teacher: Take out all the blue uppercase plastic letters and lay them with the smooth side on the mat. Place \'A and Z\' on the arc; Then place \'M and N\' on the arc; Touch \'A\' again and start to name and place each letter on the arc. When inished lay the lowercase letters under the appropriate uppercase letters. Student: Follows directions.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-alphabet-6',
        title: 'Names of Vowels',
        subtitle: 'ind-alphabet-6',
        summary: 'Teach the names of Vowels',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 6,
        lesson: {
          materials: [
            'The alphabet mat',
            'A set of red lower-case plastic letters',
            'Purple vowels',
            'Mirrors for each student',
            'Song sheet*',
          ],
          aims: [
            'To teach the names of Vowels',
          ],
          presentation_steps: [
            'Teacher: Place the alphabet mat on the table. Turn all letters to the smooth side. Look at the two different colors. (Go over concepts already taught in AL-4.) Student: Places all the letters with smooth side up. Teacher: Let us look at the purple letters, name each one of them. a, e, i, o, u These letters are called Vowels. Student: Echoes Vowels. Teacher: Place the vowels on the arc and touch and say the names. Student: Follows directions.',
          ],
          examples: [],
          extension: [
            'For variation, teach them the name of the vowels through the nursery rhyme tune of BINGO. Mix the consonants and vowels and ask the student to pick a letter and identify if it is a vowel or a consonant.',
            '*See song on next page \'AL-6\'',
            'Vowel Song: (AL - 6) (Sung to the tune of \'BINGO\') I know the Vowels of the alphabet And all 5 of their name ohs! a,e,i,o,u - a,e,i,o,u - a,e,i,o,u and Vowels are their name ohs!',
          ],
        },
      },
      {
        code: 'ind-alphabet-7',
        title: 'Before and After Hand',
        subtitle: 'ind-alphabet-7',
        summary: 'Teach the concept of before and after',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 7,
        lesson: {
          materials: [
            'Alphabet mat- Lowercase side',
            'Student\'s hands (Left Hand - Before Hand,',
            'Right Hand - After Hand)',
          ],
          aims: [
            'To teach the concept of before and after',
          ],
          presentation_steps: [
            'Teacher: Place your mat in front and place both your hands on the mat. Point to the letter m. Your left hand is on the letter m. This is called the beforehand. Do 3-Period lesson. Demonstrate that l comes before m; d comes before e, etc. Do lots of examples and review daily. Your right hand is on the letter n. This is called the after hand. Do a 3-Period lesson. Demonstrate that n comes after m; p comes after o, etc. Do lots of examples and review daily. (For some students this concept may take longer to understand than others. In that case, do only before concept for a few days and then introduce the after concept.)',
          ],
          examples: [
            'and review daily',
            'and review daily',
          ],
          extension: [
            'Objects may be used for reinforcement. Place some objects and name them. Ask student to touch the object that comes before or after another object. This is a great exercise to do with numbers, colors, etc.',
          ],
        },
      },
      {
        code: 'ind-alphabet-8',
        title: 'New Alphabet Review',
        subtitle: 'ind-alphabet-8',
        summary: 'Reinforce alphabet concepts previously',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 8,
        lesson: {
          materials: [
            'alphabet mat (lower-case)',
            'Foam shaped hands with before and after',
            'written on them/ students can use their',
            'hands',
          ],
          aims: [
            'To reinforce alphabet concepts previously taught Before, after, initial, inal, medial, middle, vowels, consonants',
          ],
          presentation_steps: [
            'Teacher: Place your mat showing the lowercase letters on the table. T: Echo after me. S: Echoes the following mantra. There are 26 letters in the alphabet; There are two kinds of letters in the alphabet: Vowels and Consonants; The vowels are \'a e i o u;\' a is the initial letter ; z is the inal letter; m and n are the middle letters; The letters between a and z are medial letters. New addition to the old mantra: My left hand is my \'before hand\' My right hand is my \'after hand\'',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-alphabet-9',
        title: 'Shapes of the letters',
        subtitle: 'ind-alphabet-9',
        summary: 'Introduce the shapes/lines found in the',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 9,
        lesson: {
          materials: [
            'Pipe cleaners shaped: horizontal, vertical',
            'lines; diagonal; crisscross; camel hump; full',
            'circle; half circle;',
            'Song sheet*',
          ],
          aims: [
            'To introduce the shapes/lines found in the',
            'letters Indirect preparation for writing',
          ],
          presentation_steps: [
            'Teacher: Holds up each shape and asks the student to point to the shapes and echo the names. Student: Echoes the teacher. This is \'Horizontal\' This is \'Vertical\' This is \'Diagonal\' This is \'Criss-Cross" ( with 2 diagonals) This is \'Half circle\' This is \'Full Circle\' This is \'Camel hump\' These are the strokes and curves used to make all the manuscript letters. Do a 3-period lesson with these strokes. Practice this for a few days in different ways.',
          ],
          examples: [],
          extension: [
            'This activity can be done using their arms or full body or wikki stix; playdoh, or yarn . *Review the shapes by using a nursery rhyme tune called \'Frere Jacques.\'',
            '*See song on next page \'AL-9\'',
            'Shape song (AL-9) (Sung to the tune of Frere Jacques) Horizontal, Horizontal Up Down, Up Down Diagonal, Diagonal Criss-cross; Criss-cross Full circle, Full circle Half circle, Half circle Camel hump; camel hump Helps to learn The shapes of all letters',
          ],
        },
      },
      {
        code: 'ind-alphabet-10',
        title: 'Listen, Look and Say',
        subtitle: 'ind-alphabet-10',
        summary: 'Identify letters by looking',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 10,
        lesson: {
          materials: [
            'Alphabet Chart',
            'Set of blue plastic Upper-Case letters in a',
            'bag',
          ],
          aims: [
            'To identify letters by looking Review of the previous lesson Indirect preparation for reading, writing',
          ],
          presentation_steps: [
            'Teacher: Bring your mat with Upper-Case letters side. Student: Places the mat on the table. Teacher: Look at your mat. I will pull a letter from the bag but will not show you. I will describe the strokes of the letter that I pull. Listen, look and tell me what letter is being described. This letter has a vertical line and a short horizontal line on the top. What letter is it? Student: Listens to the description, looks at the mat and thinks. The letter is T. Teacher: Place T on the arc while naming it. Student: Places T on the mat while naming it. Teacher will describe several letters. This goes on for a few days.',
          ],
          examples: [],
          extension: [
            'Student can describe it to the teacher and ask to guess the letter.',
          ],
        },
      },
      {
        code: 'ind-alphabet-11',
        title: 'Guess the Letter by Feel',
        subtitle: 'ind-alphabet-11',
        summary: 'Identify letters by feel',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 11,
        lesson: {
          materials: [
            'Either Upper-Case or lower-case Alphabet',
            'Mat',
            'Set of plastic Upper-Case/ lower-case',
            'letters in a bag',
          ],
          aims: [
            'To identify letters by feel Internalization of the shapes of letters',
          ],
          presentation_steps: [
            'Teacher: Bring your mat and a set of lowercase letters Pull out a letter from the bag, feel the shape of the letter and try to guess the name of the letter. Student: Feels the letter, names it and then places it on the arc. (While feeling a letter, student can verbalize the shape.) Student: Pulls out another letter and feels it, guesses the name and places it on the same letter on the arc while naming it. Continue until all the letters are gone.',
          ],
          examples: [],
          extension: [
            'Teacher and student can take turns to do the same game.',
          ],
        },
      },
      {
        code: 'ind-alphabet-12',
        title: 'Let Go of the \'Z\'',
        subtitle: 'ind-alphabet-12',
        summary: 'Reinforce the sequencing skills by sight',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 12,
        lesson: {
          materials: [
            'Alphabet mat either upper or lower-case',
            'side',
            'One set of upper/lower-case letters in a',
            'bag to be used as the draw bag',
          ],
          aims: [
            'To reinforce the sequencing skills by sight Indirect preparation for reading, writing',
          ],
          presentation_steps: [
            'Teacher: Place all the letters on the arc from a through z. Student: Places all the letters. Teacher: We will play a game today. Each of us will take turns taking two or three letters at a time saying its name and placing it in the bag. Student: Begins picking letters abc while naming them and placing them in the bag. Teacher: Picks saying the letters de and places the letters in the same bag. The teacher and student will alternate until the end. The ultimate object of this game is not to say \'z\'.',
          ],
          examples: [],
          extension: [
            'This game can be played in another way. It is called \'take the z\'. This game is played the same way as above. The only variation is that the player who says the \'z\' will be the winner.',
          ],
        },
      },
      {
        code: 'ind-alphabet-13',
        title: 'Race to inish',
        subtitle: 'ind-alphabet-13',
        summary: 'Identify position of letters in the',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 13,
        lesson: {
          materials: [
            'Alphabet Mat either upper or lower-case',
            'side',
            'One set of upper/lower-case letters in a',
            'bag to be used as the draw bag',
          ],
          aims: [
            'To identify position of letters in the alphabet Before and after',
          ],
          presentation_steps: [
            'Teacher: Place your alphabet mat on the table. We will play another game. Each of us will draw 13 letters from a bag of upper/lower-case letters. We will place the letters on the table in front of us. Teacher: Pick one letter and place it on the arc. Student: Places g on the arc. Teacher: Picks a letter s from her pile and places the letter on the same mat. Now the arc has two letters on it. E.g., g, s Teacher: Look at your letters to see if you have a letter that goes before or after one of the letters placed on the mat i.e., g or s. Student: Places f in the appropriate place on the arc and says…. f comes before g. The players take turns placing the letters before or after the letters placed while verbalizing what each one does. The irst player to place all the letters wins.',
          ],
          examples: [],
          extension: [
            'Teacher picks a letter and ask what comes before and after that letter.',
          ],
        },
      },
      {
        code: 'ind-alphabet-14',
        title: 'Nearest to Z or A',
        subtitle: 'ind-alphabet-14',
        summary: 'Identify position of letters in the',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 14,
        lesson: {
          materials: [
            'Alphabet Mat',
            'One set of upper-case/ lower-case letters in',
            'a bag to be used as the draw bag',
          ],
          aims: [
            'To identify position of letters in the alphabet Before and after',
          ],
          presentation_steps: [
            'Teacher: Place the mat on the table. Student: Places the mat on the table. Teacher: You will draw one letter from this bag and place it on the arc. Student: Draws a letter f from the bag. Teacher: I will draw my letter and place it on the arc. My letter is s. s is nearer to z than f. I will get both the letters. Student: Pulls out another letter y. Teacher: Pulls out m. Student: y is closer to z than m. I will get both the letters. This continues until all the letters are used. The player with the greatest number of letters wins.',
          ],
          examples: [],
          extension: [
            'This game can be played \'nearer to A\' in a very similar manner.',
          ],
        },
      },
      {
        code: 'ind-alphabet-15',
        title: 'Letter Snoop',
        subtitle: 'ind-alphabet-15',
        summary: 'Identify position of letters in the',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 15,
        lesson: {
          materials: [
            'Alphabet Mat',
            'One set of plastic lower-case or upper-case',
            'letters placed on board',
          ],
          aims: [
            'To identify position of letters in the alphabet Fluency in naming letters',
          ],
          presentation_steps: [
            'Teacher: Place lowercase letters on the arc of the alphabet mat. Touch and say the names of the letters. Student: Follows directions. Teacher: Close your eyes and I will take off one letter from the arc. You will guess what letter it is by looking at the chart. (The letters are pushed back so there are no gaps.) Student: Opens eyes and names the missing letter. (If unable to name the letter, then have him touch each letter and say until he discovers the missing letter.) Teacher: Put the letter back on the mat and play again. This game can be continued by taking more than on letter at a time.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-alphabet-16',
        title: 'Ten Questions',
        subtitle: 'ind-alphabet-16',
        summary: 'Identify position of letters in the',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 16,
        lesson: {
          materials: [
            'Alphabet Mat',
            'One set of blue or red plastic letters',
          ],
          aims: [
            'To identify position of letters in the alphabet Fluency in naming letters',
          ],
          presentation_steps: [
            'Teacher: Place the letters on the arc and touch and name each letter. Student: Places letters on the mat and touches and names each letter. Teacher: I am thinking of a letter. I want you to guess it. You may ask me questions but the answers to them may only be "yes" or "no" answers. You will get ten turns to guess the name of the letter. Take off the letters as they are eliminated. Examples of questions to ask: Is your letter in the irst half of the alphabet? Is the letter made up of only straight lines; does it have up & downs; or circles? Is the letter a vowel? Does it come before ______? Is it in the group of 3 letters? The object of the game is to guess the letter by asking ten questions or less.',
          ],
          examples: [
            'of questions to ask',
          ],
          extension: [
            'Another way to play is to cross out the eliminated letters using a dry erase marker. If using a temporary paper strip, the eliminated letters can be cut off. The last letter will remain.',
            'Alphabet Dice Roll and Name',
          ],
        },
      },
      {
        code: 'ind-alphabet-17',
        title: 'alphabet-18',
        subtitle: 'ind-alphabet-17',
        summary: 'Become more luent in naming letters',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 17,
        lesson: {
          materials: [
            'Alphabet Mat',
          ],
          aims: [
            'To become more luent in naming letters',
          ],
          presentation_steps: [
            'Teacher: Place the alphabet mat on the table. Student: Places the mat facing him so that the letters are clearly visible. Teacher: We will toss this ball to each other while naming the letters in ones, twos, or threes. Game #1 Teacher: Tosses the beanbag to the student and says A. Student: says B and tosses the beanbag back to the teacher. Continue until a player gets to Z. This game will inish in one round. Game #2 Players say two letters of the alphabet. "AB---CD---EF-" This game will inish in two rounds. Game #3 Players name three letters. "ABC---def---ghi -". This game will inish in three rounds.',
          ],
          examples: [],
          extension: [
            'This game can be done with cluster of 4-5 letters like: ABCD---EFGH-etc.',
          ],
        },
      },
      {
        code: 'ind-alphabet-18',
        title: 'Alphabet - Module 18',
        subtitle: 'ind-alphabet-18',
        summary: 'Alphabet module 18.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 18,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Complete Alphabet module 18.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-alphabet-19',
        title: 'Alphabet Talk',
        subtitle: 'ind-alphabet-19',
        summary: 'Learn to use the correct intonation while',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 19,
        lesson: {
          materials: [
            'Make small cards with punctuation marks',
            'for period, question, exclamation, and',
            'comma',
            'Sheet with letters written with punctuation',
            'marks*',
          ],
          aims: [
            'To learn to use the correct intonation while speaking, reading, and writing Introduction to punctuation marks Indirect introduction to reading',
          ],
          presentation_steps: [
            'Teacher: Today we will learn to use marks called punctuation marks to make meaning of sentences clear. These marks will help the listener and the reader understand what you are saying. These marks are used every day for writing. We will talk about four marks. (Note: Each letter is treated as a word or a syllable for this exercise.) Introduce one punctuation mark at a time. Period (.) Used to end a sentence. ABC. DEF. GHI. JKL. MNO. PQR. …………… Exclamation (!) Used to end a sentence that is exciting or said loudly! ABC! DEF! GHI! JKL! MNO! PQR!.............. Question mark (?) Used to ask a question. ABC? DEF? GHI? JKL? MNO? PQR?................ Comma (,) Can be used in many places to indicate a pause. ABC, DEF, GHI, JKL, MNO, PQR…………………. Once all the 4 marks are introduced, say a group of letters as if in conversation.',
          ],
          examples: [
            'on next page',
          ],
          extension: [
            'Read a book with punctuations and ask the students to use gestures for punctuations.',
            '*See examples on next page \'AL-19\'',
            'Alphabet Talk- AL-19',
            'ABC. DEF? GHI! JKL. LMN? OPQ! RST. UVW? XYZ! AB? CDE. FG! HIJ? KL. MNO! PQ? RST. UV! WX? YZ. abc! de. fgh? ijk! lmn? op. qrs? tuv! wx. yz?',
            'Variations:',
            'Conversation Abc de fgh, ij klm nop? Qrs, tuv, wxy z!',
            'This can be done using gestures. Make a ist for period, take a breath for comma, Hands up for exclamation, and hands in air for question',
            'Use the alphabet mat and students can come up with conversations with their partners.',
          ],
        },
      },
      {
        code: 'ind-alphabet-20',
        title: 'Alphabet Accent',
        subtitle: 'ind-alphabet-20',
        summary: 'Recite alphabet with accents with a',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 20,
        lesson: {
          materials: [
            'Alphabet mat',
          ],
          aims: [
            'To recite alphabet with accents with a visual reference Movements Indirect preparation for syllables Preparation for writing and reading',
          ],
          presentation_steps: [
            'Teacher: Says A B C D E F G H I J K L M N O PQRSTUVWXYZ I recited the alphabet with a change, what is it? Student: One was loud and other one was soft. Teacher: Yes, I said A louder and B softer. My voice went higher. This is called an Accent. In English words are said with an accent. Let us accent the irst and not accent the second and so on. ABCDEFGHIJKLMNOPQRSTUV WXYZ Next is to accent on the second letter and not on the irst. ABCDEFGHIJKLMNOPQRSTUV WXYZ This can be done looking at the mat. It can be done by jumping up for accent and on the loor for no accent ; Make it fun by doing movements.',
          ],
          examples: [
            'are said with an\naccent',
          ],
          extension: [
            'Say the alphabet in pairs (AB, CD)and accent the irst pair and not accent the second and so on. Say the alphabet in threes (ABC, DEF)and accent the irst and not the second chunk. Do these also with movements.',
          ],
        },
      },
      {
        code: 'ind-alphabet-21',
        title: 'Alphabet Triplets - Missing letter',
        subtitle: 'ind-alphabet-21',
        summary: 'Reinforce the sequence',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 21,
        lesson: {
          materials: [
            'Alphabet mat',
            'Alphabet deck with the end letter missing',
            '(ab--, cd--)',
          ],
          aims: [
            'Reinforce the sequence',
          ],
          presentation_steps: [
            'Teacher: Take out your alphabet mat. Student: Places the mat in front on the table. Teacher: Look at this card and name the sequence. (Even though only one letter is missing, the student will say the letters on the card and the missing letter.) Present it in order the irst time.',
            'g., abc, def, ghi, etc Student: Says abc, def, ghi, …… If the student accurately names the sequence, shuf le the cards and present the cards randomly.',
          ],
          examples: [],
          extension: [
            'This can be done with the irst letter missing or the middle card missing. This may be a challenge for some students.',
          ],
        },
      },
      {
        code: 'ind-alphabet-22',
        title: 'Alphabet Recognition',
        subtitle: 'ind-alphabet-22',
        summary: 'Recognition of letters',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 22,
        lesson: {
          materials: [
            'AL22a, AL22b, AL22c',
            'Charts on following pages*',
          ],
          aims: [
            'Recognition of letters',
          ],
          presentation_steps: [
            'Teacher: Holds up the chart one at a time. Name the letters on the chart going from left to right. Student: Names the letters from left to right. If the student is unable to recall, go back to the Alphabet modules to reinforce the names. Chart AL 22c is for making more reviews.',
          ],
          examples: [
            'from another',
            'introduction',
            'Concept of Consonants',
            'Concept of Vowels',
            'and Pre',
          ],
          extension: [
            '*See the charts on the next three pages \'AL 22a, AL 22b\'',
            'AL-22a Letter Recognition Chart',
            'A X V M D T Z B W Y K R C Q H S T P E N U V A X P I J L F G AL-22b Letter Recognition Chart',
            'a t k s u i',
            'x z r t v j',
            'v m n b w y c q h p e n a x p l f g',
            'AL-22c Letter Recognition Chart',
            'Phonics (P) Phonics is the relationship between the phonemes(sounds) and the graphemes (letters) that represent these sounds. This phonics knowledge is used to help to recognize words when reading and spell words when writing. A phoneme is the smallest unit of sound that distinguishes one word from another. Graphemes are the written representation of letters. In phonics instruction the student learn that the letter d makes the sound /d/. Students need to have a strong phonics base to become skilled readers. There are 26 graphemes but 45 phonemes as some letters have more than one sound. Phonics should be taught very systematically and explicitly. The letters are presented in the following order to students: m n h j w ch',
            't l g x u ck',
            'a i o e qu th',
            's r k v y th',
            'b f d z sh',
            'c p',
            '------------',
            'Red Yellow Green Orange Blue Purple',
            'All sounds are introduced using the three pathways - auditory, visual, kinesthetic, and tactile (VAKT)modes at the same time. When the information is received through more than one sensory pathway, there is an increased learning and retrieval. Sandpaper letters help to gain muscular memory of the shape of letters. Using a sand tray, rice, salt tray, foam or any other medium will ignite the multiple learning pathway in the brain. The sandpaper letters and the phonogram cards are color coded for the letters as noted above. It is ideal to start from the top cluster (red) and then move on to the next. Introduce three sounds each day to a student. The following day these sounds are reviewed and if the student shows progress, the next three sounds can be introduced. Each sound is reviewed at the start of every lesson. Hence new sounds are introduced while folding in the old sounds - systematic and cumulative. The Learning modules in this section address Phoneme introduction, Keyword introduction, Concept of Consonants, Concept of Vowels, and Pre-writing skills. Appendix 3 provides content for creation of Phonogram and Keyword cards that will be used in the learning modules presented in this section.',
          ],
        },
      },
    ],
  },
  {
    code: 'ind-phonics',
    title: 'Phonics (Individual)',
    description: 'Connect letters to sounds for reading and spelling',
    module_count: 7,
    is_locked: false,
    teaching_mode: 'individual' as const,
    display_order: 10,
    modules: [
      {
        code: 'ind-phonics-1',
        title: 'Sound Introduction-Day 1',
        subtitle: 'ind-phonics-1',
        summary: 'Develop auditory, visual, kinesthetic',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 1,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'To develop auditory, visual, kinesthetic perception of letter sounds',
          ],
          presentation_steps: [
            'Discovery Teacher: Take out your mirror. Look at your mouth in the mirror as you echo tiger, top, table. What initial sound do you hear in tiger, top, table? Student: Echoes tiger, top, table looking at the mirror. Says…… /t/ Teacher: Is the Air low blocked by the tongue, teeth, or lips? Student: Says tongue. Teacher: Shows the sandpaper letter t. This is letter \'t\' that makes the sound /t/. Shows the key word and sound card for letter t. t, table , /t/ Student: Echoes t, table, /t/ Teacher: Says that these special words trigger the sound of each letter. Trace the letter t while making the sound / t/. This is how we write it. Student: Echoes and traces the sound /t/. Be very precise in tracing the letter, using the irst and second ingers of your dominant hand**. Invite the student to take turns tracing the /t/ while saying the sound three times.',
          ],
          examples: [
            'and sound card for\nletter t',
          ],
          extension: [
            '*See card content in \'Appendix 3\' **Note: do not hold the student\'s hand to show how to trace as this causes muscular tensions. If the student has trouble, show it multiple times.',
          ],
        },
      },
      {
        code: 'ind-phonics-2',
        title: 'Sound Introduction-Day 2',
        subtitle: 'ind-phonics-2',
        summary: 'Develop auditory, visual, and kinesthetic',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 2,
        lesson: {
          materials: [
            'Sandpaper lowercase manuscript letters',
            'Keyword cards for letters t,m,a*',
          ],
          aims: [
            'To develop auditory, visual, and kinesthetic perception of letter sounds',
          ],
          presentation_steps: [
            'Discovery Teacher: Shows keyword and sound card for t to review. Student: Says t, table, /t/ Teacher: Today you will learn two new letter sounds. Take out your mirror. Look at your mouth in the mirror as you echo mitten, mop, monkey. What initial sound do you hear? Student: Echoes and says…… /m/ Teacher: Is the Air low blocked by the tongue, teeth, or lips? Student: Says lips. Teacher: Shows the sandpaper letter m. This is letter m that makes the sound /m/. Shows the key word and sound card for letter m. m, monkey , /m/ Student: Echoes m, monkey, /m/ Teacher: Trace the letter m while making the sound /m/. This is how we write it. Student: Echoes and traces the sound / m/. Repeat the whole procedure for a. Before a new sound introduction, review all the sounds done so far. Some students may only be able to take one introduction a day.',
          ],
          examples: [
            'and sound card for\nletter m',
          ],
          extension: [
            '*See Card Content in \'Appendix 3\'',
          ],
        },
      },
      {
        code: 'ind-phonics-3',
        title: 'Three Period Lesson',
        subtitle: 'ind-phonics-3',
        summary: 'Develop auditory, visual, and kinesthetic',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 3,
        lesson: {
          materials: [
            'Sandpaper lowercase manuscript letters',
            'Keyword cards for letters t,m,a*',
          ],
          aims: [
            'To develop auditory, visual, and kinesthetic perception of letter sounds',
          ],
          presentation_steps: [
            'When t,m,a are already presented, do a review of the sounds with a three-period lesson. Teacher: Places the three letters t, m, a on the table.',
            'Trace the letter /t/, /m/, /a/ as you say the sounds. Student: Traces /t/, /m/, /a/ while saying the sounds for each letter. Teacher: Asks student to point.',
            'Point to /m/, /t/, /a/ as you echo the sound. Student: Point to /m/, /t/, /a/ while echoing the sounds. Teacher: Points to /a/, /t/, /m/ and asks:',
            'What is this? Start with the last letter you asked him to point. Tracing, showing, asking are three components of the three-period lesson. The Three-period lesson can be thought of as association, recognition, recall.',
          ],
          examples: [],
          extension: [
            '*See Card Content in \'Appendix 3\'',
            'P -4',
          ],
        },
      },
      {
        code: 'ind-phonics-4',
        title: 'Skywriting',
        subtitle: 'ind-phonics-4',
        summary: 'Develop memory device to unlock the',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 4,
        lesson: {
          materials: [
            'Sandpaper letters',
            'Keyword and sound cards for the letters',
            'done the day before*',
          ],
          aims: [
            'To develop memory device to unlock the sounds Provides letter-sound connection Preparation for reading, writing',
          ],
          presentation_steps: [
            'Explain the **skywriting procedure to the student. Teacher: Lays the sandpaper letter t on the table and asks to trace t as you say t. Student: Traces the letter t while echoing the name t. Teacher: Shows the keyword card. Say the name, key word & sound as you skywrite. Student: Follows direction. Repeat the above procedures for m and a. (Practice and review this activity for two to three days until the student learns them. When the student is ready to move on, introduce new letters two or three at a time.)',
          ],
          examples: [
            'card',
          ],
          extension: [
            '*See Card Content in \'Appendix 3\' ** Skywriting is a process that uses the whole body to learn to write the letters. It is done with the dominant hand. It involves the use of large muscles of the upper arm and shoulders. The movement of these muscles produces a strong neurological imprint of letter shapes (Waites & Cox, 1976). The hand is stretched out, fully locked, in front of the student. Two of the ingers (pointer and middle ingers) are extended to write large letters in the air while saying the name of the letter. This develops strong muscle memory.',
          ],
        },
      },
      {
        code: 'ind-phonics-5',
        title: 'Foam Sticks in a Jar Game',
        subtitle: 'ind-phonics-5',
        summary: 'Reinforce the beginning sounds',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 5,
        lesson: {
          materials: [
            'Foam Sticks with the letters written',
            'Objects (Optional)',
          ],
          aims: [
            'To reinforce the beginning sounds To develop auditory and visual memory Preparation for reading',
          ],
          presentation_steps: [
            'Bring color coded foam sticks with the letters written on them. Only use the letters that have been presented. Teacher: Pick a stick and say the name, keyword, and the sound of the letter. Student: Picks t. Says the name, kw, sound. Teacher: Pick another letter. Student: Picks m. Says the name, kw, sound. This continues until there are no more sticks in the jar.',
          ],
          examples: [
            'beginning with this sound',
          ],
          extension: [
            'For an added variation the student will pick a stick, say the name, and give two more words, beginning with this sound. Do the above activity folding in more letters as the student is presented with newer letter sounds. Bring objects with these beginning sounds and ask to sort them out according to the foam stick that is picked.',
          ],
        },
      },
      {
        code: 'ind-phonics-6',
        title: 'The Phonogram Card Game',
        subtitle: 'ind-phonics-6',
        summary: 'Visual and auditory reinforcement of the',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 6,
        lesson: {
          materials: [
            'Phonogram cards of the letters already',
            'presented*',
          ],
          aims: [
            'Visual and auditory reinforcement of the beginning sounds Preparation for reading, writing',
          ],
          presentation_steps: [
            'Bring the cards of the letters presented to the table. Teacher: Holds up the card one at a time. Give me the name, keyword, and sound as you skywrite. Student: Looks at the card and says the name, keyword, and the sound of each letter as he skywrites. This continues until there are no more cards.',
          ],
          examples: [
            'and sound',
          ],
          extension: [
            'Place all the cards done so far, face down. Student will pick up one card at a time and say the name, keyword, and sound. Second extension is for the teacher to give the key word and sound and ask the student to guess the name of the letter. Another variation will be for the teacher to give the name and ask the student to respond with the keyword and sound.',
            '*See Card content in \'Appendix 3\'',
            'The Picture Game',
          ],
        },
      },
      {
        code: 'ind-phonics-7',
        title: '197 P-8',
        subtitle: 'ind-phonics-7',
        summary: 'Practice and develop skills through 197 P-8.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 7,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through 197 P-8.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
    ],
  },
  {
    code: 'ind-reading',
    title: 'Reading (Individual)',
    description: 'Develop decoding and reading skills',
    module_count: 8,
    is_locked: false,
    teaching_mode: 'individual' as const,
    display_order: 11,
    modules: [
      {
        code: 'ind-reading-1',
        title: 'reading-2',
        subtitle: 'ind-reading-1',
        summary: 'Learn forming words',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 1,
        lesson: {
          materials: [
            'sets of lower-case plastic letters with',
            'extra purple vowels (m, t, a, s, b, c)',
          ],
          aims: [
            'To learn forming words Preparation for reading, writing, spelling Vocabulary development',
          ],
          presentation_steps: [
            'When the student is successful with R-1 module, move on to R-2. Review body coda for words with /a/ in the medial position. Teacher: We will build more words today. Places /a/ one below the other on the table. E.g., tac, tam, tas, tab, tat Keep the initial sounds constant and change only the inal sounds to make words. Teacher: Make /ta-/. Student: Places /t/ to the left of /a/ and runs the hand under and echoes /ta/. Teacher: Make /ta/ to /tab/. Student: Places /b/ in the inal position and runs hand under left to right and reads /tab/. Let the student read from left to right after building the body and inish with coda and read again. This is repeated for several days and when they are ready, begin giving words with vowel /a/ constant and changing the initial and inal //s. E.g., cam, tab, sat, bat, mat, cat, etc.',
          ],
          examples: [
            'with',
            'today',
            'with vowel',
            'Patterns',
          ],
          extension: [
            'Word Patterns-3',
          ],
        },
      },
      {
        code: 'ind-reading-2',
        title: 'Reading - Module 2',
        subtitle: 'ind-reading-2',
        summary: 'Reading module 2.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 2,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Complete Reading module 2.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-reading-3',
        title: '206 R-4',
        subtitle: 'ind-reading-3',
        summary: 'Practice and develop skills through 206 R-4.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 3,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through 206 R-4.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-reading-4',
        title: 'Word Builders',
        subtitle: 'ind-reading-4',
        summary: 'Focus on word building',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 4,
        lesson: {
          materials: [
            'Objects with short vowels (cvc) words',
            'Pictures with short vowel (cvc) words*',
            'sets of lower-case plastic letters with',
            'extra vowels',
            'Star card with three spaces**',
          ],
          aims: [
            'Focus on word building Preparation for reading, writing, spelling Vocabulary development',
          ],
          presentation_steps: [
            'Start with objects with vowel /a/constant. Build the words on the star card. Teacher: Places pictures on the table. Teacher: Pointing to the object cat, asks, what is the body coda for /cat/? /ca/ /t/. Let us build /ca/ irst. What is the initial sound of /ca/? Student: /c/ and will place the /c/. Teacher: What is the next sound in /ca/? Student: /a/ Teacher: What is the inal sound? Student: /t/ Teacher: Runs hand under from left to right and reads /cat/. Student: Will do the same. Continue with the other pictures. This exercise is repeated for several days with all the other vowels taking one vowel at a time. When the students hear the initial, inal and the medial sounds, they are ready to move on to mixed vowel sounds.',
          ],
          examples: [
            'on the star card',
          ],
          extension: [
            'The above can be done with pictures in \'CS-4\' too.',
            '*See pictures titled \'CS-4\'',
            '**See card template titled \'IS-6\'',
          ],
        },
      },
      {
        code: 'ind-reading-5',
        title: 'CVC Words',
        subtitle: 'ind-reading-5',
        summary: 'Writing cvc words',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 5,
        lesson: {
          materials: [
            'List of two/three letter words*',
            'Star Card with three spaces**',
          ],
          aims: [
            'Writing cvc words Auditory reinforcement Preparation for spelling, reading, writing',
          ],
          presentation_steps: [
            'Teacher: Today we are going to practice writing more words. I will dictate words and you will echo and pull down the sounds and read. The word is \'mad\' saying each sound distinctly, \'ma d.\' Student: Echoes ma d and pull down a letter for each sound from left to right. Student will read by running hands under from left to right. Teacher can use a pattern of words ending in the same sounds; or with same vowels and keeping the initial letter different in the beginning. This exercise should be repeated many times with CVC words. Do not use digraphs or blends at this time.',
          ],
          examples: [
            'ending\nin the same sounds',
            'on next page',
          ],
          extension: [
            'Use pictures/objects to do the above. Show a picture to the students and ask them to name it. Now ask them to pull down a letter for each sound they hear in the name.',
            '*See examples on next page \'R-5\' **See card template titled \'IS-6\' List of words (R-5) Cat',
            'bin',
            'bud',
            'mop',
            'ben',
            'Bat',
            'tin',
            'mud',
            'top',
            'ten',
            'Sat',
            'cud',
            'lop',
            'den',
            'Mat',
            'din',
            'dud',
            'hop',
            'ken',
            'Fat',
            'pin',
            'sud',
            'pop',
            'hen',
            'Can',
            'pig',
            'but',
            'god',
            'bet',
            'Cab',
            'pit',
            'bun',
            'got',
            'ben',
            'Cat',
            'pin',
            'bug',
            'gon',
            'beg',
            'Dan',
            'rip',
            'sun',
            'fog',
            'den',
            'Mad',
            'lit',
            'mud',
            'bod',
            'pet',
          ],
        },
      },
      {
        code: 'ind-reading-6',
        title: 'Secret Word Game',
        subtitle: 'ind-reading-6',
        summary: 'Reading cvc words',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 6,
        lesson: {
          materials: [
            'List of two/three letter words and some',
            'words \'POP\' printed on small cards',
          ],
          aims: [
            'Reading cvc words Visual reinforcement Preparation for spelling, reading',
          ],
          presentation_steps: [
            'This game must be played when the student has done some of the Reading Exercises that are done below. This is a good review. Teacher: Places the printed cards in a bag or a box. Student: Puts his hand in and picks one card at a time and reads. He gets one point for every correct word read. After reading he places the cards outside the bag. If he get the card with \'POP\' then he places all the cards that he won back in the bag. If he doesn\'t read it correctly, he puts the cards back in the bag. Teacher: Takes a turn to pick and read and follows the same rule. The game is done when everything has been read.',
          ],
          examples: [
            'read',
          ],
          extension: [
            'Building Syllable game',
          ],
        },
      },
      {
        code: 'ind-reading-7',
        title: 'reading-8',
        subtitle: 'ind-reading-7',
        summary: 'Auditory discrimination of vowel sounds',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 7,
        lesson: {
          materials: [
            'Lower case consonant letters (red) with',
            'vowels (either red or purple)',
          ],
          aims: [
            'Auditory discrimination of vowel sounds Reading cvc words Vowel reinforcement Preparation for spelling, reading',
          ],
          presentation_steps: [
            'This game must be played when the students have done some of the Reading Exercises. Teacher: Make the word /tap/. Student: Echoes and makes the word /tap/. Teacher: Now switch /tap/ to /tip/. Student: Echoes and switches /tap/ to / tip/. Teacher: Now switch /tip/ to /top/. Student: Echoes /top/ and switches /tip/ to /top/. Teacher: Switch /top/ to /tup/. Student: Echoes /tup/ and switches /top/ to /tup/. Teacher: Switch /tup/ to /tep/. Student: Echoes /tep/ and switches /tup/ to /tep/. Review with several words.',
          ],
          examples: [
            'nonsense words',
            'multisyllabic words',
            'phrases',
            'nonsense\nwords',
            'phrases',
            'and sentences',
            'provide vocabulary',
            'comprehension',
            'and luency',
            'and sentences luently',
          ],
          extension: [
            '.1 Reading Exercises (RE) The following Learning modules provide an array of words, nonsense words, multisyllabic words, phrases, sentences for students to read. Each reading page has base words, nonsense words, phrases, and sentences. Sight words have also been added to this group. Some common rules have been identi ied. These words provide vocabulary, comprehension, and luency. When students read the words, and sentences luently, introduce them to the set of books called "Mac and Tab" Series 1, 1A by EPS1 or similar sets of your choice. They are written with \'cvc\' and \'vc\' words and with short stories that the children enjoy reading. There are 2 sets with 10 books in each set. This provides suf icient practice with vocabulary, comprehension, and luency.',
            'http://eps.schoolspecialty.com/',
          ],
        },
      },
      {
        code: 'ind-reading-8',
        title: 'Reading - Module 8',
        subtitle: 'ind-reading-8',
        summary: 'Reading module 8.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 8,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Complete Reading module 8.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
    ],
  },
  {
    code: 'ind-reading-exercises',
    title: 'Reading Exercises (Individual)',
    description: 'Practice reading with guided exercises',
    module_count: 9,
    is_locked: false,
    teaching_mode: 'individual' as const,
    display_order: 12,
    modules: [
      {
        code: 'ind-reading-exercises-1',
        title: 'New introduction: m, t, a',
        subtitle: 'ind-reading-exercises-1',
        summary: 'Practice and develop skills through New introduction: m, t, a.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 1,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through New introduction: m, t, a.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-reading-exercises-2',
        title: 'Review: m, t, a New introduction: s, b, c',
        subtitle: 'ind-reading-exercises-2',
        summary: 'Practice and develop skills through Review: m, t, a New introduction: s, b, c.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 2,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Review: m, t, a New introduction: s, b, c.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-reading-exercises-3',
        title: 'Review: m, t, a, s, b, c New introduction: n, l, i',
        subtitle: 'ind-reading-exercises-3',
        summary: 'Practice and develop skills through Review: m, t, a, s, b, c New introduction: n, l, i.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 3,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Review: m, t, a, s, b, c New introduction: n, l, i.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-reading-exercises-4',
        title: 'Review: m, t, a, s, b, c, n, l, i New introduction: r, f, p 219 in',
        subtitle: 'ind-reading-exercises-4',
        summary: 'Practice and develop skills through Review: m, t, a, s, b, c, n, l, i New introduction: r, f, p 219 in.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 4,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Review: m, t, a, s, b, c, n, l, i New introduction: r, f, p 219 in.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-reading-exercises-5',
        title: 'Review: m, t, a, s, b, c, n, l, i, r, f, p New introduction: h, g, o',
        subtitle: 'ind-reading-exercises-5',
        summary: 'Practice and develop skills through Review: m, t, a, s, b, c, n, l, i, r, f, p New introduction: h, g, o.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 5,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Review: m, t, a, s, b, c, n, l, i, r, f, p New introduction: h, g, o.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-reading-exercises-6',
        title: 'Review: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o New Introduction: k, d 225',
        subtitle: 'ind-reading-exercises-6',
        summary: 'Practice and develop skills through Review: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o New Introduction: k, d 225.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 6,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Review: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o New Introduction: k, d 225.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-reading-exercises-7',
        title: 'Review: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o, k, d New introduction: j, x, e, v, z',
        subtitle: 'ind-reading-exercises-7',
        summary: 'Practice and develop skills through Review: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o, k, d New introduction: j, x, e, v, z.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 7,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Review: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o, k, d New introduction: j, x, e, v, z.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-reading-exercises-8',
        title: 'Review: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o, k, d, j, x, e, v, z New Introduction: w, u, y, qu',
        subtitle: 'ind-reading-exercises-8',
        summary: 'Practice and develop skills through Review: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o, k, d, j, x, e, v, z New Introduction: w, u, y, qu.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 8,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Review: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o, k, d, j, x, e, v, z New Introduction: w, u, y, qu.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-reading-exercises-9',
        title: 'Review: ch, ck, th, th, sh',
        subtitle: 'ind-reading-exercises-9',
        summary: 'Practice and develop skills through Review: ch, ck, th, th, sh.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 9,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Review: ch, ck, th, th, sh.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
    ],
  },
  {
    code: 'ind-handwriting',
    title: 'Handwriting (Individual)',
    description: 'Develop proper letter formation and handwriting skills',
    module_count: 10,
    is_locked: false,
    teaching_mode: 'individual' as const,
    display_order: 13,
    modules: [
      {
        code: 'ind-handwriting-1',
        title: '243 HW-2',
        subtitle: 'ind-handwriting-1',
        summary: 'Practice and develop skills through 243 HW-2.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 1,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through 243 HW-2.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-handwriting-2',
        title: 'Different Shapes',
        subtitle: 'ind-handwriting-2',
        summary: 'Introduce the different shapes found in',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 2,
        lesson: {
          materials: [
            'Pipe cleaners in the following shapes',
            'Horizontal, vertical',
            'Up-down, full circle, half circle',
            'Diagonal, crisscross',
            'Song sheet*',
          ],
          aims: [
            'To introduce the different shapes found in different letters Indirect preparation to reading and writing',
          ],
          presentation_steps: [
            'This is a very important prerequisite to handwriting. Teacher: Holds up Horizontal shaped pipe cleaner. Asks student to hold up his horizontal shape. Say Horizontal. Teacher continues with 2-3 shapes each day. Review the shapes before giving names of the new shapes. This is \'Horizontal\' This is \'Up-down\' This is \'Diagonal\' This is \'Criss-Cross" (with 2 diagonals) This is \'Half circle\' This is \'Full Circle\' This is \'Camel hump\' These are the strokes and curves used to make all the manuscript letters. Do a 3-period lesson with these strokes. Practice this for a few days. Use the song sheet* to sing the different shapes. Kids learn quickly through songs.',
          ],
          examples: [
            'on next page',
          ],
          extension: [
            'Can be practiced with \'wikki stix\'. The student can make the different shapes. The student can be encouraged to make these shapes with own body for variation.',
            '* See example on next page \'HW-2\'',
            'Handwriting Shape Song (HW-2) (Sung to the tune of Frere Jacques) Horizontal, Horizontal Up-down, Up-down Diagonal, Diagonal Criss-cross; Criss-cross Full circle, Full circle Half circle, Half circle Camel hump; camel hump Helps to learn The shapes of all letters',
          ],
        },
      },
      {
        code: 'ind-handwriting-3',
        title: 'Gross Motor Activities',
        subtitle: 'ind-handwriting-3',
        summary: 'Work on the gross motor skills',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 3,
        lesson: {
          materials: [
            'Chalk board /Dry erase board',
            'Large newsprint paper',
            'Chalk/crayons/paints/markers',
          ],
          aims: [
            'Work on the gross motor skills Feel the movement in the shoulder and arm and thus improve the kinesthetic memory',
          ],
          presentation_steps: [
            'Notes to the Teacher Practice one stroke per day. Each stroke is practiced for a few days before moving on to the next stroke. Repeat this process multiple times. Using large whole arm movements help improve kinesthetic memory. Teacher shows how to make:',
            'Up and down strokes',
            'Down and up strokes',
            'Circle strokes',
            'Half circle strokes',
            'Diagonal strokes',
            'Hump strokes These strokes can be practiced by using :',
            'Large strokes in the air using straight arms',
            'Long strokes on the chalk board/ Dry erase board',
            'Wet sponge on chalk board',
            'With inger paints',
            'Large unlined paper with crayons',
            'Wide lined paper',
          ],
          examples: [],
          extension: [
            'Sand tray can be used Tray with shaving cream is another option Paper with different texture can be used',
          ],
        },
      },
      {
        code: 'ind-handwriting-4',
        title: 'Drawing geometric shapes',
        subtitle: 'ind-handwriting-4',
        summary: 'Aids in control of pencil',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 4,
        lesson: {
          materials: [
            'Geometric shape stencils',
          ],
          aims: [
            'Aids in control of pencil Muscular movements to form letters Work on the ine motor skills Eye-hand coordination Vocabulary development',
          ],
          presentation_steps: [
            'Have simple geometric shape stencils. Begin with the simplest shape like a triangle or circle. Teacher: Names the shape while pointing to a shape e.g., Circle. Student: Echoes the name of the shapeCircle. Teacher: Trace the shape with your hand three times. Student: Traces the shape with hand three times. Teacher: Echo the name and trace the circle with a crayon three times. Student: Echoes and traces three times. Teacher: Colors the circle with up and down strokes and asks the student to follow the same procedure. Student will repeat this lesson with many different shapes.',
          ],
          examples: [],
          extension: [
            'Introduce other shapes Superimpose 2-3 different shapes and color Show gradation of color',
            'Good Posture & Correct Pencil Grip',
          ],
        },
      },
      {
        code: 'ind-handwriting-5',
        title: '250 HW-6',
        subtitle: 'ind-handwriting-5',
        summary: 'Practice and develop skills through 250 HW-6.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 5,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through 250 HW-6.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-handwriting-6',
        title: 'Lines on Paper',
        subtitle: 'ind-handwriting-6',
        summary: 'Teach the three lines on the lined paper',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 6,
        lesson: {
          materials: [
            'Lined paper and pencil',
            'Chalk/dry erase board with lines',
          ],
          aims: [
            'To teach the three lines on the lined paper',
          ],
          presentation_steps: [
            'Teacher introduces the three lines on paper with a three-period lesson. First period: Teacher introduces the terminologies. \'Top Line\': Echo and trace the top line with the index inger from left to right to the end of the line. The middle line is called, \'Mid Line\': Echo and trace from left to right to the end of the line. The bottom line is called, \'Base Line\': Echo and trace from left to right to the end of the line. Second period: Teacher says, \'show me\' the top line, the midline and the base lines. Third period: Teacher points to the base, mid, top lines and asks the student, \'what is this?\' This must be reinforced every day before the start of handwriting practice.',
          ],
          examples: [],
          extension: [
            'The above can be done on a board with dry erase markers or \'Wikki Stix\'.',
          ],
        },
      },
      {
        code: 'ind-handwriting-7',
        title: 'Tall, Short, Under Letters',
        subtitle: 'ind-handwriting-7',
        summary: 'Teach the different sizes of letters',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 7,
        lesson: {
          materials: [
            'Lined paper and pencil',
            'Chalk/dry erase board with lines',
          ],
          aims: [
            'To teach the different sizes of letters',
          ],
          presentation_steps: [
            'Teacher: Places a lined paper in front of the student. There are different sizes of letters. Tall , Short, and Down letters. Teacher: Touch the top line and echo tall letter and show the motion thumbs up. Student: Touches the top line & echoes Tall letter and shows thumbs up. Teacher: Touch the mid line and echo Short letter and show closed ist. S: touches the midline & echoes Short letter showing closed ist. Teacher: Touch the mid line and go down below the baseline and echo Down letter and show the motion thumbs down. Student: goes from mid line to below the base line and echoes Down letter and shows thumbs down. Do a 3-Period Lesson.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-handwriting-8',
        title: 'Drawing the Strokes',
        subtitle: 'ind-handwriting-8',
        summary: 'Teach the different lines for writing on',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 8,
        lesson: {
          materials: [
            'Wide lined paper and pencil',
          ],
          aims: [
            'To teach the different lines for writing on the lined paper',
          ],
          presentation_steps: [
            'After several practices with chalk board, unlined paper student is ready to start with wide lined paper practice. Each stroke must be introduced one day at a time. Before introducing the next stroke, review the previous stroke. If the student is ready, introduce the next stroke. Teacher: Lower case print letters start from the top. Today you will learn the short horizontal stroke. Skywrite and echo horizontal, going from left to right. Write with your pencil while echoing the name. Student: Echoes horizontal and skywrites from left to right on the mid line. Echoes and writes with the pencil.',
            'Short horizontal stroke on midline Follow the strokes below each day and review before introducing a new stroke.',
            'Tall up-down (vertical) stroke from topline to baseline.',
            'Short up-down (vertical) stroke from midline to baseline.',
            'Down letters from midline to below the baseline.',
            'Half circles on the midline.',
            'Full circles on the midline.',
            'Camel humps on the midline. This lesson will go on for several days before the writing of letters.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-handwriting-9',
        title: 'Letter Forms and Groups',
        subtitle: 'ind-handwriting-9',
        summary: 'Teach the letters grouped by similar',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 9,
        lesson: {
          materials: [
            'Wide-lined paper',
            'Pencil',
          ],
          aims: [
            'Teach the letters grouped by similar strokes Preparation for writing Notes to the Teacher The letters are grouped from the simplest to write to more complex. This is a sample group. You may follow whichever suits you. l, t, i h, m, n, u, y b, p, o, s a, c, d, e, g, q r, f, j v, w, x, k, z While giving the mantra for each letter, follow the stroke terminologies taught earlier. Student should repeat as they write. Remind the student that these lower-case letters will start at the top. For example: letter \'b\' - \'down, up, and around\'; letter \'m\' - \'down, camel hump one, camel hump two.\' Teacher: Traces a letter irst with the mantra on paper. Student: Echoes and Traces the letter three times and makes a copy next to it. Now he will make copy from memory TCM-(Trace, copy, memory). Student only writes the same letter about 5 times and moves on to the next.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [
            'For review, skywrite and then write on paper. Repeat as many times as needed.',
            '* See description on next page \'HW-9\'',
            'Handwriting Stroke Description (HW-9) Name',
            'description',
            'tall/short/down letters',
            'half-circle, up, down',
            '*short',
            'down, up, & around',
            '*tall',
            'half-circle',
            'short',
            'half-circle, up to top, down',
            'tall',
            'horizonal, half-circle around',
            'short',
            'hook, down & cross',
            'tall',
            'half-circle, up, down below, hook',
            '*down',
            'down, camel hump',
            'tall',
            'down, dot',
            'short',
            'down below, hook left, dot',
            'down',
            'down, diagonal in, diagonal out',
            'tall',
            'down',
            'tall',
            'down, camel hump 1, camel hump 2',
            'short',
            'down, camel hump 1',
            'short',
            '*Tall: goes from the top line to base line - Thumbs up *Short: goes from mid-line to base line - Closed ist *Down: starts from mid-line and goes under the base line - Thumbs down',
            'Name',
            'description',
            'tall/short/under letters',
            'full circle',
            'short',
            'down, up, & around',
            'down',
            'half-circle, up, down below',
            'down',
            'down, up, hook right',
            'short',
            'hook, diagonal, hook',
            'short',
            'down, cross',
            'tall',
            'down, curve up, down',
            'short',
            'diagonal down, diagonal up',
            'short',
            'diagonals - down, up, down, up',
            'short',
            'crisscross',
            'short',
            'diagonal down, diag. up, down below',
            'down',
            'horizontal, diagonal, horizontal',
            'short',
            '*Tall: goes from the top line to base line - Thumbs up *Short: goes from mid-line to base line - Closed ist *Down: starts from mid-line and goes under the base line - Thumbs down',
          ],
        },
      },
      {
        code: 'ind-handwriting-10',
        title: 'Practice, Practice, Practice',
        subtitle: 'ind-handwriting-10',
        summary: 'Practice all the Lower Case and UpperCase letters',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 10,
        lesson: {
          materials: [
            'Wide-lined paper, pencil',
          ],
          aims: [
            'To practice all the Lower Case and UpperCase letters Preparation for writing',
          ],
          presentation_steps: [
            'Notes to the Teacher Give the student a journal. Give a sample of upper and lower-case letters. In the beginning, student must write lower case letters only following the lines in the journal. After mastery of the lower-case letters, move on to the upper-case letters. After mastery of the upper-case letters, write upper and lower-case letters together. This can go on until they are ready to do spelling words and sentences.',
          ],
          examples: [
            'and sentences',
          ],
          extension: [
            'Subsection B : Cursive Why cursive? Cursive letters eliminate the need to decide where to begin to write each letter and in which direction you must proceed. It also provides directional left-to-right energy and emphasis on spatial letter sequence. Cursive reduces the inclination to reverse direction by eliminating the need to raise the writing instrument between letters in a word. It provides unique letter shapes which are NOT mirror images of other letters. Finally, cursive writing helps to promote lowing, rhythmical movements which the student can execute more easily than the short, stilted lines and arcs of manuscript printing.',
            'Pre-writing skills',
          ],
        },
      },
    ],
  },
  {
    code: 'ind-spelling',
    title: 'Spelling (Individual)',
    description: 'Learn spelling patterns and rules',
    module_count: 9,
    is_locked: false,
    teaching_mode: 'individual' as const,
    display_order: 14,
    modules: [
      {
        code: 'ind-spelling-1',
        title: 'Listen to the Sounds',
        subtitle: 'ind-spelling-1',
        summary: 'Auditory reinforcements',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 1,
        lesson: {
          materials: [
            'Paper',
            'Pencil',
          ],
          aims: [
            'Auditory reinforcements Preparation for writing words, phrases and sentences on paper',
          ],
          presentation_steps: [
            'After about 4-5 sounds have been introduced the teacher can start giving two letter words to become familiar with the procedures. Teacher: Watch my mouth as I say the sound and echo the sound as you write. Say /a/. Student: Echoes and writes /a/ while sounding the letter. (Student must have eye contact with the teacher when the sound is dictated.) Student: Looks up at the teacher and waits for the next sound. Teacher: Dictates /t/ Student: Echoes and writes /t/ while sounding the letter. Teacher: Read the word that is written. Student: Reads the word /at/. Reading what is written is critical for student to develop as it leads to accurate proof-reading habits. Correcting errors by proof-reading should be encouraged. Give words using only the sounds that have been covered so far.',
          ],
          examples: [
            'that is written',
          ],
          extension: [
            'None',
          ],
        },
      },
      {
        code: 'ind-spelling-2',
        title: 'Finger Tapping',
        subtitle: 'ind-spelling-2',
        summary: 'Kinesthetic reinforcement of spelling',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 2,
        lesson: {
          materials: [
            'Paper',
            'Pencil',
          ],
          aims: [
            'Kinesthetic reinforcement of spelling words Preparation for spelling sentences and stories Sound spelling ( VC and CVC )words on paper',
          ],
          presentation_steps: [
            'Teacher: Look at my mouth and echo the word /am/ Student: Echoes /am/ Teacher: Using the non-dominant hand, tap each sound using the ingertips on the table starting with the pinky. Student: taps /a/ with pinky and /m/ with ringer while saying the sounds. Teacher: Say the word. Student: /am/ Teacher: Now sound as you write the word. Student: /a/ /m/ Teacher: Read the word that is written. Student: /am/ If the student is left-handed, use the right hand for tapping starting from the thumb. This is a very kinesthetic reinforcement of spelling. Reading what is written is critical for student to develop as it leads to accurate proof-reading habits. Correcting errors by proof-reading should be encouraged.',
          ],
          examples: [
            'that is written',
          ],
          extension: [
            'None',
          ],
        },
      },
      {
        code: 'ind-spelling-3',
        title: 'Sound Out',
        subtitle: 'ind-spelling-3',
        summary: 'Auditory reinforcement',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 3,
        lesson: {
          materials: [
            'Paper',
            'Pencil',
          ],
          aims: [
            'Auditory reinforcement Preparation for writing sentences and stories Sound spelling (VC and CVC) words on paper',
          ],
          presentation_steps: [
            'The inal goal for each student is to master this procedure and use it for all writing. Teacher: Look at my mouth and echo the word /am/ Student: Echoes /am/ Teacher: Now sound out as you write the word /am/. Student: /a/ /m/ Teacher: Read the word that is written. Student: /am/ Reading what is written is critical for student to develop as it leads to accurate proof-reading habits. Correcting errors by proof-reading should be encouraged.',
          ],
          examples: [
            'that is written',
          ],
          extension: [
            'None',
            'S-4a',
          ],
        },
      },
      {
        code: 'ind-spelling-4',
        title: 'What are Phrases and Sentences?',
        subtitle: 'ind-spelling-4',
        summary: 'Understanding of phrases, sentences',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 4,
        lesson: {
          materials: [
            'Paper',
            'Pencil',
          ],
          aims: [
            'Understanding of phrases, sentences Preparation for reading and writing',
          ],
          presentation_steps: [
            'Phrases are two or more words that do not contain the subject-predicate to communicate a complete thought. A Phrase is incomplete on its own. A phrase can be short or long. An example: on the bed A Phrase does not begin with a capital letter or end in punctuation. Sentences are a group of words that are put together to mean something. It expresses a complete thought. (Taken from Wikipedia) A Sentence always begins with a capital letter and ends in punctuation depending upon the sentence. An example: A cat sat on the bed.',
          ],
          examples: [
            'A cat sat on the bed',
          ],
          extension: [
            'None',
            'S-4b',
          ],
        },
      },
      {
        code: 'ind-spelling-5',
        title: 'Multi Syllables',
        subtitle: 'ind-spelling-5',
        summary: 'Auditory reinforcement for spelling two or',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 5,
        lesson: {
          materials: [
            'Paper and pencil',
            'Rectangular foams representing syllables',
          ],
          aims: [
            'Auditory reinforcement for spelling two or more syllables on paper',
          ],
          presentation_steps: [
            'This procedure can be done with foams or head bobbing or using arms or hands. Teacher: Says the word /catnip/ slowly but naturally. Student: Echoes the syllable /catnip/. Teacher: How many syll. are in /catnip/? Student: Two syllables Teacher: Place one felt for each syllable - cat / nip Student: Places the two rectangular foams for each syllable while saying the syllable - cat / nip Teacher: Point to the irst syllable and say the syllable and write it as you sound spell. Student: Points to the left most foam and says /cat/ and writes while sounding it out. If both syllables can be spelled, follow similar procedure as above for the second syllable. Student: After both the syllables are written, student reads the whole syllable, cat/nip.',
          ],
          examples: [
            'and sentences',
          ],
          extension: [
            'None',
            '.1 Spelling Exercises (SE) Learning modules in this section help students to practice spelling of words and sentences. The procedures described in Section 6 are used in these modules. Note: Before sounds are presented in the spelling exercises in these learning modules, students must have completed the reading and handwriting phases of the sounds.',
            'SE - 1',
          ],
        },
      },
      {
        code: 'ind-spelling-6',
        title: 'Letter review (3 Min.):',
        subtitle: 'ind-spelling-6',
        summary: 'Practice and develop skills through Letter review (3 Min.):.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 6,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Letter review (3 Min.):.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-spelling-7',
        title: 'Spelling - Module 7',
        subtitle: 'ind-spelling-7',
        summary: 'Spelling module 7.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 7,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Complete Spelling module 7.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-spelling-8',
        title: 'Spelling - Module 8',
        subtitle: 'ind-spelling-8',
        summary: 'Spelling module 8.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 8,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Complete Spelling module 8.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-spelling-9',
        title: 'Spelling - Module 9',
        subtitle: 'ind-spelling-9',
        summary: 'Spelling module 9.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 9,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Complete Spelling module 9.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
    ],
  },
  {
    code: 'ind-spelling-exercises',
    title: 'Spelling Exercises (Individual)',
    description: 'Practice spelling with guided exercises',
    module_count: 9,
    is_locked: false,
    teaching_mode: 'individual' as const,
    display_order: 15,
    modules: [
      {
        code: 'ind-spelling-exercises-1',
        title: 'Presented sounds: m, t, a Listen to the Sounds: Finger Tapping:',
        subtitle: 'ind-spelling-exercises-1',
        summary: 'Practice and develop skills through Presented sounds: m, t, a Listen to the Sounds: Finger Tapping:.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 1,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Presented sounds: m, t, a Listen to the Sounds: Finger Tapping:.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-spelling-exercises-2',
        title: 'Presented sounds: m, t, a, s, b, c Listen to the Sounds:',
        subtitle: 'ind-spelling-exercises-2',
        summary: 'Practice and develop skills through Presented sounds: m, t, a, s, b, c Listen to the Sounds:.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 2,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Presented sounds: m, t, a, s, b, c Listen to the Sounds:.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-spelling-exercises-3',
        title: 'Presented sounds: m, t, a, s, b, c, n, l, i Listen to the Sounds:',
        subtitle: 'ind-spelling-exercises-3',
        summary: 'Practice and develop skills through Presented sounds: m, t, a, s, b, c, n, l, i Listen to the Sounds:.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 3,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Presented sounds: m, t, a, s, b, c, n, l, i Listen to the Sounds:.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-spelling-exercises-4',
        title: 'Presented sounds: m, t, a, s, b, c, n, l, i, r, f, p Listen to the Sounds:',
        subtitle: 'ind-spelling-exercises-4',
        summary: 'Practice and develop skills through Presented sounds: m, t, a, s, b, c, n, l, i, r, f, p Listen to the Sounds:.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 4,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Presented sounds: m, t, a, s, b, c, n, l, i, r, f, p Listen to the Sounds:.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-spelling-exercises-5',
        title: 'Presented sounds: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o Listen to the Sounds:',
        subtitle: 'ind-spelling-exercises-5',
        summary: 'Practice and develop skills through Presented sounds: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o Listen to the Sounds:.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 5,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Presented sounds: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o Listen to the Sounds:.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-spelling-exercises-6',
        title: 'Presented sounds: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o, k, d Listen to the Sounds:',
        subtitle: 'ind-spelling-exercises-6',
        summary: 'Practice and develop skills through Presented sounds: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o, k, d Listen to the Sounds:.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 6,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Presented sounds: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o, k, d Listen to the Sounds:.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-spelling-exercises-7',
        title: 'Presented sounds: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o, k, d, j, x, e, v, z Listen to the Sounds:',
        subtitle: 'ind-spelling-exercises-7',
        summary: 'Practice and develop skills through Presented sounds: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o, k, d, j, x, e, v, z Listen to the Sounds:.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 7,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Presented sounds: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o, k, d, j, x, e, v, z Listen to the Sounds:.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-spelling-exercises-8',
        title: 'Presented sounds: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o, k, d, j, x, e, v, z w, u, y, qu Listen to the Sounds:',
        subtitle: 'ind-spelling-exercises-8',
        summary: 'Practice and develop skills through Presented sounds: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o, k, d, j, x, e, v, z w, u, y, qu Listen to the Sounds:.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 8,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Presented sounds: m, t, a, s, b, c, n, l, i, r, f, p, h, g, o, k, d, j, x, e, v, z w, u, y, qu Listen to the Sounds:.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
      {
        code: 'ind-spelling-exercises-9',
        title: 'Presented sounds: ch, ck, sh, th, th, qu Listen to the Sounds:',
        subtitle: 'ind-spelling-exercises-9',
        summary: 'Practice and develop skills through Presented sounds: ch, ck, sh, th, th, qu Listen to the Sounds:.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 9,
        lesson: {
          materials: [
            'See curriculum guide',
          ],
          aims: [
            'Practice and develop skills through Presented sounds: ch, ck, sh, th, th, qu Listen to the Sounds:.',
          ],
          presentation_steps: [
            'Follow the curriculum guide for this module.',
          ],
          examples: [],
          extension: [],
        },
      },
    ],
  },
  {
    code: 'ind-vocab-comprehension-fluency',
    title: 'Vocab/Comprehension/Fluency (Individual)',
    description: 'Build vocabulary, comprehension, and reading fluency',
    module_count: 9,
    is_locked: false,
    teaching_mode: 'individual' as const,
    display_order: 16,
    modules: [
      {
        code: 'ind-vocab-comprehension-fluency-1',
        title: 'Multiple Meanings',
        subtitle: 'ind-vocab-comprehension-fluency-1',
        summary: 'Help children when reading words in',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 1,
        lesson: {
          materials: [
            'Multiple meaning words printed on cards*',
            'Pictures of words (Moose Materials) with',
            'the same spelling but different meanings.',
          ],
          aims: [
            'To help children when reading words in context draw on their knowledge of words, which in turn expands word recognition and lexibility of meaning.',
          ],
          presentation_steps: [
            'Teacher: What does the word \'jam\' mean? Tell me all the different meanings or uses of the word. For example: Jam: a kind of jam Traf ic jam Jammed in a small place Jamming of a machine Jam with musical instruments If possible, show the pictures of additional meanings. The teacher makes up a sentence using the words. Student chooses the picture with the matching meaning.',
          ],
          examples: [
            'Jam',
            'on next page',
          ],
          extension: [
            'Student can play games with *multiple meaning cards.',
            '*See examples on next page \'VCF-1\'',
            'Multiple Meanings (VCF-1) Bat',
            'bit',
            'tug',
            'Fan',
            'pin',
            'gum',
            'Pan',
            'rip',
            'pen',
            'Jam',
            'dip',
            'miss',
            'Ram',
            'tip',
            'well',
            'Cap',
            'pit',
            'will',
            'Lap',
            'bill',
            'tick',
            'Tag',
            'net',
            'check',
            'Pad',
            'cut',
            'neck',
            'Pass',
            'run',
            'box',
            'Mass',
            'nut',
            'can',
            '* As taken from The Reading Teacher\'s Book of Lists by E B Fry and Moose Materials',
          ],
        },
      },
      {
        code: 'ind-vocab-comprehension-fluency-2',
        title: 'Word of the Day',
        subtitle: 'ind-vocab-comprehension-fluency-2',
        summary: 'Increase the student\'s vocabulary.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 2,
        lesson: {
          materials: [
            'List of words to be introduced.',
          ],
          aims: [
            'To increase the student\'s vocabulary.',
          ],
          presentation_steps: [
            'Write the Word of the Day on the board. Discuss the meaning of the word. Use the word in a sentence. Ask the student to come up with a sentence as well. Have them keep a ring of 3x5 index cards in their desk to use in their writing. Or student can write word of the day in a journal.',
          ],
          examples: [
            'of the Day on the board',
            'in a sentence',
            'of the day in a\njournal',
            'of\nthe DAY',
            'periodically',
          ],
          extension: [
            'Get a big jar or box that is marked" Word of the DAY". As the words are introduced write the new word on a piece of paper and put it in the jar/box. Review these words periodically. Let the student pull a slip out and read the word and give the meaning and a sentence.',
          ],
        },
      },
      {
        code: 'ind-vocab-comprehension-fluency-3',
        title: 'Other Vocabulary builders',
        subtitle: 'ind-vocab-comprehension-fluency-3',
        summary: 'Increase the student\'s vocabulary.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 3,
        lesson: {
          materials: [
            'List of other vocabulary builders*:',
            'Pre ixes; Suf ixes; Synonyms; Antonyms',
          ],
          aims: [
            'To increase the student\'s vocabulary.',
          ],
          presentation_steps: [
            'Common pre ixes, suf ixes, synonyms, and antonyms could be introduced at this stage as and when required. Some examples are provided on the next page. Discuss the meanings of these. Write it on cards and review every week. Use the word in a sentence. Ask a student to come up with a sentence.',
          ],
          examples: [
            'are provided on the next\npage',
            'in a sentence',
            'on next page',
            'of Vocabulary Builders',
          ],
          extension: [
            'Get a big jar or box that is marked "Pre ix/ suf ix/synonyms/antonyms." As these are introduced in class write it on a piece of paper and put it in the jar/box. Review them periodically. Let a student pull a slip out and discuss the meaning.',
            '*See examples on next page \'VCF-3\'',
            'Examples of Vocabulary Builders (VCF-3) Pre ixes List',
            'Suf ixes',
            'Synonyms',
            'Antonyms',
            'Un In Dis Non Mis Sub Mid Re Pre Super Under Anti Multi Post Pro Uni Bi Tri Quadr Pent Centi Milli Semi',
            's, es ed ing less able ful',
            'add back ask boy girl call ix end ill job sell leave look keep listen make old right say take vast walk world',
            'above add back bad before big buy break cheap clean cold cool true fast inish over happy huge inside left play rear stop',
          ],
        },
      },
      {
        code: 'ind-vocab-comprehension-fluency-4',
        title: 'Reading a Book',
        subtitle: 'ind-vocab-comprehension-fluency-4',
        summary: 'Introduce the student to new words.',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 4,
        lesson: {
          materials: [
            'A story book',
          ],
          aims: [
            'To introduce the student to new words.',
          ],
          presentation_steps: [
            'The teacher shows the cover of the book that is chosen. Ask the student what he thinks the story might be about. Read the story to the student. After reading, choose some of the words the student might not be familiar with and talk about the meaning of the words. This exercise helps the student expand his vocabulary. Read the book again.',
          ],
          examples: [],
          extension: [
            'Continue with a variety of books on different topics.',
          ],
        },
      },
      {
        code: 'ind-vocab-comprehension-fluency-5',
        title: 'Read Diary of a Wombat',
        subtitle: 'ind-vocab-comprehension-fluency-5',
        summary: 'Introduce students to a new set of',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 5,
        lesson: {
          materials: [
            'Diary of a Wombat by Jackie French.',
            'Make a list of words that may be unfamiliar',
            'to the students. Then group them according',
            'to speci ic areas of the story.',
            'For example,',
            'Setting: Australia, hole',
            'Characters: creature, humans, wombat',
            'Problem: reward, invading, trained, boring',
            'Events: battle, dust bath',
            'Ending: trained, slept',
          ],
          aims: [
            'To introduce students to a new set of vocabulary words',
          ],
          presentation_steps: [
            'Read "Diary of a Wombat". Discuss the story with the student. Bring into the discussion the setting of the story, the characters, the problem, the events, and the ending. Write words on the board that the student comes up with that are new to him. At some point include the words you have on your list if the student does not mention them. Help the student place the new words into the different areas of the story that you have discussed. For example, the setting would include the words Australia and hole.',
          ],
          examples: [
            'Australia and hole',
          ],
          extension: [
            'Use some of the new words in conversation in the next few days. Verbally review the new words. Words can be put on cards and made into a matching game or a memory game. Read other books using same procedure.',
          ],
        },
      },
      {
        code: 'ind-vocab-comprehension-fluency-6',
        title: 'The Five Ws & How- Comprehension',
        subtitle: 'ind-vocab-comprehension-fluency-6',
        summary: 'Help student develop identifying the',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 6,
        lesson: {
          materials: [
            'Sentences',
          ],
          aims: [
            'To help student develop identifying the questions - 5Ws (what, when, where, why, who) and how of sentences',
          ],
          presentation_steps: [
            'Prerequisite for this activity is that the student must be able to repeat 5-7word sentences. Begin with bare bone (2-3 word) sentences and slowly add up to 7-8 words. Teacher: Echo the sentence after me. Jack ran. Student: Echoes the sentence - Jack ran. Teacher: Who ran? Student: Jack Teacher: What did Jack do? Student: Run In the next sentence, add when, where, why questions adding one or two concepts each day. Teacher: Where did Jack run? Student: Jack ran to the pool. Teacher: When did Jack run to the pool? Student: Jack ran to the pool in the morning. Teacher: How did Jack run? Student: Jack ran quickly. Teacher: Jack ran to the pool quickly in the morning. Student: Echoes the expanded sentence.',
          ],
          examples: [
            'sentences',
          ],
          extension: [
            'Teachers can practice where, when, phrases before introducing these sentences. When phrases: Yesterday, tomorrow, today night, morning, afternoon; ; after, before, etc. Where phrases: at the store; in the house, on the bench, etc.',
          ],
        },
      },
      {
        code: 'ind-vocab-comprehension-fluency-7',
        title: 'Comprehension Skills',
        subtitle: 'ind-vocab-comprehension-fluency-7',
        summary: 'Help re ine understanding of the parts of',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 7,
        lesson: {
          materials: [
            'A book',
          ],
          aims: [
            'To help re ine understanding of the parts of a story',
          ],
          presentation_steps: [
            'Read a book. The teacher can discuss the following : What is the main idea of the story? What outcomes can you predict? What is the problem in the story? Can you identify the details? What is the sequence of the story? Describe a character. What words describe his/her feelings? What is the ending of the story? Did feelings change from beginning to end? How do you summarize the story? Cause/Effect or Fact/Opinion? Can you compare and contrast? What is the mood of the story? Where does it take place? Can you give some real-life examples? Student can act out the story. Student can tell story in their own words. Discuss the multiple meanings. Draw pictures for the story.',
          ],
          examples: [
            'describe his',
          ],
          extension: [
            'Read other books with or without words.',
            'Some of these ideas that are used in most of the stories can be drawn and placed on a poster board. For e.g., pictures of a house, sky/tree to indicate outside, a boy, a girl, numbers to indicate the sequence, etc.',
          ],
        },
      },
      {
        code: 'ind-vocab-comprehension-fluency-8',
        title: 'Comprehension Dice Game',
        subtitle: 'ind-vocab-comprehension-fluency-8',
        summary: 'Help re ine understanding of the parts of',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 8,
        lesson: {
          materials: [
            'A book',
            'A dice that has the words: character,',
            'setting, problem, events, beginning; ending,',
            'predicting outcome',
          ],
          aims: [
            'To help re ine understanding of the parts of a story',
          ],
          presentation_steps: [
            'Teacher: Reads a book. Student: Rolls the dice. Teacher: Reads the word rolled. Teacher and student discuss the area of the story that was rolled.',
          ],
          examples: [
            'rolled',
          ],
          extension: [
            'Read other books with or without words. In the beginning read short passages ideal for the younger student and slowly move on to story books.',
          ],
        },
      },
      {
        code: 'ind-vocab-comprehension-fluency-9',
        title: 'Developing Fluency',
        subtitle: 'ind-vocab-comprehension-fluency-9',
        summary: 'Help students develop luency',
        is_locked: false,
        teaching_mode: 'individual' as const,
        display_order: 9,
        lesson: {
          materials: [
            'A book',
          ],
          aims: [
            'To help students develop luency',
          ],
          presentation_steps: [
            'Some methods to help with luency are: Teacher models how to read; Student rereads loud the same; Student can read to partners; Give student books on tape; Student can record himself reading; Time the student and note accuracy and speed; note improvement by re-reading; Have student pretend to be tv/radio announcer; Teach proper punctuation; Practice Sight words reading by using games or lash cards; Poetry reciting, singing songs; Select words, sentences, short paragraphs, passages, short stories to match student\'s ability level. Fluency record keeping will help in improving speed and accuracy. Practice reading luency every day for about ive minutes.',
          ],
          examples: [
            'sentences',
            'short paragraphs',
            'passages',
            'of monthly',
            'Lesson',
          ],
          extension: [
            'Appendix 1: Lesson Planning Daily lesson plans consist of combinations of learning modules described in the main text. A daily lesson plan will include some of the following elements depending on the student\'s progress. Phonological Awareness: 2 modules done daily (examples given below in the sample daily lesson plan) Alphabet:',
            'Done daily from the beginning',
            'Phonics:',
            'Starts after Phonemic Awareness',
            'Letter Review:',
            'Starts after sound introduction. Each day, show keyword and sound card and ask the students to say it. Review letters covered .',
            'Sound Review:',
            'Starts after sound introduction. Each day, give a sound, ask student to write the letter by echoing the sound and naming the letter after writing, for sounds covered.',
            'Reading & Vocabulary:',
            'Starts when student is ready to read. Vocabulary done from the reading words and Word of the day',
            'Handwriting:',
            'Done daily from the beginning',
            'Spelling:',
            'Starts after reading begins',
            'Comprehension:',
            'Done daily from the beginning',
            'A lesson plan scheduler for a certain number of days may be prepared by the teacher since it would be helpful in creating a daily lesson plan. In order to help the development of such a scheduler and daily lesson plans, examples of monthly (20-day period) lesson plan schedulers are provided in the sheets that follow. Sample daily lesson plans based on these templates for selected days (e.g., 10th day of each month for ten months) that track the monthly plans are also provided. A template of a daily lesson plan is also provided. Note that these are just sample plans, and the actual plans may be different since they will depend on the progress made by the student.',
            'REMEMBER TO GO AS FAST AS YOU CAN BUT AS SLOW AS YOU MUST',
            'Daily Lesson Plan - Example Lesson #: 10-First Month',
            'Date:',
            'Modules',
            'Learning Modules Selection',
            'Phonological awareness (15 min.)',
            'LS-6, LS-8',
            'RMG',
            'RMG-5, RMG-6',
            'WS SYL IS MS FS CS',
            'Alphabet (10 Min.):',
            'Al-6',
            'Phonics',
            'Letter review: Sound review:',
            'Reading & Vocabulary',
            'Handwriting (10Min.):',
          ],
        },
      },
    ],
  },
];

const groupChapters: ChapterData[] = [
  { code: 'phonological-awareness', title: 'Phonological Awareness', description: 'Develop listening, rhyming, syllable, and phonemic awareness skills', display_order: 1, teaching_mode: 'group', group_codes: ['learning-sensorially', 'rhyming', 'words-and-sentences', 'syllables', 'initial-sounds', 'final-sounds', 'medial-sounds', 'combining-sounds'] },
  { code: 'alphabet', title: 'Alphabet', description: 'Learn letter names, shapes, and formations', display_order: 2, teaching_mode: 'group', group_codes: ['alphabet'] },
  { code: 'phonics', title: 'Phonics', description: 'Connect letters to their sounds', display_order: 3, teaching_mode: 'group', group_codes: ['phonics'] },
  { code: 'reading', title: 'Reading', description: 'Apply decoding skills to connected text', display_order: 4, teaching_mode: 'group', group_codes: ['reading', 'reading-exercises'] },
  { code: 'handwriting', title: 'Handwriting', description: 'Develop letter formation and writing skills', display_order: 5, teaching_mode: 'group', group_codes: ['handwriting'] },
  { code: 'spelling', title: 'Spelling', description: 'Encode words using sound-letter knowledge', display_order: 6, teaching_mode: 'group', group_codes: ['spelling', 'spelling-exercises'] },
  { code: 'vocab-comprehension-fluency', title: 'Vocabulary, Comprehension & Fluency', description: 'Build vocabulary, comprehension, and reading fluency', display_order: 7, teaching_mode: 'group', group_codes: ['vocab-comprehension-fluency'] },
];

const individualChapters: ChapterData[] = [
  { code: 'ind-phonological-awareness', title: 'Phonological Awareness', description: 'Develop listening, rhyming, syllable, and phonemic awareness skills', display_order: 1, teaching_mode: 'individual', group_codes: ['ind-learning-sensorially', 'ind-rhyming', 'ind-words-and-sentences', 'ind-syllables', 'ind-initial-sounds', 'ind-final-sounds', 'ind-medial-sounds', 'ind-combining-sounds'] },
  { code: 'ind-alphabet', title: 'Alphabet', description: 'Learn letter names, shapes, and formations', display_order: 2, teaching_mode: 'individual', group_codes: ['ind-alphabet'] },
  { code: 'ind-phonics', title: 'Phonics', description: 'Connect letters to their sounds', display_order: 3, teaching_mode: 'individual', group_codes: ['ind-phonics'] },
  { code: 'ind-reading', title: 'Reading', description: 'Apply decoding skills to connected text', display_order: 4, teaching_mode: 'individual', group_codes: ['ind-reading', 'ind-reading-exercises'] },
  { code: 'ind-handwriting', title: 'Handwriting', description: 'Develop letter formation and writing skills', display_order: 5, teaching_mode: 'individual', group_codes: ['ind-handwriting'] },
  { code: 'ind-spelling', title: 'Spelling', description: 'Encode words using sound-letter knowledge', display_order: 6, teaching_mode: 'individual', group_codes: ['ind-spelling', 'ind-spelling-exercises'] },
  { code: 'ind-vocab-comprehension-fluency', title: 'Vocabulary, Comprehension & Fluency', description: 'Build vocabulary, comprehension, and reading fluency', display_order: 7, teaching_mode: 'individual', group_codes: ['ind-vocab-comprehension-fluency'] },
];

async function run() {
  const content = supabase.schema('content');

  // Upsert chapters
  const allChapters = [...groupChapters, ...individualChapters];
  for (const ch of allChapters) {
    const { error } = await content
      .from('curriculum_chapter')
      .upsert({
        code: ch.code,
        title: ch.title,
        description: ch.description,
        display_order: ch.display_order,
        teaching_mode: ch.teaching_mode,
      }, { onConflict: 'code' });
    if (error) console.error(`Chapter ${ch.code}:`, error.message);
  }
  console.log(`Upserted ${allChapters.length} chapters`);

  const allGroups = [...groups, ...individualGroups];

  for (const g of allGroups) {
    const { data: groupRow, error: groupErr } = await content
      .from('module_group')
      .upsert(
        {
          code: g.code,
          title: g.title,
          description: g.description,
          module_count: g.module_count,
          is_locked: g.is_locked,
          teaching_mode: g.teaching_mode,
          display_order: g.display_order,
        },
        { onConflict: 'code' }
      )
      .select()
      .single();
    if (groupErr) throw groupErr;

    for (const m of g.modules) {
      const { error: moduleErr } = await content.from('module_detail').upsert(
        {
          code: m.code,
          group_id: groupRow.id,
          title: m.title,
          subtitle: m.subtitle,
          summary: m.summary || null,
          is_locked: m.is_locked,
          teaching_mode: m.teaching_mode,
          display_order: m.display_order,
          lesson: m.lesson ? normalizeLesson(m.lesson) : null,
          metadata: {},
        },
        { onConflict: 'code' }
      );
      if (moduleErr) throw moduleErr;
    }
  }

  console.log('Seeded groups and modules (no phase layer)');

  // Link groups to chapters
  const { data: chapterRows } = await content
    .from('curriculum_chapter')
    .select('id, code');
  const chapterMap = new Map((chapterRows || []).map(c => [c.code, c.id]));

  for (const ch of allChapters) {
    const chapterId = chapterMap.get(ch.code);
    if (!chapterId) continue;
    for (const groupCode of ch.group_codes) {
      await content
        .from('module_group')
        .update({ chapter_id: chapterId })
        .eq('code', groupCode);
    }
  }
  console.log('Linked groups to chapters');

  const { data: groupCount } = await content.from('module_group').select('id', { count: 'exact' });
  const { data: moduleCount } = await content.from('module_detail').select('id', { count: 'exact' });
  console.log(`Total groups: ${groupCount?.length || 0}`);
  console.log(`Total modules: ${moduleCount?.length || 0}`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

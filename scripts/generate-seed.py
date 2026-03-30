#!/usr/bin/env python3
"""
Generate seed-curriculum.ts from extracted curriculum JSON data.
"""

import json
import re
import os

# Group metadata
GROUP_META = {
    'LS': {'title': 'Learning Sensorially', 'description': 'Sharpen listening skills and auditory discrimination', 'chapter': '1.1'},
    'RMG': {'title': 'Rhyming', 'description': 'Develop rhyming discrimination and production', 'chapter': '1.2'},
    'WS': {'title': 'Words & Sentences', 'description': 'Build word and sentence awareness', 'chapter': '1.3'},
    'SYL': {'title': 'Syllables', 'description': 'Clap, segment, and blend syllables', 'chapter': '1.4'},
    'IS': {'title': 'Initial Sounds', 'description': 'Identify and manipulate initial sounds in words', 'chapter': '1.5a'},
    'FS': {'title': 'Final Sounds', 'description': 'Identify and manipulate final sounds in words', 'chapter': '1.5b'},
    'MS': {'title': 'Medial Sounds', 'description': 'Identify and manipulate medial sounds in words', 'chapter': '1.5c'},
    'CS': {'title': 'Combining Sounds', 'description': 'Blend and segment sounds to form words', 'chapter': '1.5d'},
    'AL': {'title': 'Alphabet', 'description': 'Learn letter names, sounds, and formation', 'chapter': '2'},
    'P': {'title': 'Phonics', 'description': 'Connect letters to sounds for reading and spelling', 'chapter': '3'},
    'R': {'title': 'Reading', 'description': 'Develop decoding and reading skills', 'chapter': '4'},
    'RE': {'title': 'Reading Exercises', 'description': 'Practice reading with guided exercises', 'chapter': '4.1'},
    'HW': {'title': 'Handwriting', 'description': 'Develop proper letter formation and handwriting skills', 'chapter': '5'},
    'S': {'title': 'Spelling', 'description': 'Learn spelling patterns and rules', 'chapter': '6'},
    'SE': {'title': 'Spelling Exercises', 'description': 'Practice spelling with guided exercises', 'chapter': '6.1'},
    'VCF': {'title': 'Vocab/Comprehension/Fluency', 'description': 'Build vocabulary, comprehension, and reading fluency', 'chapter': '7'},
}

GROUP_ORDER = ['LS', 'RMG', 'WS', 'SYL', 'IS', 'FS', 'MS', 'CS', 'AL', 'P', 'R', 'RE', 'HW', 'S', 'SE', 'VCF']


def escape_ts_string(s):
    """Escape a string for TypeScript template literal or string."""
    if s is None:
        return ''
    # Handle smart quotes FIRST (before escaping regular quotes)
    s = s.replace('\u2018', "'").replace('\u2019', "'")
    s = s.replace('\u201c', '"').replace('\u201d', '"')
    s = s.replace('\u2013', '-').replace('\u2014', '-')
    # Now escape
    s = s.replace('\\', '\\\\')
    s = s.replace("'", "\\'")
    s = s.replace('\n', '\\n')
    return s


def clean_lesson_data(lesson):
    """Clean up lesson data - remove artifacts."""
    if not lesson:
        return lesson

    # Clean extension: remove single-char items and module code artifacts
    if 'extension' in lesson:
        lesson['extension'] = [
            item for item in lesson['extension']
            if len(item) > 2 and not re.match(r'^[A-Z]+-\d+$', item)
            and not re.match(r'^IND_[A-Z]+-\d+$', item)
        ]

    # Clean presentation_steps
    if 'presentation_steps' in lesson:
        lesson['presentation_steps'] = [
            item for item in lesson['presentation_steps']
            if len(item) > 2
        ]

    # Clean materials
    if 'materials' in lesson:
        lesson['materials'] = [
            item for item in lesson['materials']
            if len(item) > 1
        ]
        if not lesson['materials']:
            lesson['materials'] = ['See curriculum guide']

    # Clean aims
    if 'aims' in lesson:
        lesson['aims'] = [
            item for item in lesson['aims']
            if len(item) > 2
        ]
        if not lesson['aims']:
            lesson['aims'] = ['Complete this module.']

    return lesson


def format_string_array(arr, indent):
    """Format a string array as TypeScript."""
    if not arr:
        return '[]'
    lines = []
    for item in arr:
        escaped = escape_ts_string(item)
        lines.append(f"{indent}  '{escaped}',")
    return '[\n' + '\n'.join(lines) + f'\n{indent}]'


def format_module(m, indent='          '):
    """Format a single module as TypeScript object literal."""
    lesson = clean_lesson_data(m.get('lesson'))

    code = escape_ts_string(m['code'])
    title = escape_ts_string(m['title'])
    subtitle = escape_ts_string(m['subtitle'])
    summary = escape_ts_string(m['summary'])
    teaching_mode = m['teaching_mode']
    display_order = m['display_order']

    parts = [
        f"{indent}{{",
        f"{indent}  code: '{code}',",
        f"{indent}  title: '{title}',",
        f"{indent}  subtitle: '{subtitle}',",
        f"{indent}  summary: '{summary}',",
        f"{indent}  is_locked: false,",
        f"{indent}  teaching_mode: '{teaching_mode}',",
        f"{indent}  display_order: {display_order},",
    ]

    if lesson:
        parts.append(f"{indent}  lesson: {{")
        parts.append(f"{indent}    materials: {format_string_array(lesson.get('materials', []), indent + '    ')},")
        parts.append(f"{indent}    aims: {format_string_array(lesson.get('aims', []), indent + '    ')},")
        parts.append(f"{indent}    presentation_steps: {format_string_array(lesson.get('presentation_steps', []), indent + '    ')},")
        parts.append(f"{indent}    examples: {format_string_array(lesson.get('examples', []), indent + '    ')},")
        parts.append(f"{indent}    extension: {format_string_array(lesson.get('extension', []), indent + '    ')},")
        parts.append(f"{indent}  }},")

    parts.append(f"{indent}}},")
    return '\n'.join(parts)


def format_group(prefix, modules, mode, display_order):
    """Format a module group as TypeScript object literal."""
    meta = GROUP_META[prefix]
    group_code = f"K_P1_{prefix}" if mode == 'group' else f"K_P1_IND_{prefix}"
    title_suffix = ' (Individual)' if mode == 'individual' else ''

    indent = '      '
    module_indent = '        '

    modules_str = '\n'.join(format_module(m, module_indent) for m in modules)

    return f"""{indent}{{
{indent}  code: '{group_code}',
{indent}  title: '{escape_ts_string(meta["title"])}{title_suffix}',
{indent}  description: '{escape_ts_string(meta["description"])}',
{indent}  module_count: {len(modules)},
{indent}  is_locked: false,
{indent}  teaching_mode: '{mode}',
{indent}  display_order: {display_order},
{indent}  modules: [
{modules_str}
{indent}  ],
{indent}}},"""


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))

    with open(os.path.join(script_dir, 'curriculum-data.json')) as f:
        data = json.load(f)

    group_data = data['group']
    ind_data = data['individual']

    # Build group sections
    group_sections = []
    for i, prefix in enumerate(GROUP_ORDER):
        modules = group_data.get(prefix, [])
        if modules:
            group_sections.append(format_group(prefix, modules, 'group', i + 1))

    # Build individual sections
    ind_sections = []
    for i, prefix in enumerate(GROUP_ORDER):
        modules = ind_data.get(prefix, [])
        if modules:
            ind_sections.append(format_group(prefix, modules, 'individual', i + 1))

    groups_str = '\n'.join(group_sections)
    ind_groups_str = '\n'.join(ind_sections)

    ts_content = f"""import {{ config }} from 'dotenv';
config({{ path: '.env.local' }});
import {{ createClient }} from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Outcome = {{ label: string; description: string; tone: string }};

type ModuleData = {{
  code: string;
  title: string;
  subtitle: string;
  summary: string;
  is_locked: boolean;
  teaching_mode: string;
  display_order: number;
  lesson?: {{
    materials: string[];
    aims: string[];
    presentation_steps: string[];
    examples: string[];
    extension: string[];
  }};
}};

type GroupData = {{
  code: string;
  title: string;
  description: string;
  module_count: number;
  is_locked: boolean;
  teaching_mode: string;
  display_order: number;
  modules: ModuleData[];
}};

type PhaseData = {{
  code: string;
  title: string;
  description: string;
  months: string;
  lesson_range: string;
  summary: string | null;
  is_locked: boolean;
  display_order: number;
  outcomes: Outcome[];
  groups: GroupData[];
}};

const phases: PhaseData[] = [
  {{
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
      {{ label: 'First Grade', description: 'Students ready for mainstream Grade 1 curriculum', tone: 'bg-green-50 text-green-800 border-green-100' }},
      {{ label: 'Group Literacy', description: 'Students needing continued small-group support', tone: 'bg-yellow-50 text-yellow-900 border-yellow-100' }},
      {{ label: 'One-on-One SIS Program', description: 'Students requiring individualized intervention', tone: 'bg-orange-50 text-orange-900 border-orange-100' }},
    ],
    groups: [
{groups_str}
    ],
  }},
  {{
    code: 'K_P2',
    title: 'Phase 2',
    description: 'Coming soon',
    months: 'Months 3-6',
    lesson_range: 'Lessons 60-120',
    summary: null,
    is_locked: true,
    display_order: 2,
    outcomes: [],
    groups: [],
  }},
  {{
    code: 'K_P3',
    title: 'Phase 3',
    description: 'Coming soon',
    months: 'Months 6-9',
    lesson_range: 'Lessons 120-180',
    summary: null,
    is_locked: true,
    display_order: 3,
    outcomes: [],
    groups: [],
  }},
];

const individualCurriculum: Record<string, GroupData[]> = {{
  K_P1: [
{ind_groups_str}
  ],
  K_P2: [],
  K_P3: [],
}};

async function run() {{
  const content = supabase.schema('content');
  // seed phases
  const phaseIndex: Record<string, {{ id: string; is_locked: boolean }}> = {{}};
  for (const p of phases) {{
    const {{ data: phaseRow, error: phaseErr }} = await content
      .from('phase')
      .upsert(
        {{
          code: p.code,
          title: p.title,
          description: p.description,
          months: p.months,
          lesson_range: p.lesson_range,
          summary: p.summary,
          is_locked: p.is_locked,
          display_order: p.display_order,
          outcomes: p.outcomes,
        }},
        {{ onConflict: 'code' }}
      )
      .select()
      .single();
    if (phaseErr) throw phaseErr;
    phaseIndex[p.code] = {{ id: phaseRow.id, is_locked: !!phaseRow.is_locked }};

    for (const g of p.groups) {{
      const {{ data: groupRow, error: groupErr }} = await content
        .from('module_group')
        .upsert(
          {{
            code: g.code,
            phase_id: phaseRow.id,
            title: g.title,
            description: g.description,
            module_count: g.module_count,
            is_locked: g.is_locked,
            teaching_mode: g.teaching_mode || 'group',
            display_order: g.display_order,
          }},
          {{ onConflict: 'code' }}
        )
        .select()
        .single();
      if (groupErr) throw groupErr;

      for (const m of g.modules) {{
        const {{ error: moduleErr }} = await content.from('module_detail').upsert(
          {{
            code: m.code,
            phase_id: phaseRow.id,
            group_id: groupRow.id,
            title: m.title,
            subtitle: m.subtitle,
            summary: m.summary,
            is_locked: m.is_locked,
            teaching_mode: m.teaching_mode || 'group',
            display_order: m.display_order,
            lesson: m.lesson || null,
            metadata: {{}},
          }},
          {{ onConflict: 'code' }}
        );
        if (moduleErr) throw moduleErr;
      }}
    }}
  }}

  // seed individual curriculum per phase
  for (const [phaseCode, groups] of Object.entries(individualCurriculum)) {{
    const phaseMeta = phaseIndex[phaseCode];
    if (!phaseMeta) continue;
    for (const g of groups) {{
      const {{ data: groupRow, error: groupErr }} = await content
        .from('module_group')
        .upsert(
          {{
            code: g.code,
            phase_id: phaseMeta.id,
            title: g.title,
            description: g.description,
            module_count: g.module_count,
            is_locked: g.is_locked ?? phaseMeta.is_locked,
            teaching_mode: 'individual',
            display_order: g.display_order,
          }},
          {{ onConflict: 'code' }}
        )
        .select()
        .single();
      if (groupErr) throw groupErr;

      for (const m of g.modules) {{
        const {{ error: moduleErr }} = await content.from('module_detail').upsert(
          {{
            code: m.code,
            phase_id: phaseMeta.id,
            group_id: groupRow.id,
            title: m.title,
            subtitle: m.subtitle,
            summary: m.summary || null,
            is_locked: m.is_locked,
            teaching_mode: 'individual',
            display_order: m.display_order,
            lesson: m.lesson || null,
            metadata: {{}},
          }},
          {{ onConflict: 'code' }}
        );
        if (moduleErr) throw moduleErr;
      }}
    }}
  }}

  console.log('Seeded phases, groups, and modules');

  // Print summary
  const {{ data: groupCount }} = await content.from('module_group').select('id', {{ count: 'exact' }});
  const {{ data: moduleCount }} = await content.from('module_detail').select('id', {{ count: 'exact' }});
  console.log(`Total groups: ${{groupCount?.length || 0}}`);
  console.log(`Total modules: ${{moduleCount?.length || 0}}`);
}}

run().catch(err => {{
  console.error(err);
  process.exit(1);
}});
"""

    output_path = os.path.join(script_dir, 'seed-curriculum.ts')
    with open(output_path, 'w') as f:
        f.write(ts_content)

    # Count lines
    line_count = ts_content.count('\n') + 1
    print(f"Generated {output_path}")
    print(f"Lines: {line_count}")

    # Count modules
    group_total = sum(len(group_data.get(p, [])) for p in GROUP_ORDER)
    ind_total = sum(len(ind_data.get(p, [])) for p in GROUP_ORDER)
    print(f"Group modules: {group_total}")
    print(f"Individual modules: {ind_total}")
    print(f"Total modules: {group_total + ind_total}")


if __name__ == '__main__':
    main()

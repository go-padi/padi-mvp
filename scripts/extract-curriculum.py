#!/usr/bin/env python3
"""
Extract curriculum module data from pdftotext output files.
Parses group.pdf and ind.pdf text extracts to produce JSON module data.
"""

import re
import json
import sys
import os

# Module code prefixes and their groups
MODULE_GROUPS = {
    'LS': 'Learning Sensorially',
    'RMG': 'Rhyming',
    'WS': 'Words & Sentences',
    'SYL': 'Syllables',
    'IS': 'Initial Sounds',
    'FS': 'Final Sounds',
    'MS': 'Medial Sounds',
    'CS': 'Combining Sounds',
    'AL': 'Alphabet',
    'P': 'Phonics',
    'R': 'Reading',
    'RE': 'Reading Exercises',
    'HW': 'Handwriting',
    'S': 'Spelling',
    'SE': 'Spelling Exercises',
    'VCF': 'Vocab/Comprehension/Fluency',
}

# Codes to expect per group for GROUP mode
GROUP_EXPECTED = {
    'LS': 11, 'RMG': 19, 'WS': 9, 'SYL': 17,
    'IS': 17, 'FS': 7, 'MS': 2, 'CS': 6,
    'AL': 22, 'P': 7, 'R': 8, 'RE': 9,
    'HW': 11, 'S': 9, 'SE': 9, 'VCF': 9,
}

# Codes to expect per group for INDIVIDUAL mode
IND_EXPECTED = {
    'LS': 6, 'RMG': 19, 'WS': 7, 'SYL': 15,
    'IS': 14, 'FS': 6, 'MS': 2, 'CS': 4,
    'AL': 22, 'P': 7, 'R': 8, 'RE': 9,
    'HW': 10, 'S': 9, 'SE': 9, 'VCF': 9,
}


def normalize_code(raw_code):
    """Normalize a module code: remove spaces, strip trailing letter suffixes like A/B/a/b."""
    code = re.sub(r'\s+', '', raw_code)
    # Strip trailing A/B/a/b suffix (HW-1A -> HW-1, RE-2a -> RE-2)
    code = re.sub(r'[ABab]$', '', code)
    return code


def find_module_boundaries(text):
    """Find all module header positions in the text."""
    # Pattern: module code at start of line (after optional form feed)
    # e.g., "LS-1", "RMG - 1", "HW-1A", "RE-2a", "LS - 12"
    pattern = r'(?:^|\n)\x0c?((?:LS|RMG|WS|SYL|IS|FS|MS|CS|AL|P|R|RE|HW|S|SE|VCF)\s*-\s*\d+[A-Za-z]?)\s*\n'

    boundaries = []
    for match in re.finditer(pattern, text):
        raw_code = match.group(1)
        norm_code = normalize_code(raw_code)
        start = match.end()
        boundaries.append({
            'raw_code': raw_code,
            'code': norm_code,
            'start': start,
        })

    return boundaries


def extract_field(text, field_name):
    """Extract a field value from module text. Returns the text between this field header and the next."""
    # Fields: Materials, Aim, Presentation, Extension, Summary, Notes
    fields_order = ['Materials', 'Aim', 'Presentation', 'Extension', 'Summary', 'Notes']

    # Find this field
    pattern = rf'(?:^|\n){field_name}\s*:\s*\n'
    match = re.search(pattern, text, re.IGNORECASE)
    if not match:
        # Try without colon (some fields might be formatted differently)
        pattern2 = rf'(?:^|\n){field_name}\s*:\s*'
        match = re.search(pattern2, text, re.IGNORECASE)
        if not match:
            return None

    start = match.end()

    # Find the next field or end of module
    next_fields = [f for f in fields_order if f.lower() != field_name.lower()]
    next_pattern = r'(?:^|\n)(?:' + '|'.join(next_fields) + r')\s*:?\s*\n'
    next_match = re.search(next_pattern, text[start:], re.IGNORECASE)

    if next_match:
        end = start + next_match.start()
    else:
        # Also stop at copyright line or page number
        copyright_match = re.search(r'Copyright©', text[start:])
        if copyright_match:
            end = start + copyright_match.start()
        else:
            end = len(text)

    raw = text[start:end].strip()
    # Clean up the text
    raw = re.sub(r'Copyright©.*?Reserved\s*', '', raw)
    raw = re.sub(r'\n\d+\n', '\n', raw)  # Remove standalone page numbers
    raw = raw.strip()
    return raw


def parse_list(text):
    """Parse text into a list of items."""
    if not text:
        return []

    lines = text.split('\n')
    items = []
    current_item = ''

    for line in lines:
        line = line.strip()
        if not line:
            if current_item:
                items.append(current_item.strip())
                current_item = ''
            continue

        # Check if line starts a new numbered item or bullet
        if re.match(r'^(?:\d+\.?\s*|[•\-]\s*|[a-z]\.\s*)', line):
            if current_item:
                items.append(current_item.strip())
            # Remove the number/bullet prefix
            current_item = re.sub(r'^(?:\d+\.?\s*|[•\-]\s*|[a-z]\.\s*)', '', line)
        else:
            if current_item:
                current_item += ' ' + line
            else:
                current_item = line

    if current_item:
        items.append(current_item.strip())

    # Clean up items
    items = [item for item in items if item and not item.startswith('Copyright')]
    return items


def parse_materials(text):
    """Parse materials field into a list."""
    if not text:
        return []

    # Materials are often comma or newline separated
    items = []
    for part in re.split(r'\n', text):
        part = part.strip()
        if part and not part.startswith('Copyright') and not part.startswith('*'):
            # Remove leading bullets/numbers
            part = re.sub(r'^(?:\d+\.?\s*|[•\-]\s*)', '', part).strip()
            if part:
                items.append(part)

    return items


def extract_title(text):
    """Extract the title from the first line(s) after the module code."""
    lines = text.strip().split('\n')
    title_lines = []
    for line in lines:
        line = line.strip()
        if not line:
            if title_lines:
                break
            continue
        if line.lower().startswith('materials') or line.lower().startswith('aim'):
            break
        if 'Copyright' in line:
            break
        title_lines.append(line)

    title = ' '.join(title_lines).strip()
    # Clean up title
    title = re.sub(r'\s+', ' ', title)
    return title


def derive_summary(aims_text, title):
    """Create a 1-sentence summary from the aims field."""
    if not aims_text:
        return f'Practice and develop skills through {title}.'

    # Take the first aim and make it a sentence
    first_aim = aims_text.split('\n')[0].strip()
    first_aim = re.sub(r'^(?:To\s+)', '', first_aim, flags=re.IGNORECASE)
    first_aim = re.sub(r'^(?:\d+\.?\s*|[•\-]\s*)', '', first_aim).strip()

    if first_aim:
        # Capitalize first letter
        return first_aim[0].upper() + first_aim[1:] if len(first_aim) > 1 else first_aim.upper()
    return f'Practice and develop skills through {title}.'


def extract_examples(presentation_text, extension_text):
    """Extract example words from presentation or extension text."""
    examples = []
    combined = (presentation_text or '') + '\n' + (extension_text or '')

    # Look for word lists (common patterns: comma-separated words, words in parentheses)
    # Look for patterns like "Examples: word1, word2, word3"
    example_matches = re.findall(r'(?:examples?|words?|e\.g\.)\s*:?\s*([a-z][a-z,\s]+)', combined, re.IGNORECASE)
    for match in example_matches:
        words = [w.strip() for w in match.split(',') if w.strip() and len(w.strip()) < 30]
        examples.extend(words)

    return examples[:20] if examples else []


def extract_modules(text, mode='group', expected_counts=None):
    """Extract all modules from curriculum text."""
    boundaries = find_module_boundaries(text)

    # Get module text sections
    seen_codes = set()
    modules_by_group = {}

    # Filter out appendix entries (typically at the end of file, after main content)
    # Heuristic: if we've already seen a code and it appears again much later, skip it
    code_first_occurrence = {}
    for b in boundaries:
        code = b['code']
        if code not in code_first_occurrence:
            code_first_occurrence[code] = b['start']

    for i, boundary in enumerate(boundaries):
        code = boundary['code']

        # Skip duplicate occurrences (appendix references)
        if code in seen_codes:
            continue
        seen_codes.add(code)

        # Get text until next module
        if i + 1 < len(boundaries):
            module_text = text[boundary['start']:boundaries[i + 1]['start']]
        else:
            module_text = text[boundary['start']:boundary['start'] + 3000]

        # Clean the text - remove copyright lines and page numbers
        module_text_clean = re.sub(r'Copyright©.*?Reserved\s*\n?\s*\n?\d*\s*\n?', '', module_text)

        # Extract fields
        title = extract_title(module_text_clean)
        materials_text = extract_field(module_text_clean, 'Materials')
        aims_text = extract_field(module_text_clean, 'Aim')
        presentation_text = extract_field(module_text_clean, 'Presentation')
        extension_text = extract_field(module_text_clean, 'Extension')

        materials = parse_materials(materials_text)
        aims = parse_list(aims_text)
        presentation_steps = parse_list(presentation_text)
        extension = parse_list(extension_text)
        examples = extract_examples(presentation_text, extension_text)

        summary = derive_summary(aims_text, title)

        # Determine group prefix
        prefix_match = re.match(r'^([A-Z]+)-', code)
        if not prefix_match:
            continue
        prefix = prefix_match.group(1)

        if prefix not in modules_by_group:
            modules_by_group[prefix] = []

        module_data = {
            'code': code,
            'title': title if title else f'Module {code}',
            'subtitle': code.replace('-', ''),
            'summary': summary,
            'is_locked': False,
            'teaching_mode': mode,
            'display_order': len(modules_by_group[prefix]) + 1,
            'lesson': {
                'materials': materials if materials else ['See curriculum guide'],
                'aims': aims if aims else [summary],
                'presentation_steps': presentation_steps if presentation_steps else ['Follow the curriculum guide for this module.'],
                'examples': examples,
                'extension': extension if extension else [],
            }
        }

        modules_by_group[prefix].append(module_data)

    # Fill in any missing modules based on expected counts
    if expected_counts:
        for prefix, expected in expected_counts.items():
            if prefix not in modules_by_group:
                modules_by_group[prefix] = []

            existing_nums = set()
            for m in modules_by_group[prefix]:
                num_match = re.search(r'-(\d+)', m['code'])
                if num_match:
                    existing_nums.add(int(num_match.group(1)))

            for n in range(1, expected + 1):
                if n not in existing_nums:
                    code = f'{prefix}-{n}'
                    if mode == 'individual':
                        code = f'IND_{prefix}-{n}'
                    modules_by_group[prefix].append({
                        'code': code if mode == 'group' else f'IND_{prefix}-{n}',
                        'title': f'{MODULE_GROUPS.get(prefix, prefix)} - Module {n}',
                        'subtitle': f'{prefix}{n}',
                        'summary': f'{MODULE_GROUPS.get(prefix, prefix)} module {n}.',
                        'is_locked': False,
                        'teaching_mode': mode,
                        'display_order': n,
                        'lesson': {
                            'materials': ['See curriculum guide'],
                            'aims': [f'Complete {MODULE_GROUPS.get(prefix, prefix)} module {n}.'],
                            'presentation_steps': ['Follow the curriculum guide for this module.'],
                            'examples': [],
                            'extension': [],
                        }
                    })

            # Sort by display order (use the number in the code)
            modules_by_group[prefix].sort(key=lambda m: int(re.search(r'-(\d+)', m['code']).group(1)) if re.search(r'-(\d+)', m['code']) else 0)

            # Re-assign display_order
            for idx, m in enumerate(modules_by_group[prefix]):
                m['display_order'] = idx + 1

    return modules_by_group


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)

    # Extract text from PDFs if not already done
    group_txt = '/tmp/group_curriculum.txt'
    ind_txt = '/tmp/ind_curriculum.txt'

    group_pdf = os.path.join(project_dir, 'docs/curriculum/group.pdf')
    ind_pdf = os.path.join(project_dir, 'docs/curriculum/ind.pdf')

    if not os.path.exists(group_txt):
        os.system(f'pdftotext "{group_pdf}" "{group_txt}"')
    if not os.path.exists(ind_txt):
        os.system(f'pdftotext "{ind_pdf}" "{ind_txt}"')

    with open(group_txt, 'r', encoding='utf-8', errors='replace') as f:
        group_text = f.read()
    with open(ind_txt, 'r', encoding='utf-8', errors='replace') as f:
        ind_text = f.read()

    print("Extracting Group curriculum modules...")
    group_modules = extract_modules(group_text, mode='group', expected_counts=GROUP_EXPECTED)

    print("Extracting Individual curriculum modules...")
    ind_modules = extract_modules(ind_text, mode='individual', expected_counts=IND_EXPECTED)

    # Prefix individual module codes with IND_
    for prefix, modules in ind_modules.items():
        for m in modules:
            if not m['code'].startswith('IND_'):
                m['code'] = f"IND_{m['code']}"
            m['subtitle'] = m['code'].replace('-', '').replace('IND_', 'IND')

    # Print summary
    print("\n=== Group Curriculum ===")
    total_group = 0
    for prefix in ['LS', 'RMG', 'WS', 'SYL', 'IS', 'FS', 'MS', 'CS', 'AL', 'P', 'R', 'RE', 'HW', 'S', 'SE', 'VCF']:
        count = len(group_modules.get(prefix, []))
        total_group += count
        expected = GROUP_EXPECTED.get(prefix, '?')
        status = '✓' if count >= expected else '✗'
        print(f"  {status} {prefix}: {count}/{expected} modules")
    print(f"  Total: {total_group}")

    print("\n=== Individual Curriculum ===")
    total_ind = 0
    for prefix in ['LS', 'RMG', 'WS', 'SYL', 'IS', 'FS', 'MS', 'CS', 'AL', 'P', 'R', 'RE', 'HW', 'S', 'SE', 'VCF']:
        count = len(ind_modules.get(prefix, []))
        total_ind += count
        expected = IND_EXPECTED.get(prefix, '?')
        status = '✓' if count >= expected else '✗'
        print(f"  {status} {prefix}: {count}/{expected} modules")
    print(f"  Total: {total_ind}")

    # Save as JSON
    output = {
        'group': group_modules,
        'individual': ind_modules,
    }

    output_path = os.path.join(project_dir, 'scripts/curriculum-data.json')
    with open(output_path, 'w') as f:
        json.dump(output, f, indent=2)

    print(f"\nSaved to {output_path}")


if __name__ == '__main__':
    main()

import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function run() {
  const raw = fs.readFileSync('./scripts/modules.json','utf8');
  const rows = JSON.parse(raw);
  const { error } = await supabase.from('module').insert(rows);
  if (error) throw error;
  console.log(`Inserted ${rows.length} modules`);
}
run().catch(e => { console.error(e); process.exit(1); });

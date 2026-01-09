-- Content tables: public read for preview mode (anon)
create policy "public read phases" on phase
for select to anon using (true);

create policy "public read module groups" on module_group
for select to anon using (true);

create policy "public read module detail" on module_detail
for select to anon using (true);

create policy "public read module" on module
for select to anon using (true);

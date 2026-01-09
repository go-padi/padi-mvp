create extension if not exists "hypopg" with schema "extensions";

create extension if not exists "index_advisor" with schema "extensions";


create type "public"."teaching_mode" as enum ('individual', 'group');


  create table "public"."module" (
    "id" uuid not null default gen_random_uuid(),
    "code" text not null,
    "domain" text not null,
    "section" text,
    "title" text not null,
    "objective" text not null,
    "materials" jsonb,
    "steps" jsonb,
    "extension" jsonb,
    "summary_hint" text
      );


alter table "public"."module" enable row level security;


  create table "public"."module_detail" (
    "id" uuid not null default gen_random_uuid(),
    "phase_id" uuid,
    "group_id" uuid,
    "code" text not null,
    "title" text not null,
    "subtitle" text,
    "summary" text,
    "is_locked" boolean default false,
    "display_order" integer default 0,
    "lesson" jsonb,
    "metadata" jsonb,
    "teaching_mode" public.teaching_mode not null default 'group'::public.teaching_mode
      );


alter table "public"."module_detail" enable row level security;


  create table "public"."module_group" (
    "id" uuid not null default gen_random_uuid(),
    "phase_id" uuid,
    "code" text not null,
    "title" text not null,
    "description" text,
    "module_count" integer default 0,
    "is_locked" boolean default false,
    "display_order" integer default 0,
    "teaching_mode" public.teaching_mode not null default 'group'::public.teaching_mode
      );


alter table "public"."module_group" enable row level security;


  create table "public"."phase" (
    "id" uuid not null default gen_random_uuid(),
    "code" text not null,
    "title" text not null,
    "description" text,
    "months" text,
    "lesson_range" text,
    "summary" text,
    "outcomes" jsonb,
    "is_locked" boolean default false,
    "display_order" integer default 0
      );


alter table "public"."phase" enable row level security;


  create table "public"."student" (
    "id" uuid not null default gen_random_uuid(),
    "class_id" text not null,
    "full_name" text not null,
    "created_at" timestamp with time zone default now()
      );


CREATE UNIQUE INDEX module_detail_code_key ON public.module_detail USING btree (code);

CREATE UNIQUE INDEX module_detail_pkey ON public.module_detail USING btree (id);

CREATE UNIQUE INDEX module_group_code_key ON public.module_group USING btree (code);

CREATE UNIQUE INDEX module_group_pkey ON public.module_group USING btree (id);

CREATE UNIQUE INDEX module_pkey ON public.module USING btree (id);

CREATE UNIQUE INDEX phase_code_key ON public.phase USING btree (code);

CREATE UNIQUE INDEX phase_pkey ON public.phase USING btree (id);

CREATE UNIQUE INDEX student_pkey ON public.student USING btree (id);

alter table "public"."module" add constraint "module_pkey" PRIMARY KEY using index "module_pkey";

alter table "public"."module_detail" add constraint "module_detail_pkey" PRIMARY KEY using index "module_detail_pkey";

alter table "public"."module_group" add constraint "module_group_pkey" PRIMARY KEY using index "module_group_pkey";

alter table "public"."phase" add constraint "phase_pkey" PRIMARY KEY using index "phase_pkey";

alter table "public"."student" add constraint "student_pkey" PRIMARY KEY using index "student_pkey";

alter table "public"."module_detail" add constraint "module_detail_code_key" UNIQUE using index "module_detail_code_key";

alter table "public"."module_detail" add constraint "module_detail_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public.module_group(id) ON DELETE CASCADE not valid;

alter table "public"."module_detail" validate constraint "module_detail_group_id_fkey";

alter table "public"."module_detail" add constraint "module_detail_phase_id_fkey" FOREIGN KEY (phase_id) REFERENCES public.phase(id) ON DELETE CASCADE not valid;

alter table "public"."module_detail" validate constraint "module_detail_phase_id_fkey";

alter table "public"."module_group" add constraint "module_group_code_key" UNIQUE using index "module_group_code_key";

alter table "public"."module_group" add constraint "module_group_phase_id_fkey" FOREIGN KEY (phase_id) REFERENCES public.phase(id) ON DELETE CASCADE not valid;

alter table "public"."module_group" validate constraint "module_group_phase_id_fkey";

alter table "public"."phase" add constraint "phase_code_key" UNIQUE using index "phase_code_key";

grant delete on table "public"."module" to "anon";

grant insert on table "public"."module" to "anon";

grant references on table "public"."module" to "anon";

grant select on table "public"."module" to "anon";

grant trigger on table "public"."module" to "anon";

grant truncate on table "public"."module" to "anon";

grant update on table "public"."module" to "anon";

grant delete on table "public"."module" to "authenticated";

grant insert on table "public"."module" to "authenticated";

grant references on table "public"."module" to "authenticated";

grant select on table "public"."module" to "authenticated";

grant trigger on table "public"."module" to "authenticated";

grant truncate on table "public"."module" to "authenticated";

grant update on table "public"."module" to "authenticated";

grant delete on table "public"."module" to "service_role";

grant insert on table "public"."module" to "service_role";

grant references on table "public"."module" to "service_role";

grant select on table "public"."module" to "service_role";

grant trigger on table "public"."module" to "service_role";

grant truncate on table "public"."module" to "service_role";

grant update on table "public"."module" to "service_role";

grant delete on table "public"."module_detail" to "anon";

grant insert on table "public"."module_detail" to "anon";

grant references on table "public"."module_detail" to "anon";

grant select on table "public"."module_detail" to "anon";

grant trigger on table "public"."module_detail" to "anon";

grant truncate on table "public"."module_detail" to "anon";

grant update on table "public"."module_detail" to "anon";

grant delete on table "public"."module_detail" to "authenticated";

grant insert on table "public"."module_detail" to "authenticated";

grant references on table "public"."module_detail" to "authenticated";

grant select on table "public"."module_detail" to "authenticated";

grant trigger on table "public"."module_detail" to "authenticated";

grant truncate on table "public"."module_detail" to "authenticated";

grant update on table "public"."module_detail" to "authenticated";

grant delete on table "public"."module_detail" to "service_role";

grant insert on table "public"."module_detail" to "service_role";

grant references on table "public"."module_detail" to "service_role";

grant select on table "public"."module_detail" to "service_role";

grant trigger on table "public"."module_detail" to "service_role";

grant truncate on table "public"."module_detail" to "service_role";

grant update on table "public"."module_detail" to "service_role";

grant delete on table "public"."module_group" to "anon";

grant insert on table "public"."module_group" to "anon";

grant references on table "public"."module_group" to "anon";

grant select on table "public"."module_group" to "anon";

grant trigger on table "public"."module_group" to "anon";

grant truncate on table "public"."module_group" to "anon";

grant update on table "public"."module_group" to "anon";

grant delete on table "public"."module_group" to "authenticated";

grant insert on table "public"."module_group" to "authenticated";

grant references on table "public"."module_group" to "authenticated";

grant select on table "public"."module_group" to "authenticated";

grant trigger on table "public"."module_group" to "authenticated";

grant truncate on table "public"."module_group" to "authenticated";

grant update on table "public"."module_group" to "authenticated";

grant delete on table "public"."module_group" to "service_role";

grant insert on table "public"."module_group" to "service_role";

grant references on table "public"."module_group" to "service_role";

grant select on table "public"."module_group" to "service_role";

grant trigger on table "public"."module_group" to "service_role";

grant truncate on table "public"."module_group" to "service_role";

grant update on table "public"."module_group" to "service_role";

grant delete on table "public"."phase" to "anon";

grant insert on table "public"."phase" to "anon";

grant references on table "public"."phase" to "anon";

grant select on table "public"."phase" to "anon";

grant trigger on table "public"."phase" to "anon";

grant truncate on table "public"."phase" to "anon";

grant update on table "public"."phase" to "anon";

grant delete on table "public"."phase" to "authenticated";

grant insert on table "public"."phase" to "authenticated";

grant references on table "public"."phase" to "authenticated";

grant select on table "public"."phase" to "authenticated";

grant trigger on table "public"."phase" to "authenticated";

grant truncate on table "public"."phase" to "authenticated";

grant update on table "public"."phase" to "authenticated";

grant delete on table "public"."phase" to "service_role";

grant insert on table "public"."phase" to "service_role";

grant references on table "public"."phase" to "service_role";

grant select on table "public"."phase" to "service_role";

grant trigger on table "public"."phase" to "service_role";

grant truncate on table "public"."phase" to "service_role";

grant update on table "public"."phase" to "service_role";

grant delete on table "public"."student" to "anon";

grant insert on table "public"."student" to "anon";

grant references on table "public"."student" to "anon";

grant select on table "public"."student" to "anon";

grant trigger on table "public"."student" to "anon";

grant truncate on table "public"."student" to "anon";

grant update on table "public"."student" to "anon";

grant delete on table "public"."student" to "authenticated";

grant insert on table "public"."student" to "authenticated";

grant references on table "public"."student" to "authenticated";

grant select on table "public"."student" to "authenticated";

grant trigger on table "public"."student" to "authenticated";

grant truncate on table "public"."student" to "authenticated";

grant update on table "public"."student" to "authenticated";

grant delete on table "public"."student" to "service_role";

grant insert on table "public"."student" to "service_role";

grant references on table "public"."student" to "service_role";

grant select on table "public"."student" to "service_role";

grant trigger on table "public"."student" to "service_role";

grant truncate on table "public"."student" to "service_role";

grant update on table "public"."student" to "service_role";


  create policy "public read module"
  on "public"."module"
  as permissive
  for select
  to anon
using (true);



  create policy "public read module detail"
  on "public"."module_detail"
  as permissive
  for select
  to anon
using (true);



  create policy "public read module groups"
  on "public"."module_group"
  as permissive
  for select
  to anon
using (true);



  create policy "public read phases"
  on "public"."phase"
  as permissive
  for select
  to anon
using (true);



  create policy "lesson read own prefix"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'lesson-attachments'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "lesson uploads own prefix"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'lesson-attachments'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));




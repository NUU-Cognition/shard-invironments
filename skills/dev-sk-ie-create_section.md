---
description: "Create a mesh section — scaffold the (Section) folder + header, then author its context envelope and navigation prose"
---

> [!important] THIS FILE IS AN INSTRUCTION. WHEN REFERENCED IT IS MEANT TO BE TAKEN AS AN ACTION.

Run `flint shard start-dev ie` if you haven't already.

# Skill: Create Section

Create a managed mesh section: scaffold the `(Section) <Name>/` folder and header under `Mesh/Sections/`, then fill in the header prose so the section is immediately loadable.

# Input

- The section name (without the `(Section) ` prefix) — flat and unique across the mesh
- (Optional) A display path under `Mesh/Sections/` for visual nesting (display only — no semantic meaning)
- (Optional) What the section is for — scope, lens, intended contents. Ask nothing; infer from context if not given.

# Actions

1. **Scaffold.** Run the section script:

   ```bash
   flint shard ie section "<Name>" [display/path]
   ```

   This creates `Mesh/Sections/[path/](Section) <Name>/` with the header `(Section) <Name>.md` — tags (`#ie` + `#ie/sections/<slug>`) and dates stamped. If the script reports the name or slug is taken, stop and tell the user (names are flat and unique).

2. **Author the header prose.** Open the created header and, following [[dev-tmp-ie-section-v0.1]], write:
   - The **context envelope** blockquote — 1–3 sentences on what a mind must already hold to read this section's members (the lens, the scope, local definitions, assumed background).
   - The **Navigation** section — the higher-level shape and where a reader should start. For a brand-new section this may be a sentence or two; it grows via [[dev-wkfl-ie-refresh]].
   - Do **not** add a member list — `flint shard ie load` assembles that from the members.

3. **Complete the frontmatter.** In the header:
   - Write a one-line `description:` — how this section reads in listings.
   - Add `authors` with the operator person wikilink (from `flint whoami`); omit if no Name is set.
   - Append your session id to `orbh-sessions`.

4. **Confirm.** Report the header path and, if useful, suggest seeding first notes with `flint shard ie note "<Name>" "<Title>"`.

# Output

- `Mesh/Sections/[path/](Section) <Name>/(Section) <Name>.md` — header with a written context envelope and navigation guide, ready for `flint shard ie load`

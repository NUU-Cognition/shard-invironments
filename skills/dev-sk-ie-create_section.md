---
description: "Create a mesh section — create the (Section) folder and header with the mesh CLI, then write its context envelope and navigation prose"
orb:
  - "@v1/nuucognition/session/9f552ce0-0455-44ed-b8ec-d749c3ae9b2f#flint/nuu-orbh"
  - "@v1/nuucognition/session/11ee491c-0bce-4b77-8d97-aa78c6a34ccf#flint/nuu-flint"
---

> [!important] THIS FILE IS AN INSTRUCTION. WHEN REFERENCED IT IS MEANT TO BE TAKEN AS AN ACTION.

Run `flint shard start-dev ie` if you haven't already.

# Skill: Create Section

Create a mesh section: the section folder `(Section) <Name>/` and its header, in one transaction of the mesh CLI. Then write the prose of the header, so that `load` can show the section at once.

# Input

- The section name (without the `(Section) ` prefix). Words of letters and digits, each word starts with a capital letter or a digit, one space between words, 1 to 64 characters, no hyphen or other punctuation. The key (the name in lowercase with `-` between the words) must be unique in the mesh.
- (Optional) The parent folder, mesh-root-relative. The default is `[sections] folder` of `mesh.toml` (`Mesh/Sections`). The parent must not be inside another section folder. The folder has meaning: the members of the section are in the section folder.
- (Optional) The kind: `open` (default) or `closed`. In a closed section every counted link from a member goes to a member of the same section.
- (Optional) What the section is for: the scope, the lens, the intended contents. Ask nothing; infer it from the context if it is not given.

# Actions

1. **Create.** Run the section script:

   ```bash
   flint shard ie section "<Name>" [--in <parent folder>] [--kind open|closed] [--description "<one line>"]
   ```

   It runs `mesh section create` and writes the fields and the body skeleton of [[dev-tmp-ie-section-v0.2]] in the same transaction. The header gets the tags `#ie` and `#ie/sections/<key>`. If the script refuses (a bad name, a key that exists, a parent inside a section folder, a title collision), stop and tell the user the reason and the next command that it prints.

2. **Write the header prose.** Open the created header and, following [[dev-tmp-ie-section-v0.2]], write:
   - The **context envelope** blockquote: 1 to 3 sentences on what a mind must already hold to read the members (the lens, the scope, local definitions, assumed background).
   - The **Navigation** section: the higher-level shape and where a reader starts. For a new section this can be a sentence or two; it grows with [[dev-wkfl-ie-refresh]].
   - Do **not** add a member list: `flint shard ie load` assembles it from the members.

3. **Complete the frontmatter.** In the header:
   - Write a one-line `description:` (how the section reads in listings), if `--description` did not give it.
   - Add `authors` with the operator person wikilink (from `flint whoami`); omit it if no Name is set.
   - Stamp your session in `orb:`: run `flint address me`, and append its `by` address (quoted) to `orb:`. The script already stamps `ORBH_SESSION_ID`. Add nothing only when `orb:` or `orbh-sessions` has an item that is exactly your `by` address, the short form `@v1/<org>/session/<uuid>`, `[[<uuid>]]`, or your bare `<uuid>`. The full rule is in [[knw-f-artifacts]] § Session Tracking.

4. **Confirm.** Report the header path. If it helps, suggest the first notes with `flint shard ie note "<Title>" --section "<Name>"`.

# Output

- `<parent folder>/(Section) <Name>/(Section) <Name>.md`: the header with a context envelope and a navigation guide, ready for `flint shard ie load`.

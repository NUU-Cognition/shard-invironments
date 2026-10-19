---
description: "IE note — one editable slice of reality, in zero or one mesh section"
orb:
  - "@v1/nuucognition/session/9f552ce0-0455-44ed-b8ec-d749c3ae9b2f#flint/nuu-orbh"
  - "@v1/nuucognition/session/11ee491c-0bce-4b77-8d97-aa78c6a34ccf#flint/nuu-flint"
---

# Filename: [the folder of its section (or a subfolder), else the mesh folder]/[Note Title].md

/* A note is the minimal member artifact: one editable model, a slice of reality.
   Flat and universal: one #note tag, no subtypes. The title IS the slice: a
   complete claim or concept that stands alone. The section tag is optional
   (zero or one). A note with a section tag is in the folder of its section, or
   in a subfolder of it; the tag and the folder must agree (mesh check reports
   SECTION_FOLDER_MISMATCH). The `flint shard ie note` script creates this note
   with `mesh create --section`, which places the file and adds the tag. Use
   --description and --body-file to supply its content. */

```markdown
---
id: [generate-uuid4]
tags:
  - "#note"
  - "#ie/sections/[key]" /* optional: the mesh section of this note, zero or one */
  - (continue) /* any number of "#ie/groups/[key]" group tags */
description: [One high-scent line. This is what `ie load` discloses. Required —
             a note with no description is invisible to the loader.]
contact: /* optional; omit the field entirely if the note has no reality anchor */
  - "[[cb-[codebase]]]"
orb: /* the by address of flint address me for --session or ORBH_SESSION_ID;
       omit if neither exists */
  - "[the by address of flint address me]"
template: "[[tmp-ie-note-v0.2]]"
authors: /* from flint whoami; omit if no name set */
  - "[[@Person Name]]"
created: [YYYY-MM-DD]
modified: [YYYY-MM-DD]
---

# [Note Title — a complete claim or concept that stands alone]

[The model. Free-form prose, as much or as little as the slice needs. Link densely
 to other notes with [[wikilinks]]. The title carries the assertion; the body
 develops, qualifies, or grounds it.]

/* Optional — include only if the note makes contact with reality: */
# Contact

[Where and how this note's slice touches the territory: which codebase module,
 which measurement, what was observed. The machine-readable anchors live in the
 `contact:` frontmatter list; this section is the prose elaboration.]
```

/* Notes:
   - tags is "#note", zero or one "#ie/sections/[key]" section tag, and any
     number of group tags.
   - description is REQUIRED — keep it to one line.
   - contact and the "# Contact" section are both optional and travel together;
     omit both when the note has no reality anchor.
   - modified: bump on substantive edits (convention, not enforced).
   - `orb:` holds the session stamps (NUU Orbh Mission 027). Each item is the
     quoted `by` address of `flint address me`. An agent that edits the
     note appends its address. It adds nothing only when `orb:` or
     `orbh-sessions` has an item that is exactly its `by` address, the short
     form `@v1/<org>/session/<uuid>`, `[[<uuid>]]`, or its bare `<uuid>`. Old
     documents keep `orbh-sessions`: never remove it, and add no new item to
     it. The full rule is in [[knw-f-artifacts]] § Session Tracking.
*/

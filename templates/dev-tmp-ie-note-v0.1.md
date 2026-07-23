---
description: "IE note — one editable slice of reality living in a single mesh section"
---

# Filename: [beside its section's header, or in Mesh/Main/(Section) New/]/[Note Title].md

/* A note is the minimal member artifact: one editable model, a slice of reality.
   Flat and universal — one #note tag, no subtypes. The title IS the slice: a
   complete claim or concept that stands alone. The section TAG is authoritative —
   the folder is only the visual default. The `flint shard ie note` script
   scaffolds this; fill in the description and body. */

```markdown
---
id: [generate-uuid4]
tags:
  - "#note"
  - "#ie/sections/[slug]" /* the mesh section this note lives in — exactly one */
  - (continue) /* any number of "#ie/groups/[slug]" group tags */
description: [One high-scent line. This is what `ie load` discloses. Required —
             a note with no description is invisible to the loader.]
contact: /* optional; omit the field entirely if the note has no reality anchor */
  - "[[cb-[codebase]]]"
orbh-sessions:
template: "[[tmp-ie-note-v0.1]]"
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
   - tags is always "#note" plus exactly one "#ie/sections/[slug]" section tag;
     group tags are free.
   - description is REQUIRED — keep it to one line.
   - contact and the "# Contact" section are both optional and travel together;
     omit both when the note has no reality anchor.
   - modified: bump on substantive edits (convention, not enforced).
*/

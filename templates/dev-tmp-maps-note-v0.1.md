---
description: "Map note — one editable slice of reality belonging to a single map"
---

# Filename: Mesh/Maps/(Map) [Map Name]/[Note Title].md

/* A note is the atomic unit of a map: one editable model, a slice of reality.
   Flat and universal — one #note tag, no subtypes. The title IS the slice: a
   complete claim or concept that stands alone. The `flint shard map note` script
   scaffolds this; fill in the description and body. */

```markdown
---
id: [generate-uuid4]
tags:
  - "#note"
map: "[[(Map) [Map Name]]]"
description: [One high-scent line. This is what `map load` discloses. Required —
             a note with no description is invisible to the loader.]
contact: /* optional; omit the field entirely if the note has no reality anchor */
  - "[[cb-[codebase]]]"
orbh-sessions:
template: "[[tmp-maps-note-v0.1]]"
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
   - tags is always "#note" — no subtypes in v1.
   - map: is a wikilink to the index and is singular — a note belongs to exactly
     one map (containment). A future multi-valued `maps:` field will allow
     association; do not use it yet.
   - description is REQUIRED — keep it to one line.
   - contact and the "# Contact" section are both optional and travel together;
     omit both when the note has no reality anchor.
   - modified: bump on substantive edits (convention, not enforced).
*/

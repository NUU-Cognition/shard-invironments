---
description: "Map index — the root file of a map: Information Environment plus navigation guide"
---

# Filename: Mesh/Maps/(Map) [Name]/(Map) [Name].md

/* The map index is the root file of a map. It carries the map's Information
   Environment and a higher-level navigation guide. It does NOT list the notes —
   `flint shard map load` assembles that from each note's `description`.
   The `flint shard map create` script scaffolds this skeleton; fill in the prose. */

```markdown
---
id: [generate-uuid4]
tags:
  - "#map"
orbh-sessions:
template: "[[tmp-maps-map-v0.1]]"
authors: /* from flint whoami; omit if no name set */
  - "[[@Person Name]]"
created: [YYYY-MM-DD]
modified: [YYYY-MM-DD]
---

# [Map Name]

> [Information Environment: in 1–3 sentences, what must a mind already hold to
>  read this map's notes? The lens, the scope, the assumed background. This is the
>  context a reader loads before the notes mean anything.]

## Navigation

[The higher-level shape of the map: how it is organized, where a reader should
 start, and the major throughlines that connect the notes. This is a guide, NOT a
 list of every note — the note list is produced by `flint shard map load`.
 Reference key entry-point notes by wikilink where it helps orient the reader.]
```

/* Notes:
   - tags is always "#map" for the index.
   - Do NOT add a "## Notes" section enumerating notes — that is `load`'s job
     (single source of truth: each note owns its own description).
   - Keep the index's curated prose current as notes accumulate via the refresh
     workflow — but never by hand-listing notes here.
*/

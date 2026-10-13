---
id: 8d2f6e10-4c93-4a27-bf85-1e6a9d3c70b2
tags:
  - "#f/metadata"
  - "#f/type"
---

# Note

A Note is the atomic unit of semantic content.

- A note is a single editable model: a slice of reality as standalone markdown.
- The title is the slice: a complete claim or concept.
- A note has zero or one section tag `#ie/sections/<key>`.
- A note with a section tag is in the folder of that section, or in a subfolder of it.
- A note with no section tag is unsectioned.
- A note can have any number of group tags `#ie/groups/<key>`.
- A note has one universal kind and no subtypes.
- A note has a required one-line `description`: its scent in `ie load`.
- A note can have `contact` reality anchors.
- A note holds durable understanding, not an action to complete.
- A note is revised in place, not appended to.

## Properties

| Property | Value |
|----------|-------|
| Tag | `#note`, zero or one `#ie/sections/<key>`, and any `#ie/groups/<key>` |
| Naming | `<Note Title>.md` (the title IS the claim) |
| Location | The folder of its section, or a subfolder of it; with no section, the mesh folder |

## Templates

- [[tmp-ie-note-v0.2]]

---
id: 8d2f6e10-4c93-4a27-bf85-1e6a9d3c70b2
tags:
  - "#f/metadata"
  - "#f/type"
---

# Note

A Note is the atomic unit of semantic content: a single editable model, a slice of reality written as standalone markdown. Its title is the slice it represents (a complete claim or concept). A note has zero or one section tag `#ie/sections/<key>`; a note with a section tag is in the folder of that section (or a subfolder of it), and a note with no section tag is unsectioned. It can have any number of `#ie/groups/<key>` group tags. A Note is minimal: one universal kind, no subtypes. It has a required one-line `description` (its scent in `ie load`) and optional `contact` reality anchors. It holds durable understanding, not an action to complete, and it is revised in place, not appended to.

## Properties

| Property | Value |
|----------|-------|
| Tag | `#note`, zero or one `#ie/sections/<key>`, and any `#ie/groups/<key>` |
| Naming | `<Note Title>.md` (the title IS the claim) |
| Location | The folder of its section, or a subfolder of it; with no section, the mesh folder |

## Templates

- [[tmp-ie-note-v0.2]]

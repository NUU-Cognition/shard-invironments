---
id: 8d2f6e10-4c93-4a27-bf85-1e6a9d3c70b2
tags:
  - "#f/metadata"
  - "#f/type"
---

# Note

A Note is the atomic unit of semantic content — a single editable model, a slice of reality captured as standalone markdown. Its title is the slice it represents (a complete claim or concept), and it lives in exactly one mesh section via its `#ie/sections/<name>` tag (the mesh is flat; folders are display only), with any number of `#ie/groups/<name>` group tags. A Note is deliberately minimal: one universal kind, no subtypes, with structure added only when it earns its place. It carries a required one-line `description` (its scent in `ie load`) and optional `contact` reality anchors. It is distinguished from a work artifact by what it holds — durable understanding rather than an action to complete — and from a transient capture by being editable and revised in place rather than appended to.

## Properties

| Property | Value |
|----------|-------|
| Tag | `#note` + `#ie/sections/<slug>` |
| Naming | `<Note Title>.md` (title IS the claim) |
| Location | Beside its section's header, or `Mesh/Main/(Section) New/` (display only) |

## Templates

- [[tmp-ie-note-v0.1]]

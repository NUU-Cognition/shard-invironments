---
required-reading:
  - "[[dev-knw-maps-model]]"
---

# Map

The Flint's **semantic content layer**. Where work artifacts (Tasks, Plans, Increments) capture *what is being done*, Map captures *what is known* — editable notes organized into navigable collections.

## Core Model

```
Map  ─── is a collection of ───►  Notes
 │                                  │
 │ has a                            │ each is a
 ▼                                  ▼
Index (root file)              slice of reality (a model)
```

- **Map** — a named collection of notes. Lives at `Mesh/Maps/(Map) <Name>/`, with a root file `(Map) <Name>.md` called the **index**.
- **Note** — the atomic unit. A single editable model — a slice of reality (see [[knw-f-models]]). Tagged `#note`, bound to exactly one map via `map:`.
- **Index** — the map's root file. Carries the map's **Information Environment** (what a mind must hold to read these notes) and a higher-level **navigation guide**. It does **not** list the notes.
- **Atlas** — a collection of maps. Reserved; not implemented in v1.

## Single Source of Truth

The index never lists notes. Each note owns its own one-line `description:`. `flint shard map load <Map>` reads the folder and **assembles** the note list (title + description) on demand. Edit a note → `load` reflects it immediately. Nothing to keep in sync, nothing to go stale.

This makes `load` *the* progressive-disclosure operation: an agent runs it to pull a map into context — curated framing first, then the full scent index, then it opens individual notes as needed.

## The Note Contract

Minimal and universal — one tag, no subtypes:

```yaml
tags: ["#note"]
map: "[[(Map) <Name>]]"     # wikilink to the index; a note belongs to exactly one map
description: <one-line scent># required — what load discloses
contact: []                 # optional; reality anchors, e.g. ["[[cb-rf-flint]]"]
created: <date>
modified: <date>
```

- **One map per note** (containment). A future `maps:` field will allow multi-map association — not built yet.
- **`description` is required** — a note with no scent is invisible to `load`.
- **`contact`** is the optional grounding axis: where this note's slice touches reality (a codebase `cb-…` today; telemetry, datasets, people later). An optional `# Contact` body section elaborates in prose.

## Scripts

| Script | Command | Output |
|--------|---------|--------|
| Create | `flint shard map create "<Name>"` | Scaffolds `Mesh/Maps/(Map) <Name>/` + an index skeleton |
| Note | `flint shard map note "<Map>" "<Title>"` | Scaffolds a note in a map (stamps `map`, `created`, `modified`) |
| List | `flint shard map list` | Lists every map with its note count |
| Load | `flint shard map load "<Map>"` | Prints the index, then the assembled note scent-list |

## Obsidian Template

`otmp-maps-note` (installed to `Shards/(Shards) Obsidian Templates/`) is a **Templater** template for human note creation. It reads the current file's folder via `tp.file.folder(true)`, detects an enclosing `(Map) <Name>/` folder, and auto-fills the note's `map` wikilink, `id`, and dates. Set it as a Templater *Folder Template* for `Mesh/Maps` to auto-apply on every new note created under a map. Requires the Templater plugin.

## Rules

1. A note lives in exactly one map — its folder. Need it elsewhere? Link to it, don't copy it.
2. Notes are flat: `#note`, no subtypes. Add structure only when it pays off.
3. The index is context + navigation, never a note list — `load` produces the list from the notes themselves.
4. Every note carries a `description`. Keep it to one high-scent line.
5. Use the scripts to scaffold; author the prose (index framing, note bodies, descriptions) yourself.

---
description: "The Map model — maps, notes, the index, contact grounding, and progressive disclosure via load"
---

# Knowledge: The Map Model

Deep reference for the Map shard's content model. Read this before authoring maps, notes, or the scripts that operate on them. Map is the semantic layer of a Flint: it answers *what is known here*, as opposed to the work layer (Tasks, Plans, Increments) which answers *what is being done*.

## Why Map Exists

A bare Flint accumulates work artifacts but has nowhere to put durable understanding — concepts, observations, designs, the slices of reality a project produces. Loose notes with no home become an unnavigable pile. A **map** is the container that turns a pile of notes into something a mind can walk: a curated entry point plus the notes it discloses.

## The Three Objects

### Map

A named collection of notes. On disk:

```
Mesh/Maps/
  (Map) Cognition/
    (Map) Cognition.md          ← the index (root file)
    Minds construct models.md   ← notes, flat inside the folder
    A Flint is a thinking technology.md
    ...
```

The folder *is* the map. Membership is containment: a note in this folder belongs to this map. There is no separate registry to keep in sync — the filesystem is the source of truth.

### Note

The atomic unit — one editable model, a **slice of reality** (see [[knw-f-models]]). Deliberately minimal and universal: a single `#note` tag, no subtypes. Structure is added only when it pays off (progressive typing), but the base note is enough to be useful immediately.

```yaml
---
id: <uuid>
tags: ["#note"]
map: "[[(Map) Cognition]]"
description: The second axiom — minds have no unmediated access to reality.
contact: []
created: 2026-06-20
modified: 2026-06-20
---

# Minds construct models

[Free-form model content. The title IS the slice — a complete claim or concept.]
```

| Field | Required | Purpose |
|-------|----------|---------|
| `tags` | yes | Always `#note` — flat, no subtypes |
| `map` | yes | Wikilink to the index. A note belongs to **exactly one** map (containment) |
| `description` | yes | One-line scent. This is what `load` discloses — a note without it is invisible |
| `contact` | no | Reality anchors (see below) |
| `created` / `modified` | yes | Timestamps; `modified` is a convention, not enforced |

### Index

The map's root file, `(Map) <Name>.md`. Two jobs, neither of which is listing notes:

1. **Information Environment** — what a mind must already hold to interpret this map's notes. The lens, the scope, the assumed background. (See [[knw-f-models]] § Information Environments.)
2. **Navigation guide** — the higher-level shape: how the map is organized, where to start, the major throughlines connecting the notes.

The index is curated prose. The note list is **not** here — it is produced on demand by `load`.

## Single Source of Truth

The defining design choice: **the index does not duplicate the note list.** Each note owns its `description`; `load` assembles the list by reading the folder. This means:

- Editing a note's description updates what `load` shows — instantly, with no second edit.
- A note added to the folder appears in `load` automatically.
- There is no list to drift out of sync with the notes. Staleness of *the list* is structurally impossible.

What *can* age is the index's curated prose (the IE and navigation) as a map grows. That is a judgment task, handled by [[dev-wkfl-maps-refresh]] — not by any automatic regeneration.

## Load — The Progressive-Disclosure Operation

`flint shard map load <Map>` is how a map enters an Information Environment:

```
## (Map) Cognition  — the index
[Information Environment + navigation guide, verbatim from the index]

## Notes
- [[Minds construct models]] — The second axiom; minds have no unmediated access to reality.
- [[A Flint is a thinking technology]] — structure that helps minds do work.
```

Curated framing first (so the reader knows how to interpret what follows), then the full scent index assembled from each note's `description`, then the reader opens individual notes as the task demands. Variable resolution by reader effort — the navigation *is* the retrieval.

## Contact — The Grounding Axis

A note is a slice of reality; `contact` names **where that slice touches the territory**. It is optional and additive:

- `contact:` — a YAML list of machine-readable reality anchors. The first kind is a codebase, referenced as `cb-<name>` (mirroring the existing `rf-fl-<name>` reference convention). Later kinds: telemetry streams, datasets, documents, people.
- `# Contact` — an optional body section elaborating in prose *how* the note makes contact (which module, which measurement, what was observed).

Contact gives the shard a future **verification story** — walk a note's `contact` to check it against reality — with none of that machinery required now. A note with no `contact` is a floating model; one with `contact` is grounded.

## One Map Per Note (and the Association Escape Hatch)

Membership is containment: `map:` is singular, the note lives in one folder. This keeps `load` trivial and the filesystem authoritative, and it avoids re-splitting navigation from content. When a note is relevant to another map, **link to it** across maps rather than copy it.

A future, more advanced `maps:` field (multi-valued) will allow genuine multi-map association. It is deliberately deferred — v1 is containment only.

## What Map Is Not

- **Not the work layer.** Tasks/Plans/Increments track doing; Map tracks knowing.
- **Not a retrieval index or vector store.** Navigation is link-walking + `load`, not search.
- **Not subtyped.** No concept/record/mandate zoo in v1 — one flat `#note`. The *map* does the organizing that subtypes would otherwise do.
- **Not an append-only log.** Notes are editable; that is the point. (Immutable capture is a separate concern, out of scope for v1.)

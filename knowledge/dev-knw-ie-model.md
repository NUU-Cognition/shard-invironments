---
description: "The IE model — mesh sections, mesh groups, headers, the tag grammar, main sections, and progressive disclosure via load"
---

# Knowledge: The IE Model

Deep reference for the Invironments shard. This is the mesh's structural base layer: it answers *where does a node live and what collections is it part of* — and, through headers, *what context makes a section's members interpretable*.

## Why This Layer Exists

A model only means something inside an **Information Environment** — the context a mind must hold to interpret it (see [[knw-f-models]] § Information Environments). A bare Flint has exactly one implicit environment: the whole mesh. Real work grows pockets of local meaning — a codebase's concept layer, a spec, an idea being developed — each needing a place to live and, when it matures, its own declared context.

This shard supplies the smallest possible mechanism for that: **sections** (where things live), **groups** (what things are part of), and **headers** (declared context, when earned) — the raw understanding and the manipulation tooling, nothing more. It is deliberately neutral: a base other shards build on, not an opinionated system of its own. The workspace conventions built on it (folders, staging sections) belong to the Flint shard, which depends on this one.

## The Mesh Is Flat

There are no folders in the mesh, semantically. Folders are a **display concern** — visual arrangement for humans browsing in Obsidian. Nothing may ever depend on where a file sits on disk. All structure lives in frontmatter tags:

| Structure | Carried by |
|-----------|-----------|
| Where a node lives | `#ie/sections/<name>` — exactly one |
| What collections it's part of | `#ie/groups/<name>` — any number |
| Which file is a section's header | bare `#ie` on a `(Section)` artifact |

Scripts and agents assemble every view by scanning frontmatter, never by walking directories.

## Mesh Sections

The core primitive: an exclusive container — an **unmanaged environment** by default.

- **Existence is free.** A section exists the moment a tag references it. No registration, no file required.
- **Names are flat and unique.** Section identity is the name alone — `#ie/sections/orbcode` is the same section regardless of any folder arrangement. There is no parent relation in the data model; "nesting" is purely how folders are displayed.
- **Exclusive membership.** A node carries exactly one section tag. Where something lives is a single fact.
- **Display convention.** Sections sit visually under `Mesh/Sections/`, as `(Section) <Name>/` folders, nested to any depth that reads well. The three main sections sit under `Mesh/Main/`. Moving folders around changes nothing.

### Headers — Managed Sections

A `(Section) <Name>.md` artifact upgrades a section from unmanaged to **managed**. The header carries:

1. **Context envelope** — what a mind must already hold to interpret this section's members: the lens, the scope, local definitions, assumed background.
2. **Navigation guide** — the higher-level shape: how the section is organized, where to start, the throughlines.

Header frontmatter:

```yaml
tags:
  - "#ie"                       # marks this artifact as a header
  - "#ie/sections/<name>"       # the section it heads (and lives in)
description: <one-line scent>   # how the section reads in listings
```

The header never lists members — each member owns its `description`, and `load` assembles the list live. Editing a member's description updates what `load` shows instantly; staleness of the list is structurally impossible. What *can* age is the header's curated prose — that is a judgment task, handled by [[dev-wkfl-ie-refresh]].

Headers are **earned**: most sections start as bare tags and get a header when the framing pays for itself. This is progressive typing applied to the environment layer.

## The Main Sections (Flint's convention)

Owned by the **Flint shard**, which depends on this one and scaffolds the folders (`Mesh/Main/`, `Mesh/Sections/`, `Mesh/Groups/`) and three always-there sections under `Mesh/Main/`:

| Section | Meaning |
|---------|---------|
| **New** | The dump target. A node captured with no destination lands here — it exists, it is safe, it has no home yet. |
| **Working** | Being actively developed or used. |
| **Consolidated** | Settled into its long-term form. |

Processing is the pass that moves nodes out of New: forward through the stages, or into the section where they actually belong. The base mechanism is neutral to this convention — these are just three sections that every Flint scaffolds.

## Mesh Groups

A **group** is the sum total of a tag, named — an overlapping collection that cuts across sections. Where a section says *where a node lives* (one answer), groups say *what it is part of* (many answers).

Each group has a definition file `(Group) <Name>.md` in `Mesh/Groups/`:

```yaml
tags: ["#ie/groups/<name>"]     # the group tags itself — its file is findable with its members
description: <one-line scent>
```

Groups replace free-floating ad-hoc tags for any collection meant to be *found and used as a collection*. If a grouping matters enough to reference, it matters enough to have a definition file.

## The Note Contract

The atomic member — one editable model, a slice of reality. Deliberately minimal: one `#note` tag, no subtypes.

```yaml
---
id: <uuid>
tags:
  - "#note"
  - "#ie/sections/cognition"
description: The second axiom — minds have no unmediated access to reality.
contact: []
created: 2026-07-23
modified: 2026-07-23
---

# Minds construct models

[Free-form model content. The title IS the slice — a complete claim or concept.]
```

| Field | Required | Purpose |
|-------|----------|---------|
| `tags` | yes | `#note` + exactly one section tag (+ any group tags) |
| `description` | yes | One-line scent — what `load` discloses; a note without it is invisible |
| `contact` | no | Reality anchors: where this slice touches the territory (`cb-<codebase>` today; telemetry, datasets, people later) |
| `created` / `modified` | yes | Timestamps; `modified` is a convention, not enforced |

Sections contain *any* artifact type, not just notes — a task, a spec, a report all carry section tags. The note is simply the shard's own minimal member type.

## Load — Progressive Disclosure

`flint shard ie load <Section>` is how a section enters a mind's context:

```
## (Section) Cognition — the header
[Context envelope + navigation, verbatim]

## Members
- [[Minds construct models]] — The second axiom; minds have no unmediated access to reality.
- [[A Flint is a thinking technology]] — structure that helps minds do work.
```

Header first (so the reader knows how to interpret what follows), then the scent index assembled live from each member's `description`, then the reader opens members as the task demands. Variable resolution by reader effort — the navigation *is* the retrieval.

## Neutrality — How Other Shards Build on This

This layer is a base, like Flint itself. A shard that creates an environment (OrbCode's concept layer, a spec's world, Current's idea pockets):

1. Declares a section (just starts tagging into it — flat unique name).
2. Authors a header when framing pays.
3. Optionally defines groups for its cross-cutting collections.

It never extends the grammar, adds membership kinds, or introduces parallel structure. If a capability seems missing here, the answer is a conversation about this shard — not a workaround in another one.

## Later (Deliberately Deferred)

Recorded so they aren't relitigated, deferred so the base stays simple:

- **Contamination / boundary theory** — reference direction between environments, definition shadowing, coloring vs isolation. Current's concern, layered on top when that work starts.
- **Operations** — move, split/merge, promote/land, coherence scans.
- **The all-shards migration** — every artifact in the mesh carrying a section tag.
- **Media** — markdown shadow files so media can carry section tags.

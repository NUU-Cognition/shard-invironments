---
required-reading:
  - "[[dev-knw-ie-model]]"
---

# Invironments

The mesh's **Information Environment (IE)** layer — the core primitives for structuring a flat mesh. This shard is a **neutral base**: it holds the raw understanding (the grammar, the model) and the manipulation tooling (scripts, templates), and deliberately nothing else. Workspace conventions — the `Mesh/Main/`, `Mesh/Sections/`, `Mesh/Groups/` folders and the staging sections — belong to the **Flint shard, which depends on this one**. Other shards — OrbCode, Specifications, Current — build their environments on the same primitives.

## The Grammar

One tag namespace. Two primitives. One marker.

| Tag | Meaning |
|-----|---------|
| `#ie/sections/<name>` | This node lives in **mesh section** `<name>`. Exactly one per node. |
| `#ie/groups/<name>` | This node belongs to **mesh group** `<name>`. Any number; overlap is free. |
| `#ie` | This node is a **section header** — the `(Section)` artifact carrying context + navigation. |

That is the entire grammar. *Section* = where you are (one place). *Group* = what you're part of (many). Nothing else exists at this layer.

## Mesh Sections

The core primitive: an exclusive container — basically an **unmanaged environment**. A section exists the moment a tag references it; nothing needs creating. Rules:

- **Names are flat and unique.** `#ie/sections/orbcode` means the same thing everywhere. There is no hierarchy in the data model.
- **Folders are display only.** Sections live visually under `Mesh/Sections/` at arbitrary depth — nest folders however reads well. Moving a section's folder changes nothing.
- **Headers are optional.** Dropping a `(Section) <Name>.md` header into a section upgrades it to a *managed* environment: the header carries the context envelope (what a mind must hold to read the members) and a navigation guide. Headers are earned, not required.

## The Main Sections (Flint's convention)

The **Flint shard** scaffolds three always-there sections under `Mesh/Main/`:

```
New → Working → Consolidated
```

When a note is dumped with no destination, it goes to **New**. Processing moves it forward or into the section where it belongs. This staging convention is Flint's declaration, not this shard's — the mechanism here is neutral to it (the `note` script merely defaults to the New section when one exists).

## Mesh Groups

A group is the sum total of a tag, named: an overlapping collection that cuts across sections. Each group has a definition file `(Group) <Name>.md` in `Mesh/Groups/` — name, one-line description, optional prose. Use a group for anything meant to be *findable as a collection*; use a section for where something *lives*.

## The Note Contract

The atomic member — one editable model, a slice of reality (see [[knw-f-models]]):

```yaml
tags: ["#note", "#ie/sections/<name>"]  # the section tag is authoritative
description: <one-line scent>           # required — what load discloses
contact: []                             # optional; reality anchors
created: <date>
modified: <date>
```

## Scripts

| Script | Command | Output |
|--------|---------|--------|
| Section | `flint shard ie section "<Name>" [display/path]` | Scaffolds `(Section)` folder + header under `Mesh/Sections/` |
| Note | `flint shard ie note "<Title>" [--section <name>] [--description <text>] [--body-file <path>] [--author <Name>] [--session <id>] [--json]` | Creates a note beside its section header. The default section is New. |
| Group | `flint shard ie group "<Name>"` | Scaffolds a `(Group)` definition in `Mesh/Groups/` |
| List | `flint shard ie list` | Sections and groups with member counts, from tags |
| Load | `flint shard ie load "<Section>"` | Prints the header, then the member scent-list |

The canonical note form puts the title first and uses flags for other inputs.
Use `--title "<Title>"` to supply all inputs as flags.
The old `note <section> "<Title>"` form still works.
The default author is `name` in `$NUU_HOME/config.toml`, or `~/.nuucognition/config.toml` when `NUU_HOME` is not set.
If no Name exists, the note has no `authors` field.
The default session is `ORBH_SESSION_ID`. The note stores it as a wikilink in `orbh-sessions`.
The title check covers all Markdown filenames under `Mesh/` and ignores letter case.
The command never overwrites an existing file.
`--json` returns one result object. Errors return `ok: false` and a nonzero exit code.
Use `flint shard ie note --help` for note syntax.

`load` is progressive disclosure: header first (the context), then the scent index, then open individual members as needed.

## Rules

1. Membership is the `#ie/sections/<name>` tag — one per node. The folder a file sits in means nothing semantically.
2. Section names are flat and unique across the mesh.
3. Headers never list members — `load` assembles the list from each member's `description`.
4. Every note carries a one-line `description`.
5. Keep this layer neutral: shards that build environments declare sections and author headers; they don't extend the grammar.
6. Use the scripts to scaffold; author the prose (header framing, note bodies, descriptions) yourself.

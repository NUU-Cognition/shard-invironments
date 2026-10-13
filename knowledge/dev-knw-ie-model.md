---
description: "The IE model — mesh sections (folder, header, tag, kind, closure), mesh groups, the tag grammar, main sections, and progressive disclosure via load"
---

# Knowledge: The IE Model

Deep reference for the Invironments shard. This is the mesh's structural base layer: it answers *where does a node live and what collections is it part of* — and, through headers, *what context makes a section's members interpretable*.

## Why This Layer Exists

A model only means something inside an **Information Environment** — the context a mind must hold to interpret it (see [[knw-f-models]] § Information Environments). A bare Flint has exactly one implicit environment: the whole mesh. Real work grows pockets of local meaning — a codebase's concept layer, a spec, an idea being developed — each needing a place to live and, when it matures, its own declared context.

This shard supplies the smallest mechanism for that: **sections** (where things are), **groups** (what things are part of), and **headers** (the declared context of a section). It holds the grammar and the tools, and nothing more. It is neutral: a base that other shards build on, not a system with its own opinions. The workspace conventions on top of it (folders, staging sections) belong to the Flint shard, which depends on this one. The normative rules are in [[(Spec) Mesh Section and Group Model]].

## The Mesh Is Flat, Except Section Folders

The mesh is flat: a document is identified by its title, and titles are unique in the mesh. Folders are display only, with one exception: a **section folder** `(Section) <Name>/` has meaning. A document in a section folder (or in a subfolder of it) is placed in that section. Structure lives in frontmatter tags and in section folders:

| Structure | Carried by |
|-----------|-----------|
| The section of a document | the section tag `#ie/sections/<key>` (zero or one), and the file is in the section folder |
| The groups of a document | `#ie/groups/<key>` (any number); the place of the file has no meaning |
| The header of a section | the document `(Section) <Name>.md` directly in its section folder, with the bare `#ie` tag |

The tag and the folder must agree. `mesh check` reports each disagreement (`SECTION_FOLDER_MISMATCH`), and `mesh section fix` repairs it.

## Mesh Sections

A section is the semantic boundary of the mesh: a named set of documents. A section is three things that agree:

- **The section folder** `(Section) <Name>/`. It can be at any depth under the mesh folder, but never inside another section folder (`SECTION_FOLDER_NESTED`). Its subfolders are display only. The read-only scope and the media folder hold no sections.
- **The section header** `(Section) <Name>.md`, directly in the section folder (`SECTION_HEADER_MISSING`, `SECTION_HEADER_INVALID`).
- **The section tag** `#ie/sections/<key>` on each member. The header is a member too.

A section exists when its folder and its header exist. A section tag alone does not make a section (`SECTION_UNKNOWN`).

- **Zero or one section per document.** Two section tags is `MULTIPLE_SECTIONS`. A document with no section tag is unsectioned.
- **Name and key.** A name has words of letters and digits. Each word starts with a capital letter or a digit. One space separates two words. A name has 1 to 64 characters and no hyphen or other punctuation. The key is the fold of the name: each word in lowercase, joined by `-` (`Guest Mesh Draft` → `guest-mesh-draft`, `Q4 Review` → `q4-review`). A key matches `^[a-z0-9]+(-[a-z0-9]+)*$` (`SECTION_NAME_INVALID`). Keys are flat and unique in the mesh (`SECTION_DUPLICATE`). Tools compare sections by key.
- **Archive.** An archived member stays in its section, in the subfolder `Archive/` of the section folder.

### Section Kind and Closure

The header can have `section-kind: open` or `section-kind: closed`. No value means `open`.

- In a **closed** section, every counted link from a member goes to a member of the same section. A counted link to another document is a **crossing link**, and `mesh check` reports `SECTION_NOT_CLOSED` with every crossing link.
- An **open** section can have crossing links. Links into a section are always allowed.
- **Counted links:** body links and embeds, and frontmatter links except the keys `authors`, `template`, `orbh-sessions`, and `[sections] closure-exempt-keys` of `mesh.toml`.
- **Not counted:** a link that does not resolve or is ambiguous, a link into the read-only scope, a link to a type definition in `[types] folder`, a link or embed to media, a braced cross-mesh reference, and a link from a document to itself. A heading or block anchor counts as a link to its document.

The full rule is in [[(Spec) Mesh Section and Group Model . Sections]] § 5. `mesh section crossings <section>` lists the crossing links, and `mesh section kind <section> closed` refuses while crossing links exist.

### Headers

The header `(Section) <Name>.md` carries:

1. **Context envelope**: what a mind must already hold to read the members of the section (the lens, the scope, local definitions, assumed background).
2. **Navigation guide**: the higher-level shape: how the section is organized, where to start, the throughlines.

Header frontmatter:

```yaml
tags:
  - "#ie"                       # marks this document as a header
  - "#ie/sections/<key>"        # the section it heads (the header is a member)
section-kind: open              # optional: open (default) or closed
description: <one-line scent>   # how the section reads in listings
```

The header never lists members. Each member owns its `description`, and `load` assembles the list live. So the list is never out of date. The curated prose of the header can age; [[dev-wkfl-ie-refresh]] handles that.

Every section has a header. `mesh section create` writes the folder and the header in one transaction; the `section` script then adds the skeleton of [[dev-tmp-ie-section-v0.2]].

## The Main Sections (Flint's convention)

Owned by the **Flint shard**, which depends on this one and scaffolds the folders (`Mesh/Main/`, `Mesh/Sections/`, `Mesh/Groups/`) and three always-there sections under `Mesh/Main/`:

| Section | Meaning |
|---------|---------|
| **New** | The dump target. A node captured with no destination lands here — it exists, it is safe, it has no home yet. |
| **Working** | Being actively developed or used. |
| **Consolidated** | Settled into its long-term form. |

Processing is the pass that moves nodes out of New: forward through the stages, or into the section where they actually belong. The base mechanism is neutral to this convention — these are just three sections that every Flint scaffolds.

## Mesh Groups

A **group** is a named set of documents that cuts across sections. A section says *where a document is* (one answer, or none). Groups say *what it is part of* (any number of answers).

- **The tag is the only authority.** A document is in group G when its frontmatter tags have `#ie/groups/<key>`. A document can be in any number of groups, from any section or from no section. The place of the file has no meaning for a group.
- **The definition is optional.** A definition `(Group) <Name>.md` names the group and gives a one-line description. It has its own group tag, so it is a member of its group. It can be in any folder; `mesh group create` writes it in `[groups] folder` (default `Groups` under the mesh folder). A valid definition declares its group, also when no document has the tag yet.
- **Grammar.** A group key uses the section key grammar (`GROUP_NAME_INVALID`, a warning). A definition name uses the section name grammar and folds to the key. Two definitions that fold to one key are `GROUP_DUPLICATE`.

```yaml
tags: ["#ie/groups/<key>"]      # the definition has its own group tag
description: <one-line scent>
```

Use a group for a collection that people find and use as a collection. The `mesh group` commands (`list`, `show`, `create`, `add`, `remove`, `rename`, `delete`) change groups, and the selection flags `--group` (all) and `--any-group` (one of them) select by group.

## The Note Contract

The atomic member — one editable model, a slice of reality. Deliberately minimal: one `#note` tag, no subtypes.

```yaml
---
id: <uuid>
tags:
  - "#note"
  - "#ie/sections/cognition"     # optional: zero or one section tag
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
| `tags` | yes | `#note`, zero or one section tag, and any group tags |
| `description` | yes | One-line scent — what `load` discloses; a note without it is invisible |
| `contact` | no | Reality anchors: where this slice touches the territory (`cb-<codebase>` today; telemetry, datasets, people later) |
| `created` / `modified` | yes | Timestamps; `modified` is a convention, not enforced |

The section tag is optional. A note with a section tag is in the folder of its section; `mesh create --section <section>` places it there. A note with no section tag is unsectioned.

A section can hold *any* artifact type, not only notes: a task, a spec, or a report can have a section tag. The note is the minimal member type of this shard.

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

This layer is a base, like Flint itself. A shard that creates an environment (the concept layer of OrbCode, the world of a spec, the idea pockets of Current):

1. Creates a section (`mesh section create`, or the `section` script): the folder, the header, and the flat unique key.
2. Writes the prose of the header.
3. Optionally names groups for its cross-cutting collections.

It never extends the grammar, adds membership kinds, or adds a parallel structure. If a capability seems missing here, discuss a change to this shard. Do not add a workaround in another shard.

## Later (Deliberately Deferred)

These items are recorded so that nobody discusses them again, and deferred so that the base stays simple:

- **Contamination and definition shadowing**: definition shadowing between environments, and coloring versus isolation. Current owns this work. (The closure rule of closed sections is defined now; see Section Kind and Closure.)
- **Cross-mesh reference form**: the rendering of a braced cross-mesh reference. Closure ignores such references until then.
- **Media**: Markdown shadow files, so that media can have section tags. Media travels with a section by embed closure.

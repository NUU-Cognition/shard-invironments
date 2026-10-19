---
orbh-sessions: [b0789b67-a355-4721-a49b-5763a95aa3c4, b37f454a-9107-4acd-8b19-7da95177ddfe]
required-reading:
  - "[[dev-knw-ie-model]]"
orb:
  - "@v1/nuucognition/session/9f552ce0-0455-44ed-b8ec-d749c3ae9b2f#flint/nuu-orbh"
  - "@v1/nuucognition/session/11ee491c-0bce-4b77-8d97-aa78c6a34ccf#flint/nuu-flint"
---

# Invironments

The mesh's **Information Environment (IE)** layer: the core primitives that give a mesh its structure. The mesh is flat, with one exception: a section folder has meaning. This shard is a **neutral base**. It holds the grammar, the model, and the tools (scripts, templates), and nothing else. The workspace conventions (the `Mesh/Main/`, `Mesh/Sections/`, and `Mesh/Groups/` folders and the staging sections) belong to the **Flint shard, which depends on this one**. Other shards (OrbCode, Specifications, Current) build their environments on the same primitives.

## The Grammar

One tag namespace. Two primitives. One marker.

| Tag | Meaning |
|-----|---------|
| `#ie/sections/<key>` | This document is in the **mesh section** with the key `<key>`. Zero or one per document. |
| `#ie/groups/<key>` | This document is in the **mesh group** `<key>`. Any number per document. |
| `#ie` | This document is a **section header**: the `(Section) <Name>` document of a section folder. |

A *section* is where a document is (one place, or none). A *group* is what a document is part of (any number). The full rules are in [[(Spec) Mesh Section and Group Model]].

## Mesh Sections

A section is a named set of documents with a semantic boundary. A section is three things that agree:

- **The section folder** `(Section) <Name>/`, anywhere under the mesh folder, but never inside another section folder. The folder has meaning: the members of the section are in this folder or in its subfolders.
- **The section header** `(Section) <Name>.md`, directly in the section folder. It has the tag `#ie` and the section tag. It holds the context envelope (what a mind must hold to read the members), a navigation guide, and a one-line `description`. Every section has a header.
- **The section tag** `#ie/sections/<key>` on each member, the header included. The tag is the membership. A tag alone does not make a section: the folder and the header make it.

A document has zero or one section. A document with no section tag is **unsectioned**.

**Name and key.** A section name has words of letters and digits. Each word starts with a capital letter or a digit. One space separates two words. A name has 1 to 64 characters and no hyphen or other punctuation (`Mesh SDK Docs` is valid). The key is the name in lowercase, with `-` between the words (`Mesh SDK Docs` → `mesh-sdk-docs`). Keys are flat and unique in the mesh. Tools compare sections by key, and accept the name, the key, or the header title.

**Kind.** The header can have `section-kind: open` or `section-kind: closed`. No value means `open`. In a **closed** section, every counted link from a member goes to a member of the same section. An **open** section can link out. Links into a section are always allowed. The counted links and the exceptions are in [[(Spec) Mesh Section and Group Model . Sections]] § 5.

`mesh check` reports each break of these rules, and the `mesh section` commands (`create`, `rename`, `move`, `unassign`, `kind`, `merge`, `delete`, `fix`) keep the folder, the header, and the tags in agreement.

## The Main Sections (Flint's convention)

The **Flint shard** scaffolds three sections under `Mesh/Main/`:

```
New → Working → Consolidated
```

When a note has no destination, it goes to **New**. Processing moves it forward, or into the section where it belongs. This staging convention belongs to the Flint shard, not to this shard. The mechanism here is neutral to it: the `note` script uses the New section only as its default.

## Mesh Groups

A group is a named set of documents that cuts across sections. The group tag `#ie/groups/<key>` is the only authority for membership. A document can be in any number of groups, from any section or from no section. The place of a file has no meaning for a group.

The group definition `(Group) <Name>.md` is **optional**. It names the group and gives a one-line description. It has its own group tag. It can be in any folder; `mesh group create` writes it in `[groups] folder` (default `Groups` under the mesh folder). A group key uses the section key grammar, and a definition name uses the section name grammar.

Use a group for a collection that people find and use as a collection. Use a section for the place where a document is.

## The Note Contract

The atomic member: one editable model, a slice of reality (see [[knw-f-models]]):

```yaml
tags: ["#note", "#ie/sections/<key>"]   # the section tag is optional: zero or one
description: <one-line scent>           # required: load shows it
contact: []                             # optional; reality anchors
created: <date>
modified: <date>
```

A note with a section tag is in the folder of that section.

## Scripts

Each script calls the `mesh` CLI. The script uses `MESH_BIN` when it is set (a path to the `mesh` binary, or to its `bin.js`), else `mesh` on the `PATH`. The mesh root is the Flint root (the folder of `mesh.json`).

| Script | Command | What it does |
|--------|---------|--------------|
| Section | `flint shard ie section "<Name>" [--in <folder>] [--kind open\|closed] [--description <text>] [--json]` | Creates the section folder and its header in one transaction (`mesh section create`, then the header fields and body of [[dev-tmp-ie-section-v0.2]]). The parent folder is `--in`, else `[sections] folder`. |
| Note | `flint shard ie note "<Title>" [--section <section>] [--description <text>] [--body-file <path>] [--author <Name>] [--session <id>] [--json]` | Creates a note in the folder of its section, with the section tag (`mesh create --section`). The default section is New. |
| Group | `flint shard ie group "<Name>" [--description <text>] [--json]` | Creates a group definition (`mesh group create`, then the fields of [[dev-tmp-ie-group-v0.2]]). |
| List | `flint shard ie list [--json]` | Lists the sections and the groups with their counts (`mesh section list`, `mesh group list`). |
| Load | `flint shard ie load "<Section>" [--json]` | Prints the header, then the member scent list (`mesh section show`). |

A `<section>` argument is the section name, the key, or the header title.
The default author of a note is the operator Name from the CLI, passed in `FLINT_OPERATOR_NAME`.
Without that variable, the script reads top-level `name` from `$NUU_HOME/config.toml`, or `~/.nuucognition/config.toml`.
Use `--author` to override the default author. If no Name exists, the note has no `authors` field.
The default session is `ORBH_SESSION_ID`. Use `--session` to override it. The note stamps the session in `orb:` with the `by` address of `flint address me`.
When the CLI has no `flint address me`, the note gets the short form `@v1/<org>/session/<uuid>` (the org of `[flint] org` in `flint.toml`).
A session that is not a UUID gives a warning and no stamp.
`flint shard ie section` and `flint shard ie group` stamp `ORBH_SESSION_ID` in `orb:` in the same way. With no session, the scripts write no `orb:`.
Each script asks the CLI for the address before it calls the `mesh` CLI, so the lock of the mesh transaction stays short. The scripts write no `orbh-sessions`.
Old notes keep `orbh-sessions`: never remove it, and add no new item to it. The full rule is in [[knw-f-artifacts]] § Session Tracking.
The `mesh` CLI refuses a title or case collision anywhere in the mesh (exit 9) and never overwrites a file.
`--json` returns one result object. Errors return `ok: false` and a nonzero exit code.
Use `flint shard ie note --help` for the note syntax.

`load` is progressive disclosure: the header first (the context), then the scent index, then the members that the task needs.

## Rules

1. Membership is the section tag `#ie/sections/<key>`: zero or one per document. A member is in its section folder (or a subfolder of it).
2. Section keys are flat and unique in the mesh. Section names follow the name grammar, and the key is the fold of the name. A section folder is never inside another section folder.
3. Every section has its header. Headers never list members: `load` assembles the list from the `description` of each member.
4. Every note has a one-line `description`.
5. A closed section has no crossing links. `mesh check` reports `SECTION_NOT_CLOSED`.
6. The group tag is the only authority for group membership. A group definition is optional.
7. Keep this layer neutral: shards that build environments declare sections and write headers. They do not extend the grammar.
8. Use the scripts or the `mesh` commands to create and change sections and groups. Write the prose (header framing, note bodies, descriptions) yourself.

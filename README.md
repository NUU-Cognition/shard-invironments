# Invironments

The mesh's **Information Environment (IE)** layer: the core primitives that give a mesh its structure. **Mesh sections** (where a document is), **mesh groups** (what it is part of), and **section headers** (the declared context of a section). A neutral base with the grammar and the tools only. The workspace conventions (`Mesh/Main/`, `Mesh/Sections/`, `Mesh/Groups/`, the staging sections) belong to the Flint shard, which depends on this one.

## The Grammar

| Tag | Meaning |
|-----|---------|
| `#ie/sections/<key>` | In mesh section `<key>`: zero or one per document; keys flat and unique |
| `#ie/groups/<key>` | In mesh group `<key>`: any number per document |
| `#ie` | Marks a `(Section)` header |

- **A section is a folder, a header, and a tag.** The folder `(Section) <Name>/` (never inside another section folder), the header `(Section) <Name>.md` directly in it, and the section tag on each member. The folder has meaning: the members are in it.
- **Name and key.** Words of letters and digits, each word starts with a capital letter or a digit, one space between words, 1 to 64 characters. The key is the name in lowercase with `-` between the words.
- **Kind.** `section-kind: open` (default) or `closed`. A closed section has no crossing links (`mesh check` reports `SECTION_NOT_CLOSED`).
- **Main sections**: every Flint has `Mesh/Main/`: New → Working → Consolidated. Notes with no destination go to New.
- **Groups**: the group tag is the only authority. A `(Group) <Name>.md` definition is optional.
- **`load`**: assembles the member list of a section from the `description` of each member; headers never list members.

The rules are in `(Spec) Mesh Section and Group Model` of the NUU Mesh Flint.

## Scripts

Each script calls the `mesh` CLI (`MESH_BIN`, else `mesh` on the `PATH`) on the Flint root, which must hold `mesh.json`.

```
flint shard ie section "<Name>" [--in <folder>] [--kind open|closed] [--description <text>]   # mesh section create + header skeleton
flint shard ie note "<Title>" [--section <section>] [--description <text>] [--body-file <path>]   # mesh create --section; default section New
flint shard ie group "<Name>" [--description <text>]   # mesh group create + definition skeleton
flint shard ie list                                     # mesh section list + mesh group list
flint shard ie load "<Section>"                         # header + member scent list (mesh section show)
```

## Structure

```
Shards/(Dev Remote) Invironments/
  shard.yaml                      # Manifest — types Section, Group, Note (folders are Flint's)
  dev-init-ie.md                  # Init — grammar + rules
  knowledge/
    dev-knw-ie-model.md           # Deep reference: the IE model
  skills/
    dev-sk-ie-create_section.md   # Create a section + author its header
  templates/
    dev-tmp-ie-section-v0.2.md    # Section header template (v0.1 superseded)
    dev-tmp-ie-note-v0.2.md       # Note template (v0.1 superseded)
    dev-tmp-ie-group-v0.2.md      # Group definition template (v0.1 superseded)
  workflows/
    dev-wkfl-ie-refresh.md        # Refresh a header's prose as members accumulate
  scripts/
    dev-section.js  dev-note.js  dev-group.js  dev-list.js  dev-load.js
  install/
    type-ie-section.md  type-ie-group.md  type-ie-note.md   # Type definitions (driven by types:)
    otmp-ie-note.md                  # Templater note template
    inst-ie-plugin_commands.js       # Obsidian plugin command
```

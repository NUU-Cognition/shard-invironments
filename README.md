# Invironments

The mesh's **Information Environment (IE)** layer — the core primitives for structuring a flat mesh: **mesh sections** (where a node lives), **mesh groups** (what it's part of), and **section headers** (declared context, when earned). A neutral base holding raw understanding + manipulation only; workspace conventions (`Mesh/Main/`, `Mesh/Sections/`, `Mesh/Groups/`, the staging sections) belong to the Flint shard, which depends on this one.

## The Grammar

| Tag | Meaning |
|-----|---------|
| `#ie/sections/<name>` | Lives in mesh section `<name>` — exactly one per node; names flat + unique |
| `#ie/groups/<name>` | In mesh group `<name>` — any number, overlap free |
| `#ie` | Marks a `(Section)` header artifact |

- **Flat mesh** — folders are display only; all structure is tags. Section identity is the name; folder nesting under `Mesh/Sections/` is arbitrary display depth.
- **Sections are unmanaged by default** — they exist the moment a tag references them. A `(Section) <Name>.md` header (context envelope + navigation) upgrades one to managed.
- **Main sections** — every Flint has `Mesh/Main/`: New → Working → Consolidated. Notes dumped with no destination land in New.
- **Groups** — `(Group) <Name>.md` definitions in `Mesh/Groups/`; the sum total of a tag, named.
- **`load`** — assembles a section's member list live from each member's `description`; headers never list members.

## Scripts

```
flint shard ie section "<Name>" [display/path]  # scaffold a (Section) folder + header
flint shard ie note ["<Section>"] "<Title>"     # scaffold a note; no section → New
flint shard ie group "<Name>"                   # scaffold a (Group) definition
flint shard ie list                              # sections + groups with member counts, from tags
flint shard ie load "<Section>"                  # header + assembled member scent-list
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
    dev-tmp-ie-section-v0.1.md    # Section header template
    dev-tmp-ie-note-v0.1.md       # Note template
    dev-tmp-ie-group-v0.1.md      # Group definition template
  workflows/
    dev-wkfl-ie-refresh.md        # Refresh a header's prose as members accumulate
  scripts/
    dev-section.js  dev-note.js  dev-group.js  dev-list.js  dev-load.js
  install/
    type-ie-section.md  type-ie-group.md  type-ie-note.md   # Type definitions (driven by types:)
    otmp-ie-note.md                  # Templater note template
    inst-ie-plugin_commands.js       # Obsidian plugin command
```

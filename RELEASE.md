# 0.2.0

The section and group model of `(Spec) Mesh Section and Group Model` (NUU Mesh Flint, Task 696).

- A section is three things that agree: the section folder `(Section) <Name>/`, the header `(Section) <Name>.md` directly in it, and the section tag `#ie/sections/<key>` on each member. A tag alone does not make a section. The folder has meaning: the members of a section are in its folder. A section folder is never inside another section folder.
- A document has zero or one section. The section tag is optional (the note contract changes).
- Section names follow a grammar (words of letters and digits, each word starts with a capital letter or a digit, one space between words, 1 to 64 characters); the key is the fold of the name. Keys are flat and unique.
- A section is `open` or `closed` (`section-kind` in the header). A closed section has no crossing links; the closure rule is defined (it was deferred).
- The group tag is the only authority for group membership. The group definition is optional.
- New template versions: `tmp-ie-section-v0.2` (the folder rule, `section-kind`), `tmp-ie-group-v0.2` (the definition is optional), and `tmp-ie-note-v0.2` (zero or one section tag). The v0.1 files stay as superseded notices, so the `template` links of existing documents resolve.
- The scripts `section`, `note`, `group`, `list`, and `load` call the `mesh` CLI (`section create`, `create --section`, `group create`, `section list`, `group list`, `section show`). The CLI is `MESH_BIN`, else `mesh` on the `PATH`. The Flint root must hold `mesh.json`. The old positional form `note <section> "<Title>"` and the display path argument of `section` are removed: use `--section` and `--in`.
- The Templater note template and the plugin command follow the folder rule: a note in a section folder gets the tag of that folder; a note outside every section folder has no section tag.

---

# 0.1.2

- `otmp-ie-note.md` (the note template) installs with `mode: force`. Before, it installed with `mode: once`, so a Flint kept an old copy with the removed `(IE) <Name>` / `#ie/<slug>` model. The note template uses the `(Section) <Name>` folder and the `#ie/sections/<slug>` tag, with no frontmatter block before the Templater script.
- A CLI of NUU Flint Task 1055 installs a note template byte for byte (no `#readonly` block) and replaces an unchanged copy. It keeps a changed copy and names the next command `flint shard reinstall <alias> --replace-note-templates`.

---

# 0.0.1

- Initial shard: mesh sections, mesh groups, section headers, notes
- Tag grammar: `#ie/sections/<name>` (one per node), `#ie/groups/<name>` (any number), bare `#ie` marks a `(Section)` header
- Flat mesh: section names are flat and unique; folder nesting is display only
- Scripts: section, note, group, list, load

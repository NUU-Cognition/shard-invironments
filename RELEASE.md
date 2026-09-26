# 0.1.2

- `otmp-ie-note.md` (the note template) installs with `mode: force`. Before, it installed with `mode: once`, so a Flint kept an old copy with the removed `(IE) <Name>` / `#ie/<slug>` model. The note template uses the `(Section) <Name>` folder and the `#ie/sections/<slug>` tag, with no frontmatter block before the Templater script.
- A CLI of NUU Flint Task 1055 installs a note template byte for byte (no `#readonly` block) and replaces an unchanged copy. It keeps a changed copy and names the next command `flint shard reinstall <alias> --replace-note-templates`.

---

# 0.0.1

- Initial shard: mesh sections, mesh groups, section headers, notes
- Tag grammar: `#ie/sections/<name>` (one per node), `#ie/groups/<name>` (any number), bare `#ie` marks a `(Section)` header
- Flat mesh: section names are flat and unique; folder nesting is display only
- Scripts: section, note, group, list, load

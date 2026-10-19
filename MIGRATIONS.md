# Migrations

Migration notes for Invironments. Latest version at top, separated by `---`.

# 0.2.3

- No migration step. New notes, sections, and groups get `orb:`. Old documents keep `orbh-sessions`: the shard does not rewrite them (NUU Orbh Mission 027).

---

# 0.2.0

- No migration step in the shard. The rules change, and existing data can break them: a section tag with no section folder and header (`SECTION_UNKNOWN`), a member outside its section folder (`SECTION_FOLDER_MISMATCH`), a nested key such as `main/working` (`SECTION_NAME_INVALID`), or two section tags (`MULTIPLE_SECTIONS`). Run `mesh check` to find them, and `mesh section fix` to repair the folder disagreements. The data migration of a Flint is a separate task: for NUU Mesh, see `(Spec) Mesh Section and Group Model . Migration`.
- The scripts need the `mesh` CLI with the section and group commands, and a mesh root (`mesh.json`) at the Flint root. In a Flint with no mesh root, the scripts stop and print `mesh init "<flint root>"`.
- Documents with `template: "[[tmp-ie-*-v0.1]]"` keep a link that resolves: the v0.1 templates stay as superseded notices.

---

# 0.1.2

- No migration step. The install replaces `Shards/(Shards) Obsidian Templates/otmp-ie-note.md` when the lock records it and nobody changed it.
- An older Flint can hold a copy that the lock does not record (an install with `mode: once`), often with the removed `(IE)` model and a `#readonly` block. The install keeps that copy and prints `Kept note template … Next: flint shard reinstall <alias> --replace-note-templates`. Run that command: it saves a backup of the old copy and installs the new note template. The Flint migration of 0.7.0 does not change note templates (NUU Flint Task 1055, decision S33 of `(Spec) Flint Obsidian`). The rollout of 0.7.0 does it in each Flint: run `flint shard update`, then run `flint shard reinstall <alias> --replace-note-templates`. No note changes.

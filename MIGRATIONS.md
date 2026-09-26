# Migrations

Migration notes for Invironments. Latest version at top, separated by `---`.

# 0.1.2

- No migration step. The install replaces `Shards/(Shards) Obsidian Templates/otmp-ie-note.md` when the lock records it and nobody changed it.
- An older Flint can hold a copy that the lock does not record (an install with `mode: once`), often with the removed `(IE)` model and a `#readonly` block. The install keeps that copy and prints `Kept note template … Next: flint shard reinstall <alias> --replace-note-templates`. Run that command: it saves a backup of the old copy and installs the new note template. The Flint migration of 0.7.0 does not change note templates (NUU Flint Task 1055, decision S33 of `(Spec) Flint Obsidian`). The rollout of 0.7.0 does it in each Flint: run `flint shard update`, then run `flint shard reinstall <alias> --replace-note-templates`. No note changes.

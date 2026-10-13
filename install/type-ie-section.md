---
id: 3e9c7a14-2b6d-4f08-9a51-7c4e2d8b6f30
tags:
  - "#f/metadata"
  - "#f/type"
---

# Section

A Section is the header of a mesh section: the document `(Section) <Name>.md` directly in its section folder `(Section) <Name>/`. A mesh section is three things that agree: the section folder, this header, and the section tag `#ie/sections/<key>` on each member (the header included). The folder has meaning: the members are in it or in its subfolders. A section folder is never inside another section folder. The header carries the context envelope (what a mind must hold to read the members), a navigation guide, a one-line `description`, and optionally `section-kind` (`open`, the default, or `closed`). It never lists members: `flint shard ie load` assembles the list from the `description` of each member. A document has zero or one section; a collection that overlaps sections is a Group. A section name has words of letters and digits (each word starts with a capital letter or a digit, one space between words, 1 to 64 characters), and its key is the name in lowercase with `-` between the words. Keys are unique in the mesh.

## Properties

| Property | Value |
|----------|-------|
| Tag | `#ie` (header marker) + `#ie/sections/<key>`; members have `#ie/sections/<key>` |
| Naming | `(Section) <Name>.md` |
| Location | Directly in `[parent folder/](Section) <Name>/`; the default parent is `[sections] folder` (`Mesh/Sections`) |

## Templates

- [[tmp-ie-section-v0.2]]

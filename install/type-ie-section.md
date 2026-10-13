---
id: 3e9c7a14-2b6d-4f08-9a51-7c4e2d8b6f30
tags:
  - "#f/metadata"
  - "#f/type"
---

# Section

A Section is the header of a mesh section.

- The header is the document `(Section) <Name>.md`.
- The header is directly in its section folder `(Section) <Name>/`.
- A mesh section is three things that agree: the section folder, the header, and the section tag.
- Each member has the section tag `#ie/sections/<key>`.
- The header is a member of its section.
- The folder has meaning: the members are in the section folder or in its subfolders.
- A section folder is never inside another section folder.
- The header holds the context envelope: what a mind must hold to read the members.
- The header holds a navigation guide.
- The header holds a one-line `description`.
- The header can have `section-kind`: `open` (the default) or `closed`.
- The header never lists the members. `flint shard ie load` assembles the list from the `description` of each member.
- A document has zero or one section.
- A collection that overlaps sections is a Group.
- A section name has words of letters and digits.
- Each word starts with a capital letter or a digit.
- One space separates two words.
- A name has 1 to 64 characters.
- The key is the name in lowercase, with `-` between the words.
- Keys are unique in the mesh.

## Properties

| Property | Value |
|----------|-------|
| Tag | `#ie` (header marker) + `#ie/sections/<key>`; members have `#ie/sections/<key>` |
| Naming | `(Section) <Name>.md` |
| Location | Directly in `[parent folder/](Section) <Name>/`; the default parent is `[sections] folder` (`Mesh/Sections`) |

## Templates

- [[tmp-ie-section-v0.2]]

---
id: 5b1d8c22-7e4f-4a39-9c60-2f8b3d1e9a47
tags:
  - "#f/metadata"
  - "#f/type"
---

# Group

A Group is a named mesh group — the sum total of a tag: an overlapping collection that cuts across mesh sections. Where a section says where a node lives (exactly one answer), groups say what a node is part of (any number of answers, overlap free). The definition file `(Group) <Name>.md` in `Mesh/Groups/` makes the collection findable and states its intent; it carries its own `#ie/groups/<slug>` tag so it surfaces alongside its members. Groups replace free-floating ad-hoc tags for any collection meant to be found and used as a collection.

## Properties

| Property | Value |
|----------|-------|
| Tag | `#ie/groups/<slug>` (definition and members alike) |
| Naming | `(Group) <Name>.md` |
| Location | `Mesh/Groups/` |

## Templates

- [[tmp-ie-group-v0.1]]

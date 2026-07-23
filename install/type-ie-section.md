---
id: 3e9c7a14-2b6d-4f08-9a51-7c4e2d8b6f30
tags:
  - "#f/metadata"
  - "#f/type"
---

# Section

A Section is a mesh section's header — the artifact that upgrades an exclusive container of the flat mesh from unmanaged (a bare `#ie/sections/<name>` tag) to a managed Information Environment. It carries the context envelope (what a mind must hold to interpret the section's members) and a navigation guide, never a member list — `flint shard ie load` assembles that live from each member's `description`. Section names are flat and unique across the mesh; folder nesting under `Mesh/Sections/` (or `Mesh/Main/` for the three main sections) is display only. A node lives in exactly one section — where it lives is a single fact; overlapping collections are Groups.

## Properties

| Property | Value |
|----------|-------|
| Tag | `#ie` (header marker) + `#ie/sections/<slug>`; members carry `#ie/sections/<slug>` |
| Naming | `(Section) <Name>.md` |
| Location | `Mesh/Sections/[display path/](Section) <Name>/` (display only) |

## Templates

- [[tmp-ie-section-v0.1]]

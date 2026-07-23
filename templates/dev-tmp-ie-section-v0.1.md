---
description: "Section header — the artifact that upgrades a mesh section to a managed environment: context envelope plus navigation guide"
---

# Filename: Mesh/Sections/[display path/](Section) [Name]/(Section) [Name].md

/* The header upgrades a mesh section from unmanaged (a bare tag) to managed.
   It carries the context envelope and a higher-level navigation guide. It does
   NOT list members — `flint shard ie load` assembles that from each member's
   `description`. The folder location is display only; the tags are authoritative.
   The `flint shard ie section` script scaffolds this skeleton; fill in the prose. */

```markdown
---
id: [generate-uuid4]
tags:
  - "#ie" /* marks this artifact as a section header */
  - "#ie/sections/[slug]" /* the section this header heads (and lives in).
                             Slug: lowercase name, spaces → hyphens.
                             Section names are flat and unique across the mesh. */
description: [One high-scent line — how this section reads in listings.]
orbh-sessions:
template: "[[tmp-ie-section-v0.1]]"
authors: /* from flint whoami; omit if no name set */
  - "[[@Person Name]]"
created: [YYYY-MM-DD]
modified: [YYYY-MM-DD]
---

# [Name]

> [Context envelope: in 1–3 sentences, what must a mind already hold to read this
>  section's members? The lens, the scope, the local definitions, the assumed
>  background. This is the context a reader loads before the members mean anything.]

## Navigation

[The higher-level shape of the section: how it is organized, where a reader
 should start, and the major throughlines connecting the members. This is a guide,
 NOT a list of every member — the member list is produced by `flint shard ie load`.
 Reference key entry-point members by wikilink where it helps orient the reader.]
```

/* Notes:
   - "#ie" (bare) is what marks a header; "#ie/sections/[slug]" is the section it
     belongs to — two tags, two roles.
   - Do NOT add a "## Members" section enumerating members — that is `load`'s job
     (single source of truth: each member owns its own description).
   - Keep the header's curated prose current as members accumulate via the
     refresh workflow — but never by hand-listing members here.
*/

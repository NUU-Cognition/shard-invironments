---
description: "Group definition — names a mesh group and says what belongs in it"
---

# Filename: Mesh/Groups/(Group) [Name].md

/* A group is the sum total of a tag, named — an overlapping collection that cuts
   across sections. The definition file makes the group findable and states its
   intent. It tags itself with its own group tag, so loading the group surfaces
   the definition alongside the members. The `flint shard ie group` script
   scaffolds this; fill in the description and criteria. */

```markdown
---
id: [generate-uuid4]
tags:
  - "#ie/groups/[slug]" /* the group's own tag — the definition is a member of
                           its own collection. Slug: lowercase, spaces → hyphens. */
description: [One high-scent line — what this group collects.]
orbh-sessions:
template: "[[tmp-ie-group-v0.1]]"
authors: /* from flint whoami; omit if no name set */
  - "[[@Person Name]]"
created: [YYYY-MM-DD]
modified: [YYYY-MM-DD]
---

# [Name]

[What belongs in this group and why the collection is worth naming. 1–3 sentences
 is usually enough. If membership has criteria worth stating, state them.]
```

/* Notes:
   - Group membership on any node is just the "#ie/groups/[slug]" tag — any node,
     any number of groups, overlap free.
   - Groups say what a node is PART OF; sections say where it LIVES. If a grouping
     must not cross environments or must be exclusive, it should be a section.
*/

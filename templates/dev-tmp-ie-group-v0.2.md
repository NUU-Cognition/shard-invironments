---
description: "Group definition — the optional document that names a mesh group and says what belongs in it"
---

# Filename: Mesh/Groups/(Group) [Name].md

/* A group is a named set of documents that cuts across sections. The group tag
   "#ie/groups/[key]" on a document is the only authority for membership: a
   group exists when one document has the tag. This definition is OPTIONAL. It
   names the group and states its intent. It has its own group tag, so it is a
   member of its group. It can be in any folder; the place of a file has no
   meaning for a group. Create it with `flint shard ie group "[Name]"` (it calls
   `mesh group create`, which writes it in [groups] folder), then write the
   description and the criteria. */

```markdown
---
id: [generate-uuid4]
tags:
  - "#ie/groups/[key]" /* the own tag of the group. Name: the section name grammar
                          (words of letters and digits, each word starts with a
                          capital letter or a digit, one space between words).
                          Key: each word in lowercase, joined by "-". */
description: [One high-scent line — what this group collects.]
orbh-sessions:
template: "[[tmp-ie-group-v0.2]]"
authors: /* from flint whoami; omit if no name set */
  - "[[@Person Name]]"
created: [YYYY-MM-DD]
modified: [YYYY-MM-DD]
---

# [Name]

[What belongs in this group and why the collection has a name. 1 to 3
 sentences are usually enough. If membership has criteria, state them.]
```

/* Notes:
   - Group membership on a document is only the "#ie/groups/[key]" tag: any
     document, any number of groups.
   - Groups say what a document is PART OF; a section says where it IS. If a
     collection must be exclusive or must have a boundary, make it a section.
   - Use the `mesh group` commands (add, remove, rename, delete) to change the
     members and the group.
*/

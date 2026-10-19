---
description: "Group definition — the optional document that names a mesh group and says what belongs in it"
orb:
  - "@v1/nuucognition/session/9f552ce0-0455-44ed-b8ec-d749c3ae9b2f#flint/nuu-orbh"
  - "@v1/nuucognition/session/11ee491c-0bce-4b77-8d97-aa78c6a34ccf#flint/nuu-flint"
---

# Filename: Mesh/Groups/(Group) [Name].md

/* A group is a named set of documents that cuts across sections.
   The group tag "#ie/groups/[key]" on a document is the only authority for
   membership. A group exists in two ways:
   - one document or more has the group tag, or
   - a valid definition "(Group) [Name]" declares it, also when no document
     has the tag yet (the group then has zero members).
   This definition is OPTIONAL. It names the group and states its intent. It
   has its own group tag, so it is a member of its group. It can be in any
   folder: the place of a file has no meaning for a group.
   Create it with `flint shard ie group "[Name]"`. The script calls
   `mesh group create`, which writes it in [groups] folder. Then write the
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
orb: /* the by address of flint address me for ORBH_SESSION_ID; the script
       omits it when there is no session */
  - "[the by address of flint address me]"
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
   - `orb:` holds the session stamps (NUU Orbh Mission 027). Each item is the
     quoted `by` address of `flint address me`. An agent that edits the
     definition appends its address. It adds nothing only when `orb:` or
     `orbh-sessions` has an item that is exactly its `by` address, the short
     form `@v1/<org>/session/<uuid>`, `[[<uuid>]]`, or its bare `<uuid>`. Old
     documents keep `orbh-sessions`: never remove it, and add no new item to
     it. The full rule is in [[knw-f-artifacts]] § Session Tracking.
*/

---
description: "Section header — the (Section) <Name> document directly in its section folder: the kind, the context envelope, and the navigation guide"
orb:
  - "@v1/nuucognition/session/9f552ce0-0455-44ed-b8ec-d749c3ae9b2f#flint/nuu-orbh"
  - "@v1/nuucognition/session/11ee491c-0bce-4b77-8d97-aa78c6a34ccf#flint/nuu-flint"
---

# Filename: Mesh/[parent folder/](Section) [Name]/(Section) [Name].md

/* A section is its folder, its header, and the section tag on each member.
   This template is the header. The folder has meaning: the members of the
   section are in the folder "(Section) [Name]/" or in its subfolders, and the
   header is directly in that folder. The folder is never inside another
   section folder. The default parent folder is [sections] folder of
   mesh.toml (Mesh/Sections).
   Create the folder and the header with `flint shard ie section "[Name]"`
   (it calls `mesh section create`), then write the prose. The header does NOT
   list members: `flint shard ie load` assembles the list from the
   `description` of each member. */

```markdown
---
id: [generate-uuid4]
tags:
  - "#ie" /* marks this document as a section header */
  - "#ie/sections/[key]" /* the section this header heads; the header is a member.
                            Name: words of letters and digits, each word starts with
                            a capital letter or a digit, one space between words,
                            1 to 64 characters, no hyphen or other punctuation.
                            Key: each word in lowercase, joined by "-"
                            (Mesh SDK Docs -> mesh-sdk-docs). Keys are unique. */
section-kind: [open | closed] /* optional; no value means open. In a closed
                                 section every counted link from a member goes to a
                                 member of the same section (mesh check reports
                                 SECTION_NOT_CLOSED). */
description: [One high-scent line — how this section reads in listings.]
orb: /* the by address of flint address me for ORBH_SESSION_ID; the script
       omits it when there is no session */
  - "[the by address of flint address me]"
template: "[[tmp-ie-section-v0.2]]"
authors: /* from flint whoami; omit if no name set */
  - "[[@Person Name]]"
created: [YYYY-MM-DD]
modified: [YYYY-MM-DD]
---

# [Name]

> [Context envelope: in 1 to 3 sentences, what must a mind already hold to read
>  the members of this section? The lens, the scope, the local definitions, the
>  assumed background.]

## Navigation

[The higher-level shape of the section: how it is organized, where a reader
 starts, and the major throughlines between the members. This is a guide, NOT a
 list of every member: `flint shard ie load` produces the member list. Link key
 entry-point members where it helps the reader.]
```

/* Notes:
   - "#ie" (bare) marks a header; "#ie/sections/[key]" is the section it is in.
     Two tags, two roles.
   - Do NOT add a "## Members" section. Each member owns its description.
   - Keep the prose current with the refresh workflow, never by a member list.
   - To rename, move, merge, or delete a section, use the `mesh section`
     commands. They keep the folder, the header, and the member tags in
     agreement in one transaction.
   - `orb:` holds the session stamps (NUU Orbh Mission 027). Each item is the
     quoted `by` address of `flint address me`. An agent that edits the
     header appends its address. It adds nothing only when `orb:` or
     `orbh-sessions` has an item that is exactly its `by` address, the short
     form `@v1/<org>/session/<uuid>`, `[[<uuid>]]`, or its bare `<uuid>`. Old
     documents keep `orbh-sessions`: never remove it, and add no new item to
     it. The full rule is in [[knw-f-artifacts]] § Session Tracking.
*/

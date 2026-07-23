<%*
/* IE note — Templater template.
   Detects whether this file lives directly inside a `(Section) <Name>/` folder
   and auto-populates the note frontmatter, including the authoritative section
   tag `#ie/sections/<slug>` (the folder is only the visual default — the tag is
   what binds the note to its section). Files created elsewhere default to the
   New dump section. Requires the Templater community plugin.
   Tip: set this as a Templater "Folder Template" for `Mesh/Sections` and
   `Mesh/Main` so every new note is filled in automatically. */
const folder = tp.file.folder(true);                 // e.g. "Mesh/Sections/(Section) Cognition"
const parent = folder.split("/").pop();              // e.g. "(Section) Cognition"
const m = parent.match(/^\(Section\)\s+(.+)$/);
const sectionName = m ? m[1] : "New";
const slug = sectionName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const today = tp.date.now("YYYY-MM-DD");
const uuid = crypto.randomUUID();
-%>
---
id: <% uuid %>
tags:
  - "#note"
  - "#ie/sections/<% slug %>"
description: 
contact: 
orbh-sessions: 
template: "[[tmp-ie-note-v0.1]]"
created: <% today %>
modified: <% today %>
---

# <% tp.file.title %>


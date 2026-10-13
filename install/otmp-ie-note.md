<%*
/* IE note — Templater template.
   Finds the nearest `(Section) <Name>/` folder above this file. In a section
   folder (or a subfolder of it), the note gets the section tag
   `#ie/sections/<key>` of that folder: the folder has meaning, and the tag and the folder must agree.
   Outside a section folder, the note has no section tag (unsectioned). The key
   is the section name in lowercase, with "-" between the words. Requires the
   Templater community plugin.
   Tip: set this as a Templater "Folder Template" for `Mesh/Sections` and
   `Mesh/Main` so every new note is filled in automatically. */
const folder = tp.file.folder(true);                 // e.g. "Mesh/Sections/(Section) Cognition"
const m = folder.split("/").reverse()
  .map((segment) => segment.match(/^\(Section\) (.+)$/)).find(Boolean); // nearest section folder
const key = m ? m[1].split(" ").filter(Boolean).map((word) => word.toLowerCase()).join("-") : "";
const sectionTag = key ? `\n  - "#ie/sections/${key}"` : "";
const today = tp.date.now("YYYY-MM-DD");
const uuid = crypto.randomUUID();
-%>
---
id: <% uuid %>
tags:
  - "#note"<% sectionTag %>
description: 
contact: 
orbh-sessions: 
template: "[[tmp-ie-note-v0.2]]"
created: <% today %>
modified: <% today %>
---

# <% tp.file.title %>


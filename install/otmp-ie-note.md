<%*
/* IE note — Templater template.
   Finds the nearest `(Section) <Name>/` folder above this file. The note gets
   the section tag `#ie/sections/<key>` only when two conditions are true:
   - the name follows the section name grammar (words of letters and digits,
     each word starts with a capital letter or a digit, one space between
     words, 1 to 64 characters), and
   - the folder holds its header `(Section) <Name>.md`.
   The key is the name in lowercase, with "-" between the words. Else the note
   has no section tag (unsectioned). The folder has meaning: the tag and the
   folder must agree. Requires the Templater community plugin.
   Tip: set this as a Templater "Folder Template" for `Mesh/Sections` and
   `Mesh/Main` so every new note is filled in automatically. */
const folder = tp.file.folder(true);                 // e.g. "Mesh/Sections/(Section) Cognition/Deep"
const segments = folder.split("/");
let sectionTag = "";
for (let index = segments.length - 1; index >= 0; index--) {
  const match = segments[index].match(/^\(Section\) (.*)$/);
  if (!match) continue;                              // the nearest (Section) folder only
  const name = match[1];
  const valid = name.length >= 1 && name.length <= 64 && /^[A-Z0-9][A-Za-z0-9]*( [A-Z0-9][A-Za-z0-9]*)*$/.test(name);
  const sectionFolder = segments.slice(0, index + 1).join("/");
  if (valid && await tp.file.exists(`${sectionFolder}/(Section) ${name}.md`)) {
    const key = name.split(" ").map((word) => word.toLowerCase()).join("-");
    sectionTag = `\n  - "#ie/sections/${key}"`;
  }
  break;
}
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


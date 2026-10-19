<%*
/* IE note — Templater template.
   Finds the folder section of this file, by the rule of mesh-core
   (folderSectionOf): the section folder is the outermost folder above the file
   whose name is `(Section) <Name>` with a valid name. A `(Section) ` folder with
   an invalid name declares no section, so the search goes on past it. A valid
   folder inside a section folder is nested and declares no section either.
   The name grammar: words of letters and digits, each word starts with a
   capital letter or a digit, one space between words, 1 to 64 characters.
   The note gets the section tag `#ie/sections/<key>` only when that section
   folder holds its header `(Section) <Name>.md`. The key is the name in
   lowercase, with "-" between the words. Else the note has no section tag
   (unsectioned). The tag and the folder must agree. Requires the Templater
   community plugin.
   Tip: set this as a Templater "Folder Template" for `Mesh/Sections` and
   `Mesh/Main` so every new note is filled in automatically. */
const folder = tp.file.folder(true);                 // e.g. "Mesh/Sections/(Section) Cognition/Deep"
const segments = folder.split("/");
const validName = (name) => name.length >= 1 && name.length <= 64 && /^[A-Z0-9][A-Za-z0-9]*( [A-Z0-9][A-Za-z0-9]*)*$/.test(name);
let sectionTag = "";
for (let index = 0; index < segments.length; index++) {
  const match = segments[index].match(/^\(Section\) (.*)$/);
  if (!match || !validName(match[1])) continue;      // an invalid (Section) folder declares no section
  const name = match[1];
  const sectionFolder = segments.slice(0, index + 1).join("/");
  if (await tp.file.exists(`${sectionFolder}/(Section) ${name}.md`)) {
    const key = name.split(" ").map((word) => word.toLowerCase()).join("-");
    sectionTag = `\n  - "#ie/sections/${key}"`;
  }
  break;                                             // the outermost valid section folder is the folder section
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
orb:
template: "[[tmp-ie-note-v0.2]]"
created: <% today %>
modified: <% today %>
---

# <% tp.file.title %>


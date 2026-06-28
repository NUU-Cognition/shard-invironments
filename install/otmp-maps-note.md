<%*
/* Map note — Templater template.
   Detects whether this file lives directly inside a `(Map) <Name>/` folder and
   auto-populates the note frontmatter. Requires the Templater community plugin.
   Tip: set this as a Templater "Folder Template" for `Mesh/Maps` so every new
   note created under a map is filled in automatically. */
const folder = tp.file.folder(true);                 // e.g. "Mesh/Maps/(Map) Cognition"
const parent = folder.split("/").pop();              // e.g. "(Map) Cognition"
const m = parent.match(/^\(Map\)\s+(.+)$/);
const mapName = m ? m[1] : "";
if (!mapName) new Notice("⚠ Not inside a (Map) folder — `map` left blank.");
const mapLink = mapName ? `"[[(Map) ${mapName}]]"` : "";
const today = tp.date.now("YYYY-MM-DD");
const uuid = crypto.randomUUID();
-%>
---
id: <% uuid %>
tags:
  - "#note"
map: <% mapLink %>
description: 
contact: 
orbh-sessions: 
template: "[[tmp-maps-note-v0.1]]"
created: <% today %>
modified: <% today %>
---

# <% tp.file.title %>


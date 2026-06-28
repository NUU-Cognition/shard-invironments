---
description: "Review a map and refresh its index — keep the Information Environment and navigation guide current as notes accumulate"
---

> [!important] THIS FILE IS AN INSTRUCTION. WHEN REFERENCED IT IS MEANT TO BE TAKEN AS AN ACTION.

Run `flint shard start map` if you haven't already.

# Workflow: Refresh Map

Bring a map's index back in line with its notes. The note *list* never goes stale (`load` assembles it live), but the index's curated prose — the Information Environment and the navigation guide — drifts as notes are added, revised, or removed. This workflow refreshes that prose.

# Input

- The map to refresh (name or index file)

# Actions

## Stage 1: Survey

- Run `flint shard map load "<Map>"` to pull the current index and the live note list into context
- Read the index's Information Environment and Navigation sections
- Open notes as needed to understand what the map now actually contains
- Note what has drifted: missing throughlines, new clusters of notes not reflected in the navigation, an IE that no longer matches the scope, dead wikilinks to renamed/removed notes
- Once you have a clear picture of the gap between the index prose and the notes, progress to the next stage

## Stage 2: Propose

- Draft the updated Information Environment and Navigation guide
- Present the proposed index changes to the user as a diff or summary
- Do **not** add a note list to the index — that remains `load`'s job
- Once the user approves the proposed changes, progress to the next stage

## Stage 3: Apply

- Write the approved prose into the map's index file
- Bump the index's `modified` date
- Append your session id to the index's `orbh-sessions`
- Confirm the refresh with the user

# Output

- The map's index with a current Information Environment and navigation guide
- Note list untouched (still assembled on demand by `load`)

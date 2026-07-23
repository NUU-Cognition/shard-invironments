---
description: "Review a mesh section and refresh its header — keep the context envelope and navigation guide current as members accumulate"
---

> [!important] THIS FILE IS AN INSTRUCTION. WHEN REFERENCED IT IS MEANT TO BE TAKEN AS AN ACTION.

Run `flint shard start-dev ie` if you haven't already.

# Workflow: Refresh Section

Bring a section's header back in line with its members. The member *list* never goes stale (`load` assembles it live from tags), but the header's curated prose — the context envelope and the navigation guide — drifts as members are added, revised, or removed. This workflow refreshes that prose.

# Input

- The section to refresh (name or header file)

# Actions

## Stage 1: Survey

- Run `flint shard ie load "<Section>"` to pull the current header and the live member list into context
- Read the header's context envelope and Navigation sections
- Open members as needed to understand what the section now actually contains
- Note what has drifted: missing throughlines, new clusters of members not reflected in the navigation, an envelope that no longer matches the scope, local definitions that emerged in members but aren't declared, dead wikilinks to renamed/removed members
- Once you have a clear picture of the gap between the header prose and the members, progress to the next stage

## Stage 2: Propose

- Draft the updated context envelope and Navigation guide
- Present the proposed header changes to the user as a diff or summary
- Do **not** add a member list to the header — that remains `load`'s job
- Once the user approves the proposed changes, progress to the next stage

## Stage 3: Apply

- Write the approved prose into the header file
- Bump the header's `modified` date
- Append your session id to the header's `orbh-sessions`
- Confirm the refresh with the user

# Output

- The section's header with a current context envelope and navigation guide
- Member list untouched (still assembled on demand by `load`)

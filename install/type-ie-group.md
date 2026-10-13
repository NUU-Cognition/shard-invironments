---
id: 5b1d8c22-7e4f-4a39-9c60-2f8b3d1e9a47
tags:
  - "#f/metadata"
  - "#f/type"
---

# Group

A Group is the optional definition of a mesh group: a named set of documents that cuts across mesh sections. The group tag `#ie/groups/<key>` on a document is the only authority for membership. A document can be in any number of groups, from any section or from no section, and the place of a file has no meaning for a group. A section says where a document is (zero or one answer); groups say what a document is part of (any number of answers). The definition `(Group) <Name>.md` names the group, states its intent, and has its own group tag, so it is a member of its group. A valid definition declares its group, also when no document has the tag yet. A group key uses the section key grammar, and a definition name uses the section name grammar.

## Properties

| Property | Value |
|----------|-------|
| Tag | `#ie/groups/<key>` (the definition and the members) |
| Naming | `(Group) <Name>.md` |
| Location | Any folder; `mesh group create` writes it in `[groups] folder` (`Mesh/Groups`) |

## Templates

- [[tmp-ie-group-v0.2]]

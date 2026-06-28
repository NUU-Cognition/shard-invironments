# Map

The Flint's **semantic content layer** — editable notes organized into navigable maps. Where work artifacts (Tasks, Plans, Increments) track *what is being done*, Map tracks *what is known*.

## Model

- **Map** — a named collection of notes, realized as a folder `Mesh/Maps/(Map) <Name>/` with a root **index** file.
- **Note** — the atomic unit: one editable model, a slice of reality. Flat `#note`, no subtypes, bound to one map.
- **Index** — the map's root file: its Information Environment + a navigation guide. Never a note list.
- **`load`** — assembles the note list on demand from each note's `description`, so there is one source of truth and nothing to keep in sync.
- **`contact`** — optional grounding: where a note's slice touches reality (`cb-<codebase>` today; telemetry, datasets, people later).

## Scripts

```
flint shard map create "<Name>"          # scaffold a map + index
flint shard map note   "<Map>" "<Title>" # scaffold a note in a map
flint shard map list                     # list maps with note counts
flint shard map load   "<Map>"           # print the index + assembled note scent-list
```

## Structure

```
Shards/(Dev Local) Map/
  shard.yaml                      # Manifest — declares types Map, Note; folder Mesh/Maps
  dev-init-maps.md                 # Init — core model + rules
  knowledge/
    dev-knw-maps-model.md          # Deep reference: the Map model
  templates/
    dev-tmp-maps-map-v0.1.md       # Map index template
    dev-tmp-maps-note-v0.1.md      # Note template
  workflows/
    dev-wkfl-maps-refresh.md       # Refresh a map's index prose as notes accumulate
  scripts/
    dev-create.js  dev-note.js  dev-list.js  dev-load.js
  install/
    type-maps-map.md  type-maps-note.md   # Type definitions (driven by types:)
```

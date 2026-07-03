## Candidate Cleanup Rules

**Decision:** Favoriting a Candidate automatically accepts it, and candidate cleanup deletes only unsaved Candidates.

**Status:** Accepted

**Reason:** A favorited asset is something the user intends to keep. Candidate cleanup should be safe and should never remove accepted or favorited assets.

# PROJECT DECISIONS

2026

Godot only.

Reason.

----------

Comfy hidden.

Reason.

----------

Recipes execute.

Presets configure.

Reason.

----------

Workspace is temporary.

Reason.

## PF-0014 Tile Studio Starts Small

**Decision:** PF-0014 only implements the Tile Studio foundation.

**Status:** Accepted

**Reason:** Tile Studio will eventually become a staged texture-to-tile production workflow, but the first coding step should only prove the base tile generation path, asset saving, and Workspace/Palette Lab handoff.

## PF-0014.2 Candidate Asset Language

**Decision:** User-facing generated unsaved assets should be called Candidates, not Incoming.

**Status:** Accepted

**Reason:** "Incoming" was misleading because generated assets already exist on disk. Candidate better communicates that the asset exists but has not been saved into the accepted library yet.

---

## PF-0014.2 Favoriting Saves Assets

**Decision:** Favoriting an asset automatically accepts it.

**Status:** Accepted

**Reason:** Favorite means the user wants to keep the asset. Pixel Factory should not allow a favorited item to remain only a disposable candidate.


---

## PF-0014.3 Global UI Concept Accepted

**Decision:** The PF-0014 generated dark multi-panel UI concept is the global Pixel Factory visual target.

**Status:** Accepted

**Reason:** The concept captures the desired product feel: modern, clean, game-dev focused, with strong navigation, clear studio workspaces, and integrated asset browsing. This direction applies to the whole application, not only Tile Studio.

---

## Candidate Cleanup Must Be Real Deletion

**Decision:** Clear Unsaved Candidates must delete unsaved generated candidates from disk and metadata.

**Status:** Accepted

**Reason:** Candidate assets are temporary unless accepted or favorited. Accepted and favorited assets are saved. Unsaved candidates should be removable so the asset library does not become cluttered.

## Favorite Saves Candidates

**Decision:** Favoriting a Candidate automatically promotes it to Accepted.

**Status:** Accepted

**Reason:** Favorite is a keep/save signal. A favorited asset should never be removed by candidate cleanup.


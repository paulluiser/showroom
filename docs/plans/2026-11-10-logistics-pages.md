# Inventory pages and wandering orb

One inventory landing, with an orthographic 2.5D logistics illustration: warehouse roofs, loading bays, moving trucks and layered pointer/scroll parallax. Keep concise PM metadata and one case-study link. A small shared orb wanders between projected warehouse targets, truck, headline and link, with non-repeating paths and temporary illumination on contact. No assistant face or repeated narration.

The existing shared Three.js orb renderer moves to the app shell so it persists across screens. Hero writes its motion on the showroom; the dedicated case page owns its target on that route. During navigation a single timed transition owns the motion, gathers the orb to the screen center, disperses a soft colored veil, changes the route while covered, and eases the orb into the case page. Native anchor semantics, modified clicks, direct URLs, reload, browser Back, and saved showroom scroll position work. Reduced motion skips spatial travel and the color veil.

Route: /projects/inventory-accounting. Add Vercel fallback for project URLs. Case content comes from the confirmed business problem, Agile Scrum, client discovery, signed BRD/SRS, AI-assisted analysis, change control, initial validation passed and readiness for UAT. No invented release, metrics or outcomes.

Allocate illustration geometry once, batch static geometry, limit DPR and shadows, pause offscreen/hidden and provide a motion control. Audit desktop/mobile and both themes; test route timing, wandering path bounds/non-repetition, geometry and production routing.

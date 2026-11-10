# Logistics pages audit

Scope: one inventory project, preserving both themes and the rest of the showroom.

Implemented:
- Orthographic 2.5D warehouses, loading bays, cargo and moving trucks, with pointer/scroll parallax.
- Persistent shared orb, varied non-repeating wandering contacts, transient illumination and an age-fading trail.
- Center/gather → feathered color dispersal → covered route change → case-page reveal, totaling about 2.04s.
- A dedicated /projects/inventory-accounting page with factual PM content and section navigation.
- Native same-tab links, modified-click behavior, production URL fallback, direct load/reload, browser Back and return focus/scroll restoration.
- Reduced-motion navigation bypass and static model state; hidden/offscreen animation suspension.

Reviewed desktop and 390px phone layouts in dark/light modes. Browser tests confirmed a single main-orb canvas across navigation, heading focus on the case page, native Back restoration, and direct case-page return to Projects. Built production preview served the case URL successfully, with no console errors on fresh load.

Resolved during audit: missing case-orb ref, responsive scene fitting, return focus timing, stable scrollbar space during the color transition, contact placement at the case-link edge, mobile theme-toggle clearance, truck separation over a simulated ten-minute loop, and hidden-scene coordinate guards.

Validation: 69 tests pass. Production build passes. New tests cover wandering non-repetition, smooth/bounded paths, center/cover/reveal timing, route fallback, finite model geometry, moving vehicles and contact lighting. The existing Three.js bundle-size advisory remains; no dependency was added.

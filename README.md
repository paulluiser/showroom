# Paul Luiser — The Showroom

A responsive, futuristic portfolio for Paul Luiser Vasquez, focused on IT project management and practical AI skills. React, Vite, and Three.js; no backend or secrets required.

## Run locally

```sh
npm install
npm run dev
```

## Check and build

```sh
npm test
npm run build
npm run preview
```

## Deploy on Vercel

Import this directory/repository into Vercel. Select **Vite**, use `npm run build`, and set the output directory to `dist`. No environment variables are needed. The site has no server routes.

## Edit content

- `src/content.js`: projects, AI workflows, and contextual guide messages.
- `src/main.jsx`: introduction, experience, navigation, and contact actions.
- `src/style.css`: palette, typography, responsive layout, and motion.
- `src/Scene.jsx`: Three.js stationary fluid shader orb and looping luminous ribbons.
- `public/Paul-Luiser-Vasquez-Resume.pdf`: downloadable résumé; replace when updating experience.

The guide uses scripted section-aware messages, not a live language model. AI workflows are illustrative and contain no client data. Project contributions are based on the supplied August 2026 résumé. The downloadable résumé omits the phone number and address.

Motion follows the visitor's reduced-motion preference and can also be paused manually. The WebGL scene falls back to a CSS orb when the renderer cannot initialize.

## Interaction and accessibility

The opening constellation reveals on scroll. Selecting a discipline holds its explanation until the visitor chooses **Resume exploration**. Pause freezes automatic selection and decorative motion; operating-system reduced-motion settings are respected. The WebGL loop suspends when the scene is out of view or the tab is hidden.

Mobile uses labeled bottom section links with touch-friendly targets. The guide starts collapsed, and its expanded panel contains mobile motion controls. Desktop retains a separate pause control. Native section anchors preserve deep links and browser history.

Project summaries expose role and documented deliverables without expansion. HRIS facts supplied separately are included in the website; the downloadable résumé is based on the August 2026 version. AI example disclosures are explicitly illustrative rather than client artifacts.

## Liquid Horizon revision

`src/Scene.jsx` renders the fluid orb and animated ribbon geometry. `src/Hero.jsx` provides the five horizon perspectives and manual/scroll selection. `src/Timeline.jsx` renders the scroll-lit career path with expanded responsibilities from `career` in `src/content.js`. The later generated screen mockups are exploration artifacts, not rendered site assets.

The cinematic hero is controlled by `src/Hero.jsx` and the tested geometry/tour helpers in `src/heroMotion.js`. One persistent canvas moves from landing to centered constellation to the portfolio guide.

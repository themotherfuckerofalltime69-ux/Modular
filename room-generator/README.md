# Modular Room Generator

A browser-based Three.js prototype for creating modular rooms, connecting them into a world graph, validating connections, and exporting world data as JSON.

## Requirements

- Node.js 18 or newer
- npm
- A modern browser with WebGL support

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Build for deployment

```bash
npm run build
npm run preview
```

The production site is generated in `dist/`. It can be deployed to GitHub Pages, Vercel, or another static host.

## Current features

- Three.js 3D room preview
- Procedural room geometry: floor, ceiling, walls, doorway openings and trim
- Room creation, duplication and editing
- Room-to-room connections with reciprocal connection records
- Automatic layout of connected rooms in the preview
- World graph validation, including missing rooms, reciprocal links and reachability
- JSON world export
- Responsive editor interface

## Current prototype limitations

- Connections currently represent logical doorway links and matching wall openings. This first prototype does not yet implement a playable character, physics, collision detection, or live doorway-triggered room transitions.
- The AI adapter is intentionally not included in this first runnable baseline. Add it after the room schema and procedural builder are stable; call an AI provider from a secure backend rather than exposing API keys in browser code.
- Room assets are currently procedural primitives and material presets.

## JSON model

Each room is a portable object with a stable `roomId`, dimensions, environment settings, connection records, entities, interactive objects, spawn points, and generator metadata. The complete world export contains all room objects and player/world metadata.

## Suggested next milestones

1. Add a player controller and doorway trigger transitions.
2. Add collision and navigation validation.
3. Add import-world JSON and schema migration.
4. Add asset catalogs and reusable room templates.
5. Add a secure AI planning adapter that returns schema-validated room specifications.
6. Add automated tests in GitHub Actions.

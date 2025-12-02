# PSI-MOD Residue Modifications Browser

A lightweight, modern web application to explore the PSI-MOD controlled vocabulary (CV) of protein residue modifications. It lets you quickly search, filter, and inspect modification terms, view cross‑references, and visualize chemical structures (SMILES) in your browser. The app is built with Vue 3, Vite, Pinia, and Vuetify, and parses the PSI‑MOD ontology (OBO) to present a fast, user‑friendly browsing experience for proteomics and bioinformatics users.

Key capabilities:
- Browse and search PSI‑MOD terms (names, accessions, synonyms)
- Filter by residue, mass shift, and various cross‑references (e.g., ChEBI, UniMod)
- Inspect rich details for each modification, including definitions and relationships
- Visualize SMILES structures using smiles‑drawer


## Quick start

### Prerequisites
- Node.js 18 or newer (Node 20+ recommended)
  - Check your version: `node -v`
- A package manager:
  - Yarn (recommended for this project): `npm i -g yarn`

### 1) Install dependencies
From the project root (this folder), install the required packages:

- With Yarn: `yarn install`


## Run in development mode
Development mode runs a local web server with hot‑reload. When you edit files, the browser updates automatically.

Commands:
- Yarn: `yarn dev`

What to expect:
- The dev server starts on http://localhost:3000 (default configured in `vite.config.mts`).
- Open that URL in your browser. If port 3000 is busy, Vite may prompt to use another port; accept it and use the new URL.


## Build for production
This creates an optimized, static build you can deploy to any static hosting service.

Commands:
- Yarn: `yarn build`

The output appears in the `dist/` folder.

Optional: preview the production build locally to test it as it will run in production.
- Yarn: `yarn preview`

This serves the `dist/` folder at a local URL that Vite prints in the terminal.

## Running tests
This project does not include automated tests yet. If you are looking to validate the codebase right now, you can run:
- Type checking: `yarn type-check` or `npm run type-check`
- Linting (auto‑fix style issues): `yarn lint` or `npm run lint`

If you want to add unit tests, Vitest is a great fit for Vite + Vue projects. A minimal setup would look like:
1) Install dev dependencies: `yarn add -D vitest @vitest/ui @vue/test-utils happy-dom` (or `npm i -D ...`)
2) Create a `vitest.config.ts` and a `src/__tests__/` folder with your test files.
3) Add scripts to `package.json`, for example:
   - `"test": "vitest"`
   - `"test:ui": "vitest --ui"`
4) Run tests: `yarn test` or `npm test`


## Project structure and tech
- Vue 3 (Composition API)
- Vite 7 for dev server and build
- Vuetify 3 for UI components
- Pinia for state management
- smiles‑drawer for SMILES rendering
- Custom OBO parsing (see `src/system/obo/OboParser.ts`)

Notable entry points:
- `index.html`: base HTML template
- `src/`: application source code
- `vite.config.mts`: Vite, plugins, dev server port (3000)
- `package.json`: scripts and dependencies


## How OBO parsing works (Web Worker)

Parsing the PSI‑MOD OBO file is done off the main UI thread using a Web Worker. This keeps the interface responsive while the relatively large ontology file is processed.

Where to look in the code:
- `src/system/obo/OboParser.ts` — exposes `OboParser.parse(input: string)` which spins up a Web Worker to do the actual parsing, and `parseDataVersion` to extract the OBO header’s `data-version`.
- `src/system/obo/OboParser.worker.ts` — the worker implementation that parses the OBO text into structured terms. It posts results back to the main thread when ready.
- `src/stores/obo.ts` — loads the OBO file as raw text and invokes the parser in the worker. The store also reads and exposes the `dataVersion` from the OBO header.

What this means for you:
- On slower machines or in the browser, the UI won’t “freeze” while parsing the OBO file; the work happens in a separate thread.
- In development, this works out of the box with Vite — the worker is referenced via `new URL('./OboParser.worker.ts', import.meta.url)` which Vite understands and bundles correctly.


## Common tasks
- Update dependencies: `yarn upgrade-interactive` or `yarn upgrade` (or `npm update`)
- Fix lint issues automatically: `yarn lint` (or `npm run lint`)


## Troubleshooting
- Port already in use (3000):
  - Stop the other service using the port, or let Vite choose another port when prompted.
  - You can also change the port in `vite.config.mts` under `server.port`.
- Clean install issues:
  - Delete `node_modules/` and `yarn.lock` (or `package-lock.json`), then reinstall: `yarn install` or `npm install`.
- Node version problems:
  - Ensure Node 18+; consider installing via nvm (Node Version Manager) to switch versions easily.


## Continuous deployment to GitHub Pages and OBO sourcing

This app is automatically built and published to GitHub Pages via a GitHub Actions workflow in the main repository. As part of that workflow:
- The most recent PSI‑MOD OBO file present in the main repository is copied into this app before the build, so the deployed site always serves the latest ontology.
- The app then runs a production build (`vite build`) and publishes the contents of `dist/` to the Pages branch.

Notes for contributors:
- Locally, the app loads the OBO file from `src/assets/data/PSI-MOD.obo` (imported as raw text). In CI, the workflow places the latest file at that same path before building.
- The store extracts the OBO `data-version` and can display it in the UI, which helps verify that a deployment contains the expected OBO release.


## License and contributions
Contributions and feedback are welcome. If you plan significant changes, consider opening an issue or discussion first to align on approach.

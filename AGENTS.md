# Repository Guidelines

## Project Structure & Module Organization
The app is a static SPA served from the repository root. `index.html` is the modern entry point; keep `cpp_guide.html` unchanged as a legacy reference. Topic pages live in `content/` as modular HTML fragments loaded on demand. Client behaviour is split across `js/app.js` (controller), `js/content-loader.js` (fetch + caching), `js/utils.js` (helpers), and `js/config.js` (tab metadata). Styling sits in `css/main.css`, `css/components.css`, and `css/syntax-highlighting.css`; reuse existing utility classes before adding new ones.

## Build, Test, and Development Commands
No build step is required; all dependencies resolve via CDN. Serve the project locally with `python3 -m http.server 8000` or `npx serve .` from the repo root, then open `http://localhost:8000/index.html`. Use the same static server to validate the legacy `cpp_guide.html` when comparing layouts.

## Coding Style & Naming Conventions
JavaScript uses modern ES classes, 4-space indentation, and camelCase for variables and methods; keep module-level constants in SCREAMING_SNAKE_CASE when needed. DOM IDs and data attributes stay kebab-case, while content filenames use lower_snake_case to match the tab IDs declared in `js/config.js`. Prefer descriptive method names (`switchTab`, `setupEventListeners`) and inline comments only when logic is non-obvious. CSS follows 4-space indentation and keeps custom properties in `:root`; extend existing tokens before introducing new colors or spacing.

## Testing Guidelines
There is no automated test suite. After content or behavior changes, run a local server and verify: tab switching, table-of-contents generation, scroll spy highlighting, and cached reloads in the browser console. For new content modules, confirm heading levels populate the sidebar correctly and that Prism highlighting still renders.

## Commit & Pull Request Guidelines
Commits follow short, imperative subject lines similar to `Add CLAUDE.md documentation`; group related changes and avoid mixed formatting/content updates. Pull requests should describe the user-facing impact, list updated files or sections, link related issues, and include screenshots or screen recordings for UI adjustments. Call out manual test steps performed so reviewers can reproduce results quickly.

# CLAUDE.md — instructions for Claude working on this site

Personal CV website of Thomas Lacquet (research consultant, Haystack Consulting, Leuven). Static Astro 5 site with a Keystatic form editor for the owner. He edits content himself in the editor, so keep content in `content/*.json` and layout in components.

## Structure
- Two languages: English at `/` (`content/*.json`) and Dutch at `/nl/` (`content/nl/*.json`). `src/lib/content.ts` → `getContent(Astro.currentLocale)` merges them: Dutch files only supply text; photos, logos, layout, links, colours, CEFR levels and section order always come from the English file, and English decides how many items a list has. Fixed interface text (buttons, nav, labels) lives in the `ui` object in `content.ts`. Both routes render `src/components/Page.astro`. **When you change English copy, update the Dutch file too.**
- `content/*.json`: ALL page text, lists and image paths, one file per section (settings, hero, logos, experience, work, speaking, education, skills, about, contact). Edited by the owner via Keystatic at http://localhost:4321/keystatic (`npm run dev`).
- `keystatic.config.ts`: the editor schema. **When you add or rename a field in a JSON file, update the schema too**, or the editor breaks or drops the field on the next save.
- `content/settings.json` → `sections`: order and visibility of sections. `src/pages/index.astro` renders them in that order (hero first, contact last).
- `src/lib/content.ts`: imports all JSON. Components read from here and never hard-code copy.
- `src/components/*.astro`: one file per section, layout only.
- `src/layouts/Base.astro`: `<head>`, SEO meta (title and description from settings), JSON-LD (schema.org Person), accent colour as a CSS variable, and the only script (reveal on scroll, timeline progress).
- `src/styles/global.css`: all styling, with tokens in `:root`. Reuse the existing classes (`.section`, `.sh`, `.eyebrow`, `.h2`, `.h3`, `.meta`, `.card`, `.grid`, `.split`, `.row`, `.btn`).
- `public/`: images (`img/`, `img/cases/`, `logos/`), fonts, `robots.txt`, `sitemap.xml`, `llms.txt`, `og-image.jpg`.
- `astro.config.mjs`: React and Keystatic load only during `astro dev`. The build is fully static, with no editor and no server.

## Adding a section
1. Add `content/<name>.json` and a matching `singleton` in `keystatic.config.ts` (include it in `ui.navigation`).
2. Export it from `src/lib/content.ts` and create `src/components/<Name>.astro` with the standard wrapper: `<section class="section" id="<name>"><div class="wrap" data-reveal><div class="sh">…</div>…</div></section>`.
3. Register it in `sections` in `Page.astro`, add a Dutch `content/nl/<name>.json` and its key to `KEYS` in the Keystatic config, add the nav label to both languages in `ui` in `content.ts`, add the option to `sectionOptions` in the Keystatic config, add the label in `Nav.astro`, and add the id to `settings.json` → `sections`.

## Layout controls
- Each section JSON has a `layout` object (editor group "Layout"): `spacing` (compact/normal/spacious) → `data-space` on the section; hero adds `avatarSize` (s/m/l); about and speaking add `photoPosition` (left/right/top/bottom), `photoSize` (s/m/l), `photoAlign` (top/center/bottom) and `photoFocus` (crop focus). The hero also has `background` (charts/clusters/none) and `segments` (max 4, each max 4 items, drawn as dots, no logos). In `charts` mode each rotating claim word shows its classic chart behind the hero (standalone SVG images in `public/charts/`, loaded as `<img>` so the dummy numbers stay out of the page text,, matched on keywords in `Hero.astro`; segmentation shows the clusters). Below 1100 px and on phones only the faint clusters remain. These are rendered through the `.media-split` and `[data-space]` rules at the end of `global.css`. Add new layout options as select fields in the `layout()` helper, never as free pixel values, so the site stays responsive.

## Images in the editor
- Every section has its own image folder (`public/img/<section>/…`, `public/logos/<section>/…`). Keystatic saves a file at `<folder>/<field path>.ext`, e.g. `/logos/speaking/talks/0/logo.webp`. Never point two sections at the same folder, or files overwrite each other.
- When you set an image path by hand, put the file at exactly that path, or the editor drops the field on the next save.

## Workflow with the owner
- For design changes, first show 2–3 options as artboards on his Claude Design canvas ("CV-website Thomas Lacquet"). Implement only the option he picks.
- He edits `content/*.json` himself through the editor. Before overwriting any of those files on his computer, read his current version and merge it.
- His local copy lives at `C:\Hackerman\thomas-lacquet-site\site`. He runs `start.bat` (Windows, needs Node ≥ 20.19).

## Publishing
- Live at https://thomaslacquet.github.io (GitHub Pages, repo `ThomasLacquet/thomaslacquet.github.io`, public). Every push to `main` builds and deploys via `.github/workflows/deploy.yml`.
- The owner edits on his PC (`C:\Hackerman\thomas-lacquet-site\site`) and has no git there. To publish: stage his current `content/` (and any changed files) from the device, copy them into a clone of the repo, check `npm run build`, commit and push. Never commit `Private/`, PDFs or anything with his phone number or home address.

## Rules
- Keep it fast: no client-side frameworks on the public page, no external fonts or scripts. Images as WebP or JPG with width and height set, and lazy loading below the fold.
- Accessibility: real links and buttons, alt text, contrast ≥ 4.5:1, works at 390 px wide, respects `prefers-reduced-motion`.
- Copy is English. Write like a person: concrete claims, varied sentence length, no clichés, no invented numbers. Missing facts stay as `[PLACEHOLDER]` in capitals.
- No CV PDF and no phone number or home address on the public site (owner's choice, privacy). `settings.cv` is empty, which hides every CV button.
- Facts must match his CV. Name clients (ING) only with Haystack's permission.
- When facts change, also update `public/llms.txt` and the JSON-LD in `Base.astro`.
- Check before finishing: `npm run build` passes, and `grep -rn "\[" content` lists the placeholders still left.

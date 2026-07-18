# Playwright Visual Testing

Playwright is the standard end-to-end and visual-regression testing tool for VayuGati Flow.

## Installation

Playwright is installed as a dev dependency in `frontend/` and uses Chromium by default.

```bash
cd frontend
npm install -D @playwright/test
npx playwright install chromium
```

## Project layout

```
frontend/
  playwright.config.ts
  tests/
    e2e/              functional UI tests
    visual/           screenshot and video tests
    screenshots/      generated PNG screenshots
    videos/           generated demo videos
    fixtures/         test data
    report/           generated HTML report
```

## Running tests

```bash
# Run all tests
npm run test:e2e

# Run tests in interactive UI mode
npm run test:e2e:ui

# Show the HTML report
npm run test:e2e:report
```

## What is tested

- Map initialization and layer presence
- Traffic highlight layers (`traffic-road-glow`, `traffic-road-soft`, `traffic-road-core`)
- Camera marker rendering
- Vehicle marker rendering
- No JavaScript console errors
- No failed network requests
- Screenshots at zoom levels 12, 14, 16, 18
- Screenshots at viewports 1280×720, 1440×900, 1920×1080
- Deterministic vehicle animation frame

## Capturing screenshots

Screenshots are produced automatically by `tests/visual/map-screenshots.spec.ts` and saved to:

```
frontend/tests/screenshots/
```

## Capturing videos

The demo video test `tests/visual/map-demo.spec.ts` records at multiple zoom levels and saves to:

```
frontend/tests/videos/demo.mp4
```

## Updating snapshots

Map screenshots are intended as artifacts, not Playwright snapshots. Re-run the test suite to regenerate them.

## Troubleshooting

- **Browser not found**: Run `npx playwright install chromium`.
- **Tests timeout on map load**: Ensure the backend is available on `http://127.0.0.1:8000` or that `webServer` in `playwright.config.ts` can start it.
- **Network failures**: The map loads tiles from CartoCDN and the style from `basemaps.cartocdn.com`. A working internet connection is required.
- **Screenshots differ across runs**: Fonts and tiles may vary slightly. Keep screenshots as generated artifacts, not golden snapshots.

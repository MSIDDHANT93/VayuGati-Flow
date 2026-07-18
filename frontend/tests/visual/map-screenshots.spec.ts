import { test } from '@playwright/test'

const MAP_CENTER = [77.5946, 12.9716]

async function waitForMapLoaded(page: any) {
  await page.waitForFunction(
    () => {
      const map = (window as any).vayugatiMap
      return map && map.loaded()
    },
    { timeout: 60000 }
  )
}

test.describe('Map screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(
      () => {
        const map = (window as any).vayugatiMap
        return map && map.loaded()
      },
      { timeout: 30000 }
    )
  })

  for (const zoom of [12, 14, 16, 18]) {
    test(`zoom ${zoom} at 1280x720`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.evaluate(
        ({ zoom, center }) => {
          const map = (window as any).vayugatiMap
          map.setZoom(zoom, { duration: 0 })
          map.setCenter(center, { duration: 0 })
        },
        { zoom, center: MAP_CENTER }
      )
      await waitForMapLoaded(page)
      await page.screenshot({
        path: `tests/screenshots/zoom${zoom}.png`,
        fullPage: false,
      })
    })
  }

  const viewports = [
    { name: '1280x720', width: 1280, height: 720 },
    { name: '1440x900', width: 1440, height: 900 },
    { name: '1920x1080', width: 1920, height: 1080 },
  ]
  for (const vp of viewports) {
    test(`viewport ${vp.name} at zoom 15`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.evaluate(
        ({ center }) => {
          const map = (window as any).vayugatiMap
          map.setZoom(15, { duration: 0 })
          map.setCenter(center, { duration: 0 })
        },
        { center: MAP_CENTER }
      )
      await waitForMapLoaded(page)
      await page.screenshot({
        path: `tests/screenshots/viewport-${vp.name}.png`,
        fullPage: false,
      })
    })
  }
})

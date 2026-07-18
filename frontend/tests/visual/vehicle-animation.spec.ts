import { test } from '@playwright/test'

test('vehicle animation deterministic frame', async ({ page }) => {
  await page.goto('/')

  await page.waitForFunction(
    () => {
      const map = (window as any).vayugatiMap
      const vehicles = (window as any).vayugatiVehicles
      return map && map.loaded() && vehicles && vehicles.length > 0
    },
    { timeout: 30000 }
  )

  // Pause animation and move every vehicle to a deterministic point on its ring.
  await page.evaluate(() => {
    const vehicles: any[] = (window as any).vayugatiVehicles
    ;(window as any).vayugatiPause(true)
    vehicles.forEach((v: any) => {
      v.t = 0.5
      v.pointIndex = Math.min(v.pointIndex, v.ring.length - 2)
    })
    ;(window as any).vayugatiStep(0)
  })

  // Allow one frame for markers to repaint.
  await page.waitForTimeout(100)

  await page.screenshot({
    path: 'tests/screenshots/vehicle-animation-frame.png',
    fullPage: false,
  })
})

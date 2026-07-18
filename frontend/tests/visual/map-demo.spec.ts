import { test } from '@playwright/test'

const MAP_CENTER = [77.5946, 12.9716]

test('demo video capture', async ({ page }) => {
  await page.goto('/')

  await page.waitForFunction(
    () => {
      const map = (window as any).vayugatiMap
      const vehicles = (window as any).vayugatiVehicles
      return map && map.loaded() && vehicles && vehicles.length > 0
    },
    { timeout: 30000 }
  )

  await page.evaluate(
    ({ center }) => {
      const map = (window as any).vayugatiMap
      map.setZoom(12, { duration: 0 })
      map.setCenter(center, { duration: 0 })
    },
    { center: MAP_CENTER }
  )
  await page.waitForTimeout(1500)

  await page.evaluate(() => {
    const map = (window as any).vayugatiMap
    map.setZoom(14, { duration: 0 })
  })
  await page.waitForTimeout(1500)

  await page.evaluate(() => {
    const map = (window as any).vayugatiMap
    map.setZoom(16, { duration: 0 })
  })
  await page.waitForTimeout(1500)

  await page.evaluate(() => {
    const map = (window as any).vayugatiMap
    map.setZoom(17, { duration: 0 })
  })
  await page.waitForTimeout(2000)

  const video = page.video()
  await page.close()
  if (video) {
    await video.saveAs('tests/videos/demo.mp4')
  }
})

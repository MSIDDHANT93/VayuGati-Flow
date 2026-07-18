import { test, expect } from '@playwright/test'

test.describe('Operational map', () => {
  const errors: string[] = []
  const failedRequests: { url: string; status: number }[] = []

  test.beforeEach(async ({ page }) => {
    errors.length = 0
    failedRequests.length = 0

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    page.on('pageerror', (err) => {
      errors.push(err.message)
    })
    page.on('response', (response) => {
      if (!response.ok() && response.url().startsWith('http')) {
        failedRequests.push({ url: response.url(), status: response.status() })
      }
    })
  })

  test('map loads, layers exist, markers render, no console or network errors', async ({ page }) => {
    await page.goto('/')

    await page.waitForFunction(
      () => {
        const map = (window as any).vayugatiMap
        return map && map.loaded()
      },
      { timeout: 30000 }
    )

    const layers = await page.evaluate(() => {
      const map = (window as any).vayugatiMap
      return {
        glow: !!map.getLayer('traffic-road-glow'),
        soft: !!map.getLayer('traffic-road-soft'),
        core: !!map.getLayer('traffic-road-core'),
      }
    })
    expect(layers.glow).toBe(true)
    expect(layers.soft).toBe(true)
    expect(layers.core).toBe(true)

    await page.waitForFunction(
      () => {
        const cameras = document.querySelectorAll('.op-map-camera-marker')
        const vehicles = (window as any).vayugatiVehicles
        return cameras.length > 0 && vehicles && vehicles.length > 0
      },
      { timeout: 30000 }
    )

    expect(errors).toEqual([])
    expect(failedRequests).toEqual([])
  })
})

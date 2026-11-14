import { expect, test } from '@playwright/test'

test('app loads and shows the header', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Personal Weekly Timetable' })).toBeAttached()
  await expect(page.getByRole('banner')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add event' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible()
})

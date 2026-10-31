import {test,expect} from '@playwright/test';

// The HTML is rendered before React hydrates. Error events from a fast failed
// remote request must not leave the catalogue with broken image icons.
test('failed external photos recover to a local placeholder',async({page})=>{
  await page.route('https://images.unsplash.com/**',route=>route.abort());
  await page.goto('/motobazar/');
  await expect(page.locator('html')).toHaveAttribute('data-ready','true');
  const images=page.locator('.mc-row-image img');
  await expect(images.first()).toHaveAttribute('src','/motobazar/placeholder-moto.svg');
  await expect.poll(()=>images.first().evaluate(img=>img.complete&&img.naturalWidth>0),{timeout:10000}).toBe(true);
  await page.locator('.mc-row h2 a').first().click();
  await expect(page.locator('html')).toHaveAttribute('data-ready','true');
  const main=page.locator('.mc-gallery-main img');
  await expect(main).toHaveAttribute('src','/motobazar/placeholder-moto.svg');
  await expect.poll(()=>main.evaluate(img=>img.complete&&img.naturalWidth>0),{timeout:10000}).toBe(true);
});

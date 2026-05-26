// @ts-check
import { test, expect } from '@playwright/test';

test.describe('CORES Project - User Journey Tests', () => {
  test('complete user journey: finding and using colour information', async ({ page }) => {
    // User arrives at the site
    await page.goto('/');
    
    // 1. User sees the catalogue title and description
    await expect(page.locator('#headerLabel')).toHaveText('Colour and Effects Catalogue');
    await expect(page.locator('#headerParagraph')).toBeVisible();
    
    // 2. User is on the Colours tab by default
    await expect(page.locator('.tab-btn.active')).toHaveText('COLOURS');
    
    // 3. User sees the list of colours
    const initialColours = page.locator('.card');
    const initialCount = await initialColours.count();
    expect(initialCount).toBeGreaterThan(0);
    
    // 4. User wants to find warm red colours
    const searchInput = page.locator('#searchInput');
    await searchInput.fill('red');
    
    const searchField = page.locator('#searchField');
    await searchField.selectOption('Base Colour');
    
    await page.click('#btnSearch');
    
    // 5. User sees filtered results
    const redColours = page.locator('.card');
    const redCount = await redColours.count();
    
    if (redCount > 0) {
      // Verify results contain 'red'
      for (let i = 0; i < Math.min(redCount, 3); i++) {
        const title = await redColours.nth(i).locator('.card-title').textContent();
        expect(title?.toLowerCase()).toContain('red');
      }
    }
    
    // 6. User wants to filter for warm colours only
    await page.click('#btnClear');
    
    const warmCheckbox = page.locator('text=Warm').locator('..').locator('input[type="checkbox"]');
    await warmCheckbox.check();
    
    await page.waitForTimeout(500);
    
    const warmColours = page.locator('.card');
    const warmCount = await warmColours.count();
    expect(warmCount).toBeGreaterThan(0);
    
    // 7. User finds a colour they like and wants to copy the HEX code
    const firstHex = page.locator('.card-hex').first();
    const hexValue = await firstHex.textContent();
    
    await firstHex.click();
    
    // Verify copy feedback
    await expect(firstHex).toHaveText('COPIED!');
    
    await page.waitForTimeout(1000);
    
    // HEX value should be restored
    await expect(firstHex).toHaveText(hexValue);
    
    // 8. User wants to see complementary colour information
    const firstCard = page.locator('.card').first();
    const complementarySection = firstCard.locator('.card-field:has-text("Complementary")');
    
    if (await complementarySection.count() > 0) {
      const complementaryValue = await complementarySection.locator('.card-value').textContent();
      
      if (complementaryValue && !complementaryValue.includes('N/A')) {
        // Verify complementary colour is displayed with HEX
        expect(complementaryValue).toMatch(/[A-Za-z]+.*#[0-9A-F]{6}/i);
      }
    }
    
    // 9. User wants to check effects
    await page.click('text=EFFECTS');
    
    const effects = page.locator('.card');
    const effectsCount = await effects.count();
    expect(effectsCount).toBeGreaterThan(0);
    
    // 10. User wants to see project examples
    await page.click('text=Projects');
    
    const projects = page.locator('.projects-accordion');
    const projectsCount = await projects.count();
    expect(projectsCount).toBeGreaterThan(0);
    
    // 11. User expands a project to see details
    const firstProject = projects.first();
    const projectButton = firstProject.locator('button');
    
    await projectButton.click();
    
    await expect(firstProject.locator('.project-desc')).toBeVisible();
    
    // 12. User checks the putty reference guide
    await page.click('text=PUTTY');
    
    await expect(page.locator('text=Technical reference guide for fillers')).toBeVisible();
    await expect(page.locator('.custom-medieval-table')).toBeVisible();
    
    // 13. User wants to export their inventory
    await page.click('text=COLOURS');
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('#btnInventory');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('meu_inventario_tintas.csv');
    
    console.log('✅ Complete user journey test passed!');
  });

  test('user journey: searching for specific project materials', async ({ page }) => {
    // User arrives and goes directly to projects
    await page.goto('/');
    await page.click('text=Projects');
    
    // 1. User sees list of projects
    const projects = page.locator('.projects-accordion');
    const projectsCount = await projects.count();
    expect(projectsCount).toBeGreaterThan(0);
    
    // 2. User finds a project with materials
    let projectWithMaterials = null;
    
    for (let i = 0; i < Math.min(projectsCount, 5); i++) {
      const project = projects.nth(i);
      const projectButton = project.locator('button');
      
      await projectButton.click();
      
      const materialsGrid = project.locator('.project-dependencies-grid');
      
      if (await materialsGrid.count() > 0) {
        projectWithMaterials = project;
        break;
      }
    }
    
    if (projectWithMaterials) {
      // 3. User sees the materials used in the project
      const materialsGrid = projectWithMaterials.locator('.project-dependencies-grid');
      const materialChips = materialsGrid.locator('.mini-chip');
      const chipCount = await materialChips.count();
      
      expect(chipCount).toBeGreaterThan(0);
      
      // 4. User wants to find more information about a specific material
      const firstChip = materialChips.first();
      const chipText = await firstChip.textContent();
      
      // 5. User goes back to colours to search for this material
      await page.click('text=COLOURS');
      
      const searchInput = page.locator('#searchInput');
      
      // Extract colour name from chip (format: "code manufacturer\ncolourName")
      const colourName = chipText?.split('\n')[1]?.trim();
      
      if (colourName) {
        await searchInput.fill(colourName);
        
        const searchField = page.locator('#searchField');
        await searchField.selectOption('Base Colour');
        
        await page.click('#btnSearch');
        
        // 6. User should find the colour
        const results = page.locator('.card');
        const resultCount = await results.count();
        
        if (resultCount > 0) {
          // Verify the colour is found
          const firstResultTitle = await results.first().locator('.card-title').textContent();
          expect(firstResultTitle?.toLowerCase()).toContain(colourName.toLowerCase());
        }
      }
    }
    
    console.log('✅ Project materials search journey test passed!');
  });

  test('user journey: comparing colours and effects', async ({ page }) => {
    // User arrives and wants to compare colours
    await page.goto('/');
    
    // 1. User is on Colours tab
    await expect(page.locator('.tab-btn.active')).toHaveText('COLOURS');
    
    // 2. User sorts colours alphabetically (default)
    const firstColour = await page.locator('.card').first().locator('.card-title').textContent();
    
    // 3. User switches to Effects tab
    await page.click('text=EFFECTS');
    
    // 4. User sorts effects alphabetically
    const firstEffect = await page.locator('.card').first().locator('.card-title').textContent();
    
    // 5. User switches back to Colours
    await page.click('text=COLOURS');
    
    // 6. User should see the same first colour (sorting is preserved per tab)
    const firstColourAfterSwitch = await page.locator('.card').first().locator('.card-title').textContent();
    expect(firstColourAfterSwitch).toBe(firstColour);
    
    // 7. User wants to filter colours by manufacturer
    const akCheckbox = page.locator('text=AK').locator('..').locator('input[type="checkbox"]');
    await akCheckbox.check();
    
    await page.waitForTimeout(500);
    
    // 8. User sees only AK colours
    const akColours = page.locator('.card');
    const akCount = await akColours.count();
    expect(akCount).toBeGreaterThan(0);
    
    // 9. User clears filters
    await page.click('#btnClear');
    
    // 10. User should see all colours again
    const allColours = page.locator('.card');
    const allCount = await allColours.count();
    expect(allCount).toBeGreaterThan(akCount);
    
    console.log('✅ Colour comparison journey test passed!');
  });
});
import { test, expect } from '../../fixtures';

test.describe('Navigation', () => {

  test('browser back button returns to search results from lot page',
    { tag: ['@ui', '@regression'] },
    async ({ homePage, searchResultsPage, page }) => {
      await homePage.open();
      await homePage.searchFor('train');

      await searchResultsPage.clickLotByIndex(0);
      await Promise.all([
        page.waitForURL(/\/s\?/),
        page.goBack(),
      ]);

      expect(page.url()).toContain('/s?');
    });

});

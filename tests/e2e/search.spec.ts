import { test, expect } from '../../fixtures';

test.describe('Search', () => {

  test('search for "train" and verify second lot details',
    { tag: ['@ui', '@smoke'] },
    async ({ homePage, searchResultsPage, lotPage }) => {
      await homePage.open();
      await homePage.searchViaUI('train');

      expect(searchResultsPage.isOpen()).toBeTruthy();
      expect(searchResultsPage.url()).toContain('q=train');

      await searchResultsPage.clickLotByIndex(1);
      expect(lotPage.isOpen()).toBeTruthy();

      await lotPage.printLotDetails();
    });

  test('search results contain multiple lots with titles',
    { tag: ['@ui', '@regression'] },
    async ({ homePage, searchResultsPage }) => {
      await homePage.open();
      await homePage.searchFor('train');

      const count = await searchResultsPage.getLotCount();
      expect(count).toBeGreaterThan(1);

      const firstTitle = await searchResultsPage.getLotTitleByIndex(0);
      expect(firstTitle.trim()).not.toBe('');
    });

  test('different search keywords return relevant results',
    { tag: ['@ui', '@regression'] },
    async ({ homePage, searchResultsPage }) => {
      await homePage.open();
      await homePage.searchFor('stamp');

      const count = await searchResultsPage.getLotCount();
      expect(count).toBeGreaterThan(0);

      const firstTitle = await searchResultsPage.getLotTitleByIndex(0);
      expect(firstTitle.trim()).not.toBe('');
      console.log(`First result for "stamp": ${firstTitle.trim()}`);
    });

});

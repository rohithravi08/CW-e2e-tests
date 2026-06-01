import { test, expect } from '../../fixtures';

test.describe('Lot Page', () => {

  test('clicking first lot opens a valid lot page',
    { tag: ['@ui', '@smoke'] },
    async ({ homePage, searchResultsPage, lotPage }) => {
      await homePage.open();
      await homePage.searchFor('train');

      const firstLotTitle = await searchResultsPage.getLotTitleByIndex(0);
      await searchResultsPage.clickLotByIndex(0);

      expect(lotPage.isOpen()).toBeTruthy();

      const lotName = await lotPage.getLotName();
      expect(lotName.trim()).not.toBe('');

      console.log(`Card title:    ${firstLotTitle}`);
      console.log(`Lot page name: ${lotName.trim()}`);
    });

  test('lot page title matches the card title in search results',
    { tag: ['@ui', '@regression'] },
    async ({ homePage, searchResultsPage, lotPage }) => {
      await homePage.open();
      await homePage.searchFor('train');

      const cardTitle = await searchResultsPage.getLotTitleByIndex(1);
      await searchResultsPage.clickLotByIndex(1);

      const lotName = await lotPage.getLotName();
      expect(lotName.toLowerCase()).toContain(cardTitle.toLowerCase().substring(0, 30));
    });

});

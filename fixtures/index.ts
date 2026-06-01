import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { SearchResultsPage } from '../pages/SearchResultsPage';
import { LotPage } from '../pages/LotPage';

type Pages = {
  homePage: HomePage;
  searchResultsPage: SearchResultsPage;
  lotPage: LotPage;
};

export const test = base.extend<Pages>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  searchResultsPage: async ({ page }, use) => {
    await use(new SearchResultsPage(page));
  },
  lotPage: async ({ page }, use) => {
    await use(new LotPage(page));
  },
});

export { expect } from '@playwright/test';

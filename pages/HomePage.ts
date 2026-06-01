import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  private readonly searchInput = this.page.locator('input[type="search"]').first();
  private readonly searchButton = this.page.getByRole('banner').getByRole('button', { name: 'Search' });

  constructor(page: Page) {
    super(page);
  }

  async open() {
    await this.goto('/en/');
  }

  async searchFor(keyword: string) {
    await this.page.goto(`/en/s?q=${encodeURIComponent(keyword)}`);
  }

  async searchViaUI(keyword: string) {
    await this.searchInput.click();
    await this.searchInput.pressSequentially(keyword, { delay: 50 });
    await Promise.all([
      this.page.waitForURL(/\/s\?/),
      this.searchButton.click(),
    ]);
  }
}

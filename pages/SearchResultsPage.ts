import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class SearchResultsPage extends BasePage {
  readonly lotCards: Locator = this.page.locator('[data-testid^="lot-card-container"]');

  constructor(page: Page) {
    super(page);
  }

  isOpen(): boolean {
    return this.page.url().includes('/s?');
  }

  async clickLotByIndex(index: number) {
    const lot = this.lotCards.nth(index);
    await lot.waitFor();
    await Promise.all([
      this.page.waitForURL(/\/l\//),
      lot.click(),
    ]);
  }

  async getLotCount(): Promise<number> {
    await this.lotCards.first().waitFor();
    return this.lotCards.count();
  }

  async getLotTitleByIndex(index: number): Promise<string> {
    const lot = this.lotCards.nth(index);
    return (await lot.locator('p').first().textContent()) ?? '';
  }
}

import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LotPage extends BasePage {
  private readonly lotTitle = this.page.locator('h1').first();
  private readonly favoritesCounter = this.page.locator('button[class*="FavoriteChip"]').first();
  private readonly currentBid = this.page.locator('[data-testid="lot-bid-status-section"] .u-typography-h2');

  constructor(page: Page) {
    super(page);
  }

  async getLotName(): Promise<string> {
    await this.lotTitle.waitFor();
    return (await this.lotTitle.textContent()) ?? '';
  }

  async getFavouritesCount(): Promise<string> {
    await this.favoritesCounter.waitFor({ timeout: 5000 });
    return (await this.favoritesCounter.textContent()) ?? '';
  }

  async getCurrentBid(): Promise<string> {
    await this.currentBid.waitFor({ timeout: 5000 });
    return (await this.currentBid.textContent()) ?? '';
  }

  async printLotDetails() {
    const [name, favourites, bid] = await Promise.all([
      this.getLotName(),
      this.getFavouritesCount(),
      this.getCurrentBid(),
    ]);

    console.log('=== Lot Details ===');
    console.log(`Lot Name:         ${name.trim()}`);
    console.log(`Favourites Count: ${favourites.trim()}`);
    console.log(`Current Bid:      ${bid.trim()}`);
    console.log('===================');

    return { name: name.trim(), favourites: favourites.trim(), bid: bid.trim() };
  }

  isOpen(): boolean {
    return this.page.url().includes('/l/');
  }
}

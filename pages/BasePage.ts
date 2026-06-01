import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected readonly page: Page) {}

  url(): string {
    return this.page.url();
  }

  async goto(path: string = '/') {
    await this.page.goto(path);
    await this.dismissCookieBanner();
  }

  private async dismissCookieBanner() {
    try {
      const acceptBtn = this.page.getByRole('button', { name: /accept all|accept cookies|agree/i });
      await acceptBtn.waitFor({ timeout: 4000 });
      await acceptBtn.click();
    } catch {
      // No cookie banner present
    }
  }
}

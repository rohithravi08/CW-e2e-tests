import { test, expect } from '@playwright/test';

const KNOWN_LOT_ID = 104009301;
const INVALID_LOT_ID = 999999999;

// 40-character lowercase hex string
const TOKEN_PATTERN = /^[0-9a-f]{40}$/;
// ISO 8601 datetime with Z suffix
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
// cdn.catawiki.net flag asset URL
const FLAG_URL_PATTERN = /^https:\/\/cdn\.catawiki\.net\/.+\.(svg|png)$/;

function bidsUrl(lotId: number) {
  return `/buyer/api/v3/lots/${lotId}/bids`;
}

const DEFAULT_PARAMS = { currency_code: 'EUR', per_page: '200' };

test.describe('Lot Bids API', () => {

  // ── Status & shape ────────────────────────────────────────────────────────

  test('returns HTTP 200 for a valid lot ID',
    { tag: ['@api', '@smoke'] },
    async ({ request }) => {
      const response = await request.get(bidsUrl(KNOWN_LOT_ID), { params: DEFAULT_PARAMS });
      expect(response.status()).toBe(200);
    });

  test('response has bids array and meta object',
    { tag: ['@api', '@smoke'] },
    async ({ request }) => {
      const response = await request.get(bidsUrl(KNOWN_LOT_ID), { params: DEFAULT_PARAMS });
      const body = await response.json();

      expect(body).toHaveProperty('bids');
      expect(body).toHaveProperty('meta');
      expect(Array.isArray(body.bids)).toBe(true);
      expect(typeof body.meta).toBe('object');
    });

  test('returns 200 with null or empty bids for a non-existent lot ID',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    // The bids endpoint returns 200 for unknown lots.
    // The API returns bids: null (not an empty array) when no lot is found.
    const response = await request.get(bidsUrl(INVALID_LOT_ID), { params: DEFAULT_PARAMS });
    expect(response.status()).toBe(200);

    const body = await response.json();
    const bids = body.bids;
    const isEmpty = bids === null || (Array.isArray(bids) && bids.length === 0);
    expect(isEmpty).toBe(true);
  });

  // ── Bid fields ────────────────────────────────────────────────────────────

  test('each bid has all required fields',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(bidsUrl(KNOWN_LOT_ID), { params: DEFAULT_PARAMS });
    const { bids } = await response.json();

    const REQUIRED = ['id', 'amount', 'currency_code', 'bidder', 'from_order', 'explanation_type', 'created_at'];
    for (const bid of bids) {
      for (const key of REQUIRED) {
        expect(bid, `bid ${bid.id} missing key: ${key}`).toHaveProperty(key);
      }
    }
  });

  test('each bid id is a unique positive integer',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(bidsUrl(KNOWN_LOT_ID), { params: DEFAULT_PARAMS });
    const { bids } = await response.json();

    const ids = bids.map((b: any) => b.id);
    for (const id of ids) {
      expect(typeof id).toBe('number');
      expect(id).toBeGreaterThan(0);
    }
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('each bid amount is a positive number',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(bidsUrl(KNOWN_LOT_ID), { params: DEFAULT_PARAMS });
    const { bids } = await response.json();

    for (const bid of bids) {
      expect(typeof bid.amount).toBe('number');
      expect(bid.amount).toBeGreaterThan(0);
    }
  });

  test('all bid amounts are unique',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(bidsUrl(KNOWN_LOT_ID), { params: DEFAULT_PARAMS });
    const { bids } = await response.json();

    const amounts = bids.map((b: any) => b.amount);
    expect(new Set(amounts).size).toBe(amounts.length);
  });

  test('each bid currency_code matches the requested currency',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(bidsUrl(KNOWN_LOT_ID), { params: DEFAULT_PARAMS });
    const { bids } = await response.json();

    for (const bid of bids) {
      expect(bid.currency_code).toBe('EUR');
    }
  });

  test('each bid from_order is a boolean',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(bidsUrl(KNOWN_LOT_ID), { params: DEFAULT_PARAMS });
    const { bids } = await response.json();

    for (const bid of bids) {
      expect(typeof bid.from_order).toBe('boolean');
    }
  });

  test('each bid explanation_type is null or a string',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(bidsUrl(KNOWN_LOT_ID), { params: DEFAULT_PARAMS });
    const { bids } = await response.json();

    for (const bid of bids) {
      expect(bid.explanation_type === null || typeof bid.explanation_type === 'string').toBe(true);
    }
  });

  test('each bid created_at is a valid ISO 8601 datetime',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(bidsUrl(KNOWN_LOT_ID), { params: DEFAULT_PARAMS });
    const { bids } = await response.json();

    for (const bid of bids) {
      expect(bid.created_at).toMatch(ISO_DATE_PATTERN);
      expect(isNaN(Date.parse(bid.created_at))).toBe(false);
    }
  });

  // ── Ordering ──────────────────────────────────────────────────────────────

  test('bids are sorted by amount in descending order',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(bidsUrl(KNOWN_LOT_ID), { params: DEFAULT_PARAMS });
    const { bids } = await response.json();

    const amounts: number[] = bids.map((b: any) => b.amount);
    for (let i = 0; i < amounts.length - 1; i++) {
      expect(amounts[i]).toBeGreaterThanOrEqual(amounts[i + 1]);
    }
  });

  test('bids are sorted by created_at in descending order',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(bidsUrl(KNOWN_LOT_ID), { params: DEFAULT_PARAMS });
    const { bids } = await response.json();

    const timestamps: number[] = bids.map((b: any) => Date.parse(b.created_at));
    for (let i = 0; i < timestamps.length - 1; i++) {
      expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i + 1]);
    }
  });

  // ── Bidder fields ─────────────────────────────────────────────────────────

  test('each bidder has name, token, total_bids and country',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(bidsUrl(KNOWN_LOT_ID), { params: DEFAULT_PARAMS });
    const { bids } = await response.json();

    for (const bid of bids) {
      const { bidder } = bid;
      expect(bidder).toHaveProperty('name');
      expect(bidder).toHaveProperty('token');
      expect(bidder).toHaveProperty('total_bids');
      expect(bidder).toHaveProperty('country');
    }
  });

  test('bidder name matches "Bidder NNNN" pattern',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(bidsUrl(KNOWN_LOT_ID), { params: DEFAULT_PARAMS });
    const { bids } = await response.json();

    for (const bid of bids) {
      expect(bid.bidder.name).toMatch(/^Bidder \d+$/);
    }
  });

  test('bidder token is a 40-character hex string',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(bidsUrl(KNOWN_LOT_ID), { params: DEFAULT_PARAMS });
    const { bids } = await response.json();

    for (const bid of bids) {
      expect(bid.bidder.token).toMatch(TOKEN_PATTERN);
    }
  });

  test('bidder total_bids is a positive integer',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(bidsUrl(KNOWN_LOT_ID), { params: DEFAULT_PARAMS });
    const { bids } = await response.json();

    for (const bid of bids) {
      expect(typeof bid.bidder.total_bids).toBe('number');
      expect(Number.isInteger(bid.bidder.total_bids)).toBe(true);
      expect(bid.bidder.total_bids).toBeGreaterThan(0);
    }
  });

  // ── Bidder country ────────────────────────────────────────────────────────

  test('country code is a 2-letter lowercase string',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(bidsUrl(KNOWN_LOT_ID), { params: DEFAULT_PARAMS });
    const { bids } = await response.json();

    for (const bid of bids) {
      expect(bid.bidder.country.code).toMatch(/^[a-z]{2}$/);
    }
  });

  test('country flag_svg_url and flag_png_url are valid CDN URLs',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(bidsUrl(KNOWN_LOT_ID), { params: DEFAULT_PARAMS });
    const { bids } = await response.json();

    for (const bid of bids) {
      const { country } = bid.bidder;
      expect(country.flag_svg_url).toMatch(FLAG_URL_PATTERN);
      expect(country.flag_png_url).toMatch(FLAG_URL_PATTERN);
    }
  });

  test('flag url country code matches bidder country code',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(bidsUrl(KNOWN_LOT_ID), { params: DEFAULT_PARAMS });
    const { bids } = await response.json();

    for (const bid of bids) {
      const { code, flag_svg_url, flag_png_url } = bid.bidder.country;
      expect(flag_svg_url).toContain(`/${code}-`);
      expect(flag_png_url).toContain(`/${code}-`);
    }
  });

  // ── Meta ──────────────────────────────────────────────────────────────────

  test('meta.per_page matches the requested per_page parameter',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(bidsUrl(KNOWN_LOT_ID), { params: DEFAULT_PARAMS });
    const { meta } = await response.json();

    expect(meta.per_page).toBe(200);
  });

  test('meta.page is 1 by default',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(bidsUrl(KNOWN_LOT_ID), { params: DEFAULT_PARAMS });
    const { meta } = await response.json();

    expect(meta.page).toBe(1);
  });

  test('meta.total is a non-negative integer',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(bidsUrl(KNOWN_LOT_ID), { params: DEFAULT_PARAMS });
    const { meta } = await response.json();

    expect(typeof meta.total).toBe('number');
    expect(Number.isInteger(meta.total)).toBe(true);
    expect(meta.total).toBeGreaterThanOrEqual(0);
  });

  test('meta.total equals bids array length when total <= per_page',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(bidsUrl(KNOWN_LOT_ID), { params: DEFAULT_PARAMS });
    const { bids, meta } = await response.json();

    if (meta.total <= meta.per_page) {
      expect(bids.length).toBe(meta.total);
    }
  });

  // ── Param behaviour ───────────────────────────────────────────────────────

  test('per_page=1 returns at most 1 bid',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(bidsUrl(KNOWN_LOT_ID), {
      params: { currency_code: 'EUR', per_page: '1' },
    });
    const { bids } = await response.json();

    expect(bids.length).toBeLessThanOrEqual(1);
  });

  test('requesting USD currency_code returns bids with USD amounts',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(bidsUrl(KNOWN_LOT_ID), {
      params: { currency_code: 'USD', per_page: '200' },
    });
    expect(response.status()).toBe(200);

    const { bids } = await response.json();
    for (const bid of bids) {
      expect(bid.currency_code).toBe('USD');
    }
  });

  // ── Performance ───────────────────────────────────────────────────────────

  test('responds within 1 second',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const start = Date.now();
    await request.get(bidsUrl(KNOWN_LOT_ID), { params: DEFAULT_PARAMS });
    expect(Date.now() - start).toBeLessThan(1000);
  });

});

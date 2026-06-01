import { test, expect } from '@playwright/test';

const ENDPOINT = '/collections/api/v1/collections/related/brand';

const DEFAULT_PARAMS = { query: '?q=train', locale: 'en' };

// Hex colour pattern: #RRGGBB
const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

// Each collection item must carry these keys
const REQUIRED_COLLECTION_KEYS = [
  'id', 'title', 'description', 'start_date',
  'url', 'color', 'title_color', 'cta_text',
  'categories', 'images', 'lot_count', 'tags', 'seo',
];

test.describe('Collections Related Brand API', () => {

  test('returns HTTP 200',
    { tag: ['@api', '@smoke'] },
    async ({ request }) => {
      const response = await request.get(ENDPOINT, { params: DEFAULT_PARAMS });
      expect(response.status()).toBe(200);
    });

  test('response body has a collections array',
    { tag: ['@api', '@smoke'] },
    async ({ request }) => {
      const response = await request.get(ENDPOINT, { params: DEFAULT_PARAMS });
      const body = await response.json();

      expect(body).toHaveProperty('collections');
      expect(Array.isArray(body.collections)).toBe(true);
      expect(body.collections.length).toBeGreaterThan(0);
    });

  test('each collection has all required fields',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(ENDPOINT, { params: DEFAULT_PARAMS });
    const { collections } = await response.json();

    for (const collection of collections) {
      for (const key of REQUIRED_COLLECTION_KEYS) {
        expect(collection, `collection ${collection.id} missing key: ${key}`).toHaveProperty(key);
      }
    }
  });

  test('each collection id is a positive integer',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(ENDPOINT, { params: DEFAULT_PARAMS });
    const { collections } = await response.json();

    for (const collection of collections) {
      expect(typeof collection.id).toBe('number');
      expect(collection.id).toBeGreaterThan(0);
    }
  });

  test('each collection title is a non-empty string',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(ENDPOINT, { params: DEFAULT_PARAMS });
    const { collections } = await response.json();

    for (const collection of collections) {
      expect(typeof collection.title).toBe('string');
      expect(collection.title.trim()).not.toBe('');
    }
  });

  test('each collection url points to catawiki.com',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(ENDPOINT, { params: DEFAULT_PARAMS });
    const { collections } = await response.json();

    for (const collection of collections) {
      expect(collection.url).toContain('catawiki.com');
      expect(collection.url).toMatch(/\/en\/x\/\d+/);
    }
  });

  test('each collection color and title_color are valid hex values',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(ENDPOINT, { params: DEFAULT_PARAMS });
    const { collections } = await response.json();

    for (const collection of collections) {
      expect(collection.color).toMatch(HEX_COLOR);
      expect(collection.title_color).toMatch(HEX_COLOR);
    }
  });

  test('each collection lot_count is a positive integer',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(ENDPOINT, { params: DEFAULT_PARAMS });
    const { collections } = await response.json();

    for (const collection of collections) {
      expect(typeof collection.lot_count).toBe('number');
      expect(collection.lot_count).toBeGreaterThan(0);
    }
  });

  test('each collection categories is a non-empty array of integers',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(ENDPOINT, { params: DEFAULT_PARAMS });
    const { collections } = await response.json();

    for (const collection of collections) {
      expect(Array.isArray(collection.categories)).toBe(true);
      expect(collection.categories.length).toBeGreaterThan(0);
      for (const cat of collection.categories) {
        expect(typeof cat).toBe('number');
      }
    }
  });

  test('each collection images array has url and valid orientation',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(ENDPOINT, { params: DEFAULT_PARAMS });
    const { collections } = await response.json();

    for (const collection of collections) {
      expect(Array.isArray(collection.images)).toBe(true);
      for (const image of collection.images) {
        expect(image).toHaveProperty('url');
        expect(image).toHaveProperty('orientation');
        expect(typeof image.url).toBe('string');
        expect(['portrait', 'landscape']).toContain(image.orientation);
      }
    }
  });

  test('each collection image url is reachable (first collection only)',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(ENDPOINT, { params: DEFAULT_PARAMS });
    const { collections } = await response.json();

    const firstImage = collections[0]?.images?.[0];
    expect(firstImage).toBeDefined();

    const imgResponse = await request.head(firstImage.url);
    expect([200, 301, 302]).toContain(imgResponse.status());
  });

  test('seo field is a boolean',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(ENDPOINT, { params: DEFAULT_PARAMS });
    const { collections } = await response.json();

    for (const collection of collections) {
      expect(typeof collection.seo).toBe('boolean');
    }
  });

  test('start_date is a valid ISO 8601 date string',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(ENDPOINT, { params: DEFAULT_PARAMS });
    const { collections } = await response.json();

    for (const collection of collections) {
      const parsed = Date.parse(collection.start_date);
      expect(isNaN(parsed)).toBe(false);
    }
  });

  test('cta_text contains a number (object count)',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(ENDPOINT, { params: DEFAULT_PARAMS });
    const { collections } = await response.json();

    for (const collection of collections) {
      expect(typeof collection.cta_text).toBe('string');
      expect(collection.cta_text).toMatch(/\d+/);
    }
  });

  test('responds within 2 seconds',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const start = Date.now();
    await request.get(ENDPOINT, { params: DEFAULT_PARAMS });
    expect(Date.now() - start).toBeLessThan(2000);
  });

  test('locale=nl returns a valid response',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(ENDPOINT, {
      params: { query: '?q=train', locale: 'nl' },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.collections)).toBe(true);
  });

  test('different query returns a response with collections array',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(ENDPOINT, {
      params: { query: '?q=stamp', locale: 'en' },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.collections)).toBe(true);
  });

});

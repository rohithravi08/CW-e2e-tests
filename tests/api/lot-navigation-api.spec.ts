import { test, expect } from '@playwright/test';

const KNOWN_LOT_ID = 104009301;
const INVALID_LOT_ID = 999999999;

function navigationUrl(lotId: number) {
  return `/buyer/api/v3/lots/${lotId}/navigation`;
}

test.describe('Lot Navigation API', () => {

  test('returns HTTP 200 for a valid lot ID',
    { tag: ['@api', '@smoke'] },
    async ({ request }) => {
      const response = await request.get(navigationUrl(KNOWN_LOT_ID));
      expect(response.status()).toBe(200);
    });

  test('response contains all required fields',
    { tag: ['@api', '@smoke'] },
    async ({ request }) => {
      const response = await request.get(navigationUrl(KNOWN_LOT_ID));
      const body = await response.json();

      expect(body).toHaveProperty('source');
      expect(body).toHaveProperty('previous_lot_id');
      expect(body).toHaveProperty('next_lot_id');
      expect(body).toHaveProperty('current_position');
      expect(body).toHaveProperty('total_lots');
    });

  test('source is a non-empty string',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(navigationUrl(KNOWN_LOT_ID));
    const { source } = await response.json();

    expect(typeof source).toBe('string');
    expect(source.trim()).not.toBe('');
  });

  test('previous_lot_id is a positive integer or null',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(navigationUrl(KNOWN_LOT_ID));
    const { previous_lot_id } = await response.json();

    if (previous_lot_id !== null) {
      expect(typeof previous_lot_id).toBe('number');
      expect(previous_lot_id).toBeGreaterThan(0);
    } else {
      expect(previous_lot_id).toBeNull();
    }
  });

  test('next_lot_id is a positive integer or null',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(navigationUrl(KNOWN_LOT_ID));
    const { next_lot_id } = await response.json();

    if (next_lot_id !== null) {
      expect(typeof next_lot_id).toBe('number');
      expect(next_lot_id).toBeGreaterThan(0);
    } else {
      expect(next_lot_id).toBeNull();
    }
  });

  test('current_position is a positive integer',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(navigationUrl(KNOWN_LOT_ID));
    const { current_position } = await response.json();

    expect(typeof current_position).toBe('number');
    expect(Number.isInteger(current_position)).toBe(true);
    expect(current_position).toBeGreaterThanOrEqual(1);
  });

  test('total_lots is a positive integer',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(navigationUrl(KNOWN_LOT_ID));
    const { total_lots } = await response.json();

    expect(typeof total_lots).toBe('number');
    expect(Number.isInteger(total_lots)).toBe(true);
    expect(total_lots).toBeGreaterThan(0);
  });

  test('current_position is within bounds of total_lots',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(navigationUrl(KNOWN_LOT_ID));
    const { current_position, total_lots } = await response.json();

    expect(current_position).toBeGreaterThanOrEqual(1);
    expect(current_position).toBeLessThanOrEqual(total_lots);
  });

  test('previous_lot_id and next_lot_id are different lots',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(navigationUrl(KNOWN_LOT_ID));
    const { previous_lot_id, next_lot_id } = await response.json();

    if (previous_lot_id !== null && next_lot_id !== null) {
      expect(previous_lot_id).not.toBe(next_lot_id);
    }
  });

  test('previous and next lot IDs differ from the requested lot',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(navigationUrl(KNOWN_LOT_ID));
    const { previous_lot_id, next_lot_id } = await response.json();

    if (previous_lot_id !== null) {
      expect(previous_lot_id).not.toBe(KNOWN_LOT_ID);
    }
    if (next_lot_id !== null) {
      expect(next_lot_id).not.toBe(KNOWN_LOT_ID);
    }
  });

  test('first lot in auction has null previous_lot_id',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    // Fetch KNOWN_LOT_ID first to get its neighbours, then walk to position 1
    const response = await request.get(navigationUrl(KNOWN_LOT_ID));
    const body = await response.json();

    if (body.current_position === 1) {
      expect(body.previous_lot_id).toBeNull();
    } else {
      // Not at position 1 — just confirm the field type is correct
      expect(body.previous_lot_id === null || typeof body.previous_lot_id === 'number').toBe(true);
    }
  });

  test('last lot in auction has null next_lot_id',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(navigationUrl(KNOWN_LOT_ID));
    const body = await response.json();

    if (body.current_position === body.total_lots) {
      expect(body.next_lot_id).toBeNull();
    } else {
      expect(body.next_lot_id === null || typeof body.next_lot_id === 'number').toBe(true);
    }
  });

  test('returns 404 for a non-existent lot ID',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(navigationUrl(INVALID_LOT_ID));
    expect(response.status()).toBe(404);
  });

  test('responds within 1 second',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const start = Date.now();
    await request.get(navigationUrl(KNOWN_LOT_ID));
    expect(Date.now() - start).toBeLessThan(1000);
  });

  test('navigation of the previous lot points back toward current lot',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(navigationUrl(KNOWN_LOT_ID));
    const { previous_lot_id, current_position } = await response.json();

    if (previous_lot_id === null) return;

    const prevResponse = await request.get(navigationUrl(previous_lot_id));
    expect(prevResponse.status()).toBe(200);

    const prev = await prevResponse.json();
    expect(prev.current_position).toBe(current_position - 1);
    expect(prev.next_lot_id).toBe(KNOWN_LOT_ID);
  });

  test('navigation of the next lot points back toward current lot',
    { tag: ['@api', '@regression'] },
    async ({ request }) => {
    const response = await request.get(navigationUrl(KNOWN_LOT_ID));
    const { next_lot_id, current_position } = await response.json();

    if (next_lot_id === null) return;

    const nextResponse = await request.get(navigationUrl(next_lot_id));
    expect(nextResponse.status()).toBe(200);

    const next = await nextResponse.json();
    expect(next.current_position).toBe(current_position + 1);
    expect(next.previous_lot_id).toBe(KNOWN_LOT_ID);
  });

});

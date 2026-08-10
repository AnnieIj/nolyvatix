/**
 * Nolyvatix Data Engine - Response Wrapper Unit Tests
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { createSuccessResponse, createPaginatedResponse, createErrorResponse } from '../middleware/responseWrapper.js';

describe('ResponseWrapper', () => {
  test('should format success response correctly', () => {
    const res = createSuccessResponse({ foo: 'bar' });

    assert.strictEqual(res.success, true);
    assert.deepStrictEqual(res.data, { foo: 'bar' });
    assert.ok(res.timestamp);
  });

  test('should format paginated response correctly', () => {
    const items = [1, 2, 3];
    const res = createPaginatedResponse(items, {
      cursor: '1',
      nextCursor: '4',
      limit: 10,
      hasMore: false,
    });

    assert.strictEqual(res.success, true);
    assert.deepStrictEqual(res.data, [1, 2, 3]);
    assert.strictEqual(res.pagination.nextCursor, '4');
    assert.strictEqual(res.pagination.hasMore, false);
  });

  test('should format error response correctly', () => {
    const res = createErrorResponse('TEST_ERR', 'Test error message');

    assert.strictEqual(res.success, false);
    assert.strictEqual(res.error?.code, 'TEST_ERR');
    assert.strictEqual(res.error?.message, 'Test error message');
  });
});

/**
 * Nolyvatix Client - Authenticated API Client
 * Automatically attaches Firebase ID Token in Authorization header
 */

import { getAuthToken } from './firebase.ts';

export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = await getAuthToken();

  const headers = new Headers(init?.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}

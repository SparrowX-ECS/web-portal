import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const baseUrl = readFileSync(new URL('./.base-url', import.meta.url), 'utf8').trim().replace(/\/+$/, '');

if (!baseUrl) {
  throw new Error('BASE_URL must point to the deployed web portal');
}

describe('deployed web portal', () => {
  it('serves the health endpoint', async () => {
    const response = await fetch(`${baseUrl}/health`);

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/plain');
    expect((await response.text()).trim()).toBe('OK');
  });

  it('serves the SPA shell', async () => {
    const response = await fetch(`${baseUrl}/`);
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
    expect(body).toContain('<div id="root"></div>');
  });
});

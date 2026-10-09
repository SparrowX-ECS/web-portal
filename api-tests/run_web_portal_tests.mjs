import { unlinkSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const baseUrl = process.env.BASE_URL ?? '';
if (!baseUrl) {
  console.error('BASE_URL must point to the deployed web portal');
  process.exit(1);
}

const urlFile = new URL('./.base-url', import.meta.url);
writeFileSync(urlFile, baseUrl, 'utf8');

try {
  const result = spawnSync(
    'npx',
    [
      'vitest',
      'run',
      'api-tests/test_web_portal.test.ts',
      '--config',
      'api-tests/vitest.config.ts',
      '--reporter=verbose',
    ],
    { stdio: 'inherit' },
  );
  const exitCode = result.status ?? 1;
  unlinkSync(urlFile);
  process.exitCode = exitCode;
} finally {
  try {
    unlinkSync(urlFile);
  } catch {
    // The file was already removed after the test process completed.
  }
}

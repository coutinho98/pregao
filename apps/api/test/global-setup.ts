import 'dotenv/config';
import { execSync } from 'node:child_process';

export default function applyMigrationsToTestDatabase(): void {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error('TEST_DATABASE_URL is required to run the tests.');
  execSync('prisma migrate deploy', {
    stdio: 'ignore',
    env: { ...process.env, DATABASE_URL: url, DIRECT_URL: url },
  });
}

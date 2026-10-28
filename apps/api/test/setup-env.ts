import 'dotenv/config';

if (!process.env.TEST_DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL is required to run the tests (see apps/api/.env.example).');
}
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
// Tests settle lots explicitly (and move a fake clock), so the background worker stays off.
process.env.SETTLEMENT_INTERVAL_MS = '0';
// Every test signs up its own users from the same address; the limit has its own test.
process.env.AUTH_ATTEMPTS_PER_MINUTE = '1000';

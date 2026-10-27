import 'dotenv/config';

if (!process.env.TEST_DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL is required to run the tests (see apps/api/.env.example).');
}
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

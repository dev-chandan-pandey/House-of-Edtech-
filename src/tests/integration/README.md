# Integration tests (scaffold)

This directory contains example/integration tests that require a running instance of the app
(`BASE_URL`) and a test database (`DATABASE_URL`) configured.

How to run:
1. Start your app (locally) with a test database.
2. Set env vars:
   - `BASE_URL=http://localhost:3000`
   - `DATABASE_URL=postgresql://...` (optional if tests don't hit DB)
3. Run:
   ```bash
   npm run test -- src/tests/integration/sample.integration.test.ts

# Server tests

Add server tests here using your runner of choice (vitest, jest, supertest).

A typical test setup spins up the express app via `createApp()` and queries with supertest:

```ts
import request from "supertest";
import { createApp } from "../../server/src/app";

const app = createApp();

it("returns 200 on health check", async () => {
  const res = await request(app).get("/api/healthz");
  expect(res.status).toBe(200);
});
```

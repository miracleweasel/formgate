// test/backlog.rateLimit.test.ts
// Tests for Backlog API rate limiting

import { describe, it } from "node:test";
import assert from "node:assert/strict";

// We can't easily test the actual rate limiter without mocking,
// but we can verify the client module exports and structure

describe("Backlog client module", () => {
  it("exports backlogGetJson function", async () => {
    const mod = await import("../lib/backlog/client");
    assert.equal(typeof mod.backlogGetJson, "function");
  });

  it("exports backlogPostJson function", async () => {
    const mod = await import("../lib/backlog/client");
    assert.equal(typeof mod.backlogPostJson, "function");
  });

  it("exports makeBacklogApiUrl function", async () => {
    const mod = await import("../lib/backlog/client");
    assert.equal(typeof mod.makeBacklogApiUrl, "function");
  });

  it("exports createBacklogIssueBestEffort function", async () => {
    const mod = await import("../lib/backlog/client");
    assert.equal(typeof mod.createBacklogIssueBestEffort, "function");
  });

  it("makeBacklogApiUrl builds correct URL with apiKey", async () => {
    const { makeBacklogApiUrl } = await import("../lib/backlog/client");
    const url = makeBacklogApiUrl(
      { spaceUrl: "https://test.backlog.jp", apiKey: "secret123" },
      "/api/v2/projects"
    );
    assert.ok(url.includes("test.backlog.jp"), "URL should include space domain");
    assert.ok(url.includes("apiKey=secret123"), "URL should include apiKey param");
    assert.ok(url.includes("/api/v2/projects"), "URL should include path");
  });

  it("makeBacklogApiUrl handles query params", async () => {
    const { makeBacklogApiUrl } = await import("../lib/backlog/client");
    const url = makeBacklogApiUrl(
      { spaceUrl: "https://test.backlog.jp", apiKey: "key" },
      "/api/v2/issues",
      { count: 100, projectId: 123 }
    );
    assert.ok(url.includes("count=100"), "URL should include count param");
    assert.ok(url.includes("projectId=123"), "URL should include projectId param");
  });

  it("makeBacklogApiUrl ignores null/undefined query params", async () => {
    const { makeBacklogApiUrl } = await import("../lib/backlog/client");
    const url = makeBacklogApiUrl(
      { spaceUrl: "https://test.backlog.jp", apiKey: "key" },
      "/api/v2/issues",
      { count: 100, filter: null, sort: undefined }
    );
    assert.ok(url.includes("count=100"), "URL should include count param");
    assert.ok(!url.includes("filter="), "URL should not include null param");
    assert.ok(!url.includes("sort="), "URL should not include undefined param");
  });
});

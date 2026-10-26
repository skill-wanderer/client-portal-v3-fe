import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_RETURN_TO, safeReturnTo } from "./return-to.ts";

test("keeps same-origin paths, including query and hash", () => {
  assert.equal(safeReturnTo("/projects?tab=1#files"), "/projects?tab=1#files");
  assert.equal(safeReturnTo("/projects/../account"), "/account");
  assert.equal(safeReturnTo("/%2F%2Fevil.com"), "/%2F%2Fevil.com");
});

test("rejects anything that would leave the portal", () => {
  for (const input of [
    "https://evil.com",
    "//evil.com",
    "/\\evil.com",
    "/\\/evil.com",
    "\\\\evil.com",
    "/..//evil.com",
    "/a/../..//evil.com/x",
    "/\t/evil.com",
    "javascript:alert(1)",
  ]) {
    assert.equal(safeReturnTo(input), DEFAULT_RETURN_TO, input);
  }
});

test("falls back for empty values and auth routes", () => {
  assert.equal(safeReturnTo(null), DEFAULT_RETURN_TO);
  assert.equal(safeReturnTo(""), DEFAULT_RETURN_TO);
  assert.equal(safeReturnTo("/auth/login"), DEFAULT_RETURN_TO);
});

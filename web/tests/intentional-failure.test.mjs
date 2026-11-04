import assert from "node:assert/strict";
import test from "node:test";

test("CI probe: intentional failure on the second push", () => {
  assert.fail("Intentional CI probe failure; revert this commit to restore passing tests.");
});

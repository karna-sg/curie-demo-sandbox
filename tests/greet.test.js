import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { greet } from "../src/greet.js";

describe("greet", () => {
  it("returns Hello greeting with normalized name", () => {
    assert.equal(greet("jane doe"), "Hello, Jane Doe!");
  });

  it("normalizes whitespace before greeting", () => {
    assert.equal(greet("  jane   doe "), "Hello, Jane Doe!");
  });

  it("throws TypeError on empty string", () => {
    assert.throws(() => greet(""), TypeError);
  });

  it("throws TypeError on non-string input", () => {
    assert.throws(() => greet(null), TypeError);
    assert.throws(() => greet(42), TypeError);
  });
});

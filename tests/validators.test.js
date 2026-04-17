import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isValidName, normalizeName } from "../src/validators.js";

describe("isValidName", () => {
  it("accepts simple and multi-part names", () => {
    assert.equal(isValidName("Jane"), true);
    assert.equal(isValidName("Jane Doe"), true);
    assert.equal(isValidName("O'Brien"), true);
    assert.equal(isValidName("Anne-Marie"), true);
  });

  it("rejects empty and whitespace-only strings", () => {
    assert.equal(isValidName(""), false);
    assert.equal(isValidName("   "), false);
  });

  it("rejects null, undefined, and non-string values", () => {
    assert.equal(isValidName(null), false);
    assert.equal(isValidName(undefined), false);
    assert.equal(isValidName(42), false);
    assert.equal(isValidName({}), false);
  });

  it("rejects strings longer than 80 characters", () => {
    assert.equal(isValidName("a".repeat(81)), false);
    assert.equal(isValidName("a".repeat(80)), true);
  });

  it("rejects strings containing digits or symbols", () => {
    assert.equal(isValidName("Jane1"), false);
    assert.equal(isValidName("hi@"), false);
    assert.equal(isValidName("Jane_Doe"), false);
  });

  it("accepts Unicode letters", () => {
    assert.equal(isValidName("Zoë"), true);
    assert.equal(isValidName("José"), true);
  });
});

describe("normalizeName", () => {
  it("collapses internal whitespace and title-cases", () => {
    assert.equal(normalizeName("  jane   doe "), "Jane Doe");
  });

  it("title-cases hyphenated and apostrophe names", () => {
    assert.equal(normalizeName("anne-marie"), "Anne-Marie");
    assert.equal(normalizeName("o'brien"), "O'Brien");
  });

  it("throws TypeError on invalid input", () => {
    assert.throws(() => normalizeName(""), TypeError);
    assert.throws(() => normalizeName(null), TypeError);
    assert.throws(() => normalizeName("Jane1"), TypeError);
  });
});

import test from "node:test";
import assert from "node:assert/strict";
import { guideFor } from "../src/content.js";
test("the guide explains AI work when the visitor reaches AI capabilities", () => {
  assert.match(guideFor("intelligence").message, /requirements/i);
});
test("contact guidance offers a real contact address", () => {
  assert.match(guideFor("contact").message, /paulluiser@gmail.com/);
});
test("unknown sections safely return the introduction", () => {
  assert.equal(guideFor("unknown"), guideFor("home"));
});
test("career history includes exact associate title and internship with verified dates", async () => {
  const { career } = await import("../src/content.js");
  assert.equal(career.length, 4);
  assert.equal(career[1].title, "Associate IT Project Manager");
  assert.equal(career[1].date, "June — October 2025");
  assert.equal(career[2].date, "February — May 2025");
  assert.ok(career.every((role) => role.details.length >= 2));
});

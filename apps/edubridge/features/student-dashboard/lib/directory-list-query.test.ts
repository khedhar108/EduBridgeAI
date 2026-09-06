import assert from "node:assert/strict";
import { test } from "node:test";
import {
  directoryNamePattern,
  parseDirectoryListInput,
  studentsPageHref,
} from "./directory-list-query";

test("parseDirectoryListInput clamps page and trims name", () => {
  assert.deepEqual(parseDirectoryListInput({}), { name: undefined, page: 1 });
  assert.deepEqual(parseDirectoryListInput({ q: "  Amit  ", page: "2" }), {
    name: "Amit",
    page: 2,
  });
  assert.equal(parseDirectoryListInput({ page: "0" }).page, 1);
  assert.equal(parseDirectoryListInput({ page: "nope" }).page, 1);
});

test("directoryNamePattern drops LIKE wildcards", () => {
  assert.equal(directoryNamePattern("  %Ami_t\\  "), "%Amit%");
  assert.equal(directoryNamePattern("   "), undefined);
  assert.equal(directoryNamePattern("%"), undefined);
});

test("studentsPageHref omits page 1", () => {
  assert.equal(
    studentsPageHref("pilot", { q: "Amit", page: 1, date: "2026-09-04" }),
    "/pilot/students?date=2026-09-04&q=Amit",
  );
  assert.equal(
    studentsPageHref("pilot", { q: "Amit", page: 2 }),
    "/pilot/students?q=Amit&page=2",
  );
});

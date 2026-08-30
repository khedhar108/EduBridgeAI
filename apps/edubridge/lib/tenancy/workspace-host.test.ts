import assert from "node:assert/strict";
import test from "node:test";
import {
  hostnameFromHeaders,
  parseWorkspaceHost,
  workspaceUrlDisplay,
} from "./workspace-host";

const STAGING_ROOT = "dev.edubridge.app";
const PRODUCTION_ROOT = "edubridge.app";
const SCHOOL_SLUG = "school-bridge";

test("parses staging school and platform hosts", () => {
  assert.deepEqual(
    parseWorkspaceHost(`${SCHOOL_SLUG}.${STAGING_ROOT}`, STAGING_ROOT),
    { kind: "school", slug: SCHOOL_SLUG },
  );
  assert.deepEqual(
    parseWorkspaceHost(`platform.${STAGING_ROOT}`, STAGING_ROOT),
    { kind: "platform" },
  );
  assert.deepEqual(parseWorkspaceHost(STAGING_ROOT, STAGING_ROOT), {
    kind: "apex",
  });
});

test("keeps production, Vercel, and localhost modes distinct", () => {
  assert.deepEqual(
    parseWorkspaceHost(`${SCHOOL_SLUG}.${PRODUCTION_ROOT}`, PRODUCTION_ROOT),
    { kind: "school", slug: SCHOOL_SLUG },
  );
  assert.deepEqual(
    parseWorkspaceHost("feature-edubridge.vercel.app", STAGING_ROOT),
    { kind: "apex" },
  );
  assert.deepEqual(parseWorkspaceHost(`${SCHOOL_SLUG}.localhost`, STAGING_ROOT), {
    kind: "school",
    slug: SCHOOL_SLUG,
  });
  assert.deepEqual(parseWorkspaceHost("localhost", STAGING_ROOT), {
    kind: "apex",
  });
});

test("rejects nested, reserved, and malformed school hosts", () => {
  assert.deepEqual(
    parseWorkspaceHost(`nested.${SCHOOL_SLUG}.${STAGING_ROOT}`, STAGING_ROOT),
    { kind: "apex" },
  );
  assert.deepEqual(
    parseWorkspaceHost(`www.${STAGING_ROOT}`, STAGING_ROOT),
    { kind: "apex" },
  );
  assert.deepEqual(
    parseWorkspaceHost(`school.${STAGING_ROOT}`, STAGING_ROOT),
    { kind: "apex" },
  );
});

test("uses forwarded host only when the deployment trusts its proxy", () => {
  const headers = new Headers({
    host: "localhost:3000",
    "x-forwarded-host": `${SCHOOL_SLUG}.${STAGING_ROOT}:443, proxy.internal`,
  });

  assert.equal(hostnameFromHeaders(headers, false), "localhost");
  assert.equal(
    hostnameFromHeaders(headers, true),
    `${SCHOOL_SLUG}.${STAGING_ROOT}`,
  );
});

test("displays URLs from the configured environment root", () => {
  assert.deepEqual(
    workspaceUrlDisplay(
      SCHOOL_SLUG,
      `${SCHOOL_SLUG}.${STAGING_ROOT}`,
      STAGING_ROOT,
    ),
    {
      slug: SCHOOL_SLUG,
      shareHost: `${SCHOOL_SLUG}.${STAGING_ROOT}`,
      shareUrl: `https://${SCHOOL_SLUG}.${STAGING_ROOT}`,
      onSchoolHost: true,
      localHint: `/${SCHOOL_SLUG}`,
    },
  );
});

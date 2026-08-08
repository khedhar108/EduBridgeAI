#!/usr/bin/env python3
"""Phase 0 progress checklist — flip [ ] to [x] when verified."""

from __future__ import annotations

STEPS: list[tuple[str, bool]] = [
    # Architecture (docs)
    ("SaaS boundaries docs (platform / tenant / support)", True),
    ("ADR-006 workspace subdomains + path fallback", True),
    # Auth foundation
    ("@supabase/ssr + env vars in apps/edubridge", True),
    ("proxy.ts session refresh + coarse route guards", True),
    ("Premium marketing home `/`", True),
    ("School sign-in `/sign-in`", True),
    ("Platform sign-in `/platform/sign-in`", True),
    ("Platform placeholder `/platform`", True),
    ("Workspace gate `/[workspace]` via getSessionContext", True),
    ("auth/callback code exchange", True),
    ("getSessionContext + assertRole + platform claim", True),
    ("invitations table + invite/accept flow", True),
    ("Domain join pending then admin activate", True),
    ("Bootstrap school_admin + teacher + owner smoke sign-in", True),
    # Still open
    ("Invite outsider + domain activate e2e", False),
    ("Full shell Header/AppMenu/ModulePill/Search/Profile", False),
    ("Seed auth users for all six roles", False),
    ("RLS isolation test with two schools", False),
    ("pnpm lint / build green after auth", False),
]


def main() -> None:
    done = sum(1 for _, ok in STEPS if ok)
    total = len(STEPS)
    print(f"Phase 0 progress: {done}/{total}\n")
    for label, ok in STEPS:
        mark = "x" if ok else " "
        print(f"- [{mark}] {label}")
    print()
    if done < total:
        raise SystemExit(1)
    print("All listed steps complete.")


if __name__ == "__main__":
    main()

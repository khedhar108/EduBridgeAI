"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { checkUsernameAction } from "../actions/check-username";
import { validateUsername } from "../lib/username";

const DEBOUNCE_MS = 400;

export function useUsernameCheck(
  username: string,
  schoolSlug: string | undefined,
) {
  const [debounced, setDebounced] = useState(username);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(username), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [username]);

  const slug = schoolSlug?.trim() ?? "";
  const formatError = validateUsername(debounced);
  const enabled = Boolean(debounced) && !formatError && slug.length > 0;

  const query = useQuery({
    queryKey: queryKeys.auth.usernameCheck(slug, debounced),
    queryFn: () => checkUsernameAction(debounced, slug),
    enabled,
    staleTime: 30_000,
    retry: 0,
    refetchOnWindowFocus: false,
  });

  return { ...query, debounced, enabled };
}

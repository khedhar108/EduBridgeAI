"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { workspaceSlugError } from "@/lib/tenancy/school-slug";
import { checkSlugAction } from "../actions/register-school";

const DEBOUNCE_MS = 400;

export function useSlugCheck(slug: string, enabled: boolean) {
  const [debounced, setDebounced] = useState(slug);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(slug), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [slug]);

  const formatError = workspaceSlugError(debounced);
  const queryEnabled = enabled && Boolean(debounced) && !formatError;

  const query = useQuery({
    queryKey: queryKeys.registration.slugCheck(debounced),
    queryFn: () => checkSlugAction(debounced),
    enabled: queryEnabled,
    staleTime: 30_000,
    retry: 0,
    refetchOnWindowFocus: false,
  });

  return { ...query, debounced, formatError, enabled: queryEnabled };
}

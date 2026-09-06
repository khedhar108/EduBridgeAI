export const DIRECTORY_PAGE_SIZE = 25;

export type DirectoryListInput = {
  name?: string;
  page: number;
};

/** Strip LIKE metacharacters; the query uses ILIKE on full_name. */
export function directoryNamePattern(raw: string): string | undefined {
  const needle = raw.trim().replace(/[%_\\]/g, "");
  return needle.length > 0 ? `%${needle}%` : undefined;
}

export function parseDirectoryListInput(raw: {
  q?: string;
  page?: string;
}): DirectoryListInput {
  const name = raw.q?.trim() ? raw.q.trim() : undefined;
  const parsed = Number.parseInt(raw.page ?? "1", 10);
  const page = Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
  return { name, page };
}

export function studentsPageHref(
  workspace: string,
  params: { class?: string; date?: string; q?: string; page?: number },
): string {
  const search = new URLSearchParams();
  if (params.class) search.set("class", params.class);
  if (params.date) search.set("date", params.date);
  if (params.q) search.set("q", params.q);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const qs = search.toString();
  return qs ? `/${workspace}/students?${qs}` : `/${workspace}/students`;
}

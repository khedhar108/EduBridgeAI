"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { matchStudentForFamily, FAMILY_MATCH_GENERIC_ERROR } from "@/lib/tenancy/match-student-for-family";
import {
  clearFamilySessionCookie,
  setFamilySessionCookie,
} from "@/lib/tenancy/family-session";
import { resolveParentFamilyGroup } from "@/lib/tenancy/parent-family-group";
import { familySignInSchema } from "../lib/schemas";

export type FamilySignInState = { error?: string };

const SCHOOL_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function clientIp(forwardedFor: string | null, realIp: string | null): string {
  const first = forwardedFor?.split(",")[0]?.trim();
  if (first) return first;
  if (realIp?.trim()) return realIp.trim();
  return "unknown";
}

export async function familySignInAction(
  _prev: FamilySignInState,
  formData: FormData,
): Promise<FamilySignInState> {
  const workspace = String(formData.get("workspace") ?? "")
    .trim()
    .toLowerCase();
  if (!SCHOOL_SLUG_PATTERN.test(workspace)) {
    return { error: FAMILY_MATCH_GENERIC_ERROR };
  }

  const parsed = familySignInSchema.safeParse({
    admissionNumber: formData.get("admissionNumber"),
    dateOfBirth: formData.get("dateOfBirth"),
    viewer: formData.get("viewer"),
  });
  if (!parsed.success) {
    return { error: FAMILY_MATCH_GENERIC_ERROR };
  }

  const headerStore = await headers();
  const result = await matchStudentForFamily({
    schoolSlug: workspace,
    admissionNumber: parsed.data.admissionNumber,
    dateOfBirth: parsed.data.dateOfBirth,
    ip: clientIp(
      headerStore.get("x-forwarded-for"),
      headerStore.get("x-real-ip"),
    ),
  });

  if (!result.ok) {
    return { error: result.error };
  }

  const group =
    parsed.data.viewer === "parent"
      ? await resolveParentFamilyGroup(result.schoolId, result.studentId)
      : null;

  await setFamilySessionCookie(
    {
      schoolId: result.schoolId,
      viewer: parsed.data.viewer,
      studentIds: group?.studentIds ?? [result.studentId],
      activeStudentId: result.studentId,
      ...(group ? { familyId: group.familyId } : {}),
    },
    { schoolSlug: workspace },
  );

  revalidatePath(`/${workspace}/family`);
  revalidatePath(`/${workspace}/family/home`);
  redirect(`/${workspace}/family/home`);
}

export async function familySignOutAction(formData: FormData): Promise<void> {
  const workspace = String(formData.get("workspace") ?? "")
    .trim()
    .toLowerCase();
  if (!SCHOOL_SLUG_PATTERN.test(workspace)) {
    redirect("/");
  }
  await clearFamilySessionCookie(workspace);
  revalidatePath(`/${workspace}/family`);
  revalidatePath(`/${workspace}/family/home`);
  redirect(`/${workspace}/family`);
}

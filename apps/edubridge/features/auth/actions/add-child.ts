"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { matchStudentForFamily, FAMILY_MATCH_GENERIC_ERROR } from "@/lib/tenancy/match-student-for-family";
import {
  getFamilySession,
  setFamilySessionCookie,
} from "@/lib/tenancy/family-session";
import {
  linkStudentToFamilyGroup,
  MAX_LINKED_STUDENTS,
  resolveParentFamilyGroup,
} from "@/lib/tenancy/parent-family-group";
import { familyAddChildSchema } from "../lib/schemas";

export type FamilyAddChildState = { error?: string };

const SCHOOL_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function clientIp(forwardedFor: string | null, realIp: string | null): string {
  const first = forwardedFor?.split(",")[0]?.trim();
  if (first) return first;
  if (realIp?.trim()) return realIp.trim();
  return "unknown";
}

export async function familyAddChildAction(
  _prev: FamilyAddChildState,
  formData: FormData,
): Promise<FamilyAddChildState> {
  const workspace = String(formData.get("workspace") ?? "")
    .trim()
    .toLowerCase();
  if (!SCHOOL_SLUG_PATTERN.test(workspace)) {
    return { error: FAMILY_MATCH_GENERIC_ERROR };
  }

  const session = await getFamilySession(workspace);
  if (!session || session.viewer !== "parent") {
    redirect(`/${workspace}/family`);
  }

  const parsed = familyAddChildSchema.safeParse({
    admissionNumber: formData.get("admissionNumber"),
    dateOfBirth: formData.get("dateOfBirth"),
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

  if (!result.ok || result.schoolId !== session.schoolId) {
    return { error: FAMILY_MATCH_GENERIC_ERROR };
  }

  if (session.studentIds.includes(result.studentId)) {
    return { error: "This child is already in this session." };
  }

  const group = session.familyId
    ? { familyId: session.familyId, studentIds: session.studentIds }
    : await resolveParentFamilyGroup(session.schoolId, session.activeStudentId);

  const linked = await linkStudentToFamilyGroup(
    session.schoolId,
    group.familyId,
    result.studentId,
  );
  if (!linked.ok) {
    return {
      error: `You can link up to ${MAX_LINKED_STUDENTS} children in one session.`,
    };
  }

  await setFamilySessionCookie(
    {
      schoolId: session.schoolId,
      viewer: "parent",
      studentIds: linked.studentIds,
      activeStudentId: result.studentId,
      familyId: linked.familyId,
    },
    { schoolSlug: workspace },
  );

  revalidatePath(`/${workspace}/family`, "layout");
  redirect(`/${workspace}/family/home`);
}

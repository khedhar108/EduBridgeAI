"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getFamilySession,
  setFamilySessionCookie,
} from "@/lib/tenancy/family-session";
import { familySwitchChildSchema } from "../lib/schemas";

const SCHOOL_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function familySwitchChildAction(
  formData: FormData,
): Promise<void> {
  const workspace = String(formData.get("workspace") ?? "")
    .trim()
    .toLowerCase();
  if (!SCHOOL_SLUG_PATTERN.test(workspace)) {
    redirect("/");
  }

  const session = await getFamilySession(workspace);
  if (!session || session.viewer !== "parent") {
    redirect(`/${workspace}/family`);
  }

  const parsed = familySwitchChildSchema.safeParse({
    studentId: formData.get("studentId"),
  });
  if (!parsed.success || !session.studentIds.includes(parsed.data.studentId)) {
    redirect(`/${workspace}/family/home`);
  }

  await setFamilySessionCookie(
    {
      schoolId: session.schoolId,
      viewer: session.viewer,
      studentIds: session.studentIds,
      activeStudentId: parsed.data.studentId,
      ...(session.familyId ? { familyId: session.familyId } : {}),
    },
    { schoolSlug: workspace },
  );

  revalidatePath(`/${workspace}/family`, "layout");
  redirect(`/${workspace}/family/home`);
}

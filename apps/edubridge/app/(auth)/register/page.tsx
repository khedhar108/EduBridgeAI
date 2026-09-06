import Link from "next/link";
import { AuthHeader } from "@/features/auth";
import { RegisterSchoolWizard } from "@/features/registration";

export default function RegisterSchoolPage() {
  return (
    <>
      <AuthHeader
        title="Register your school"
        description="Official school email, a workspace URL, and you are in. Staff join later from the office."
      />
      <RegisterSchoolWizard />
      <p className="text-center text-sm text-muted-foreground">
        Already have a workspace?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}

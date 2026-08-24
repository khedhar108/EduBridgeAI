import Link from "next/link";
import { AuthHeader, DemoAccountsModal, SchoolDomainSignUpForm } from "@/features/auth";

export default function JoinSchoolPage() {
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <AuthHeader
          title="Join with school email"
          description="Register with your official school email. An admin activates your account before you can open the workspace."
        />
        <DemoAccountsModal />
      </div>
      <SchoolDomainSignUpForm />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
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

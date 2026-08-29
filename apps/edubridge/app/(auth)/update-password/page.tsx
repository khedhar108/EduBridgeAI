import Link from "next/link";
import { AuthHeader, UpdatePasswordForm } from "@/features/auth";

export default function UpdatePasswordPage() {
  return (
    <>
      <AuthHeader
        title="Choose a new password"
        description="This page only works after you open the reset link from your email."
      />
      <UpdatePasswordForm />
      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/sign-in"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </>
  );
}

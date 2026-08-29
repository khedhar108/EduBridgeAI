import Link from "next/link";
import { AuthHeader, ForgotPasswordForm } from "@/features/auth";

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeader
        title="Reset password"
        description="We email a link to the address on the account. Office-created staff can also ask an admin to set a new password."
      />
      <ForgotPasswordForm />
      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
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

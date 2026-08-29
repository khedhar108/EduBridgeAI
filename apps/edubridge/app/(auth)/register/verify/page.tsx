import Link from "next/link";
import { AuthHeader } from "@/features/auth";
import { VerifyRegisterForm } from "@/features/registration";

type Props = {
  searchParams: Promise<{ email?: string }>;
};

export default async function VerifyRegisterPage({ searchParams }: Props) {
  const { email } = await searchParams;
  const address = email?.trim().toLowerCase() ?? "";

  return (
    <>
      <AuthHeader
        title="Check your school email"
        description={
          address
            ? `Enter the code we sent to ${address}. The link in that email also works.`
            : "Enter the code from your school inbox, or start registration again."
        }
      />
      {address ? (
        <VerifyRegisterForm email={address} />
      ) : (
        <p className="text-sm text-muted-foreground">
          <Link
            href="/register"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Back to register
          </Link>
        </p>
      )}
    </>
  );
}

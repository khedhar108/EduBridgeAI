import Link from "next/link";
import { AuthHeader, DemoAccountsModal, SignInForm } from "@/features/auth";

type Props = {
  searchParams: Promise<{ next?: string; error?: string; email?: string }>;
};

export default async function SchoolSignInPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <AuthHeader title="School workspace" />
        <DemoAccountsModal />
      </div>
      {params.error === "auth" ? (
        <p className="text-sm text-destructive" role="alert">
          We couldn&apos;t complete that sign-in. Try again.
        </p>
      ) : null}
      <SignInForm
        surface="school"
        next={params.next}
        emailPrefill={params.email}
      />
      <p className="text-center text-sm text-muted-foreground">
        New staff with a school email?{" "}
        <Link
          href="/join-school"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Request access
        </Link>
      </p>
    </>
  );
}

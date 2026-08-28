import { AuthHeader, AuthShell, DemoAccountsModal, SignInForm } from "@/features/auth";

type Props = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function PlatformSignInPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <AuthShell>
      <div className="flex items-start justify-between gap-4">
        <AuthHeader
          title="Platform console"
          description="Operator access only. Billing and school metadata, not a tenant workspace."
        />
        <DemoAccountsModal />
      </div>
      {params.error === "forbidden" ? (
        <p className="text-sm text-destructive" role="alert">
          This account is not a platform owner.
        </p>
      ) : null}
      <SignInForm surface="platform" next={params.next ?? "/platform"} />
    </AuthShell>
  );
}

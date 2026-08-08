import Link from "next/link";
import { SignInForm } from "@/features/auth";

type Props = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function PlatformSignInPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <main className="flex min-h-dvh flex-col bg-background">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-4 py-12">
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="font-serif text-2xl tracking-tight text-foreground"
          >
            EduBridge
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Platform console
          </h1>
          <p className="text-sm text-muted-foreground">
            Operator access only. Billing and school metadata — not a tenant
            workspace.
          </p>
        </div>
        {params.error === "forbidden" ? (
          <p className="text-sm text-destructive" role="alert">
            This account is not a platform owner.
          </p>
        ) : null}
        <SignInForm surface="platform" next={params.next ?? "/platform"} />
      </div>
    </main>
  );
}

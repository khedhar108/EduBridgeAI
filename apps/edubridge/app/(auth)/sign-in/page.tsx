import Link from "next/link";
import { SignInForm } from "@/features/auth";

type Props = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function SchoolSignInPage({ searchParams }: Props) {
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
            School workspace
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your school account. Teachers and staff with your
            school&apos;s email domain can request access; an admin activates
            them from the team dashboard.
          </p>
        </div>
        {params.error === "auth" ? (
          <p className="text-sm text-destructive" role="alert">
            Sign-in link expired or invalid. Try again.
          </p>
        ) : null}
        <SignInForm surface="school" next={params.next} />
        <p className="text-center text-sm text-muted-foreground">
          New staff with a school email?{" "}
          <Link
            href="/join-school"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Request access
          </Link>
        </p>
      </div>
    </main>
  );
}

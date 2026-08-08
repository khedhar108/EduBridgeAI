import Link from "next/link";
import { SchoolDomainSignUpForm } from "@/features/auth";

export default function JoinSchoolPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-8 px-4 py-16">
      <div className="flex flex-col gap-2">
        <p className="font-serif text-3xl tracking-tight">EduBridge</p>
        <h1 className="text-xl font-semibold">Join with school email</h1>
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
    </main>
  );
}

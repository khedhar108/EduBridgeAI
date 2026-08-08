import { notFound } from "next/navigation";
import { Button } from "@repo/ui/components/button";
import { getSessionContext } from "@/lib/tenancy/session-context";
import { signOutAction } from "@/features/auth";
import { modulesForRole } from "@/features/shell";

type Props = {
  children: React.ReactNode;
  params: Promise<{ workspace: string }>;
};

export default async function WorkspaceLayout({ children, params }: Props) {
  const { workspace } = await params;
  const ctx = await getSessionContext(workspace);
  if (!ctx) {
    notFound();
  }

  const nav = modulesForRole(ctx.role);

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <p className="font-serif text-lg tracking-tight">EduBridge</p>
          <span className="text-sm text-muted-foreground">{ctx.schoolSlug}</span>
          <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium capitalize text-muted-foreground">
            {ctx.role.replace("_", " ")}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" size="sm" className="h-11">
                Sign out
              </Button>
            </form>
          </div>
        </div>
        {nav.length > 0 ? (
          <nav className="mx-auto flex max-w-6xl gap-4 overflow-x-auto px-4 pb-3 text-sm">
            {nav.map((item) => (
              <a
                key={item.id}
                href={`/${workspace}${item.href === "/" ? "" : item.href}`}
                className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {item.title}
              </a>
            ))}
          </nav>
        ) : null}
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}

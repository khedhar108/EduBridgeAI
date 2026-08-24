import Link from "next/link";
import { LayoutDashboard, ShieldCheck, Sparkles } from "lucide-react";
import { MeshGradient } from "./mesh-gradient";

const panelFeatures = [
  {
    icon: LayoutDashboard,
    text: "One shell hosts every module as it ships",
  },
  {
    icon: ShieldCheck,
    text: "Each school's records stay isolated, always",
  },
  {
    icon: Sparkles,
    text: "Drafts by AI, approved by people",
  },
] as const;

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background p-4">
      <MeshGradient />

      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:grid-cols-[1.05fr_1fr]">
        {/* Animated gradient bar across the top */}
        <div className="gradient-bar absolute inset-x-0 top-0 h-1" />

        <aside className="relative hidden flex-col justify-between overflow-hidden p-10 lg:flex xl:p-14">
          <MeshGradient className="opacity-60" />
          <Link
            href="/"
            className="relative font-serif text-2xl tracking-tight text-foreground"
          >
            EduBridge
          </Link>
          <div className="relative flex flex-1 flex-col justify-center gap-10 py-10">
            <div className="flex flex-col gap-4">
              <h2 className="max-w-md font-serif text-3xl leading-[1.15] tracking-tight text-foreground xl:text-4xl">
                Every part of your school day, in one calm place.
              </h2>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                Dashboards, report cards, timetables, and fees live behind one
                sign-in, scoped to your school alone.
              </p>
            </div>
            <ul className="flex max-w-md flex-col gap-3">
              {panelFeatures.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-3.5 rounded-xl border border-border/60 bg-background/60 py-3 pr-4 pl-3.5"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <span className="text-sm leading-snug text-muted-foreground">
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p className="relative text-xs text-muted-foreground">
            Teachers, staff, accountants, and admins sign in with their school
            email.
          </p>
        </aside>

        <div className="relative flex flex-col">
          <header className="px-6 pt-6 lg:hidden">
            <Link
              href="/"
              className="font-serif text-2xl tracking-tight text-foreground"
            >
              EduBridge
            </Link>
          </header>
          <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 px-6 py-12">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}

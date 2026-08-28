import Link from "next/link";

type FeesNavProps = {
  workspace: string;
  active: "overview" | "structures" | "register" | "collections" | "audit";
};

const links = [
  { id: "overview", href: "/fees", label: "Overview" },
  { id: "structures", href: "/fees/structures", label: "Structures" },
  { id: "register", href: "/fees/register", label: "Register" },
  { id: "collections", href: "/fees/collections", label: "Collections" },
  { id: "audit", href: "/fees/audit", label: "Audit" },
] as const;

export function FeesNav({ workspace, active }: FeesNavProps) {
  return (
    <nav className="flex flex-wrap gap-2 border-b border-border pb-3">
      {links.map((link) => {
        const href = `/${workspace}${link.href}`;
        const isActive = link.id === active;
        return (
          <Link
            key={link.id}
            href={href}
            className={
              isActive
                ? "rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary"
                : "rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

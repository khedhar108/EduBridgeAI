type Props = {
  title: string;
  children: string;
};

export function FamilyAwaiting({ title, children }: Props) {
  return (
    <section className="flex flex-col gap-1.5 rounded-xl border border-dashed border-border px-4 py-5">
      <h2 className="text-sm font-medium text-foreground">{title}</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
    </section>
  );
}

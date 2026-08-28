type Props = {
  title: string;
  description: string;
};

export function FamilyPageIntro({ title, description }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

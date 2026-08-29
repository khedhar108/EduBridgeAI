import { BlackholeHero } from "@/features/marketing";

import { PLATFORM_NAME } from "@/lib/brand";

export const metadata = {
  title: `Hero preview · ${PLATFORM_NAME}`,
  description: "Standalone preview of the blackhole marketing hero.",
};

export default function HeroPreviewPage() {
  return <BlackholeHero />;
}

import AppShell from "@/components/AppShell";
import { getPublicSiteData } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getPublicSiteData();
  return <AppShell data={data} />;
}

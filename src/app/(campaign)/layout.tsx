import { AppShell } from "@/components/layout/app-shell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CampaignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const campaign = await prisma.campaign.findFirst({
    select: { dmName: true, name: true },
  });

  return (
    <AppShell dmName={campaign?.dmName || null} campaignName={campaign?.name || null}>
      {children}
    </AppShell>
  );
}

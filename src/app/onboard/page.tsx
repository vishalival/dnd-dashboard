import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { OnboardClient } from "./onboard-client";

export const dynamic = "force-dynamic";

export default async function OnboardPage() {
  // If a campaign already exists, redirect to dashboard
  const campaign = await prisma.campaign.findFirst({ select: { id: true } });
  if (campaign) {
    redirect("/dashboard");
  }

  return <OnboardClient />;
}

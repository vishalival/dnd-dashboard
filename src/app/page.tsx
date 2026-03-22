import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const campaign = await prisma.campaign.findFirst({ select: { id: true } });

  if (campaign) {
    redirect("/dashboard");
  } else {
    redirect("/onboard");
  }
}

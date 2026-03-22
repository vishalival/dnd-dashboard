export const dynamic = "force-dynamic";

import { getCampaign } from "@/lib/data";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const campaign = await getCampaign();

  if (!campaign) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-heading font-semibold text-foreground/80 dark:text-zinc-300 mb-2">
            No Campaign Found
          </h2>
          <p className="text-sm text-muted-foreground dark:text-zinc-500 mb-4">
            Upload your D&D campaign documents to get started.
          </p>
          <a
            href="/onboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-400 transition-colors"
          >
            Set Up Campaign
          </a>
        </div>
      </div>
    );
  }

  return <DashboardClient campaign={campaign} />;
}

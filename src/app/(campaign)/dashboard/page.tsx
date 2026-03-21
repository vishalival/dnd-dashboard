export const dynamic = "force-dynamic";

import { getCampaign } from "@/lib/data";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const campaign = await getCampaign();

  if (!campaign) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-heading font-semibold text-zinc-300 mb-2">
            No Campaign Found
          </h2>
          <p className="text-sm text-zinc-500 mb-4">
            Run <code className="px-2 py-1 bg-zinc-800 rounded text-gold text-xs">npm run db:seed</code> to load sample data.
          </p>
        </div>
      </div>
    );
  }

  return <DashboardClient campaign={campaign} />;
}

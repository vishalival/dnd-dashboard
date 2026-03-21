export const dynamic = "force-dynamic";

import { getCampaign } from "@/lib/data";
import { SessionsClient } from "./sessions-client";

export default async function SessionsPage() {
  const campaign = await getCampaign();
  if (!campaign) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-zinc-500">No campaign found. Run seed script.</p>
      </div>
    );
  }
  return <SessionsClient campaign={campaign} />;
}

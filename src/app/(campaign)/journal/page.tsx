export const dynamic = "force-dynamic";

import { getCampaign } from "@/lib/data";
import { JournalClient } from "./journal-client";

export default async function JournalPage() {
  const campaign = await getCampaign();
  if (!campaign) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground dark:text-zinc-500">
          No campaign found. Run seed script.
        </p>
      </div>
    );
  }
  return <JournalClient campaign={campaign} />;
}

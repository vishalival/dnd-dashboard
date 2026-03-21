import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  
  // Find all completed sessions that are in the future
  const sessions = await prisma.sessionPlan.findMany({
    where: {
      date: { gt: now },
      status: "completed"
    }
  });
  
  if (sessions.length > 0) {
    await prisma.sessionPlan.updateMany({
      where: {
        date: { gt: now },
        status: "completed"
      },
      data: {
        status: "ready"
      }
    });
    console.log(`Updated ${sessions.length} sessions to 'ready'`);
  } else {
    console.log("No future completed sessions found in db. They might be set correctly already.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

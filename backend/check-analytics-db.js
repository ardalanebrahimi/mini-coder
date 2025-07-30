// Script to verify analytics events are persisted in the database
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkAnalyticsEvents() {
  try {
    console.log("Checking analytics events in database...");

    const count = await prisma.analyticsEvent.count();
    console.log(`📊 Total analytics events in database: ${count}`);

    if (count > 0) {
      const recentEvents = await prisma.analyticsEvent.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          eventType: true,
          sessionId: true,
          language: true,
          timestamp: true,
          createdAt: true,
        },
      });

      console.log("\n🕒 Recent events:");
      recentEvents.forEach((event) => {
        console.log(
          `  ${event.eventType} | ${event.sessionId} | ${event.timestamp}`
        );
      });
    }
  } catch (error) {
    console.error("Error checking analytics events:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAnalyticsEvents();

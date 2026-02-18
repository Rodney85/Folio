import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// 1. "Impulse & Influencer" (Weekly)
// Runs every Monday at 9am UTC
crons.weekly(
    "weekly_notifications",
    { hourUTC: 9, minuteUTC: 0, dayOfWeek: "monday" },
    internal.scheduled.sendWeeklyInfluencerStats
);

// Runs every Wednesday at 9am UTC (Spread them out)
crons.weekly(
    "weekly_shop_manager",
    { hourUTC: 9, minuteUTC: 0, dayOfWeek: "wednesday" },
    internal.scheduled.sendWeeklyShopManagerNudge
);

// 2. "The Accountant & Visionary" (Monthly)
// Runs on the 1st of every month
crons.monthly(
    "monthly_build_value",
    { hourUTC: 12, minuteUTC: 0, day: 1 },
    internal.scheduled.sendMonthlyBuildValue
);

// Runs on the 15th of every month
crons.monthly(
    "monthly_visionary",
    { hourUTC: 12, minuteUTC: 0, day: 15 },
    internal.scheduled.sendMonthlyVisionaryNudge
);

export default crons;

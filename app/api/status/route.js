import { NextResponse } from "next/server";
import { LOOP_NAMES, DIRECTION_LABELS } from "@/lib/segments";

export const dynamic = "force-dynamic";

const USE_MOCK = !process.env.POSTGRES_URL && !process.env.DATABASE_URL;
const DB_DEBUG = {
  hasPostgresUrl: !!process.env.POSTGRES_URL,
  hasDatabaseUrl: !!process.env.DATABASE_URL,
  mock: USE_MOCK,
};

function getMockData() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const isClosed = dayOfWeek === 3 || dayOfWeek === 6;

  return {
    loops: {
      canyon: {
        name: "Canyon Loop",
        direction: "ccw",
        directionLabel: "Counter-Clockwise",
        confidence: "high",
        lastChanged: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        recentEfforts: { cw: 1, ccw: 8, total: 9 },
      },
      benjamin: {
        name: "Benjamin Loop",
        direction: "cw",
        directionLabel: "Clockwise",
        confidence: "medium",
        lastChanged: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        recentEfforts: { cw: 4, ccw: 1, total: 5 },
      },
    },
    history: [
      { id: 1, loop: "canyon", direction: "ccw", confidence: "high", detected_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), source: "webhook" },
      { id: 2, loop: "benjamin", direction: "cw", confidence: "medium", detected_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), source: "webhook" },
      { id: 3, loop: "canyon", direction: "cw", confidence: "high", detected_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), source: "cron" },
      { id: 4, loop: "benjamin", direction: "ccw", confidence: "high", detected_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), source: "webhook" },
    ],
    isClosed,
    closureNote: isClosed ? "Bikes are not allowed on Betasso trails today (Wed/Sat closure)" : null,
    checkedAt: new Date().toISOString(),
  };
}

export async function GET() {
  if (USE_MOCK) {
    return NextResponse.json({ ...getMockData(), _debug: DB_DEBUG });
  }

  try {
    const { getLatestDirection, getRecentEfforts, getDirectionHistory } = await import("@/lib/db");
    const { inferDirection } = await import("@/lib/direction");

    const loops = {};

    for (const loop of ["canyon", "benjamin"]) {
      const [latest, efforts] = await Promise.all([
        getLatestDirection(loop),
        getRecentEfforts(loop, 48),
      ]);

      const inference = inferDirection(efforts);

      loops[loop] = {
        name: LOOP_NAMES[loop],
        direction: latest?.direction || inference.direction,
        directionLabel: DIRECTION_LABELS[latest?.direction || inference.direction] || "Unknown",
        confidence: inference.direction ? inference.confidence : "none",
        lastChanged: latest?.detected_at || null,
        recentEfforts: {
          cw: inference.cwCount,
          ccw: inference.ccwCount,
          total: inference.cwCount + inference.ccwCount,
        },
      };
    }

    const history = await getDirectionHistory(20);

    const today = new Date();
    const dayOfWeek = today.getDay();
    const isClosed = dayOfWeek === 3 || dayOfWeek === 6;

    return NextResponse.json({
      loops,
      history,
      isClosed,
      closureNote: isClosed ? "Bikes are not allowed on Betasso trails today (Wed/Sat closure)" : null,
      checkedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Status API error:", err);
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}

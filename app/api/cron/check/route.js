import { NextResponse } from "next/server";
import { ALL_SEGMENT_IDS, SEGMENT_LOOKUP } from "@/lib/segments";
import { insertEffortCountReading, getEffortCountDeltas, getLatestDirection } from "@/lib/db";
import { getSegment } from "@/lib/strava";
import { checkAndUpdateDirection } from "@/lib/direction";

// Verify cron secret to prevent unauthorized calls
function verifyCronSecret(request) {
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // We need a token to call the Strava API for segment info.
    // Use app-level token or first connected user's token.
    // For public segment data, we can use any valid token.
    const { sql } = await import("@vercel/postgres");
    const userResult = await sql`
      SELECT * FROM users ORDER BY id LIMIT 1;
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json({ ok: true, note: "no users to check with" });
    }

    const user = userResult.rows[0];
    const { ensureFreshToken } = await import("@/lib/strava");
    const { updateUserTokens } = await import("@/lib/db");

    const tokenResult = await ensureFreshToken(user);
    if (tokenResult.refreshed) {
      await updateUserTokens(user.id, {
        accessToken: tokenResult.accessToken,
        refreshToken: tokenResult.refreshToken,
        tokenExpiresAt: tokenResult.tokenExpiresAt,
      });
    }

    // Fetch current effort counts for all segments
    for (const segmentId of ALL_SEGMENT_IDS) {
      try {
        const segment = await getSegment(tokenResult.accessToken, segmentId);
        await insertEffortCountReading(segmentId, segment.effort_count);
      } catch (err) {
        console.error(`Failed to fetch segment ${segmentId}:`, err);
      }
    }

    // Check if cron deltas suggest a direction change for any loop
    // Only override if webhook data is stale (>24hrs since last direction change)
    for (const loop of ["canyon", "benjamin"]) {
      const latest = await getLatestDirection(loop);
      const isStale = !latest ||
        (new Date() - new Date(latest.detected_at)) > 24 * 60 * 60 * 1000;

      if (isStale) {
        await checkAndUpdateDirection(loop, "cron");
      }
    }

    return NextResponse.json({ ok: true, checked: ALL_SEGMENT_IDS.length });
  } catch (err) {
    console.error("Cron check error:", err);
    return NextResponse.json({ error: "Cron check failed" }, { status: 500 });
  }
}

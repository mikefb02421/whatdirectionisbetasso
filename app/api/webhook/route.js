import { NextResponse } from "next/server";
import { getUserByStravaId, updateUserTokens, insertSegmentEffort } from "@/lib/db";
import { ensureFreshToken, getActivity } from "@/lib/strava";
import { SEGMENT_LOOKUP } from "@/lib/segments";
import { checkAndUpdateDirection } from "@/lib/direction";

// GET /api/webhook — Strava webhook verification (subscription validation)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.STRAVA_WEBHOOK_VERIFY_TOKEN) {
    return NextResponse.json({ "hub.challenge": challenge });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// POST /api/webhook — Strava webhook events
export async function POST(request) {
  const body = await request.json();

  // We only care about activity creation events
  if (body.object_type !== "activity" || body.aspect_type !== "create") {
    return NextResponse.json({ ok: true });
  }

  const stravaAthleteId = body.owner_id;
  const activityId = body.object_id;

  try {
    const user = await getUserByStravaId(stravaAthleteId);
    if (!user) {
      return NextResponse.json({ ok: true, note: "unknown user" });
    }

    // Refresh token if needed
    const tokenResult = await ensureFreshToken(user);
    if (tokenResult.refreshed) {
      await updateUserTokens(user.id, {
        accessToken: tokenResult.accessToken,
        refreshToken: tokenResult.refreshToken,
        tokenExpiresAt: tokenResult.tokenExpiresAt,
      });
    }

    // Fetch the activity details
    const activity = await getActivity(tokenResult.accessToken, activityId);

    // Check if this activity includes any of our directional segments
    const segmentEfforts = activity.segment_efforts || [];
    const loopsToCheck = new Set();

    for (const effort of segmentEfforts) {
      const match = SEGMENT_LOOKUP[effort.segment.id];
      if (match) {
        await insertSegmentEffort({
          userId: user.id,
          stravaActivityId: activityId,
          segmentId: effort.segment.id,
          loop: match.loop,
          direction: match.direction,
          startedAt: effort.start_date,
        });
        loopsToCheck.add(match.loop);
      }
    }

    // Update direction for any affected loops
    for (const loop of loopsToCheck) {
      await checkAndUpdateDirection(loop, "webhook");
    }

    return NextResponse.json({ ok: true, matched: loopsToCheck.size });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ ok: true, error: "processing failed" });
  }
}

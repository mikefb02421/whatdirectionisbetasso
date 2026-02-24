import { NextResponse } from "next/server";
import { exchangeToken } from "@/lib/strava";
import { upsertUser } from "@/lib/db";

// GET /api/auth/strava?code=xxx
// Strava redirects here after user authorizes
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/connect?error=denied", request.url));
  }

  try {
    const data = await exchangeToken(code);

    await upsertUser({
      stravaId: data.athlete.id,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenExpiresAt: new Date(data.expires_at * 1000).toISOString(),
      displayName: `${data.athlete.firstname} ${data.athlete.lastname}`.trim(),
    });

    return NextResponse.redirect(new URL("/?connected=true", request.url));
  } catch (err) {
    console.error("Strava OAuth error:", err);
    return NextResponse.redirect(new URL("/connect?error=auth_failed", request.url));
  }
}

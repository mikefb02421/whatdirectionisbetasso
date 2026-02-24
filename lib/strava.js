const STRAVA_API = "https://www.strava.com/api/v3";

export function getAuthUrl(redirectUri) {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "read,activity:read",
    approval_prompt: "auto",
  });
  return `https://www.strava.com/oauth/authorize?${params}`;
}

export async function exchangeToken(code) {
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
  return res.json();
}

export async function refreshAccessToken(refreshToken) {
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);
  return res.json();
}

export async function getActivity(accessToken, activityId) {
  const res = await fetch(`${STRAVA_API}/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Fetch activity failed: ${res.status}`);
  return res.json();
}

export async function getSegment(accessToken, segmentId) {
  const res = await fetch(`${STRAVA_API}/segments/${segmentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Fetch segment failed: ${res.status}`);
  return res.json();
}

// Ensure user token is fresh; returns updated tokens if refreshed
export async function ensureFreshToken(user) {
  const now = new Date();
  const expiresAt = new Date(user.token_expires_at);
  if (expiresAt > now) {
    return { accessToken: user.access_token, refreshed: false };
  }
  const data = await refreshAccessToken(user.refresh_token);
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    tokenExpiresAt: new Date(data.expires_at * 1000).toISOString(),
    refreshed: true,
  };
}

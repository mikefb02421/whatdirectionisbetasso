import { sql } from "@vercel/postgres";

// --- Users ---

export async function upsertUser({
  stravaId,
  accessToken,
  refreshToken,
  tokenExpiresAt,
  displayName,
}) {
  const result = await sql`
    INSERT INTO users (strava_id, access_token, refresh_token, token_expires_at, display_name)
    VALUES (${stravaId}, ${accessToken}, ${refreshToken}, ${tokenExpiresAt}, ${displayName})
    ON CONFLICT (strava_id) DO UPDATE SET
      access_token = ${accessToken},
      refresh_token = ${refreshToken},
      token_expires_at = ${tokenExpiresAt},
      display_name = COALESCE(${displayName}, users.display_name)
    RETURNING *;
  `;
  return result.rows[0];
}

export async function getUserByStravaId(stravaId) {
  const result = await sql`
    SELECT * FROM users WHERE strava_id = ${stravaId};
  `;
  return result.rows[0] || null;
}

export async function updateUserTokens(userId, { accessToken, refreshToken, tokenExpiresAt }) {
  await sql`
    UPDATE users
    SET access_token = ${accessToken},
        refresh_token = ${refreshToken},
        token_expires_at = ${tokenExpiresAt}
    WHERE id = ${userId};
  `;
}

export async function getConnectedUserCount() {
  const result = await sql`SELECT COUNT(*) as count FROM users;`;
  return parseInt(result.rows[0].count, 10);
}

// --- Segment Efforts ---

export async function insertSegmentEffort({
  userId,
  stravaActivityId,
  segmentId,
  loop,
  direction,
  startedAt,
}) {
  const result = await sql`
    INSERT INTO segment_efforts (user_id, strava_activity_id, segment_id, loop, direction, started_at)
    VALUES (${userId}, ${stravaActivityId}, ${segmentId}, ${loop}, ${direction}, ${startedAt})
    ON CONFLICT (strava_activity_id, segment_id) DO NOTHING
    RETURNING *;
  `;
  return result.rows[0] || null;
}

export async function getRecentEfforts(loop, hoursBack = 48) {
  const result = await sql`
    SELECT * FROM segment_efforts
    WHERE loop = ${loop}
      AND started_at > NOW() - INTERVAL '1 hour' * ${hoursBack}
    ORDER BY started_at DESC;
  `;
  return result.rows;
}

// --- Effort Count Readings (cron backup) ---

export async function insertEffortCountReading(segmentId, effortCount) {
  await sql`
    INSERT INTO effort_count_readings (segment_id, effort_count)
    VALUES (${segmentId}, ${effortCount});
  `;
}

export async function getEffortCountDeltas(segmentId, hoursBack = 24) {
  const result = await sql`
    SELECT * FROM effort_count_readings
    WHERE segment_id = ${segmentId}
      AND read_at > NOW() - INTERVAL '1 hour' * ${hoursBack}
    ORDER BY read_at ASC;
  `;
  const rows = result.rows;
  if (rows.length < 2) return 0;
  return rows[rows.length - 1].effort_count - rows[0].effort_count;
}

// --- Direction Changes ---

export async function insertDirectionChange({ loop, direction, confidence, source }) {
  await sql`
    INSERT INTO direction_changes (loop, direction, confidence, source)
    VALUES (${loop}, ${direction}, ${confidence}, ${source});
  `;
}

export async function getLatestDirection(loop) {
  const result = await sql`
    SELECT * FROM direction_changes
    WHERE loop = ${loop}
    ORDER BY detected_at DESC
    LIMIT 1;
  `;
  return result.rows[0] || null;
}

export async function getDirectionHistory(limit = 20) {
  const result = await sql`
    SELECT * FROM direction_changes
    ORDER BY detected_at DESC
    LIMIT ${limit};
  `;
  return result.rows;
}

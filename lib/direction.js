import { getRecentEfforts, getLatestDirection, insertDirectionChange } from "./db";

export function inferDirection(efforts) {
  const cwCount = efforts.filter((e) => e.direction === "cw").length;
  const ccwCount = efforts.filter((e) => e.direction === "ccw").length;
  const total = cwCount + ccwCount;

  if (total === 0) {
    return { direction: null, confidence: "none", cwCount, ccwCount };
  }

  const direction = cwCount >= ccwCount ? "cw" : "ccw";
  const dominantCount = Math.max(cwCount, ccwCount);
  const ratio = dominantCount / total;

  let confidence;
  if (dominantCount >= 5 && ratio >= 0.8) {
    confidence = "high";
  } else if (dominantCount >= 3 && ratio >= 0.65) {
    confidence = "medium";
  } else {
    confidence = "low";
  }

  return { direction, confidence, cwCount, ccwCount };
}

export async function checkAndUpdateDirection(loop, source = "webhook") {
  const efforts = await getRecentEfforts(loop, 48);
  const { direction, confidence } = inferDirection(efforts);

  if (!direction) return null;

  const latest = await getLatestDirection(loop);

  // Only insert a new record if direction changed or we have no record
  if (!latest || latest.direction !== direction) {
    await insertDirectionChange({ loop, direction, confidence, source });
    return { loop, direction, confidence, changed: true };
  }

  return { loop, direction, confidence, changed: false };
}

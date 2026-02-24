// Strava segment IDs for directional segments at Betasso Preserve
// Each loop has segments that can only be completed in one direction

export const SEGMENTS = {
  canyon: {
    cw: [15627703],
    ccw: [1809767, 1425550],
  },
  benjamin: {
    cw: [1809798],
    ccw: [661111],
  },
};

// Flat lookup: segment ID → { loop, direction }
export const SEGMENT_LOOKUP = {};
for (const [loop, directions] of Object.entries(SEGMENTS)) {
  for (const [direction, ids] of Object.entries(directions)) {
    for (const id of ids) {
      SEGMENT_LOOKUP[id] = { loop, direction };
    }
  }
}

// All segment IDs as a flat array
export const ALL_SEGMENT_IDS = Object.keys(SEGMENT_LOOKUP).map(Number);

export const LOOP_NAMES = {
  canyon: "Canyon Loop",
  benjamin: "Benjamin Loop",
};

export const DIRECTION_LABELS = {
  cw: "Clockwise",
  ccw: "Counter-Clockwise",
};

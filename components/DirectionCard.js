"use client";

const CONFIDENCE_STYLES = {
  high: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  low: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  none: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

function DirectionArrow({ direction }) {
  // CW = right-curving arrow, CCW = left-curving arrow
  const isCW = direction === "cw";

  return (
    <svg
      viewBox="0 0 120 120"
      className="w-24 h-24 mx-auto"
      aria-label={isCW ? "Clockwise arrow" : "Counter-clockwise arrow"}
    >
      <circle
        cx="60"
        cy="60"
        r="40"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeDasharray="200 52"
        strokeLinecap="round"
        className="text-green-700 dark:text-green-400"
        transform={isCW ? "" : "scale(-1,1) translate(-120,0)"}
      />
      {/* Arrowhead */}
      <polygon
        points={isCW ? "88,28 100,45 82,45" : "32,28 20,45 38,45"}
        fill="currentColor"
        className="text-green-700 dark:text-green-400"
      />
    </svg>
  );
}

export default function DirectionCard({ loopName, direction, directionLabel, confidence, recentEfforts, lastChanged }) {
  const hasData = direction && confidence !== "none";

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 flex flex-col items-center gap-3">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{loopName}</h2>

      {hasData ? (
        <>
          <DirectionArrow direction={direction} />
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {directionLabel}
          </p>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${CONFIDENCE_STYLES[confidence]}`}>
            {confidence} confidence
          </span>
          {recentEfforts && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Based on {recentEfforts.total} ride{recentEfforts.total !== 1 ? "s" : ""} in the last 48h
            </p>
          )}
          {lastChanged && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Direction since {new Date(lastChanged).toLocaleDateString()}
            </p>
          )}
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-400 dark:text-gray-500 text-lg">No recent data</p>
          <p className="text-sm text-gray-400 dark:text-gray-600 mt-1">
            Connect your Strava to help!
          </p>
        </div>
      )}
    </div>
  );
}

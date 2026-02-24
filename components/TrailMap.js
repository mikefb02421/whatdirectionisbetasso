"use client";

export default function TrailMap({ canyonDirection, benjaminDirection }) {
  const canyonCW = canyonDirection === "cw";
  const benjaminCW = benjaminDirection === "cw";

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4 text-center">
        Trail Map
      </h3>
      <svg viewBox="0 0 400 250" className="w-full max-w-md mx-auto" aria-label="Betasso trail map">
        {/* Canyon Loop (left, larger) */}
        <ellipse cx="150" cy="130" rx="100" ry="75" fill="none" stroke="#6b7280" strokeWidth="3" strokeDasharray="8 4" />
        <text x="150" y="130" textAnchor="middle" className="fill-gray-600 dark:fill-gray-400 text-xs" fontSize="12" fontWeight="600">
          Canyon Loop
        </text>

        {/* Canyon direction arrow */}
        <g transform={`rotate(${canyonCW ? 0 : 0}, 150, 130)`}>
          <path
            d={canyonCW
              ? "M 230,85 A 90,65 0 0,1 240,105"
              : "M 70,85 A 90,65 0 0,0 60,105"
            }
            fill="none"
            stroke="#16a34a"
            strokeWidth="3"
            markerEnd="url(#arrowGreen)"
          />
        </g>

        {/* Benjamin Loop (right, smaller) */}
        <ellipse cx="300" cy="130" rx="65" ry="55" fill="none" stroke="#6b7280" strokeWidth="3" strokeDasharray="8 4" />
        <text x="300" y="130" textAnchor="middle" className="fill-gray-600 dark:fill-gray-400 text-xs" fontSize="11" fontWeight="600">
          Benjamin
        </text>
        <text x="300" y="145" textAnchor="middle" className="fill-gray-600 dark:fill-gray-400 text-xs" fontSize="11" fontWeight="600">
          Loop
        </text>

        {/* Benjamin direction arrow */}
        <g>
          <path
            d={benjaminCW
              ? "M 350,95 A 55,45 0 0,1 355,115"
              : "M 250,95 A 55,45 0 0,0 245,115"
            }
            fill="none"
            stroke="#16a34a"
            strokeWidth="3"
            markerEnd="url(#arrowGreen)"
          />
        </g>

        {/* Trailhead marker */}
        <circle cx="85" cy="210" r="6" fill="#dc2626" />
        <text x="97" y="215" className="fill-gray-600 dark:fill-gray-400" fontSize="10">
          Trailhead
        </text>

        {/* Arrow marker definition */}
        <defs>
          <marker id="arrowGreen" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#16a34a" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

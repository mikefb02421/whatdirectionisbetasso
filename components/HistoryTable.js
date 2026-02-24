"use client";

import { LOOP_NAMES, DIRECTION_LABELS } from "@/lib/segments";

const CONFIDENCE_DOT = {
  high: "bg-green-500",
  medium: "bg-yellow-500",
  low: "bg-orange-500",
  none: "bg-gray-400",
};

export default function HistoryTable({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center text-gray-400 dark:text-gray-500 py-6">
        No direction changes recorded yet.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md overflow-hidden">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-6 pt-5 pb-3">
        Recent Direction Changes
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="text-left px-3 sm:px-6 py-2 text-gray-500 dark:text-gray-400 font-medium">Date</th>
              <th className="text-left px-3 sm:px-6 py-2 text-gray-500 dark:text-gray-400 font-medium">Loop</th>
              <th className="text-left px-3 sm:px-6 py-2 text-gray-500 dark:text-gray-400 font-medium">Direction</th>
              <th className="text-left px-3 sm:px-6 py-2 text-gray-500 dark:text-gray-400 font-medium">Confidence</th>
              <th className="text-left px-3 sm:px-6 py-2 text-gray-500 dark:text-gray-400 font-medium hidden sm:table-cell">Source</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry) => (
              <tr key={entry.id} className="border-b border-gray-50 dark:border-gray-800/50">
                <td className="px-3 sm:px-6 py-3 text-gray-700 dark:text-gray-300">
                  {new Date(entry.detected_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-3 sm:px-6 py-3 text-gray-700 dark:text-gray-300">
                  {LOOP_NAMES[entry.loop] || entry.loop}
                </td>
                <td className="px-3 sm:px-6 py-3 font-medium text-gray-900 dark:text-gray-100">
                  {DIRECTION_LABELS[entry.direction] || entry.direction}
                </td>
                <td className="px-3 sm:px-6 py-3">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${CONFIDENCE_DOT[entry.confidence]}`} />
                    <span className="text-gray-600 dark:text-gray-400">{entry.confidence}</span>
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                  {entry.source}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

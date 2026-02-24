"use client";

import { useState, useEffect } from "react";
import ClosureBanner from "@/components/ClosureBanner";
import DirectionCard from "@/components/DirectionCard";
import TrailMap from "@/components/TrailMap";
import HistoryTable from "@/components/HistoryTable";
import Link from "next/link";

export default function Home() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/status");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
        setHistory(json.history || []);
      } catch (err) {
        setError("Unable to load trail data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {data && <ClosureBanner isClosed={data.isClosed} closureNote={data.closureNote} />}

      <header className="text-center pt-8 pb-4 px-4">
        <h1 className="text-3xl font-bold text-green-800 dark:text-green-400">
          Betasso Trail Direction
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Boulder, CO &middot; Current riding direction for mountain bikes
        </p>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 pb-12 space-y-6">
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 mt-3">Loading trail data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Stale data warning */}
            {data.checkedAt && (new Date() - new Date(data.checkedAt)) > 6 * 60 * 60 * 1000 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 text-center text-yellow-700 dark:text-yellow-400 text-sm">
                Data may be stale &mdash; last checked {new Date(data.checkedAt).toLocaleString()}
              </div>
            )}

            {/* Direction Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {["canyon", "benjamin"].map((loop) => (
                <DirectionCard
                  key={loop}
                  loopName={data.loops[loop].name}
                  direction={data.loops[loop].direction}
                  directionLabel={data.loops[loop].directionLabel}
                  confidence={data.loops[loop].confidence}
                  recentEfforts={data.loops[loop].recentEfforts}
                  lastChanged={data.loops[loop].lastChanged}
                />
              ))}
            </div>

            {/* Trail Map */}
            <TrailMap
              canyonDirection={data.loops.canyon.direction}
              benjaminDirection={data.loops.benjamin.direction}
            />

            {/* History */}
            <HistoryTable history={history} />

            {/* CTA */}
            <div className="text-center pt-2">
              <Link
                href="/connect"
                className="inline-block bg-green-700 hover:bg-green-800 text-white font-medium px-6 py-3 rounded-xl transition-colors"
              >
                Help improve this data &mdash; Connect your Strava
              </Link>
            </div>
          </>
        )}
      </main>

      <footer className="text-center py-6 px-4 border-t border-gray-200 dark:border-gray-800">
        {data?.checkedAt && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Last checked: {new Date(data.checkedAt).toLocaleString()}
          </p>
        )}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Direction inferred from Strava ride data. Not official &mdash; always check on-trail signs.
        </p>
      </footer>
    </div>
  );
}

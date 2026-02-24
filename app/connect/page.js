"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ConnectContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 text-center">
        <Link href="/" className="text-green-700 dark:text-green-400 text-sm hover:underline">
          &larr; Back to directions
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Help Track Trail Direction
        </h1>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 space-y-4 text-left">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200">How it works</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>Connect your Strava account below</li>
            <li>Ride Betasso like you normally do</li>
            <li>When you upload your ride, we automatically detect which direction the trail is running</li>
            <li>Everyone benefits from up-to-date direction info!</li>
          </ol>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-sm text-green-800 dark:text-green-300">
            <strong>Privacy:</strong> We only read your Betasso ride data to determine trail direction.
            We don&apos;t store your routes, see your other rides, or share any personal data.
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-red-700 dark:text-red-400 text-sm">
            {error === "denied"
              ? "You declined the Strava authorization. No worries!"
              : "Something went wrong connecting to Strava. Please try again."}
          </div>
        )}

        <a
          href={`https://www.strava.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID}&redirect_uri=${typeof window !== "undefined" ? window.location.origin : ""}/api/auth/strava&response_type=code&scope=read,activity:read&approval_prompt=auto`}
          className="inline-flex items-center gap-2 bg-[#fc4c02] hover:bg-[#e34402] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
          </svg>
          Connect with Strava
        </a>

        <p className="text-xs text-gray-400 dark:text-gray-500">
          You can disconnect your account at any time from your Strava settings.
        </p>
      </div>
    </div>
  );
}

export default function ConnectPage() {
  return (
    <Suspense>
      <ConnectContent />
    </Suspense>
  );
}

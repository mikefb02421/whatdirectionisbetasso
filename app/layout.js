import "./globals.css";

export const metadata = {
  title: "Betasso Trail Direction | Boulder, CO",
  description:
    "Check the current riding direction for Canyon Loop and Benjamin Loop at Betasso Preserve. Inferred from real Strava ride data.",
  openGraph: {
    title: "Betasso Trail Direction",
    description: "Current mountain bike direction for Betasso Preserve loops",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f0fdf4" },
    { media: "(prefers-color-scheme: dark)", color: "#14532d" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-green-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}

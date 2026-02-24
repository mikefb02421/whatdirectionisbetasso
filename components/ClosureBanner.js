"use client";

export default function ClosureBanner({ isClosed, closureNote }) {
  if (!isClosed) return null;

  return (
    <div className="bg-red-600 text-white text-center py-3 px-4 font-semibold">
      {closureNote || "Bikes are not allowed on Betasso trails today (Wed/Sat closure)"}
    </div>
  );
}

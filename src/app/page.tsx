"use client"; // Mark this file as a client component

import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">AR Pollution Mapping</h1>
      <p className="text-center mb-4">View real-time pollution levels on an interactive map.</p>
      <div className="w-full max-w-4xl">
        <Map />
      </div>
    </main>
  );
}
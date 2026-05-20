"use client";

export default function WeatherBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0f172a]" aria-hidden="true">

      {/* Subtle radial glow spots */}
      <div className="absolute left-[10%] top-[15%] h-96 w-96 rounded-full bg-sky-600/10 blur-3xl" />
      <div className="absolute right-[5%] top-[5%] h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="absolute left-[40%] top-[40%] h-64 w-64 rounded-full bg-sky-500/5 blur-3xl" />

      {/* Cloud strip — constrained to top 30% of screen */}
      <div className="absolute left-0 right-0 top-0 h-[30%]">

        {/* Layer 1 — slow large clouds near the top */}
        <div className="absolute top-[10%]" style={{ animation: "drift 40s -10s linear infinite" }}>
          <CloudShape width={180} height={55} opacity={0.07} />
        </div>
        <div className="absolute top-[5%]" style={{ animation: "drift 50s -25s linear infinite" }}>
          <CloudShape width={240} height={70} opacity={0.06} />
        </div>

        {/* Layer 2 — medium speed */}
        <div className="absolute top-[40%]" style={{ animation: "drift 28s -5s linear infinite" }}>
          <CloudShape width={140} height={42} opacity={0.08} />
        </div>
        <div className="absolute top-[55%]" style={{ animation: "drift 32s -18s linear infinite" }}>
          <CloudShape width={200} height={58} opacity={0.06} />
        </div>

        {/* Layer 3 — faster small clouds */}
        <div className="absolute top-[70%]" style={{ animation: "drift 18s -3s linear infinite" }}>
          <CloudShape width={100} height={32} opacity={0.07} />
        </div>
        <div className="absolute top-[80%]" style={{ animation: "drift 22s -14s linear infinite" }}>
          <CloudShape width={130} height={38} opacity={0.05} />
        </div>
      </div>

      {/* Fade the cloud strip into the solid background */}
      <div className="absolute left-0 right-0 top-[20%] h-[15%] bg-gradient-to-b from-transparent to-[#0f172a]" />

      <style>{`
        @keyframes drift {
          from { transform: translateX(-300px); }
          to   { transform: translateX(110vw); }
        }
      `}</style>
    </div>
  );
}

function CloudShape({ width, height, opacity }: { width: number; height: number; opacity: number }) {
  const r = height * 0.45;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ opacity }}
    >
      <circle cx={r} cy={height - r * 0.6} r={r} fill="#bae6fd" />
      <circle cx={width * 0.4} cy={height * 0.45} r={r * 1.15} fill="#bae6fd" />
      <circle cx={width * 0.7} cy={height - r * 0.5} r={r * 0.9} fill="#bae6fd" />
      <rect x={r * 0.3} y={height - r * 0.6} width={width - r * 0.6} height={r * 0.6} fill="#bae6fd" />
    </svg>
  );
}

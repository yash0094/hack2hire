import React from "react";

export default function HealthGauge({ score = 0, label = "—" }) {
  const s = Math.max(0, Math.min(100, score));
  const color = s >= 80 ? "#16A34A" : s >= 60 ? "#CA8A00" : s >= 40 ? "#EA580C" : "#DC2626";
  // Semicircle gauge
  const R = 110;
  const C = Math.PI * R; // half-circle length
  const offset = C * (1 - s / 100);

  return (
    <div className="flex flex-col items-center" data-testid="health-gauge">
      <div className="relative w-[280px] h-[160px]">
        <svg viewBox="0 0 260 150" className="w-full h-full">
          {/* track */}
          <path
            d="M 20 140 A 110 110 0 0 1 240 140"
            fill="none"
            stroke="#D4D4D4"
            strokeWidth="14"
            strokeLinecap="butt"
          />
          {/* progress */}
          <path
            d="M 20 140 A 110 110 0 0 1 240 140"
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeLinecap="butt"
            strokeDasharray={C}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 500ms linear, stroke 200ms linear" }}
          />
          {/* tick marks */}
          {[0, 25, 50, 75, 100].map(t => {
            const angle = Math.PI * (1 - t / 100);
            const x1 = 130 + Math.cos(angle) * 95;
            const y1 = 140 - Math.sin(angle) * 95;
            const x2 = 130 + Math.cos(angle) * 80;
            const y2 = 140 - Math.sin(angle) * 80;
            return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#A1A1A1" strokeWidth="1" />;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <div className="font-mono text-6xl font-semibold tracking-tighter" style={{ color }} data-testid="health-score">
            {s}
          </div>
          <div className="label-micro">/ 100</div>
        </div>
      </div>
      <div className="mt-2 label-micro" style={{ color }} data-testid="health-label">
        [ {label} ]
      </div>
    </div>
  );
}

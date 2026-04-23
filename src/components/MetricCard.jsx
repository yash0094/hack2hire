import React from "react";

export default function MetricCard({ label, value, unit, color = "#0A0A0A", hint, testid }) {
  return (
    <div className="tile p-4 md:p-6 flex flex-col gap-3" data-testid={testid}>
      <div className="flex items-center justify-between">
        <span className="label-micro">{label}</span>
        {hint ? <span className="label-micro text-[#A1A1A1]">{hint}</span> : null}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-4xl sm:text-5xl tracking-tighter" style={{ color }}>
          {value}
        </span>
        {unit && <span className="label-micro">{unit}</span>}
      </div>
    </div>
  );
}

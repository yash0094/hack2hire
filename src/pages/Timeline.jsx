import React, { useEffect, useState } from "react";
import { getTimeline } from "../lib/api";

const SEV_COLOR = { critical: "#DC2626", warning: "#CA8A00", info: "#2563EB", success: "#16A34A" };

const formatWhen = (iso) => {
  const d = new Date(iso);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
};

export default function Timeline() {
  const [events, setEvents] = useState([]);
  useEffect(() => { getTimeline().then(setEvents); }, []);

  return (
    <div className="p-4 md:p-8" data-testid="timeline-page">
      <div className="label-micro mb-2">SYSTEM LOG</div>
      <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter uppercase">Problem Timeline</h1>
      <p className="font-mono text-xs text-[#525252] mt-2">// Historical events &amp; auto-resolutions.</p>

      <div className="mt-8 relative pl-6 md:pl-8" data-testid="timeline-list">
        {/* vertical line */}
        <div className="absolute left-2 md:left-3 top-0 bottom-0 w-px bg-[#D4D4D4]" />
        {events.map((ev, idx) => (
          <div key={ev.id} className="relative pb-6" data-testid={`timeline-${idx}`}>
            {/* node */}
            <div
              className="absolute left-[-22px] md:left-[-26px] top-1 w-3 h-3 border-2 bg-[#FFFFFF]"
              style={{ borderColor: SEV_COLOR[ev.severity] }}
            />
            <div className="tile p-4 md:p-5">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="label-micro" style={{ color: SEV_COLOR[ev.severity] }}>
                  {ev.severity.toUpperCase()}
                </span>
                <span className="label-micro text-[#A1A1A1]">{formatWhen(ev.timestamp)}</span>
                {ev.resolved && (
                  <span className="label-micro text-[#16A34A]">RESOLVED</span>
                )}
              </div>
              <div className="font-heading font-semibold text-lg">{ev.title}</div>
              <div className="font-body text-sm text-[#525252] mt-1">{ev.detail}</div>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="font-mono text-sm text-[#525252]">&gt; No events recorded.</div>
        )}
      </div>
    </div>
  );
}

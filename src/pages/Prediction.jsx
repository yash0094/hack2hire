import React, { useEffect, useState } from "react";
import { getPrediction } from "../lib/api";
import { WarningIcon, SparkleIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

export default function Prediction() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getPrediction().then(setData);
  }, []);

  if (!data) {
    return <div className="p-8 font-mono text-sm text-[#525252]" data-testid="prediction-loading">&gt; Forecasting network trajectory<span className="cursor-blink">_</span></div>;
  }

  return (
    <div className="p-4 md:p-8" data-testid="prediction-page">
      {/* Marquee warning strip */}
      <div className="border border-[#CA8A00] overflow-hidden mb-8 bg-[#F5F5F5]">
        <div className="flex whitespace-nowrap marquee py-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="label-micro text-[#CA8A00] px-4">
              ⚠ PREDICTIVE ALERT SYSTEM ACTIVE / TRAJECTORY FORECASTING / MODEL: CLAUDE-SONNET-4.5 / ⚠
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 label-micro mb-2">
        <SparkleIcon size={12} weight="fill" color="#CA8A00" />
        FORECAST
      </div>
      <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter uppercase leading-[0.9]">
        Prediction Alert
      </h1>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-0 border border-[#D4D4D4]">
        <div className="lg:col-span-2 p-6 md:p-10 border-b lg:border-b-0 lg:border-r border-[#D4D4D4]" data-testid="prediction-headline">
          <WarningIcon size={42} weight="fill" color="#CA8A00" />
          <div className="font-heading font-bold text-2xl md:text-3xl lg:text-4xl mt-5 leading-snug">
            {data.headline}
          </div>
          <div className="font-body text-base text-[#525252] mt-4">{data.detail}</div>
        </div>
        <div className="p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="label-micro">TIME UNTIL</div>
            <div className="font-mono text-6xl tracking-tighter mt-2" style={{ color: "#CA8A00" }} data-testid="prediction-minutes">
              {data.minutes_until}
            </div>
            <div className="label-micro text-[#A1A1A1]">minutes</div>
            <div className="label-micro mt-6">CONFIDENCE</div>
            <div className="h-2 mt-2 bg-[#FFFFFF] border border-[#D4D4D4]">
              <div className="h-full bg-[#CA8A00]" style={{ width: `${data.confidence}%` }} />
            </div>
            <div className="font-mono text-xs text-[#0A0A0A] mt-1">{data.confidence}%</div>
          </div>
          <button
            onClick={() => navigate("/recommendations")}
            data-testid="prevent-btn"
            className="mt-8 bg-[#0A0A0A] text-[#FFFFFF] px-4 py-3 font-mono text-xs tracking-[0.2em] uppercase font-semibold flex items-center justify-center gap-2 hover:bg-[#CA8A00] transition-colors"
          >
            Prevent Now <ArrowRightIcon size={14} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}

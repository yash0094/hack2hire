import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { startDiagnose, getDiagnose } from "../lib/api";
import { CheckIcon, XIcon, CircleNotchIcon, ArrowRightIcon } from "@phosphor-icons/react";

export default function Diagnose() {
  const [session, setSession] = useState(null);
  const [running, setRunning] = useState(false);
  const pollRef = useRef(null);
  const navigate = useNavigate();

  const run = async () => {
    setRunning(true);
    const s = await startDiagnose();
    setSession(s);
    pollRef.current = setInterval(async () => {
      try {
        const upd = await getDiagnose(s.session_id);
        setSession(upd);
        if (upd.status === "done") {
          clearInterval(pollRef.current);
          setRunning(false);
        }
      } catch {
        clearInterval(pollRef.current);
        setRunning(false);
      }
    }, 800);
  };

  useEffect(() => {
    run();
    return () => pollRef.current && clearInterval(pollRef.current);
  }, []);

  const StatusIcon = ({ status }) => {
    if (status === "ok") return <CheckIcon size={18} weight="bold" color="#16A34A" />;
    if (status === "fail") return <XIcon size={18} weight="bold" color="#DC2626" />;
    if (status === "running") return <CircleNotchIcon size={18} weight="bold" className="animate-spin" color="#0A0A0A" />;
    return <div className="w-[18px] h-[18px] border border-[#A1A1A1]" />;
  };

  return (
    <div className="p-4 md:p-8" data-testid="diagnose-page">
      <div className="label-micro mb-2">PROCESS 0x{Math.floor(Math.random() * 99999).toString(16).toUpperCase()}</div>
      <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter uppercase">FIX MY WIFI</h1>
      <p className="font-mono text-xs text-[#525252] mt-2">// Running exhaustive 8-step diagnostic. Do not disconnect.</p>

      {/* Terminal panel */}
      <div className="mt-8 border border-[#D4D4D4] bg-[#FFFFFF] overflow-hidden relative">
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#D4D4D4] bg-[#F5F5F5]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#DC2626]" />
            <div className="w-2 h-2 bg-[#CA8A00]" />
            <div className="w-2 h-2 bg-[#16A34A]" />
            <span className="label-micro ml-2">~/netdoctor/diagnostic.sh</span>
          </div>
          <span className="label-micro text-[#A1A1A1]">{session?.status === "done" ? "DONE" : "RUNNING"}</span>
        </div>

        <div className="p-4 md:p-6 font-mono text-sm space-y-2 relative min-h-[400px]" data-testid="diagnostic-terminal">
          {running && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
              <div className="scan-line absolute left-0 right-0 h-[1px] bg-[#16A34A]" />
            </div>
          )}
          <div className="text-[#A1A1A1]">$ netdoctor diagnose --full</div>
          <div className="text-[#A1A1A1]">[i] Initializing scan at {new Date().toLocaleTimeString()}</div>
          <div className="border-b border-[#D4D4D4] my-3" />

          {session?.steps?.map((st, i) => (
            <div key={st.key} className="flex items-start gap-3 py-2 border-b border-[#F5F5F5]" data-testid={`diag-step-${st.key}`}>
              <span className="text-[#A1A1A1] w-8 shrink-0">[{String(i + 1).padStart(2, "0")}]</span>
              <StatusIcon status={st.status} />
              <div className="flex-1">
                <div className={st.status === "ok" ? "text-[#0A0A0A]" : "text-[#525252]"}>
                  {st.label}{st.status === "running" && <span className="cursor-blink">_</span>}
                </div>
                {st.detail && <div className="text-[#A1A1A1] text-xs mt-1">&gt; {st.detail}</div>}
              </div>
            </div>
          ))}

          {session?.status === "done" && (
            <>
              <div className="border-b border-[#D4D4D4] my-3" />
              <div className="text-[#16A34A]">[OK] Diagnostic complete.</div>
              <div className="text-[#525252]">{session.summary}</div>
            </>
          )}
        </div>

        {/* Progress bar */}
        <div className="border-t border-[#D4D4D4] p-4 bg-[#F5F5F5]">
          <div className="flex items-center justify-between mb-2">
            <span className="label-micro">PROGRESS</span>
            <span className="font-mono text-xs" data-testid="diag-progress">{session?.progress ?? 0}%</span>
          </div>
          <div className="h-2 bg-[#FFFFFF] border border-[#D4D4D4] overflow-hidden">
            <div
              className="h-full bg-[#16A34A] transition-all duration-300"
              style={{ width: `${session?.progress ?? 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={run}
          disabled={running}
          data-testid="rerun-diagnostic-btn"
          className="border border-[#D4D4D4] hover:border-[#0A0A0A] px-6 py-3 font-mono text-xs tracking-[0.2em] uppercase disabled:opacity-40"
        >
          Re-run diagnostic
        </button>
        <button
          onClick={() => navigate("/recommendations")}
          data-testid="goto-recs-btn"
          className="bg-[#0A0A0A] text-[#FFFFFF] px-6 py-3 font-mono text-xs tracking-[0.2em] uppercase font-semibold flex items-center gap-2 hover:bg-[#16A34A] transition-colors"
        >
          View Recommendations <ArrowRightIcon size={14} weight="bold" />
        </button>
      </div>
    </div>
  );
}

import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  GaugeIcon,
  WarningIcon,
  LightningIcon,
  ClockCounterClockwiseIcon,
  MapTrifoldIcon,
  DevicesIcon,
  CrosshairIcon,
  WifiHighIcon,
} from "@phosphor-icons/react";

const NAV = [
  { to: "/", label: "DASHBOARD", icon: GaugeIcon, testid: "nav-dashboard" },
  { to: "/diagnose", label: "DIAGNOSE", icon: CrosshairIcon, testid: "nav-diagnose" },
  { to: "/recommendations", label: "RECOMMEND", icon: LightningIcon, testid: "nav-recommendations" },
  { to: "/heatmap", label: "ZONE MAP", icon: MapTrifoldIcon, testid: "nav-heatmap" },
  { to: "/devices", label: "DEVICES", icon: DevicesIcon, testid: "nav-devices" },
  { to: "/timeline", label: "TIMELINE", icon: ClockCounterClockwiseIcon, testid: "nav-timeline" },
  { to: "/prediction", label: "FORECAST", icon: WarningIcon, testid: "nav-prediction" },
];

export default function AppShell({ children }) {
  const location = useLocation();
  const current = NAV.find(n => n.to === location.pathname) || NAV[0];

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#0A0A0A] flex flex-col" data-testid="app-shell">
      {/* Top Header */}
      <header className="border-b border-[#D4D4D4] bg-[#FFFFFF] sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 md:px-8 h-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-[#0A0A0A] flex items-center justify-center">
              <WifiHighIcon size={18} weight="bold" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-heading font-black text-sm tracking-tight">NET DOCTOR</span>
              <span className="label-micro">v1.0 / DIAGNOSTIC CONSOLE</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#16A34A] pulse-dot" />
              <span className="label-micro">LIVE</span>
            </div>
            <span className="label-micro text-[#A1A1A1]">|</span>
            <span className="label-micro">{new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}</span>
          </div>
        </div>
        <div className="border-t border-[#D4D4D4] px-4 md:px-8 h-9 flex items-center">
          <span className="label-micro text-[#0A0A0A]">&gt; {current.label}</span>
          <span className="ml-2 w-2 h-4 bg-[#0A0A0A] cursor-blink" />
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Desktop left nav */}
        <aside className="hidden lg:flex w-56 shrink-0 border-r border-[#D4D4D4] flex-col">
          <nav className="flex flex-col">
            {NAV.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                data-testid={item.testid}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-6 py-4 border-b border-[#D4D4D4] label-micro transition-colors ${
                    isActive
                      ? "bg-[#0A0A0A] text-[#FFFFFF]"
                      : "text-[#525252] hover:text-[#0A0A0A] hover:bg-[#F5F5F5]"
                  }`
                }
                end={item.to === "/"}
              >
                <item.icon size={16} weight="bold" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto p-6 border-t border-[#D4D4D4]">
            <div className="label-micro mb-2 text-[#A1A1A1]">SYSTEM</div>
            <div className="font-mono text-xs text-[#525252]">
              MyHomeWiFi<br />
              ASUS RT-AX88U
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-[#D4D4D4] bg-[#FFFFFF] z-40">
        <div className="grid grid-cols-7">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              data-testid={`${item.testid}-mobile`}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-3 ${
                  isActive ? "bg-[#0A0A0A] text-[#FFFFFF]" : "text-[#525252]"
                }`
              }
              end={item.to === "/"}
            >
              <item.icon size={16} weight="bold" />
              <span className="text-[9px] font-mono tracking-[0.15em]">{item.label.split(" ")[0].slice(0, 4)}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

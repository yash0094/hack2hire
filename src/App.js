import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import AppShell from "@/components/AppShell";
import Dashboard from "@/pages/Dashboard";
import Diagnose from "@/pages/Diagnose";
import Recommendations from "@/pages/Recommendations";
import Heatmap from "@/pages/Heatmap";
import Devices from "@/pages/Devices";
import Timeline from "@/pages/Timeline";
import Prediction from "@/pages/Prediction";

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/diagnose" element={<Diagnose />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/heatmap" element={<Heatmap />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/prediction" element={<Prediction />} />
          </Routes>
        </AppShell>
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "#F5F5F5",
              border: "1px solid #D4D4D4",
              borderRadius: 0,
              color: "#0A0A0A",
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "12px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            },
          }}
        />
      </BrowserRouter>
    </div>
  );
}

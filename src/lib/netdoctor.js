// Net Doctor — 100% client-side simulated WiFi engine.
// No backend required. All data computed locally; timeline persisted to localStorage.

const SSID = "MyHomeWiFi";
const ROUTER_MODEL = "ASUS RT-AX88U";
const CHANNELS_24 = [1, 6, 11];
const CHANNELS_5 = [36, 40, 44, 48, 149, 153, 157, 161];

const state = {
  base_latency: 38.0,
  base_signal: -62.0,
  base_download: 145.0,
  base_upload: 42.0,
  band: "2.4GHz",
  channel: 6,
  devices_count: 7,
};

const rand = (min, max) => Math.random() * (max - min) + min;
const jitter = (base, pct = 0.15) => base * (1 + rand(-pct, pct));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function currentMetrics() {
  const now = new Date();
  const hour = now.getHours();
  const peak = hour >= 18 && hour <= 22 ? 1.4 : hour >= 12 && hour <= 14 ? 1.15 : 1.0;
  const latency = Math.max(5, jitter(state.base_latency) * peak);
  const signal = jitter(state.base_signal, 0.05);
  const download = Math.max(1, jitter(state.base_download) / peak);
  const upload = Math.max(0.5, jitter(state.base_upload) / peak);
  let devices = state.devices_count + Math.floor(rand(-1, 2));
  devices = Math.max(3, Math.min(15, devices));
  const congestion = Math.min(100, Math.round(45 + (devices - 5) * 7 + (peak - 1) * 80));

  return {
    ssid: SSID,
    router_model: ROUTER_MODEL,
    band: state.band,
    channel: state.channel,
    download_mbps: Math.round(download * 10) / 10,
    upload_mbps: Math.round(upload * 10) / 10,
    latency_ms: Math.round(latency),
    signal_dbm: Math.round(signal),
    devices_count: devices,
    congestion_pct: congestion,
    timestamp: now.toISOString(),
  };
}

function healthScore(m) {
  const sigScore = Math.max(0, Math.min(100, (m.signal_dbm + 90) * (100 / 40)));
  const latScore = Math.max(0, Math.min(100, 100 - (m.latency_ms - 20) * 1.5));
  const congScore = Math.max(0, 100 - m.congestion_pct);
  const speedScore = Math.max(0, Math.min(100, (m.download_mbps / 200) * 100));
  return Math.round(sigScore * 0.35 + latScore * 0.25 + congScore * 0.20 + speedScore * 0.20);
}

function detectIssues(m) {
  const issues = [];
  if (m.signal_dbm < -75) {
    issues.push({ code: "WEAK_SIGNAL", severity: "critical", title: "Weak Signal Detected",
      detail: `Signal strength is ${m.signal_dbm} dBm. Move closer to the router or add a mesh node.` });
  }
  if (m.latency_ms > 90) {
    issues.push({ code: "HIGH_LATENCY", severity: "critical", title: "High Latency",
      detail: `Ping is ${m.latency_ms}ms. Affects video calls and gaming.` });
  }
  if (m.devices_count >= 7) {
    issues.push({ code: "TOO_MANY_DEVICES", severity: "warning", title: "Network Overloaded",
      detail: `${m.devices_count} devices are connected. Consider splitting load or upgrading bandwidth.` });
  }
  if (m.congestion_pct > 70) {
    issues.push({ code: "CHANNEL_CONGESTION", severity: "warning", title: "Channel Congestion",
      detail: `Channel ${m.channel} is ${m.congestion_pct}% congested. Switch to a cleaner channel.` });
  }
  if (m.band === "2.4GHz" && m.download_mbps < 100) {
    issues.push({ code: "SUGGEST_5GHZ", severity: "info", title: "Switch to 5 GHz",
      detail: "Switching to the 5 GHz band previously improved your speed by ~30%." });
  }
  if (issues.length === 0) {
    issues.push({ code: "HEALTHY", severity: "success", title: "Network Healthy",
      detail: "No issues detected on your network." });
  }
  return issues;
}

// ---- Timeline (localStorage) ----
const TL_KEY = "netdoctor:timeline";

function seedTimeline() {
  const now = Date.now();
  const samples = [
    ["Router restarted", "Auto-healing reset restored connectivity.", "success", 2],
    ["High latency spike", "Latency hit 180ms for 4 minutes.", "warning", 6],
    ["Weak signal in Garage", "Signal dropped to -88 dBm.", "critical", 14],
    ["New device connected", "iPad Air joined MyHomeWiFi.", "info", 26],
    ["Channel switched 6 → 11", "Reduced congestion by 35%.", "success", 40],
    ["Bandwidth hog detected", "PlayStation 5 used 42 Mbps for 2h.", "warning", 70],
  ];
  const events = samples.map(([title, detail, sev, h]) => ({
    id: crypto.randomUUID(),
    timestamp: new Date(now - h * 3600 * 1000).toISOString(),
    title, detail, severity: sev, resolved: true,
  }));
  localStorage.setItem(TL_KEY, JSON.stringify(events));
  return events;
}

function readTimeline() {
  try {
    const raw = localStorage.getItem(TL_KEY);
    if (!raw) return seedTimeline();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) && arr.length ? arr : seedTimeline();
  } catch { return seedTimeline(); }
}

function addTimeline(title, detail, severity = "success") {
  const events = readTimeline();
  events.unshift({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    title, detail, severity, resolved: true,
  });
  localStorage.setItem(TL_KEY, JSON.stringify(events.slice(0, 50)));
}

// ---- Public API (same shape as original backend) ----

export async function getStatus() {
  const m = currentMetrics();
  const score = healthScore(m);
  const label = score >= 80 ? "EXCELLENT" : score >= 60 ? "MODERATE" : score >= 40 ? "DEGRADED" : "CRITICAL";
  return { ...m, health_score: score, health_label: label };
}

export async function getIssues() {
  const m = currentMetrics();
  const issues = detectIssues(m);
  return { issues, count: issues.length };
}

const DEVICE_POOL = [
  ["iPhone 15 Pro", "phone"], ["MacBook Pro 16", "laptop"], ["PlayStation 5", "console"],
  ["Samsung Smart TV", "tv"], ["Nest Thermostat", "iot"], ["Ring Doorbell", "iot"],
  ["iPad Air", "tablet"], ["Dad's Laptop", "laptop"], ["Sonos Arc", "speaker"],
  ["Echo Dot", "iot"], ["Xbox Series X", "console"], ["Work Laptop", "laptop"],
];

export async function getDevices() {
  const m = currentMetrics();
  const n = m.devices_count;
  const chosen = [...DEVICE_POOL].sort(() => Math.random() - 0.5).slice(0, Math.min(n, DEVICE_POOL.length));
  const hex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0").toUpperCase();
  const devices = chosen.map(([name, type], i) => {
    const bw = Math.round(rand(0.1, 45.0) * 10) / 10;
    return {
      id: `dev-${i}`, name, type,
      ip: `192.168.1.${20 + i}`,
      mac: Array.from({ length: 6 }, hex).join(":"),
      signal_dbm: Math.round(rand(-82, -48)),
      bandwidth_mbps: bw,
      is_hog: bw > 25,
    };
  });
  return { devices, count: devices.length };
}

export async function getHeatmap() {
  const zonesRaw = [
    ["Living Room", 25, 30, -52, "good"], ["Kitchen", 55, 25, -64, "good"],
    ["Master Bedroom", 75, 55, -74, "moderate"], ["Kid's Room", 82, 30, -81, "weak"],
    ["Office", 20, 60, -58, "good"], ["Garage", 10, 85, -86, "weak"],
    ["Bathroom", 60, 65, -70, "moderate"], ["Hallway", 45, 50, -60, "good"],
  ];
  return {
    zones: zonesRaw.map(([name, x, y, s, st], i) => ({
      id: `zone-${i}`, name, x, y, signal_dbm: s, status: st,
    })),
    router: { x: 40, y: 40 },
  };
}

export async function getTimeline() {
  return readTimeline();
}

// ---- Diagnostic session ----
const DIAG_STEPS = [
  ["ping_router", "Ping router gateway"],
  ["dns_check", "Resolve DNS (1.1.1.1)"],
  ["speed_test", "Run speed benchmark"],
  ["scan_channels", "Scan 2.4GHz / 5GHz channels"],
  ["scan_interference", "Detect neighboring networks"],
  ["audit_devices", "Audit connected devices"],
  ["signal_sweep", "Sweep signal strength across bands"],
  ["summarize", "Compile diagnostic report"],
];

const sessions = new Map();

function runDiagnostic(sid) {
  const sess = sessions.get(sid);
  const total = sess.steps.length;
  let i = 0;
  const tick = () => {
    if (i >= total) {
      sess.status = "done";
      sess.progress = 100;
      sess.summary = "Diagnostic complete. Review recommendations for targeted fixes.";
      return;
    }
    const step = sess.steps[i];
    step.status = "running";
    sess.progress = Math.round((i / total) * 100);
    setTimeout(() => {
      const m = currentMetrics();
      if (step.key === "ping_router") step.detail = `Latency ${m.latency_ms}ms`;
      else if (step.key === "speed_test") step.detail = `${m.download_mbps} Mbps down / ${m.upload_mbps} Mbps up`;
      else if (step.key === "scan_channels" && Math.random() < 0.35) step.detail = "Detected 3 overlapping SSIDs on channel 6.";
      else step.detail = "Passed.";
      step.status = "ok";
      i++;
      sess.progress = Math.round((i / total) * 100);
      tick();
    }, rand(600, 1200));
  };
  tick();
}

export async function startDiagnose() {
  const sid = crypto.randomUUID();
  const sess = {
    session_id: sid,
    steps: DIAG_STEPS.map(([k, l]) => ({ key: k, label: l, status: "pending", detail: null })),
    progress: 0, status: "running", summary: null,
  };
  sessions.set(sid, sess);
  runDiagnostic(sid);
  return sess;
}

export async function getDiagnose(sid) {
  const sess = sessions.get(sid);
  if (!sess) throw new Error("Diagnostic session not found");
  return JSON.parse(JSON.stringify(sess));
}

// ---- Actions ----

export async function toggleBand(band) {
  if (band !== "2.4GHz" && band !== "5GHz") throw new Error("Invalid band");
  state.band = band;
  state.channel = pick(band === "5GHz" ? CHANNELS_5 : CHANNELS_24);
  if (band === "5GHz") {
    state.base_download = 320; state.base_upload = 95;
    state.base_latency = 22;   state.base_signal = -58;
  } else {
    state.base_download = 145; state.base_upload = 42;
    state.base_latency = 38;   state.base_signal = -62;
  }
  addTimeline(`Switched to ${band}`, `Now on channel ${state.channel}.`, "success");
  return { ok: true, band: state.band, channel: state.channel };
}

export async function restartRouter() {
  state.base_latency *= 0.7;
  state.base_signal = Math.max(-58, state.base_signal + 4);
  state.base_download *= 1.15;
  addTimeline("Router restarted", "Auto-healing reset improved latency and signal.", "success");
  return { ok: true };
}

// ---- Rule-based recommendations ----

function fallbackRecs(m) {
  const recs = [];
  if (m.band === "2.4GHz") recs.push({
    id: "rec-5ghz", title: "Switch to 5 GHz",
    detail: "The 5 GHz band is less crowded and historically improved your speed by ~30%.",
    impact: "HIGH", action: "SWITCH_BAND_5GHZ",
  });
  if (m.latency_ms > 60) recs.push({
    id: "rec-restart", title: "Restart your router",
    detail: `Latency is ${m.latency_ms}ms. A quick restart clears stale connections.`,
    impact: "MEDIUM", action: "RESTART_ROUTER",
  });
  if (m.signal_dbm < -72) recs.push({
    id: "rec-mesh", title: "Move closer or add a mesh node",
    detail: `Signal is ${m.signal_dbm} dBm in your current location.`,
    impact: "HIGH", action: "MOVE_CLOSER",
  });
  if (m.devices_count >= 7) recs.push({
    id: "rec-qos", title: "Enable QoS prioritization",
    detail: `${m.devices_count} devices are competing. Prioritize video calls & gaming.`,
    impact: "MEDIUM", action: "ENABLE_QOS",
  });
  if (recs.length === 0) recs.push({
    id: "rec-maintain", title: "Keep firmware up to date",
    detail: "Network is healthy. Periodic firmware updates keep it that way.",
    impact: "LOW", action: "UPDATE_FIRMWARE",
  });
  return recs;
}

export async function getRecommendations() {
  await delay(400); // simulate API latency
  const m = currentMetrics();
  return { recommendations: fallbackRecs(m), source: "rule-based" };
}

export async function getPrediction() {
  await delay(300);
  const m = currentMetrics();
  const minutes = pick([8, 10, 12, 15, 20]);
  const confidence = Math.floor(rand(68, 93));
  return {
    headline: `Network likely to slow down in ${minutes} minutes`,
    detail: `Congestion is trending up (${m.congestion_pct}%) with ${m.devices_count} devices active.`,
    minutes_until: minutes,
    confidence,
  };
}

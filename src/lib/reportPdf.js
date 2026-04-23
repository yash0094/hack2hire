import { jsPDF } from "jspdf";

const C = {
  bg: [255, 255, 255],
  surface: [245, 245, 245],
  border: [212, 212, 212],
  text: [10, 10, 10],
  muted: [82, 82, 82],
  dim: [161, 161, 161],
  success: [22, 163, 74],
  warning: [202, 138, 0],
  critical: [220, 38, 38],
  info: [37, 99, 235],
};

const sev = (s) =>
  s === "critical" ? C.critical : s === "warning" ? C.warning : s === "success" ? C.success : C.info;

const setFill = (doc, c) => doc.setFillColor(c[0], c[1], c[2]);
const setDraw = (doc, c) => doc.setDrawColor(c[0], c[1], c[2]);
const setText = (doc, c) => doc.setTextColor(c[0], c[1], c[2]);

export function generateReportPDF({ status, issues, recs, devices, zones, prediction, timeline }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 40;
  let y = M;

  // Background
  setFill(doc, C.bg);
  doc.rect(0, 0, W, H, "F");

  // Top bar
  setFill(doc, C.surface);
  doc.rect(0, 0, W, 60, "F");
  setDraw(doc, C.border);
  doc.setLineWidth(0.5);
  doc.line(0, 60, W, 60);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  setText(doc, C.text);
  doc.text("NET DOCTOR", M, 28);
  doc.setFontSize(8);
  setText(doc, C.muted);
  doc.text("DIAGNOSTIC REPORT / v1.0", M, 44);

  const now = new Date();
  const dateStr = now.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
  doc.text(dateStr.toUpperCase(), W - M, 28, { align: "right" });
  doc.text(`NETWORK: ${status.ssid}`, W - M, 44, { align: "right" });

  y = 90;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  setText(doc, C.text);
  doc.text((status.ssid || "NETWORK").toUpperCase(), M, y);
  y += 18;
  doc.setFontSize(9);
  setText(doc, C.muted);
  doc.text(`${status.router_model} / ${status.band} / CH${status.channel}`, M, y);
  y += 24;

  // Health Score block
  const scoreColor = status.health_score >= 80 ? C.success : status.health_score >= 60 ? C.warning : status.health_score >= 40 ? [255, 136, 0] : C.critical;
  setDraw(doc, C.border);
  doc.rect(M, y, W - 2 * M, 80);

  // Score number
  setText(doc, scoreColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(48);
  doc.text(String(status.health_score), M + 18, y + 58);

  doc.setFontSize(8);
  setText(doc, C.muted);
  doc.text("HEALTH / 100", M + 18, y + 72);

  // Health label
  doc.setFontSize(10);
  setText(doc, scoreColor);
  doc.text(`[ ${status.health_label} ]`, M + 150, y + 30);

  // Mini metrics
  const mini = [
    ["DOWNLOAD", `${status.download_mbps} Mbps`],
    ["UPLOAD", `${status.upload_mbps} Mbps`],
    ["LATENCY", `${Math.round(status.latency_ms)} ms`],
    ["SIGNAL", `${Math.round(status.signal_dbm)} dBm`],
    ["DEVICES", String(status.devices_count)],
    ["CONGEST.", `${status.congestion_pct}%`],
  ];
  mini.forEach((m, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = M + 150 + col * 120;
    const my = y + 44 + row * 20;
    doc.setFontSize(7);
    setText(doc, C.dim);
    doc.text(m[0], x, my);
    doc.setFontSize(10);
    setText(doc, C.text);
    doc.text(m[1], x + 55, my);
  });
  y += 100;

  // Section: Issues
  y = sectionHeader(doc, "DETECTED ISSUES", issues.length, y, W, M);
  issues.forEach((iss) => {
    if (y > H - 100) y = newPage(doc, W, H);
    setFill(doc, sev(iss.severity));
    doc.rect(M, y + 4, 3, 18, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    setText(doc, C.text);
    doc.text(iss.title, M + 12, y + 12);
    setText(doc, sev(iss.severity));
    doc.setFontSize(7);
    doc.text(iss.severity.toUpperCase(), W - M, y + 12, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setText(doc, C.muted);
    const lines = doc.splitTextToSize(iss.detail, W - 2 * M - 20);
    doc.text(lines, M + 12, y + 26);
    y += 26 + lines.length * 10 + 8;
    setDraw(doc, C.border);
    doc.line(M, y - 4, W - M, y - 4);
  });
  y += 8;

  // Section: Recommendations
  if (recs && recs.length) {
    if (y > H - 120) y = newPage(doc, W, H);
    y = sectionHeader(doc, "SMART RECOMMENDATIONS", recs.length, y, W, M);
    recs.forEach((rec, idx) => {
      if (y > H - 80) y = newPage(doc, W, H);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      setText(doc, C.text);
      doc.text(`${String(idx + 1).padStart(2, "0")}  ${rec.title}`, M, y + 10);
      const impactC = rec.impact === "HIGH" ? C.critical : rec.impact === "MEDIUM" ? C.warning : C.info;
      setText(doc, impactC);
      doc.setFontSize(7);
      doc.text(`${rec.impact} IMPACT`, W - M, y + 10, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      setText(doc, C.muted);
      const lines = doc.splitTextToSize(rec.detail, W - 2 * M);
      doc.text(lines, M, y + 24);
      y += 24 + lines.length * 10 + 10;
      setDraw(doc, C.border);
      doc.line(M, y - 4, W - M, y - 4);
    });
    y += 8;
  }

  // Section: Prediction
  if (prediction) {
    if (y > H - 100) y = newPage(doc, W, H);
    y = sectionHeader(doc, "FORECAST", null, y, W, M);
    setText(doc, C.warning);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    const hlines = doc.splitTextToSize(prediction.headline, W - 2 * M);
    doc.text(hlines, M, y + 12);
    y += 12 + hlines.length * 14;
    setText(doc, C.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const dlines = doc.splitTextToSize(prediction.detail, W - 2 * M);
    doc.text(dlines, M, y + 4);
    y += 4 + dlines.length * 11 + 8;
    setText(doc, C.dim);
    doc.setFontSize(8);
    doc.text(`Minutes until: ${prediction.minutes_until}    Confidence: ${prediction.confidence}%`, M, y);
    y += 18;
  }

  // Section: Devices
  if (devices && devices.length) {
    if (y > H - 120) y = newPage(doc, W, H);
    y = sectionHeader(doc, "CONNECTED DEVICES", devices.length, y, W, M);
    doc.setFontSize(7);
    setText(doc, C.dim);
    doc.text("DEVICE", M, y);
    doc.text("TYPE", M + 200, y);
    doc.text("IP", M + 280, y);
    doc.text("MBPS", W - M, y, { align: "right" });
    y += 8;
    setDraw(doc, C.border);
    doc.line(M, y, W - M, y);
    y += 8;
    devices.slice(0, 20).forEach((d) => {
      if (y > H - 40) y = newPage(doc, W, H);
      doc.setFontSize(9);
      setText(doc, C.text);
      doc.text(d.name, M, y);
      setText(doc, C.muted);
      doc.text(d.type, M + 200, y);
      doc.text(d.ip, M + 280, y);
      setText(doc, d.is_hog ? C.critical : C.text);
      doc.text(String(d.bandwidth_mbps), W - M, y, { align: "right" });
      y += 14;
    });
    y += 8;
  }

  // Section: Zones
  if (zones && zones.length) {
    if (y > H - 120) y = newPage(doc, W, H);
    y = sectionHeader(doc, "ZONE SIGNAL MAP", zones.length, y, W, M);
    zones.forEach((z) => {
      if (y > H - 40) y = newPage(doc, W, H);
      const zc = z.status === "good" ? C.success : z.status === "moderate" ? C.warning : C.critical;
      setFill(doc, zc);
      doc.rect(M, y - 7, 6, 6, "F");
      doc.setFontSize(9);
      setText(doc, C.text);
      doc.text(z.name, M + 14, y);
      setText(doc, zc);
      doc.text(`${z.signal_dbm} dBm`, W - M, y, { align: "right" });
      y += 14;
    });
  }

  // Footer on each page
  const pages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    setDraw(doc, C.border);
    doc.line(M, H - 32, W - M, H - 32);
    doc.setFontSize(7);
    setText(doc, C.dim);
    doc.text("GENERATED BY NET DOCTOR", M, H - 18);
    doc.text(`PAGE ${p} / ${pages}`, W - M, H - 18, { align: "right" });
  }

  return doc;
}

function sectionHeader(doc, title, count, y, W, M) {
  doc.setDrawColor(212, 212, 212);
  doc.line(M, y, W - M, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(10, 10, 10);
  const label = count !== null && count !== undefined ? `${title}  /  ${count}` : title;
  doc.text(label, M, y + 14);
  return y + 26;
}

function newPage(doc, W, H) {
  doc.addPage();
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, "F");
  return 40;
}

export async function downloadReport(data) {
  const doc = generateReportPDF(data);
  const fname = `netdoctor-report-${new Date().toISOString().slice(0, 10)}.pdf`;

  if (navigator.share && navigator.canShare) {
    try {
      const blob = doc.output("blob");
      const file = new File([blob], fname, { type: "application/pdf" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Net Doctor WiFi Report" });
        return "shared";
      }
    } catch {
      // fall through to download
    }
  }
  doc.save(fname);
  return "downloaded";
}

// Re-exports from netdoctor.js so existing page imports keep working.
export {
  getStatus,
  getIssues,
  getDevices,
  getTimeline,
  getHeatmap,
  getPrediction,
  getRecommendations,
  startDiagnose,
  getDiagnose,
  toggleBand,
  restartRouter,
} from "./netdoctor";

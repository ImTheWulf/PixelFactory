const imageInput = document.getElementById("imageInput");
const originalPreview = document.getElementById("originalPreview");
const processedPreview = document.getElementById("processedPreview");
const processBtn = document.getElementById("processBtn");
const downloadBtn = document.getElementById("downloadBtn");
const previewMode = document.getElementById("previewMode");
const previewModeInline = document.getElementById("previewModeInline");
const workspaceStatus = document.getElementById("workspaceStatus");
const changePaletteAssetBtn = document.getElementById("changePaletteAssetBtn");
const paletteLoadedState = document.getElementById("paletteLoadedState");
const paletteWorkspaceMeta = document.getElementById("paletteWorkspaceMeta");
const paletteDirtyState = document.getElementById("paletteDirtyState");
const paletteHistory = document.getElementById("paletteHistory");
const paletteComparePanel = document.getElementById("paletteComparePanel");
const paletteStatusFooter = document.getElementById("paletteStatusFooter");
const compareSlider = document.getElementById("compareSlider");
const compareOriginalPreview = document.getElementById("compareOriginalPreview");
const compareProcessedPreview = document.getElementById("compareProcessedPreview");
const compareProcessedClip = document.getElementById("compareProcessedClip");
const compareDivider = document.getElementById("compareDivider");
const openCompareViewerBtn = document.getElementById("openCompareViewerBtn");
const mainPaletteCanvasStage = document.getElementById("mainPaletteCanvasStage");
const mainCanvasFitBtn = document.getElementById("mainCanvasFitBtn");
const mainCanvasActualBtn = document.getElementById("mainCanvasActualBtn");
const mainCanvasGridToggle = document.getElementById("mainCanvasGridToggle");
const mainCanvasDifferenceBtn = document.getElementById("mainCanvasDifferenceBtn");
const mainDifferenceCanvas = document.getElementById("mainDifferenceCanvas");
const paletteCompareModal = document.getElementById("paletteCompareModal");
const paletteCompareTitle = document.getElementById("paletteCompareTitle");
const paletteCompareMeta = document.getElementById("paletteCompareMeta");
const paletteCompareModalStage = document.getElementById("paletteCompareModalStage");
const compareModalCanvas = document.getElementById("compareModalCanvas");
const compareModalOriginal = document.getElementById("compareModalOriginal");
const compareModalProcessed = document.getElementById("compareModalProcessed");
const compareModalProcessedClip = document.getElementById("compareModalProcessedClip");
const compareModalDivider = document.getElementById("compareModalDivider");
const compareModalSlider = document.getElementById("compareModalSlider");
const compareResizeScale = document.getElementById("compareResizeScale");
const comparePaletteColors = document.getElementById("comparePaletteColors");
const comparePixelSize = document.getElementById("comparePixelSize");
const compareGridToggle = document.getElementById("compareGridToggle");
const compareOperation = document.getElementById("compareOperation");
const compareProcessBtn = document.getElementById("compareProcessBtn");
const compareDownloadBtn = document.getElementById("compareDownloadBtn");
const compareCloseBtn = document.getElementById("compareCloseBtn");
const compareFitBtn = document.getElementById("compareFitBtn");
const compareActualBtn = document.getElementById("compareActualBtn");
const compareZoomInBtn = document.getElementById("compareZoomInBtn");
const compareZoomOutBtn = document.getElementById("compareZoomOutBtn");
const compareDifferenceBtn = document.getElementById("compareDifferenceBtn");
const compareDifferenceCanvas = document.getElementById("compareDifferenceCanvas");
const comparePixelInspector = document.getElementById("comparePixelInspector");
const discardPalettePreviewBtn = document.getElementById("discardPalettePreviewBtn");
const applyPalettePreviewBtn = document.getElementById("applyPalettePreviewBtn");
const downloadPaletteResultBtn = document.getElementById("downloadPaletteResultBtn");
const savePaletteAssetBtn = document.getElementById("savePaletteAssetBtn");
const savePaletteAsAssetBtn = document.getElementById("savePaletteAsAssetBtn");
const paletteSaveAsModal = document.getElementById("paletteSaveAsModal");
const paletteSaveAsName = document.getElementById("paletteSaveAsName");
const paletteSaveAsType = document.getElementById("paletteSaveAsType");
const paletteSaveAsSource = document.getElementById("paletteSaveAsSource");
const paletteSaveAsCloseBtn = document.getElementById("paletteSaveAsCloseBtn");
const paletteSaveAsCancelBtn = document.getElementById("paletteSaveAsCancelBtn");
const paletteSaveAsConfirmBtn = document.getElementById("paletteSaveAsConfirmBtn");
const opPaletteCount = document.getElementById("opPaletteCount");
const opResizeScale = document.getElementById("opResizeScale");
const opPixelSize = document.getElementById("opPixelSize");
const opPixelSnapRow = document.getElementById("opPixelSnapRow");
const pixelSnapToolBtn = document.getElementById("pixelSnapToolBtn");
const pixelSnapGridSize = document.getElementById("pixelSnapGridSize");
const pixelSnapStrength = document.getElementById("pixelSnapStrength");
const pixelSnapStrengthValue = document.getElementById("pixelSnapStrengthValue");
const pixelSnapPalette = document.getElementById("pixelSnapPalette");
const pixelSnapAlpha = document.getElementById("pixelSnapAlpha");
const pixelSnapShowGrid = document.getElementById("pixelSnapShowGrid");
const pixelSnapLivePreview = document.getElementById("pixelSnapLivePreview");
const orphanCleanupEnabled = document.getElementById("orphanCleanupEnabled");
const orphanCleanupStrength = document.getElementById("orphanCleanupStrength");
const orphanCleanupStrengthValue = document.getElementById("orphanCleanupStrengthValue");
const paletteNormalizeEnabled = document.getElementById("paletteNormalizeEnabled");
const paletteNormalizeTolerance = document.getElementById("paletteNormalizeTolerance");
const paletteNormalizeToleranceValue = document.getElementById("paletteNormalizeToleranceValue");
const edgeCleanupEnabled = document.getElementById("edgeCleanupEnabled");
const edgeCleanupStrength = document.getElementById("edgeCleanupStrength");
const edgeCleanupStrengthValue = document.getElementById("edgeCleanupStrengthValue");
const alphaCleanupEnabled = document.getElementById("alphaCleanupEnabled");
const alphaCleanupThreshold = document.getElementById("alphaCleanupThreshold");
const alphaCleanupThresholdValue = document.getElementById("alphaCleanupThresholdValue");
const morphologyCleanupEnabled = document.getElementById("morphologyCleanupEnabled");
const morphologyCleanupStrength = document.getElementById("morphologyCleanupStrength");
const morphologyCleanupStrengthValue = document.getElementById("morphologyCleanupStrengthValue");
const jaggyCleanupEnabled = document.getElementById("jaggyCleanupEnabled");
const jaggyCleanupStrength = document.getElementById("jaggyCleanupStrength");
const jaggyCleanupStrengthValue = document.getElementById("jaggyCleanupStrengthValue");
const pixelSnapDetectedGrid = document.getElementById("pixelSnapDetectedGrid");
const pixelSnapConfidence = document.getElementById("pixelSnapConfidence");
const pixelSnapPaletteEstimate = document.getElementById("pixelSnapPaletteEstimate");
const pixelSnapColorDelta = document.getElementById("pixelSnapColorDelta");
const pixelSnapChangeAmount = document.getElementById("pixelSnapChangeAmount");
const pixelSnapResizeReadout = document.getElementById("pixelSnapResizeReadout");
const cleanupDiagnosticsSummary = document.getElementById("cleanupDiagnosticsSummary");
const cleanupDiagnosticsList = document.getElementById("cleanupDiagnosticsList");
const pixelReportSummary = document.getElementById("pixelReportSummary");
const pixelReportList = document.getElementById("pixelReportList");
const imageAnalysisSummary = document.getElementById("imageAnalysisSummary");
const imageAnalysisList = document.getElementById("imageAnalysisList");
const applyRecommendedPipelineBtn = document.getElementById("applyRecommendedPipelineBtn");
const applyRecommendedPipelineHint = document.getElementById("applyRecommendedPipelineHint");
const imageMetadataSummary = document.getElementById("imageMetadataSummary");
const imageMetadataList = document.getElementById("imageMetadataList");
const processingHistorySummary = document.getElementById("processingHistorySummary");
const processingHistoryList = document.getElementById("processingHistoryList");
const paletteStatisticsSummary = document.getElementById("paletteStatisticsSummary");
const paletteStatisticsList = document.getElementById("paletteStatisticsList");
const paletteTargetSlider = document.getElementById("paletteTargetSlider");
const paletteTargetValue = document.getElementById("paletteTargetValue");
const palettePreserveTransparency = document.getElementById("palettePreserveTransparency");
const paletteReductionSummary = document.getElementById("paletteReductionSummary");
const paletteTargetChips = Array.from(document.querySelectorAll("[data-palette-target]"));
const pixelSnapModeBadge = document.getElementById("pixelSnapModeBadge");
const pixelSnapEnabled = document.getElementById("pixelSnapEnabled");
const paletteEnabled = document.getElementById("paletteEnabled");
const resizeEnabled = document.getElementById("resizeEnabled");
const exportTargetSize = document.getElementById("exportTargetSize");
const exportSizeNotice = document.getElementById("exportSizeNotice");
const smartDownscaleEnabled = document.getElementById("smartDownscaleEnabled");
const pipelineManagerSummary = document.getElementById("pipelineManagerSummary");
const pipelineStageToggles = Array.from(document.querySelectorAll("[data-pipeline-toggle]"));
const comparePixelSnapEnabled = document.getElementById("comparePixelSnapEnabled");
const comparePaletteEnabled = document.getElementById("comparePaletteEnabled");
const compareResizeEnabled = document.getElementById("compareResizeEnabled");

let selectedFile = null;
let selectedFileSource = null;
let paletteSourceAsset = null;
let processedBlobUrl = null;
let paletteCanvasObjectUrl = null;
let workspace = { has_image: false };
let paletteDirty = false;
let paletteHistoryEntries = [];
let processingHistoryEntries = [];
let paletteStatisticsRequestId = 0;
let paletteCurrentMeta = { type: "—", status: "No canvas loaded", recipe: "—", resolution: "—" };
let paletteCompareZoom = 1;
let paletteCompareMode = "fit";
let paletteProcessedResolution = "—";
let paletteAutoProcessTimer = null;
let paletteIsProcessing = false;
let paletteCompareIsPanning = false;
let paletteComparePanStart = null;
let paletteCompareSpaceDown = false;
let paletteCompareViewMode = "compare";
let paletteMainViewMode = "compare";
let paletteMainCanvasMode = "fit";
let pixelSnapLastResult = null;

function isPixelSnapLivePreviewEnabled() {
  return pixelSnapLivePreview?.checked === true;
}

function getPaletteTargetValue() {
  const raw = document.getElementById("paletteColors")?.value ?? "0";
  const value = Number(raw);
  return Number.isFinite(value) ? Math.max(0, Math.min(256, value)) : 0;
}

function isColorCleanupActive() {
  return paletteEnabled?.checked !== false && getPaletteTargetValue() > 0;
}

function isPaletteNormalizeActive() {
  return paletteNormalizeEnabled?.checked === true;
}

function paletteTargetLabel(value = getPaletteTargetValue()) {
  return Number(value) > 0 ? `${Number(value)} colors` : "Original colors";
}

function setPaletteTarget(value, { schedule = true } = {}) {
  const target = Math.max(0, Math.min(256, Number(value) || 0));
  const select = document.getElementById("paletteColors");
  if (select) {
    const hasExactOption = Array.from(select.options).some((option) => Number(option.value) === target);
    if (!hasExactOption && target > 0) {
      const option = document.createElement("option");
      option.value = String(target);
      option.textContent = String(target);
      select.appendChild(option);
    }
    select.value = String(target);
  }
  if (paletteTargetSlider) paletteTargetSlider.value = String(target);
  if (paletteTargetValue) paletteTargetValue.textContent = target > 0 ? `${target} colors` : "Original";
  if (paletteEnabled && target > 0) paletteEnabled.checked = true;
  paletteTargetChips.forEach((button) => button.classList.toggle("active", Number(button.dataset.paletteTarget || 0) === target));
  updateToolToggleLabels();
  updateOperationStackLabels();
  renderPaletteStatistics();
  if (schedule) schedulePalettePreviewUpdate();
}

function syncPaletteTargetControls({ schedule = false } = {}) {
  setPaletteTarget(getPaletteTargetValue(), { schedule });
}

function syncPaletteTransparencyControls({ schedule = false } = {}) {
  if (palettePreserveTransparency && pixelSnapAlpha) {
    palettePreserveTransparency.checked = pixelSnapAlpha.checked !== false;
  }
  updateToolToggleLabels();
  if (schedule) schedulePalettePreviewUpdate();
}

function normalizePaletteAssetStatus(status = "") {
  const raw = String(status || "").trim().toLowerCase();
  if (raw === "accepted") return "Accepted";
  if (raw === "favorite" || raw === "favorited") return "Accepted";
  if (raw === "incoming" || raw === "candidate") return "Candidate";
  if (raw === "upload") return "Local Upload";
  if (raw === "clean" || raw === "saved") return "Clean";
  return status ? raw.replace(/^./, (c) => c.toUpperCase()) : "—";
}

function canOverwriteCurrentPaletteAsset() {
  return Boolean(paletteSourceAsset?.id && String(paletteSourceAsset?.status || "").toLowerCase() === "accepted");
}

function hasPaletteSaveableCanvas() {
  return Boolean(processedBlobUrl || (selectedFile && paletteDirty));
}

function updatePaletteSaveControls() {
  const hasPreview = Boolean(processedBlobUrl);
  const hasSaveable = hasPaletteSaveableCanvas();
  if (applyPalettePreviewBtn) {
    applyPalettePreviewBtn.disabled = !hasPreview;
    applyPalettePreviewBtn.title = hasPreview ? "Apply the processed preview to the current Palette Lab canvas without saving yet." : "Update the preview before applying.";
  }
  if (downloadBtn) downloadBtn.disabled = !hasSaveable;
  if (downloadPaletteResultBtn) downloadPaletteResultBtn.disabled = !hasSaveable;
  if (discardPalettePreviewBtn) discardPalettePreviewBtn.disabled = !(selectedFile || hasPreview || paletteDirty);
  if (savePaletteAsAssetBtn) {
    savePaletteAsAssetBtn.disabled = !hasSaveable;
    savePaletteAsAssetBtn.title = hasSaveable ? "Create a new accepted asset from the current Palette Lab canvas." : "Update or apply a preview before saving.";
  }
  if (savePaletteAssetBtn) {
    savePaletteAssetBtn.disabled = !hasSaveable || !canOverwriteCurrentPaletteAsset();
    if (!hasSaveable) {
      savePaletteAssetBtn.title = "Update or apply a preview before saving.";
    } else if (!paletteSourceAsset?.id) {
      savePaletteAssetBtn.title = "Local uploads must use Save As to create an accepted asset.";
    } else if (!canOverwriteCurrentPaletteAsset()) {
      savePaletteAssetBtn.title = "Generated Candidates cannot be overwritten here. Use Save As to create an accepted cleaned asset.";
    } else {
      savePaletteAssetBtn.title = "Overwrite the currently loaded accepted asset.";
    }
  }
}

function suggestedPaletteSaveAsName() {
  const sourceName = paletteSourceAsset?.name || selectedFile?.name || "palette_lab_asset";
  return String(sourceName).replace(/\.png$/i, "").replace(/[^a-zA-Z0-9_\-]+/g, "_").replace(/_+$/g, "") + "_clean";
}

function preservePaletteScroll(fn = null) {
  const x = window.scrollX;
  const y = window.scrollY;
  if (typeof fn === "function") fn();
  requestAnimationFrame(() => window.scrollTo(x, y));
  window.setTimeout(() => window.scrollTo(x, y), 80);
}

function operationFromFlags({ snap = true, palette = true, resize = true } = {}) {
  if (snap && palette && resize) return "pixel_snap";
  if (snap && palette && !resize) return "pixel_snap_only";
  if (snap && !palette && resize) return "pixel_snap_only";
  if (snap && !palette && !resize) return "pixel_snap_only";
  if (!snap && palette && resize) return "resize_palette";
  if (!snap && palette && !resize) return "palette";
  if (!snap && !palette && resize) return "resize";
  return "pixel_snap_only";
}

function syncOperationFromToolToggles() {
  const operation = document.getElementById("operation");
  if (!operation) return;
  operation.value = operationFromFlags({
    snap: pixelSnapEnabled?.checked !== false,
    palette: paletteEnabled?.checked !== false,
    resize: resizeEnabled?.checked !== false,
  });
  if (pixelSnapPalette && paletteEnabled) pixelSnapPalette.disabled = paletteEnabled.checked === false;
  if (pixelSnapPalette) pixelSnapPalette.checked = isColorCleanupActive();
  if (pixelSnapGridSize && pixelSnapEnabled) pixelSnapGridSize.disabled = pixelSnapEnabled.checked === false;
  if (pixelSnapStrength && pixelSnapEnabled) pixelSnapStrength.disabled = pixelSnapEnabled.checked === false;
}

function syncCompareOperationFromToggles() {
  const compareOperationControl = document.getElementById("compareOperation");
  if (!compareOperationControl) return;
  compareOperationControl.value = operationFromFlags({
    snap: comparePixelSnapEnabled?.checked !== false,
    palette: comparePaletteEnabled?.checked !== false,
    resize: compareResizeEnabled?.checked !== false,
  });
}

function getAutoPixelSnapSize(width, height) {
  const smallest = Math.max(1, Math.min(Number(width) || 1, Number(height) || 1));
  if (smallest >= 1024) return 32;
  if (smallest >= 512) return 16;
  if (smallest >= 256) return 8;
  if (smallest >= 128) return 4;
  return 2;
}

function getCurrentPixelSnapSize() {
  const selected = Number(pixelSnapGridSize?.value || comparePixelSize?.value || document.getElementById("pixelSize")?.value || 0);
  const sourceWidth = originalPreview?.naturalWidth || selectedFile?.width || 512;
  const sourceHeight = originalPreview?.naturalHeight || selectedFile?.height || 512;
  return selected > 0 ? selected : getAutoPixelSnapSize(sourceWidth, sourceHeight);
}

function getPixelSnapConfidence(width, height, gridSize) {
  const w = Number(width) || 1;
  const h = Number(height) || 1;
  const grid = Math.max(1, Number(gridSize) || 1);
  const divisibility = ((w % grid === 0 ? 1 : 0.72) + (h % grid === 0 ? 1 : 0.72)) / 2;
  const cellCount = (w / grid) * (h / grid);
  const densityScore = cellCount >= 64 && cellCount <= 16384 ? 1 : 0.78;
  return Math.round(Math.max(35, Math.min(98, divisibility * densityScore * 94)));
}

function ensureGridOverlay(host) {
  if (!host) return null;
  let overlay = host.querySelector(":scope > .pf-grid-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "pf-grid-overlay";
    host.appendChild(overlay);
  }
  return overlay;
}

function getContainedImageRect(img, host) {
  const hostRect = host.getBoundingClientRect();
  const imgRect = img.getBoundingClientRect();
  const naturalWidth = img.naturalWidth || 1;
  const naturalHeight = img.naturalHeight || 1;
  const boxWidth = Math.max(1, imgRect.width || hostRect.width);
  const boxHeight = Math.max(1, imgRect.height || hostRect.height);
  const scale = Math.min(boxWidth / naturalWidth, boxHeight / naturalHeight);
  const width = Math.max(1, naturalWidth * scale);
  const height = Math.max(1, naturalHeight * scale);
  const left = (imgRect.left - hostRect.left) + (boxWidth - width) / 2;
  const top = (imgRect.top - hostRect.top) + (boxHeight - height) / 2;
  return { left, top, width, height };
}

function updateGridOverlayForImage(img, host, gridSize) {
  const overlay = ensureGridOverlay(host);
  if (!overlay || !img || !img.getAttribute("src") || !img.naturalWidth || !img.naturalHeight) {
    if (overlay) overlay.classList.remove("active");
    return;
  }
  if (!pixelSnapShowGrid?.checked) {
    overlay.classList.remove("active");
    return;
  }

  const grid = Math.max(1, Number(gridSize) || 1);
  const hostRect = host.getBoundingClientRect();
  const imgRect = img.getBoundingClientRect();

  // Compare modal uses a real zoomable canvas. Lock the grid to the canvas itself
  // instead of re-measuring the image every frame. This keeps the overlay static
  // while zooming/panning and prevents it from drifting when the before/after
  // slider is moved.
  if (host === compareModalCanvas || host?.classList?.contains("palette-compare-modal-canvas")) {
    const width = Math.max(1, hostRect.width);
    const height = Math.max(1, hostRect.height);
    const columns = Math.max(1, img.naturalWidth / grid);
    const rows = Math.max(1, img.naturalHeight / grid);
    overlay.style.left = "0px";
    overlay.style.top = "0px";
    overlay.style.width = `${width}px`;
    overlay.style.height = `${height}px`;
    overlay.style.backgroundSize = `${Math.max(2, width / columns)}px ${Math.max(2, height / rows)}px`;
    overlay.classList.add("active", "locked");
    return;
  }

  const contentRect = getContainedImageRect(img, host);
  const width = Math.max(1, contentRect.width);
  const height = Math.max(1, contentRect.height);
  const columns = Math.max(1, img.naturalWidth / grid);
  const rows = Math.max(1, img.naturalHeight / grid);

  overlay.style.left = `${contentRect.left + host.scrollLeft}px`;
  overlay.style.top = `${contentRect.top + host.scrollTop}px`;
  overlay.style.width = `${width}px`;
  overlay.style.height = `${height}px`;
  overlay.style.backgroundSize = `${Math.max(2, width / columns)}px ${Math.max(2, height / rows)}px`;
  overlay.classList.add("active");
  overlay.classList.remove("locked");
}

function updatePixelSnapAnalysis() {
  const width = originalPreview?.naturalWidth || 0;
  const height = originalPreview?.naturalHeight || 0;
  const estimatedGridSize = getCurrentPixelSnapSize();
  const estimatedConfidence = width && height ? getPixelSnapConfidence(width, height, estimatedGridSize) : 0;
  const paletteTarget = getPaletteTargetValue();
  const hasProcessedReadout = Boolean(pixelSnapLastResult?.grid && processedBlobUrl);
  const gridSize = hasProcessedReadout ? Number(pixelSnapLastResult.grid) : estimatedGridSize;
  const confidence = hasProcessedReadout ? Number(pixelSnapLastResult.confidence || estimatedConfidence) : estimatedConfidence;
  const paletteLabel = hasProcessedReadout
    ? (Number(pixelSnapLastResult.paletteTarget || 0) > 0 ? `${Number(pixelSnapLastResult.paletteTarget)} colors` : "Original colors")
    : (isColorCleanupActive() ? `${paletteTarget} colors` : "Original colors");
  const suffix = hasProcessedReadout ? "" : " est.";
  if (pixelSnapDetectedGrid) pixelSnapDetectedGrid.textContent = width && height ? `${gridSize}px${suffix}` : "—";
  if (pixelSnapConfidence) pixelSnapConfidence.textContent = width && height ? `${confidence}%${suffix}` : "—";
  if (pixelSnapPaletteEstimate) pixelSnapPaletteEstimate.textContent = paletteLabel;
  if (pixelSnapColorDelta) {
    const sourceColors = Number(pixelSnapLastResult?.sourceColors || 0);
    const outputColors = Number(pixelSnapLastResult?.outputColors || 0);
    pixelSnapColorDelta.textContent = hasProcessedReadout && sourceColors && outputColors ? `${sourceColors} → ${outputColors}` : "—";
  }
  if (pixelSnapChangeAmount) {
    const percent = pixelSnapLastResult?.changedPercent;
    pixelSnapChangeAmount.textContent = hasProcessedReadout && percent !== undefined && percent !== null ? `${percent}%` : "—";
  }
  if (pixelSnapResizeReadout) {
    const scale = hasProcessedReadout ? Number(pixelSnapLastResult?.resizeScale || 1) : Number(document.getElementById("resizeScale")?.value || 1);
    pixelSnapResizeReadout.textContent = `${scale}x`;
  }
  if (pixelSnapModeBadge) pixelSnapModeBadge.textContent = width && height ? `${gridSize}px · ${confidence}%${suffix}` : (gridSize ? `${gridSize}px grid` : "Auto grid");

  updatePixelSnapGridOverlays();
}

function clearPixelSnapProcessedReadout() {
  pixelSnapLastResult = null;
  updatePixelSnapAnalysis();
  renderImageAnalysis();
  renderImageMetadata();
}

function updatePixelSnapGridOverlays() {
  const gridSize = getCurrentPixelSnapSize();
  document.querySelectorAll(".pf-grid-overlay").forEach((node) => node.classList.remove("active"));

  // Keep grids out of the main Original/Processed cards. They are review aids only,
  // so they appear in the compare strip and full compare viewer when enabled.
  updateGridOverlayForImage(compareOriginalPreview, compareOriginalPreview?.closest(".palette-compare-stage"), gridSize);
  updateGridOverlayForImage(compareModalOriginal, compareModalCanvas, gridSize);
}


function setPaletteDirty(isDirty, label = null) {
  paletteDirty = Boolean(isDirty);
  if (!paletteDirtyState) return;
  paletteDirtyState.classList.toggle("modified", paletteDirty);
  paletteDirtyState.classList.toggle("saved", !paletteDirty);
  paletteDirtyState.textContent = label || (paletteDirty ? "● Modified Preview" : "● Clean");
}

function setPaletteFooterStatus(message = "Palette Lab ready.") {
  if (paletteStatusFooter) paletteStatusFooter.textContent = message;
}

function updatePaletteMeta(meta = {}) {
  paletteCurrentMeta = { ...paletteCurrentMeta, ...meta };
  if (!paletteWorkspaceMeta) return;
  const rows = [
    ["Type", paletteCurrentMeta.type || "—"],
    ["Status", paletteCurrentMeta.status || "—"],
    ["Recipe", paletteCurrentMeta.recipe || "—"],
    ["Resolution", paletteCurrentMeta.resolution || "—"],
  ];
  paletteWorkspaceMeta.innerHTML = rows.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
}

function addPaletteHistory(label, detail = "") {
  const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  paletteHistoryEntries.unshift({ label, detail, stamp });
  paletteHistoryEntries = paletteHistoryEntries.slice(0, 8);
  renderPaletteHistory();
}

function renderPaletteHistory() {
  if (!paletteHistory) return;
  if (!paletteHistoryEntries.length) {
    paletteHistory.innerHTML = "<li>No asset loaded.</li>";
    return;
  }
  paletteHistory.innerHTML = paletteHistoryEntries
    .map((entry) => `<li><strong>${escapeHtml(entry.label)}</strong><span>${escapeHtml(entry.detail || entry.stamp)}</span></li>`)
    .join("");
}


function boolFlag(value) {
  return String(value ?? "").toLowerCase() === "true";
}

function smartDownscaleState(result = pixelSnapLastResult || {}) {
  const requested = boolFlag(result.smartDownscaleRequested) || (result.smartDownscaleRequested == null && smartDownscaleEnabled?.checked === true);
  const applied = boolFlag(result.smartDownscale) || boolFlag(result.smartDownscaleApplied);
  const grid = result.smartDownscaleGrid || result.grid || "—";
  let detail = "off";
  if (requested && applied) detail = `on · source ÷ ${grid} grid`;
  else if (requested) detail = "on · no downscale applied";
  return { requested, applied, grid, detail };
}

function cleanupStageMessage({ name, changed, enabled, inactive = "Off", active = "Enabled", zero = "No cleanup needed", detail = "" }) {
  const amount = Number(changed || 0);
  if (!enabled) return inactive;
  if (amount <= 0) return detail ? `${active} · ${zero} · ${detail}` : `${active} · ${zero}`;
  return detail ? `${active} · ${detail}` : active;
}


function buildImageAnalysis(result = pixelSnapLastResult || {}) {
  const num = (value) => {
    const parsed = Number(value || 0);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const grid = num(result.grid);
  const confidence = num(result.confidence);
  const sourceColors = num(result.sourceColors);
  const outputColors = num(result.outputColors);
  const sourceAlpha = num(result.sourceTransparentPercent);
  const sourceWidth = num(result.sourceWidth);
  const sourceHeight = num(result.sourceHeight);
  const outputWidth = num(result.outputWidth);
  const outputHeight = num(result.outputHeight);
  const changedPercent = num(result.changedPercent);
  const resizeScaleValue = Number(result.resizeScale || document.getElementById("resizeScale")?.value || 1) || 1;
  const exportTargetValue = result.exportTargetSize && result.exportTargetSize !== "scale" ? Number(result.exportTargetSize) : 0;
  const finalColors = outputColors || sourceColors;
  const square = sourceWidth > 0 && sourceWidth === sourceHeight;
  const largeSource = Math.max(sourceWidth, sourceHeight) >= 512;
  const likelyPixelArt = grid >= 2 && confidence >= 70;
  const likelyUpscaled = likelyPixelArt && largeSource;
  const highPalette = sourceColors > 256;
  const cleanPalette = finalColors > 0 && finalColors <= 256;
  const transparent = sourceAlpha > 0;
  const exactTargetMode = exportTargetValue > 0;
  const targetExport = exactTargetMode ? `${exportTargetValue}×${exportTargetValue}` : `Output scale ${resizeScaleValue}x`;
  const outputShrunk = sourceWidth && outputWidth && outputWidth < sourceWidth;
  const exactTargetShrinks = exactTargetMode && sourceWidth && exportTargetValue < Math.max(sourceWidth, sourceHeight);
  const exactTargetUpscales = exactTargetMode && sourceWidth && exportTargetValue > Math.max(sourceWidth, sourceHeight);
  const confidenceScore = Math.max(0, Math.min(100, Math.round(
    (likelyPixelArt ? 32 : 12) +
    (confidence ? Math.min(32, confidence * 0.32) : 0) +
    (cleanPalette ? 18 : highPalette ? 10 : 14) +
    (changedPercent > 0 && changedPercent < 85 ? 8 : changedPercent >= 85 ? 5 : 4) +
    (square ? 5 : 2) +
    (transparent ? 3 : 1)
  )));

  const detected = [
    { label: likelyPixelArt ? "Pixel-art grid detected" : "Pixel-art grid uncertain", detail: grid ? `${grid}px grid · ${confidence || 0}% confidence` : "No grid locked yet", good: likelyPixelArt },
    { label: likelyUpscaled ? "Likely upscaled source" : "Source scale looks moderate", detail: sourceWidth && sourceHeight ? `${sourceWidth}×${sourceHeight}` : "No source size yet", good: likelyUpscaled },
    { label: highPalette ? "High/noisy palette" : "Palette already controlled", detail: sourceColors ? `${sourceColors.toLocaleString()} source colors` : "No palette count yet", good: highPalette },
    { label: transparent ? "Transparency present" : "No transparency detected", detail: `${sourceAlpha || 0}% transparent pixels`, good: transparent },
    { label: exactTargetMode ? "Exact target export" : "Output-scale export", detail: targetExport, good: !exactTargetShrinks },
  ];

  const recommendations = [];
  const suggestions = [];
  const skips = [];
  const warnings = [];
  const addRec = (name, detail) => recommendations.push({ name, detail });
  const addSuggest = (name, detail) => suggestions.push({ name, detail });
  const addSkip = (name, detail) => skips.push({ name, detail });
  const addWarn = (label, detail) => warnings.push({ label, detail });

  if (grid >= 2 && confidence >= 65) addSuggest("Smart Downscale", `Detected ${grid}px grid; useful for normalization, but kept manual so export size never changes unexpectedly.`);
  else addSkip("Smart Downscale", "Grid confidence is low or already 1×.");

  if (grid >= 2) addRec("Pixel Snap", "Lock pixels to the detected grid.");
  else addSkip("Pixel Snap", "No clear pixel grid detected yet.");

  if (highPalette) addRec("Palette Normalize", "Merge near-duplicate AI colors.");
  else addSkip("Palette Normalize", "Palette count is already manageable.");

  if (transparent) addRec("Alpha Cleanup", "Inspect transparent edges/fringe before export.");
  else addSkip("Alpha Cleanup", "Image has no transparent fringe to clean.");

  if (likelyUpscaled || highPalette) addRec("Edge Cleanup", "Useful for upscaled or noisy AI pixel edges.");
  else addSkip("Edge Cleanup", "No obvious edge repair signal from metadata.");

  if (sourceColors > 1000 && confidence >= 60) addSuggest("Morphology / Jaggy", "Manual pass; use low strength and compare if specks or stair steps are visible.");
  else addSkip("Morphology / Jaggy", "Only needed when specks, pinholes, or stair steps are visible.");

  if (exactTargetShrinks) {
    addWarn("Target Resolution will shrink the asset", `${sourceWidth}×${sourceHeight} is exporting as ${exportTargetValue}×${exportTargetValue}. Use Output Scale if you want to preserve processed size.`);
  } else if (exactTargetUpscales) {
    addWarn("Target Resolution will upscale the asset", `${sourceWidth}×${sourceHeight} is exporting as ${exportTargetValue}×${exportTargetValue}. Nearest-neighbor keeps pixels crisp.`);
  }
  if (outputShrunk && !exactTargetShrinks) {
    addWarn("Working size changed", `${sourceWidth}×${sourceHeight} processed to ${outputWidth}×${outputHeight}. This may be from Smart Downscale or Output Scale settings.`);
  }

  return {
    detected,
    recommendations,
    suggestions,
    skips,
    warnings,
    confidenceScore,
    likelyPixelArt,
    likelyUpscaled,
    highPalette,
    transparent,
    exactTargetMode,
    exactTargetShrinks,
  };
}
function buildAutoPipelinePlan(result = pixelSnapLastResult || {}) {
  const num = (value) => {
    const parsed = Number(value || 0);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const grid = num(result.grid);
  const confidence = num(result.confidence);
  const sourceColors = num(result.sourceColors);
  const sourceAlpha = num(result.sourceTransparentPercent);
  const sourceWidth = num(result.sourceWidth);
  const sourceHeight = num(result.sourceHeight);
  const largeSource = Math.max(sourceWidth, sourceHeight) >= 512;
  const highPalette = sourceColors > 256;
  const clearGrid = grid >= 2 && confidence >= 65;
  const likelyUpscaled = clearGrid && largeSource;
  const transparent = sourceAlpha > 0;

  return {
    smart: false,
    smartSuggested: clearGrid,
    snap: grid >= 2,
    palette: true,
    normalize: highPalette,
    alpha: transparent,
    orphan: false,
    edge: likelyUpscaled || highPalette,
    morphology: false,
    jaggy: false,
    resize: false,
    preserveExportControls: true,
    notes: [
      clearGrid ? `Smart Downscale: suggested for ${grid}px grid at ${confidence || 0}% confidence, but left manual so size does not change unexpectedly.` : "Smart Downscale: skipped until grid confidence is stronger.",
      highPalette ? `Palette Normalize: ${sourceColors.toLocaleString()} source colors suggests AI color noise.` : "Palette Normalize: skipped because palette count looks controlled.",
      transparent ? "Alpha Cleanup: enabled because transparent pixels were detected." : "Alpha Cleanup: skipped because no transparent fringe was detected.",
      (likelyUpscaled || highPalette) ? "Edge Cleanup: enabled as a conservative upscaled/noisy-edge repair." : "Edge Cleanup: skipped until visible edge artifacts are detected.",
      "Target Resolution and Output Scale are never changed by Auto Pipeline.",
      "Morphology, Jaggy, Smart Downscale, and Orphan Cleanup stay manual by default to avoid over-cleaning or resizing detailed art.",
    ],
  };
}
function setCheckboxValue(control, checked) {
  if (!control) return;
  control.checked = Boolean(checked);
}

function applyRecommendedPipeline() {
  const result = pixelSnapLastResult || {};
  if (!result.processingMs) {
    setStatus("Process an image first so PixelFactory can recommend a pipeline.");
    return;
  }
  const plan = buildAutoPipelinePlan(result);

  // Smart Downscale is intentionally manual because it can change the working resolution.
  // Auto Pipeline never changes Output Scale or Target Resolution.
  setCheckboxValue(pixelSnapEnabled, plan.snap);
  setCheckboxValue(paletteEnabled, plan.palette);
  setCheckboxValue(paletteNormalizeEnabled, plan.normalize);
  setCheckboxValue(alphaCleanupEnabled, plan.alpha);
  // Orphan, Morphology, Jaggy, Smart Downscale, and export sizing stay manual.
  setCheckboxValue(edgeCleanupEnabled, plan.edge);

  if (pixelSnapGridSize) pixelSnapGridSize.value = "0";
  if (paletteNormalizeTolerance && plan.normalize && Number(paletteNormalizeTolerance.value || 0) < 8) paletteNormalizeTolerance.value = "8";
  if (edgeCleanupStrength && plan.edge && Number(edgeCleanupStrength.value || 0) <= 0) edgeCleanupStrength.value = "0.30";
  if (alphaCleanupThreshold && plan.alpha && Number(alphaCleanupThreshold.value || 0) <= 0) alphaCleanupThreshold.value = "12";

  updateToolToggleLabels();
  updateOperationStackLabels();
  syncOperationFromToolToggles();
  renderImageAnalysis();
  renderCleanupDiagnostics();
  renderPixelReport();
  setStatus("Safe recommendations applied. Smart Downscale and export size stayed manual.");
  schedulePalettePreviewUpdate();
}

function renderImageAnalysis() {
  if (!imageAnalysisList) return;
  const result = pixelSnapLastResult || {};
  if (!result.processingMs) {
    if (imageAnalysisSummary) imageAnalysisSummary.textContent = "Waiting for process";
    if (applyRecommendedPipelineBtn) applyRecommendedPipelineBtn.disabled = true;
    if (applyRecommendedPipelineHint) applyRecommendedPipelineHint.textContent = "Process an image first.";
    imageAnalysisList.innerHTML = '<div class="cleanup-diagnostic-empty">Process an image to get pipeline recommendations.</div>';
    return;
  }
  const analysis = buildImageAnalysis(result);
  const autoPlan = buildAutoPipelinePlan(result);
  const plannedStages = [autoPlan.snap, autoPlan.palette, autoPlan.normalize, autoPlan.alpha, autoPlan.edge].filter(Boolean).length;
  if (applyRecommendedPipelineBtn) applyRecommendedPipelineBtn.disabled = false;
  if (applyRecommendedPipelineHint) applyRecommendedPipelineHint.textContent = `${plannedStages} safe stages · size controls stay manual`;
  const badges = [];
  if (analysis.likelyPixelArt) badges.push("Pixel art");
  if (analysis.likelyUpscaled) badges.push("Upscaled source");
  if (analysis.highPalette) badges.push("Palette noise");
  if (analysis.transparent) badges.push("Transparency");
  if (!badges.length) badges.push("Manual review");

  imageAnalysisList.innerHTML = `
    <div class="image-analysis-score-card">
      <div><span>Analysis Confidence</span><strong>${analysis.confidenceScore}%</strong></div>
      <p>${escapeHtml(badges.join(" · "))}</p>
    </div>
    <div class="auto-pipeline-preview">
      <strong>Safe Auto Pipeline Preview</strong>
      <span>${escapeHtml(autoPlan.notes.join(" "))}</span>
    </div>
    ${analysis.warnings.length ? `<div class="export-safety-warning"><strong>Export Size Notice</strong>${analysis.warnings.map((item) => `<span>⚠ ${escapeHtml(item.label)} — ${escapeHtml(item.detail)}</span>`).join("")}</div>` : ""}
    <div class="image-analysis-columns">
      <div class="image-analysis-section">
        <h3>Detected</h3>
        ${analysis.detected.map((item) => `<div class="analysis-row ${item.good ? "good" : "neutral"}"><strong>${item.good ? "✓" : "○"} ${escapeHtml(item.label)}</strong><span>${escapeHtml(item.detail)}</span></div>`).join("")}
      </div>
      <div class="image-analysis-section">
        <h3>Safe Recommendations</h3>
        ${analysis.recommendations.map((item) => `<div class="analysis-row good"><strong>✓ ${escapeHtml(item.name)}</strong><span>${escapeHtml(item.detail)}</span></div>`).join("") || '<div class="analysis-row neutral"><strong>○ Manual review</strong><span>No automatic recommendation yet.</span></div>'}
      </div>
      <div class="image-analysis-section">
        <h3>Suggested / Manual</h3>
        ${analysis.suggestions.map((item) => `<div class="analysis-row suggested"><strong>◇ ${escapeHtml(item.name)}</strong><span>${escapeHtml(item.detail)}</span></div>`).join("")}
        ${analysis.skips.map((item) => `<div class="analysis-row muted"><strong>○ ${escapeHtml(item.name)}</strong><span>${escapeHtml(item.detail)}</span></div>`).join("")}
      </div>
    </div>`;

  if (imageAnalysisSummary) {
    imageAnalysisSummary.textContent = `${analysis.confidenceScore}% confidence · ${analysis.recommendations.length} safe recommendations`;
  }
}

function renderCleanupDiagnostics() {
  if (!cleanupDiagnosticsList) return;
  const result = pixelSnapLastResult || {};
  if (!result.processingMs) {
    if (cleanupDiagnosticsSummary) cleanupDiagnosticsSummary.textContent = "Waiting for first update";
    cleanupDiagnosticsList.innerHTML = '<div class="cleanup-diagnostic-empty">Process an image to see exact cleanup results.</div>';
    return;
  }

  const num = (value) => {
    const parsed = Number(value || 0);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const fmt = (value) => num(value).toLocaleString();
  const resizePixels = num(result.stepResizePixels);
  const smart = smartDownscaleState(result);
  const rows = [
    {
      name: "Smart Downscale",
      changed: fmt(result.stepSmartDownscale),
      raw: num(result.stepSmartDownscale),
      status: smart.requested ? (smart.applied ? `Applied · source ÷ ${smart.grid} grid` : "Enabled · already at detected grid") : "Off",
      kind: smart.applied ? "changed" : smart.requested ? "noop" : "off",
    },
    {
      name: "Pixel Snap",
      changed: fmt(result.stepPixelSnap),
      raw: num(result.stepPixelSnap),
      status: cleanupStageMessage({ changed: result.stepPixelSnap, enabled: pixelSnapEnabled?.checked !== false, active: "Enabled", zero: "Grid already stable", detail: `grid ${result.grid || "—"} · ${result.confidence || "—"}% confidence` }),
    },
    {
      name: "Palette Quantize",
      changed: fmt(result.stepPaletteQuantize),
      raw: num(result.stepPaletteQuantize),
      status: cleanupStageMessage({ changed: result.stepPaletteQuantize, enabled: isColorCleanupActive(), active: "Enabled", zero: "Original colors kept", detail: result.paletteTarget && Number(result.paletteTarget) > 0 ? `${result.paletteTarget} target colors` : "original color count" }),
    },
    {
      name: "Palette Normalize",
      changed: fmt(result.stepPaletteNormalize),
      raw: num(result.stepPaletteNormalize),
      status: cleanupStageMessage({ changed: result.stepPaletteNormalize, enabled: result.paletteNormalize === "true", active: "Enabled", zero: "No near-duplicate colors detected", detail: `tolerance ${result.normalizeTolerance || "—"}` }),
    },
    {
      name: "Orphan Cleanup",
      changed: fmt(result.stepOrphanCleanup),
      raw: num(result.stepOrphanCleanup),
      status: cleanupStageMessage({ changed: result.stepOrphanCleanup, enabled: orphanCleanupEnabled?.checked === true, zero: "No isolated specks detected" }),
    },
    {
      name: "Edge Cleanup",
      changed: fmt(result.stepEdgeCleanup),
      raw: num(result.stepEdgeCleanup),
      status: cleanupStageMessage({ changed: result.stepEdgeCleanup, enabled: result.edgeCleanup === "true", zero: "No edge artifacts detected", detail: `strength ${result.edgeStrength || 0}%` }),
    },
    {
      name: "Morphology Cleanup",
      changed: fmt(result.stepMorphologyCleanup),
      raw: num(result.stepMorphologyCleanup),
      status: cleanupStageMessage({ changed: result.stepMorphologyCleanup, enabled: result.morphologyCleanup === "true", zero: "No specks or pinholes detected", detail: `strength ${result.morphologyStrength || 0}%` }),
    },
    {
      name: "Jaggy Cleanup",
      changed: fmt(result.stepJaggyCleanup),
      raw: num(result.stepJaggyCleanup),
      status: cleanupStageMessage({ changed: result.stepJaggyCleanup, enabled: result.jaggyCleanup === "true", zero: "No stair-step repairs needed", detail: `strength ${result.jaggyStrength || 0}%` }),
    },
    {
      name: "Alpha Preserve",
      changed: fmt(result.stepAlphaPreserve),
      raw: num(result.stepAlphaPreserve),
      status: pixelSnapAlpha?.checked === false ? "Off" : (num(result.stepAlphaPreserve) ? "Applied · source alpha restored" : "Enabled · alpha already matched"),
    },
    {
      name: "Alpha Cleanup",
      changed: fmt(result.stepAlphaCleanup),
      raw: num(result.stepAlphaCleanup),
      status: cleanupStageMessage({ changed: result.stepAlphaCleanup, enabled: result.alphaCleanup === "true", zero: "No transparent fringe detected", detail: `threshold ${result.alphaThreshold || 0}` }),
    },
    {
      name: "Resize",
      changed: resizePixels > 0 ? `+${fmt(resizePixels)}` : "0",
      raw: resizePixels,
      status: resizeEnabled?.checked !== false ? (result.exportTargetSize && result.exportTargetSize !== "scale" ? `target resolution ${result.exportTargetSize}×${result.exportTargetSize} nearest-neighbor` : `${result.resizeScale || 1}x nearest-neighbor`) : "Off",
      kind: resizePixels > 0 ? "changed" : "noop",
    },
  ];
  cleanupDiagnosticsList.innerHTML = rows.map((row) => {
    const kind = row.kind || (row.status === "Off" ? "off" : row.raw > 0 ? "changed" : "noop");
    return `
    <div class="cleanup-diagnostic-row ${kind}">
      <strong>${escapeHtml(row.name)}</strong>
      <span>${escapeHtml(row.changed)} px</span>
      <em>${escapeHtml(row.status)}</em>
    </div>`;
  }).join("");
  if (cleanupDiagnosticsSummary) {
    const changed = result.changedPercent ? `${result.changedPercent}% changed` : "0% changed";
    const noops = rows.filter((row) => row.kind !== "off" && row.raw <= 0).length;
    cleanupDiagnosticsSummary.textContent = `${changed} · ${result.processingMs} ms · ${noops} no-op stages`;
  }
}

function renderPixelReport() {
  if (!pixelReportList) return;
  const result = pixelSnapLastResult || {};
  if (!result.processingMs) {
    if (pixelReportSummary) pixelReportSummary.textContent = "Waiting for process";
    pixelReportList.innerHTML = '<div class="cleanup-diagnostic-empty">Process an image to generate a unified report.</div>';
    return;
  }

  const num = (value) => {
    const parsed = Number(value || 0);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const fmt = (value) => num(value).toLocaleString();
  const pct = (value) => value || "0";
  const sourceWidth = num(result.sourceWidth || originalPreview?.naturalWidth || 0);
  const sourceHeight = num(result.sourceHeight || originalPreview?.naturalHeight || 0);
  const outputWidth = num(result.outputWidth || processedPreview?.naturalWidth || 0);
  const outputHeight = num(result.outputHeight || processedPreview?.naturalHeight || 0);
  const grid = num(result.grid || getCurrentPixelSnapSize() || 1);
  const spriteWidth = num(result.estimatedSpriteWidth || (sourceWidth && grid ? Math.max(1, Math.round(sourceWidth / grid)) : 0));
  const spriteHeight = num(result.estimatedSpriteHeight || (sourceHeight && grid ? Math.max(1, Math.round(sourceHeight / grid)) : 0));
  const sourceSize = sourceWidth && sourceHeight ? `${sourceWidth} × ${sourceHeight}` : "—";
  const outputSize = outputWidth && outputHeight ? `${outputWidth} × ${outputHeight}` : "—";
  const spriteSize = spriteWidth && spriteHeight ? `${spriteWidth} × ${spriteHeight}` : "—";
  const pipeline = [
    ["Smart Downscale", smartDownscaleState(result).requested, smartDownscaleState(result).applied ? `${fmt(result.stepSmartDownscale)} px` : smartDownscaleState(result).detail],
    ["Pixel Snap", pixelSnapEnabled?.checked !== false, `${fmt(result.stepPixelSnap)} px`],
    ["Palette Quantize", isColorCleanupActive(), result.paletteTarget && Number(result.paletteTarget) > 0 ? `${result.paletteTarget} colors` : "original"],
    ["Palette Normalize", result.paletteNormalize === "true", `${fmt(result.stepPaletteNormalize)} px`],
    ["Orphan Cleanup", orphanCleanupEnabled?.checked === true, `${fmt(result.stepOrphanCleanup)} px`],
    ["Edge Cleanup", result.edgeCleanup === "true", `${fmt(result.stepEdgeCleanup)} px`],
    ["Morphology Cleanup", result.morphologyCleanup === "true", `${fmt(result.stepMorphologyCleanup)} px`],
    ["Jaggy Cleanup", result.jaggyCleanup === "true", `${fmt(result.stepJaggyCleanup)} px`],
    ["Alpha Preserve", pixelSnapAlpha?.checked !== false, `${fmt(result.stepAlphaPreserve)} px`],
    ["Alpha Cleanup", result.alphaCleanup === "true", `${fmt(result.stepAlphaCleanup)} px`],
    ["Resize", resizeEnabled?.checked !== false, result.exportTargetSize && result.exportTargetSize !== "scale" ? `Target ${result.exportTargetSize}×${result.exportTargetSize}` : `Scale ${result.resizeScale || 1}x`],
  ];

  const sections = [
    ["Image", [
      ["Source", sourceSize],
      ["Output", outputSize],
      ["Export Mode", result.exportTargetSize && result.exportTargetSize !== "scale" ? `Target Resolution ${result.exportTargetSize}×${result.exportTargetSize}` : `Output Scale ${result.resizeScale || 1}x`],
      ["Sprite Estimate", spriteSize],
    ]],
    ["Detection", [
      ["Grid", grid ? `${grid}px` : "—"],
      ["Confidence", result.confidence ? `${result.confidence}%` : "—"],
    ]],
    ["Palette", [
      ["Original", result.sourceColors ? fmt(result.sourceColors) : "—"],
      ["Final", result.outputColors ? fmt(result.outputColors) : "—"],
      ["Target", result.paletteTarget && Number(result.paletteTarget) > 0 ? result.paletteTarget : "Original colors"],
    ]],
    ["Cleanup", [
      ["Pixels Changed", result.changedPixels ? `${fmt(result.changedPixels)} px` : "—"],
      ["Changed", `${pct(result.changedPercent)}%`],
      ["Transparency", result.outputTransparentPercent ? `${result.sourceTransparentPercent || "0"}% → ${result.outputTransparentPercent}%` : `${result.sourceTransparentPercent || "0"}%`],
    ]],
    ["Performance", [
      ["Processing Time", `${result.processingMs} ms`],
    ]],
  ];

  pixelReportList.innerHTML = `
    <div class="pixel-report-grid">
      ${sections.map(([title, rows]) => `
        <div class="pixel-report-section">
          <h3>${escapeHtml(title)}</h3>
          ${rows.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}
        </div>`).join("")}
    </div>
    <div class="pixel-report-pipeline">
      ${pipeline.map(([name, on, detail]) => `<span class="${on ? "active" : "inactive"}">${on ? "✓" : "○"} ${escapeHtml(name)} <em>${escapeHtml(detail)}</em></span>`).join("")}
    </div>`;

  if (pixelReportSummary) {
    pixelReportSummary.textContent = `${sourceSize} → ${outputSize} · ${pct(result.changedPercent)}% changed · ${result.processingMs} ms`;
  }
}


function addProcessingHistoryEntry() {
  if (!processingHistoryList || !pixelSnapLastResult?.processingMs) return;
  const result = pixelSnapLastResult || {};
  const sourceWidth = Number(result.sourceWidth || originalPreview?.naturalWidth || 0);
  const sourceHeight = Number(result.sourceHeight || originalPreview?.naturalHeight || 0);
  const outputWidth = Number(result.outputWidth || processedPreview?.naturalWidth || 0);
  const outputHeight = Number(result.outputHeight || processedPreview?.naturalHeight || 0);
  const sourceColors = Number(result.sourceColors || 0);
  const outputColors = Number(result.outputColors || 0);
  const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  processingHistoryEntries.unshift({
    stamp,
    filename: selectedFile?.name || "workspace.png",
    sourceSize: sourceWidth && sourceHeight ? `${sourceWidth} × ${sourceHeight}` : "—",
    outputSize: outputWidth && outputHeight ? `${outputWidth} × ${outputHeight}` : "—",
    colors: sourceColors && outputColors ? `${sourceColors} → ${outputColors}` : (outputColors ? `${outputColors}` : "—"),
    changed: result.changedPercent ? `${result.changedPercent}%` : "0%",
    ms: result.processingMs || "—",
  });
  processingHistoryEntries = processingHistoryEntries.slice(0, 8);
  renderProcessingHistory();
}

function renderProcessingHistory() {
  if (!processingHistoryList) return;
  if (!processingHistoryEntries.length) {
    if (processingHistorySummary) processingHistorySummary.textContent = "Waiting for first process";
    processingHistoryList.innerHTML = '<div class="cleanup-diagnostic-empty">Process an image to build a local session history.</div>';
    return;
  }
  processingHistoryList.innerHTML = processingHistoryEntries.map((entry) => `
    <div class="processing-history-row">
      <strong>${escapeHtml(entry.stamp)}</strong>
      <span>${escapeHtml(entry.filename)}</span>
      <em>${escapeHtml(entry.sourceSize)} → ${escapeHtml(entry.outputSize)} · ${escapeHtml(entry.colors)} colors · ${escapeHtml(entry.changed)} changed · ${escapeHtml(entry.ms)} ms</em>
    </div>`).join("");
  if (processingHistorySummary) {
    const latest = processingHistoryEntries[0];
    processingHistorySummary.textContent = `${processingHistoryEntries.length} saved · Last ${latest.ms} ms`;
  }
}

function renderImageMetadata() {
  if (!imageMetadataList) return;
  const result = pixelSnapLastResult || {};
  const sourceWidth = Number(result.sourceWidth || originalPreview?.naturalWidth || 0);
  const sourceHeight = Number(result.sourceHeight || originalPreview?.naturalHeight || 0);
  const outputWidth = Number(result.outputWidth || processedPreview?.naturalWidth || 0);
  const outputHeight = Number(result.outputHeight || processedPreview?.naturalHeight || 0);
  if (!sourceWidth || !sourceHeight) {
    if (imageMetadataSummary) imageMetadataSummary.textContent = "Waiting for image";
    imageMetadataList.innerHTML = '<div class="cleanup-diagnostic-empty">Load or process an image to inspect size, palette, alpha, and estimated sprite resolution.</div>';
    return;
  }

  const grid = Number(result.grid || getCurrentPixelSnapSize() || 1);
  const estimatedSpriteWidth = Number(result.estimatedSpriteWidth || Math.max(1, Math.round(sourceWidth / Math.max(1, grid))));
  const estimatedSpriteHeight = Number(result.estimatedSpriteHeight || Math.max(1, Math.round(sourceHeight / Math.max(1, grid))));
  const sourceColors = Number(result.sourceColors || 0);
  const outputColors = Number(result.outputColors || 0);
  const sourceAlpha = result.sourceTransparentPercent ?? "—";
  const outputAlpha = result.outputTransparentPercent ?? "—";
  const rows = [
    ["Source Size", `${sourceWidth} × ${sourceHeight}`, selectedFile?.name || "Loaded image"],
    ["Output Size", outputWidth && outputHeight ? `${outputWidth} × ${outputHeight}` : "—", outputWidth && outputHeight ? "Processed preview" : "Process to inspect output"],
    ["Detected Grid", grid ? `${grid}px` : "—", result.confidence ? `${result.confidence}% confidence` : "estimated"],
    ["Sprite Estimate", `${estimatedSpriteWidth} × ${estimatedSpriteHeight}`, "source size ÷ detected grid"],
    ["Palette", sourceColors && outputColors ? `${sourceColors} → ${outputColors}` : (sourceColors ? `${sourceColors} colors` : "—"), result.paletteTarget && Number(result.paletteTarget) > 0 ? `${result.paletteTarget} target colors` : "original target"],
    ["Transparency", outputAlpha !== "—" ? `${sourceAlpha}% → ${outputAlpha}%` : `${sourceAlpha}%`, "partial/transparent pixels"],
  ];
  imageMetadataList.innerHTML = rows.map(([name, value, detail]) => `
    <div class="image-metadata-row">
      <strong>${escapeHtml(name)}</strong>
      <span>${escapeHtml(value)}</span>
      <em>${escapeHtml(detail)}</em>
    </div>`).join("");
  if (imageMetadataSummary) {
    const out = outputWidth && outputHeight ? ` · Output ${outputWidth}×${outputHeight}` : "";
    imageMetadataSummary.textContent = `Source ${sourceWidth}×${sourceHeight}${out}`;
  }
}


function rgbaToHex(r, g, b, a = 255) {
  const hex = [r, g, b].map((value) => Math.max(0, Math.min(255, Number(value) || 0)).toString(16).padStart(2, "0")).join("").toUpperCase();
  return a < 255 ? `#${hex}${Math.max(0, Math.min(255, Number(a) || 0)).toString(16).padStart(2, "0").toUpperCase()}` : `#${hex}`;
}

async function analyzePaletteBlob(blob) {
  if (!blob) return null;
  const bitmap = await createImageBitmap(blob);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(bitmap, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const counts = new Map();
    let transparent = 0;
    let semiTransparent = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a === 0) transparent += 1;
      else if (a < 255) semiTransparent += 1;
      const key = `${r},${g},${b},${a}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const totalPixels = Math.max(1, canvas.width * canvas.height);
    let most = null;
    let least = null;
    for (const [key, count] of counts.entries()) {
      const [r, g, b, a] = key.split(",").map(Number);
      const entry = { key, count, hex: rgbaToHex(r, g, b, a), alpha: a };
      if (!most || count > most.count) most = entry;
      if (a > 0 && (!least || count < least.count)) least = entry;
    }
    const uniqueColors = counts.size;
    const bits = uniqueColors <= 1 ? 1 : Math.ceil(Math.log2(uniqueColors));
    const topColors = Array.from(counts.entries())
      .map(([key, count]) => {
        const [r, g, b, a] = key.split(",").map(Number);
        return { key, count, hex: rgbaToHex(r, g, b, a), alpha: a };
      })
      .filter((entry) => entry.alpha > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 16);
    return {
      width: canvas.width,
      height: canvas.height,
      totalPixels,
      uniqueColors,
      transparent,
      semiTransparent,
      transparentPercent: ((transparent / totalPixels) * 100).toFixed(1),
      semiTransparentPercent: ((semiTransparent / totalPixels) * 100).toFixed(1),
      bits,
      most,
      least,
      topColors,
    };
  } finally {
    bitmap.close?.();
  }
}

function paletteColorRow(label, stat, totalPixels) {
  if (!stat) return [label, "—", "No color data"];
  const pct = ((stat.count / Math.max(1, totalPixels)) * 100).toFixed(1);
  const copyButton = `<button type="button" class="palette-copy-hex" data-copy-hex="${escapeHtml(stat.hex)}">Copy</button>`;
  return [label, `${stat.hex} ${copyButton}`, `${stat.count.toLocaleString()} px · ${pct}%`];
}

function renderPaletteSwatches(colors = [], totalPixels = 1) {
  if (!colors.length) return '<div class="palette-swatch-empty">No visible colors to show yet.</div>';
  return `<div class="palette-swatch-strip">${colors.map((color) => {
    const pct = ((color.count / Math.max(1, totalPixels)) * 100).toFixed(1);
    return `<button type="button" class="palette-swatch" data-copy-hex="${escapeHtml(color.hex)}" title="${escapeHtml(color.hex)} · ${color.count.toLocaleString()} px · ${pct}%"><span style="background:${escapeHtml(color.hex)}"></span><em>${escapeHtml(color.hex)}</em></button>`;
  }).join("")}</div>`;
}

function renderPaletteReductionSummary(sourceStats, outputStats) {
  if (!paletteReductionSummary) return;
  if (!sourceStats) {
    paletteReductionSummary.textContent = "Load or process an image to preview palette reduction.";
    return;
  }
  const target = getPaletteTargetValue();
  const finalStats = outputStats || sourceStats;
  const before = sourceStats.uniqueColors || 0;
  const after = finalStats.uniqueColors || 0;
  const reduced = before > 0 ? Math.max(0, before - after) : 0;
  const reductionPct = before > 0 ? ((reduced / before) * 100).toFixed(1) : "0.0";
  const targetText = target > 0 ? `${target} colors` : "Original colors";
  const preserveText = pixelSnapAlpha?.checked !== false ? "Transparency preserved" : "Transparency not preserved";
  const normalizeText = paletteNormalizeEnabled?.checked === true ? `Normalize tol ${paletteNormalizeTolerance?.value || 8}` : "Normalize off";
  paletteReductionSummary.innerHTML = `
    <div><strong>Palette Preview</strong><span>${before.toLocaleString()} → ${after.toLocaleString()} colors</span><em>${targetText}</em></div>
    <div><strong>Reduction</strong><span>${reduced.toLocaleString()} colors removed</span><em>${reductionPct}% smaller palette</em></div>
    <div><strong>Safety</strong><span>${escapeHtml(preserveText)}</span><em>${escapeHtml(normalizeText)}</em></div>`;
}

async function renderPaletteStatistics() {
  if (!paletteStatisticsList) return;
  const requestId = ++paletteStatisticsRequestId;
  const sourceBlob = selectedFile || null;
  let outputBlob = null;
  if (processedBlobUrl) {
    try {
      const response = await fetch(processedBlobUrl);
      outputBlob = await response.blob();
    } catch (_) {
      outputBlob = null;
    }
  }
  if (!sourceBlob && !outputBlob) {
    if (paletteStatisticsSummary) paletteStatisticsSummary.textContent = "Waiting for image";
    paletteStatisticsList.innerHTML = '<div class="cleanup-diagnostic-empty">Load an image to inspect palette usage, dominant colors, transparency, and estimated bit depth.</div>';
    renderPaletteReductionSummary(null, null);
    return;
  }

  try {
    const sourceStats = sourceBlob ? await analyzePaletteBlob(sourceBlob) : null;
    if (requestId !== paletteStatisticsRequestId) return;
    const outputStats = outputBlob ? await analyzePaletteBlob(outputBlob) : null;
    if (requestId !== paletteStatisticsRequestId) return;
    const stats = outputStats || sourceStats;
    if (!stats) return;
    const target = Number(getPaletteTargetValue?.() || 0);
    const utilizationBase = target > 0 ? target : 256;
    const utilization = Math.min(100, (stats.uniqueColors / utilizationBase) * 100).toFixed(1);
    const rows = [
      ["Image Size", `${stats.width} × ${stats.height}`, `${stats.totalPixels.toLocaleString()} total pixels`],
      ["Unique Colors", stats.uniqueColors.toLocaleString(), target > 0 ? `${target} target colors selected` : "current visible palette"],
      ["Transparency", `${stats.transparentPercent}%`, `${stats.transparent.toLocaleString()} fully transparent px`],
      ["Semi-Alpha", `${stats.semiTransparentPercent}%`, `${stats.semiTransparent.toLocaleString()} partially transparent px`],
      ["Bits / Pixel", `${stats.bits} bpp`, `minimum for ${stats.uniqueColors.toLocaleString()} colors`],
      ["Utilization", `${utilization}%`, target > 0 ? `of ${target}-color target` : "of 256-color sprite palette"],
      paletteColorRow("Most Used", stats.most, stats.totalPixels),
      paletteColorRow("Least Used", stats.least, stats.totalPixels),
    ];
    paletteStatisticsList.innerHTML = `
      <div class="palette-statistics-grid">
        ${rows.map(([name, value, detail]) => `
          <div class="palette-statistics-row">
            <strong>${escapeHtml(name)}</strong>
            <span>${value}</span>
            <em>${escapeHtml(detail)}</em>
          </div>`).join("")}
      </div>
      <div class="palette-swatch-panel">
        <div><strong>Top Visible Colors</strong><em>Click a swatch to copy HEX</em></div>
        ${renderPaletteSwatches(stats.topColors || [], stats.totalPixels)}
      </div>`;
    renderPaletteReductionSummary(sourceStats, outputStats);
    if (paletteStatisticsSummary) {
      const mode = outputBlob ? "Processed" : "Source";
      paletteStatisticsSummary.textContent = `${mode} · ${stats.uniqueColors.toLocaleString()} colors · ${stats.bits} bpp`;
    }
  } catch (err) {
    if (requestId !== paletteStatisticsRequestId) return;
    if (paletteStatisticsSummary) paletteStatisticsSummary.textContent = "Palette scan failed";
    paletteStatisticsList.innerHTML = `<div class="cleanup-diagnostic-empty">Palette statistics failed: ${escapeHtml(err.message || "Unknown error")}</div>`;
  }
}

document.addEventListener("click", async (event) => {
  const button = event.target?.closest?.("[data-copy-hex]");
  if (!button) return;
  const hex = button.dataset.copyHex || "";
  try {
    await navigator.clipboard.writeText(hex);
    if (button.classList.contains("palette-swatch")) {
      setStatus(`Copied ${hex}`);
    } else {
      button.textContent = "Copied";
      window.setTimeout(() => { button.textContent = "Copy"; }, 900);
    }
  } catch (_) {
    setStatus(`HEX ${hex}`);
  }
});

function getCurrentSourceSizeForNotice() {
  const result = pixelSnapLastResult || {};
  const sourceWidth = Number(result.sourceWidth || originalPreview?.naturalWidth || 0) || 0;
  const sourceHeight = Number(result.sourceHeight || originalPreview?.naturalHeight || 0) || 0;
  return { sourceWidth, sourceHeight };
}

function updateExportSizeNotice() {
  if (!exportSizeNotice) return;
  const target = exportTargetSize?.value || "scale";
  const scale = document.getElementById("resizeScale")?.value || "1";
  const smartOn = smartDownscaleEnabled?.checked === true;
  const { sourceWidth, sourceHeight } = getCurrentSourceSizeForNotice();
  const sourceLabel = sourceWidth && sourceHeight ? `${sourceWidth}×${sourceHeight}` : "the processed image";
  let message = `Output Scale ${scale}x preserves the processed image shape and multiplies it with nearest-neighbor pixels.`;
  let tone = "neutral";
  if (target !== "scale") {
    const targetNumber = Number(target || 0);
    const maxSource = Math.max(sourceWidth, sourceHeight);
    message = `Target Resolution exports an exact ${target}×${target} PNG. This changes the final asset size instead of just zooming the preview.`;
    if (maxSource && targetNumber < maxSource) {
      tone = "warning";
      message += ` Current source is ${sourceLabel}, so this will downscale the exported file.`;
    } else if (maxSource && targetNumber > maxSource) {
      tone = "info";
      message += ` Current source is ${sourceLabel}, so this will upscale using nearest-neighbor.`;
    }
  }
  if (smartOn) message += " Smart Downscale is also on and may reduce the working source before export.";
  exportSizeNotice.textContent = message;
  exportSizeNotice.dataset.tone = tone;
}

function updateOperationStackLabels() {
  syncOperationFromToolToggles();
  const operation = document.getElementById("operation")?.value || "resize_palette";
  const pixelSize = pixelSnapGridSize?.value || document.getElementById("pixelSize")?.value || "0";
  const snapStrength = Number(pixelSnapStrength?.value || 1);
  const paletteOn = isColorCleanupActive();
  const normalizeOn = isPaletteNormalizeActive();
  const resizeOn = resizeEnabled?.checked !== false;
  const snapOn = pixelSnapEnabled?.checked !== false;
  if (opPaletteCount) {
    const tolerance = Number(paletteNormalizeTolerance?.value || 8);
    opPaletteCount.textContent = paletteOn ? paletteTargetLabel() : (normalizeOn ? `Normalize · ${tolerance}` : "Original colors");
  }
  const smartOn = smartDownscaleEnabled?.checked === true;
  const smartLabel = document.getElementById("opSmartDownscale");
  if (smartLabel) smartLabel.textContent = smartOn ? "Auto grid" : "Off";
  if (opResizeScale) {
    const target = exportTargetSize?.value || "scale";
    opResizeScale.textContent = resizeOn ? (target !== "scale" ? `${target}×${target}` : `${document.getElementById("resizeScale")?.value || 2}x`) : "Off";
  }
  if (opPixelSize) opPixelSize.textContent = snapOn ? (pixelSize === "0" ? `Auto · ${Math.round(snapStrength * 100)}%` : `${pixelSize}px · ${Math.round(snapStrength * 100)}%`) : "Off";
  const orphanOn = orphanCleanupEnabled?.checked === true;
  const orphanStrengthPct = Math.round(Number(orphanCleanupStrength?.value || 0) * 100);
  const orphanRow = document.querySelector('[data-op="orphan"]');
  const orphanLabel = document.getElementById("opOrphanCleanup");
  if (orphanLabel) orphanLabel.textContent = orphanOn ? `${orphanStrengthPct}%` : "Off";
  const edgeOn = edgeCleanupEnabled?.checked === true;
  const edgeStrengthPct = Math.round(Number(edgeCleanupStrength?.value || 0) * 100);
  const edgeRow = document.querySelector('[data-op="edge"]');
  const edgeLabel = document.getElementById("opEdgeCleanup");
  if (edgeLabel) edgeLabel.textContent = edgeOn ? `${edgeStrengthPct}%` : "Off";
  const jaggyOn = jaggyCleanupEnabled?.checked === true;
  const jaggyStrengthPct = Math.round(Number(jaggyCleanupStrength?.value || 0) * 100);
  const jaggyRow = document.querySelector('[data-op="jaggy"]');
  const jaggyLabel = document.getElementById("opJaggyCleanup");
  if (jaggyLabel) jaggyLabel.textContent = jaggyOn ? `${jaggyStrengthPct}%` : "Off";
  const alphaOn = alphaCleanupEnabled?.checked === true;
  const alphaThresholdNumber = Number(alphaCleanupThreshold?.value || 0);
  const alphaRow = document.querySelector('[data-op="alpha"]');
  const alphaLabel = document.getElementById("opAlphaCleanup");
  if (alphaLabel) alphaLabel.textContent = alphaOn ? `threshold ${alphaThresholdNumber}` : "Off";
  document.querySelector('[data-op="palette"]')?.classList.toggle("active", paletteOn || normalizeOn);
  document.querySelector('[data-op="smart"]')?.classList.toggle("active", smartOn);
  document.querySelector('[data-op="resize"]')?.classList.toggle("active", resizeOn);
  orphanRow?.classList.toggle("active", orphanOn);
  edgeRow?.classList.toggle("active", edgeOn);
  alphaRow?.classList.toggle("active", alphaOn);
  jaggyRow?.classList.toggle("active", jaggyOn);
  document.querySelector('[data-pipeline-chip="orphan"]')?.classList.toggle("active", orphanOn);
  document.querySelector('[data-pipeline-chip="edge"]')?.classList.toggle("active", edgeOn);
  document.querySelector('[data-pipeline-chip="morphology"]')?.classList.toggle("active", morphologyCleanupEnabled?.checked === true);
  document.querySelector('[data-pipeline-chip="jaggy"]')?.classList.toggle("active", jaggyOn);
  document.querySelector('[data-pipeline-chip="alpha-cleanup"]')?.classList.toggle("active", alphaOn);
  document.querySelector('[data-pipeline-chip="smart"]')?.classList.toggle("active", smartOn);
  document.querySelector('[data-pipeline-chip="palette"]')?.classList.toggle("active", paletteOn || normalizeOn);
  if (paletteNormalizeToleranceValue) paletteNormalizeToleranceValue.textContent = String(Number(paletteNormalizeTolerance?.value || 8));
  if (opPixelSnapRow) opPixelSnapRow.classList.toggle("active", snapOn || operation.startsWith("pixel_snap"));
  if (pixelSnapStrengthValue) pixelSnapStrengthValue.textContent = `${Math.round(snapStrength * 100)}%`;
  if (orphanCleanupStrengthValue) orphanCleanupStrengthValue.textContent = `${orphanStrengthPct}%`;
  if (edgeCleanupStrengthValue) edgeCleanupStrengthValue.textContent = `${Math.round(Number(edgeCleanupStrength?.value || 0) * 100)}%`;
  if (morphologyCleanupStrengthValue) morphologyCleanupStrengthValue.textContent = `${Math.round(Number(morphologyCleanupStrength?.value || 0) * 100)}%`;
  if (jaggyCleanupStrengthValue) jaggyCleanupStrengthValue.textContent = `${jaggyStrengthPct}%`;
  if (alphaCleanupThresholdValue) alphaCleanupThresholdValue.textContent = String(alphaThresholdNumber);
  if (pixelSnapModeBadge) pixelSnapModeBadge.textContent = snapOn ? (pixelSize === "0" ? "Auto grid" : `${pixelSize}px grid`) : "Pixel Snap off";
  updateExportSizeNotice();
  updateToolToggleLabels();
}

function updateCompareSlider() {
  const value = Number(compareSlider?.value || 50);
  if (compareProcessedClip) compareProcessedClip.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
  if (compareDivider) compareDivider.style.left = `${value}%`;
}

function updateCompareModalSlider() {
  const value = Number(compareModalSlider?.value || 50);
  if (compareModalProcessedClip) compareModalProcessedClip.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
  if (compareModalDivider) compareModalDivider.style.left = `${value}%`;
  requestAnimationFrame(updatePixelSnapGridOverlays);
}


function updateCompareGridToggleLabel() {
  const enabled = pixelSnapShowGrid?.checked === true;
  [compareGridToggle, mainCanvasGridToggle].filter(Boolean).forEach((btn) => {
    btn.textContent = enabled ? "Grid On" : "Grid Off";
    btn.classList.toggle("active", enabled);
    btn.classList.toggle("is-on", enabled);
    btn.classList.toggle("is-off", !enabled);
  });
  updateToolToggleLabels();
}

function pipelineControlForStage(stage) {
  return {
    smart: smartDownscaleEnabled,
    snap: pixelSnapEnabled,
    palette: paletteEnabled,
    normalize: paletteNormalizeEnabled,
    alpha: alphaCleanupEnabled,
    orphan: orphanCleanupEnabled,
    edge: edgeCleanupEnabled,
    morphology: morphologyCleanupEnabled,
    jaggy: jaggyCleanupEnabled,
    resize: resizeEnabled,
  }[stage] || null;
}

function pipelineStageLabel(stage) {
  const control = pipelineControlForStage(stage);
  if (!control) return "—";
  if (stage === "smart") return control.checked ? "Auto" : "Off";
  if (stage === "snap") {
    const grid = pixelSnapGridSize?.value || "0";
    return control.checked ? (grid === "0" ? "Auto" : `${grid}px`) : "Off";
  }
  if (stage === "palette") return control.checked ? paletteTargetLabel() : "Off";
  if (stage === "normalize") return control.checked ? `Tol ${Number(paletteNormalizeTolerance?.value || 8)}` : "Off";
  if (stage === "alpha") return control.checked ? `T ${Number(alphaCleanupThreshold?.value || 0)}` : "Off";
  if (stage === "orphan") return control.checked ? `${Math.round(Number(orphanCleanupStrength?.value || 0) * 100)}%` : "Off";
  if (stage === "edge") return control.checked ? `${Math.round(Number(edgeCleanupStrength?.value || 0) * 100)}%` : "Off";
  if (stage === "morphology") return control.checked ? `${Math.round(Number(morphologyCleanupStrength?.value || 0) * 100)}%` : "Off";
  if (stage === "jaggy") return control.checked ? `${Math.round(Number(jaggyCleanupStrength?.value || 0) * 100)}%` : "Off";
  if (stage === "resize") {
    const target = exportTargetSize?.value || "scale";
    return control.checked ? (target !== "scale" ? `${target}×${target}` : `${document.getElementById("resizeScale")?.value || 2}x`) : "Off";
  }
  return control.checked ? "On" : "Off";
}

function updatePipelineManager() {
  if (!pipelineStageToggles.length) return;
  let activeCount = 0;
  pipelineStageToggles.forEach((button) => {
    const stage = button.dataset.pipelineToggle || "";
    const control = pipelineControlForStage(stage);
    const isOn = control?.checked === true;
    if (isOn) activeCount += 1;
    button.classList.toggle("active", isOn);
    button.classList.toggle("is-off", !isOn);
    const label = button.querySelector("span");
    if (label) label.textContent = pipelineStageLabel(stage);
  });
  if (pipelineManagerSummary) pipelineManagerSummary.textContent = `${activeCount} / ${pipelineStageToggles.length} stages on`;
}

function updateToolToggleLabels() {
  document.querySelectorAll(".pf-toggle-button-control input[type='checkbox']").forEach((input) => {
    const label = input.closest(".pf-toggle-button-control");
    const text = label?.querySelector("span");
    if (!label || !text) return;
    const onText = text.dataset.on || text.textContent || "On";
    const offText = text.dataset.off || onText.replace(/On$/, "Off");
    text.textContent = input.checked ? onText : offText;
    label.classList.toggle("is-on", input.checked);
    label.classList.toggle("is-off", !input.checked);
  });
  updatePipelineManager();
}

function toggleCompareGrid() {
  if (!pixelSnapShowGrid) return;
  pixelSnapShowGrid.checked = !pixelSnapShowGrid.checked;
  updateCompareGridToggleLabel();
  updatePixelSnapGridOverlays();
}

function setCompareViewMode(mode = "compare") {
  paletteCompareViewMode = mode === "difference" ? "difference" : "compare";
  compareModalCanvas?.classList.toggle("difference-mode", paletteCompareViewMode === "difference");
  compareDifferenceBtn?.classList.toggle("active", paletteCompareViewMode === "difference");
  if (compareModalSlider) compareModalSlider.disabled = paletteCompareViewMode === "difference";
  if (paletteCompareMeta) {
    const base = paletteCompareMeta.textContent.split(" · View")[0];
    paletteCompareMeta.textContent = `${base} · View ${paletteCompareViewMode === "difference" ? "Difference" : "Before/After"}`;
  }
  if (paletteCompareViewMode === "difference") buildCompareDifferenceCanvas();
  updateCompareModalSlider();
}

function buildCompareDifferenceCanvas() {
  if (!compareDifferenceCanvas || !compareModalOriginal || !compareModalProcessed) return false;
  if (!compareModalOriginal.naturalWidth || !compareModalOriginal.naturalHeight || !compareModalProcessed.naturalWidth || !compareModalProcessed.naturalHeight) return false;
  const width = compareModalOriginal.naturalWidth;
  const height = compareModalOriginal.naturalHeight;
  compareDifferenceCanvas.width = width;
  compareDifferenceCanvas.height = height;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const out = compareDifferenceCanvas.getContext("2d");
  if (!ctx || !out) return false;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(compareModalOriginal, 0, 0, width, height);
  const original = ctx.getImageData(0, 0, width, height);
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(compareModalProcessed, 0, 0, width, height);
  const processed = ctx.getImageData(0, 0, width, height);
  const diff = out.createImageData(width, height);
  for (let i = 0; i < diff.data.length; i += 4) {
    const dr = Math.abs(original.data[i] - processed.data[i]);
    const dg = Math.abs(original.data[i + 1] - processed.data[i + 1]);
    const db = Math.abs(original.data[i + 2] - processed.data[i + 2]);
    const da = Math.abs(original.data[i + 3] - processed.data[i + 3]);
    const change = Math.max(dr, dg, db, da);
    if (change < 3) {
      diff.data[i] = 8; diff.data[i + 1] = 13; diff.data[i + 2] = 22; diff.data[i + 3] = 255;
    } else {
      diff.data[i] = Math.min(255, 24 + dr * 3);
      diff.data[i + 1] = Math.min(255, 80 + dg * 3);
      diff.data[i + 2] = Math.min(255, 130 + db * 3);
      diff.data[i + 3] = 255;
    }
  }
  out.putImageData(diff, 0, 0);
  return true;
}

function buildMainDifferenceCanvas() {
  if (!mainDifferenceCanvas || !compareOriginalPreview || !compareProcessedPreview) return false;
  if (!compareOriginalPreview.naturalWidth || !compareOriginalPreview.naturalHeight || !compareProcessedPreview.naturalWidth || !compareProcessedPreview.naturalHeight) return false;
  const width = compareOriginalPreview.naturalWidth;
  const height = compareOriginalPreview.naturalHeight;
  mainDifferenceCanvas.width = width;
  mainDifferenceCanvas.height = height;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const out = mainDifferenceCanvas.getContext("2d");
  if (!ctx || !out) return false;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(compareOriginalPreview, 0, 0, width, height);
  const original = ctx.getImageData(0, 0, width, height);
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(compareProcessedPreview, 0, 0, width, height);
  const processed = ctx.getImageData(0, 0, width, height);
  const diff = out.createImageData(width, height);
  for (let i = 0; i < diff.data.length; i += 4) {
    const dr = Math.abs(original.data[i] - processed.data[i]);
    const dg = Math.abs(original.data[i + 1] - processed.data[i + 1]);
    const db = Math.abs(original.data[i + 2] - processed.data[i + 2]);
    const da = Math.abs(original.data[i + 3] - processed.data[i + 3]);
    const change = Math.max(dr, dg, db, da);
    if (change < 3) {
      diff.data[i] = 8; diff.data[i + 1] = 13; diff.data[i + 2] = 22; diff.data[i + 3] = 255;
    } else {
      diff.data[i] = Math.min(255, 24 + dr * 3);
      diff.data[i + 1] = Math.min(255, 80 + dg * 3);
      diff.data[i + 2] = Math.min(255, 130 + db * 3);
      diff.data[i + 3] = 255;
    }
  }
  out.putImageData(diff, 0, 0);
  return true;
}

function setMainCanvasViewMode(mode = "compare") {
  paletteMainViewMode = mode === "difference" ? "difference" : "compare";
  const active = paletteMainViewMode === "difference";
  paletteComparePanel?.classList.toggle("difference-mode", active);
  mainCanvasDifferenceBtn?.classList.toggle("active", active);
  mainCanvasDifferenceBtn?.classList.toggle("is-on", active);
  mainCanvasDifferenceBtn?.classList.toggle("is-off", !active);
  if (mainCanvasDifferenceBtn) mainCanvasDifferenceBtn.textContent = active ? "Difference On" : "Difference Off";
  if (compareSlider) compareSlider.disabled = active;
  if (active) buildMainDifferenceCanvas();
  updateCompareSlider();
  requestAnimationFrame(updatePixelSnapGridOverlays);
}

function applyMainCanvasActualSize() {
  if (!mainPaletteCanvasStage) return;
  // 1:1 means inspect the source canvas at true source-pixel size.
  // The processed side is mapped into the same visual bounds so before/after stays aligned.
  const ow = compareOriginalPreview?.naturalWidth || originalPreview?.naturalWidth || compareProcessedPreview?.naturalWidth || processedPreview?.naturalWidth || 0;
  const oh = compareOriginalPreview?.naturalHeight || originalPreview?.naturalHeight || compareProcessedPreview?.naturalHeight || processedPreview?.naturalHeight || 0;
  const targetW = Math.max(1, ow);
  const targetH = Math.max(1, oh);
  mainPaletteCanvasStage.style.setProperty("--main-canvas-actual-width", `${targetW}px`);
  mainPaletteCanvasStage.style.setProperty("--main-canvas-actual-height", `${targetH}px`);
}

function centerMainCanvasStage() {
  if (!mainPaletteCanvasStage) return;
  requestAnimationFrame(() => {
    mainPaletteCanvasStage.scrollLeft = Math.max(0, (mainPaletteCanvasStage.scrollWidth - mainPaletteCanvasStage.clientWidth) / 2);
    mainPaletteCanvasStage.scrollTop = Math.max(0, (mainPaletteCanvasStage.scrollHeight - mainPaletteCanvasStage.clientHeight) / 2);
    updatePixelSnapGridOverlays();
  });
}

function setMainCanvasPreviewMode(mode = "fit") {
  paletteMainCanvasMode = mode === "actual" ? "actual" : "fit";
  applyMainCanvasActualSize();
  mainPaletteCanvasStage?.classList.toggle("actual", paletteMainCanvasMode === "actual");
  [mainCanvasFitBtn, mainCanvasActualBtn].forEach((btn) => {
    btn?.classList.remove("active", "is-on", "is-off");
  });
  mainCanvasFitBtn?.classList.toggle("active", paletteMainCanvasMode === "fit");
  mainCanvasFitBtn?.classList.toggle("is-on", paletteMainCanvasMode === "fit");
  mainCanvasFitBtn?.classList.toggle("is-off", paletteMainCanvasMode !== "fit");
  mainCanvasActualBtn?.classList.toggle("active", paletteMainCanvasMode === "actual");
  mainCanvasActualBtn?.classList.toggle("is-on", paletteMainCanvasMode === "actual");
  mainCanvasActualBtn?.classList.toggle("is-off", paletteMainCanvasMode !== "actual");
  showPaletteCompare({ resetSlider: false });
  centerMainCanvasStage();
}

function readComparePixel(img, x, y) {
  if (!img || !img.naturalWidth || !img.naturalHeight) return null;
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const data = ctx.getImageData(Math.max(0, Math.min(canvas.width - 1, x)), Math.max(0, Math.min(canvas.height - 1, y)), 1, 1).data;
  return `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3]})`;
}

function updateComparePixelInspector(event) {
  if (!comparePixelInspector || !compareModalCanvas || !compareModalOriginal?.naturalWidth || !compareModalOriginal?.naturalHeight) return;
  const rect = compareModalCanvas.getBoundingClientRect();
  const xRatio = (event.clientX - rect.left) / Math.max(1, rect.width);
  const yRatio = (event.clientY - rect.top) / Math.max(1, rect.height);
  if (xRatio < 0 || xRatio > 1 || yRatio < 0 || yRatio > 1) {
    comparePixelInspector.textContent = "Hover image for pixel info";
    return;
  }
  const x = Math.max(0, Math.min(compareModalOriginal.naturalWidth - 1, Math.floor(xRatio * compareModalOriginal.naturalWidth)));
  const y = Math.max(0, Math.min(compareModalOriginal.naturalHeight - 1, Math.floor(yRatio * compareModalOriginal.naturalHeight)));
  const src = readComparePixel(compareModalOriginal, x, y) || "—";
  const out = readComparePixel(compareModalProcessed, Math.floor(xRatio * (compareModalProcessed.naturalWidth || compareModalOriginal.naturalWidth)), Math.floor(yRatio * (compareModalProcessed.naturalHeight || compareModalOriginal.naturalHeight))) || "—";
  comparePixelInspector.textContent = `x ${x}, y ${y} · Original ${src} · Processed ${out}`;
}

function syncCompareControlsFromPalette() {
  const resize = document.getElementById("resizeScale");
  const colors = document.getElementById("paletteColors");
  const operation = document.getElementById("operation");
  if (compareResizeScale && resize) compareResizeScale.value = resize.value;
  if (comparePaletteColors && colors) comparePaletteColors.value = colors.value;
  if (comparePixelSize && pixelSnapGridSize) comparePixelSize.value = pixelSnapGridSize.value;
  if (compareOperation && operation) compareOperation.value = operation.value;
  updateCompareGridToggleLabel();
}

function syncPaletteControlsFromCompare() {
  const resize = document.getElementById("resizeScale");
  const colors = document.getElementById("paletteColors");
  const operation = document.getElementById("operation");
  if (resize && compareResizeScale) resize.value = compareResizeScale.value;
  if (colors && comparePaletteColors) colors.value = comparePaletteColors.value;
  if (pixelSnapGridSize && comparePixelSize) pixelSnapGridSize.value = comparePixelSize.value;
  const hiddenPixelSize = document.getElementById("pixelSize");
  if (hiddenPixelSize && comparePixelSize) hiddenPixelSize.value = comparePixelSize.value;
  if (operation && compareOperation) operation.value = compareOperation.value;
  updateOperationStackLabels();
}
function syncPixelSnapPanelToOperation() {
  const pixelSize = document.getElementById("pixelSize");
  if (pixelSnapGridSize && pixelSize) pixelSize.value = pixelSnapGridSize.value;
  if (comparePixelSize && pixelSnapGridSize) comparePixelSize.value = pixelSnapGridSize.value;
  syncOperationFromToolToggles();
  updateCompareGridToggleLabel();
  updateOperationStackLabels();
}

function syncPixelSnapPanelFromOperation() {
  const pixelSize = document.getElementById("pixelSize");
  if (pixelSnapGridSize && pixelSize) pixelSnapGridSize.value = pixelSize.value;
  if (comparePixelSize && pixelSnapGridSize) comparePixelSize.value = pixelSnapGridSize.value;
  updateCompareGridToggleLabel();
  updateOperationStackLabels();
}


function syncOpenCompareControlsFromPalette() {
  if (!paletteCompareModal || paletteCompareModal.classList.contains("hidden")) return;
  syncCompareControlsFromPalette();
}

function processPreviewFromCompareViewer() {
  syncPaletteControlsFromCompare();
  setStatus("Updating Palette Lab preview from compare viewer...");
  processPalettePreview();
}

let compareAutoProcessTimer = null;
function scheduleComparePreviewUpdate() {
  if (!paletteCompareModal || paletteCompareModal.classList.contains("hidden")) return;
  if (!selectedFile) return;
  if (!isPixelSnapLivePreviewEnabled()) {
    setPaletteDirty(true, "● Preview pending");
    setStatus("Auto-update preview is off. Click Process / Update when ready.");
    return;
  }
  window.clearTimeout(compareAutoProcessTimer);
  compareAutoProcessTimer = window.setTimeout(() => {
    processPreviewFromCompareViewer();
  }, 450);
}

function getCompareBaseSize() {
  const naturalWidth = compareModalOriginal?.naturalWidth || selectedFile?.width || 512;
  const naturalHeight = compareModalOriginal?.naturalHeight || selectedFile?.height || 512;
  return { width: Math.max(1, naturalWidth), height: Math.max(1, naturalHeight) };
}

function getPaletteCompareStageCenter() {
  if (!paletteCompareModalStage) return { x: 0.5, y: 0.5 };
  const rect = paletteCompareModalStage.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function centerPaletteCompareCanvas() {
  if (!paletteCompareModalStage) return;
  paletteCompareModalStage.scrollLeft = Math.max(0, (paletteCompareModalStage.scrollWidth - paletteCompareModalStage.clientWidth) / 2);
  paletteCompareModalStage.scrollTop = Math.max(0, (paletteCompareModalStage.scrollHeight - paletteCompareModalStage.clientHeight) / 2);
}

function applyPaletteCompareMode({ center = false } = {}) {
  if (!paletteCompareModalStage || !compareModalCanvas) return;
  const { width, height } = getCompareBaseSize();
  const stageWidth = Math.max(1, paletteCompareModalStage.clientWidth - 32);
  const stageHeight = Math.max(1, paletteCompareModalStage.clientHeight - 32);
  const fitScale = Math.min(stageWidth / width, stageHeight / height);
  const baseScale = paletteCompareMode === "fit" ? fitScale : 1;
  const zoom = paletteCompareMode === "fit" ? 1 : paletteCompareZoom;
  const displayWidth = Math.max(1, Math.round(width * baseScale * zoom));
  const displayHeight = Math.max(1, Math.round(height * baseScale * zoom));

  paletteCompareModalStage.classList.toggle("fit", paletteCompareMode === "fit");
  paletteCompareModalStage.classList.toggle("zoomed", paletteCompareMode !== "fit");
  compareModalCanvas.style.width = `${displayWidth}px`;
  compareModalCanvas.style.height = `${displayHeight}px`;

  [compareModalOriginal, compareModalProcessed].filter(Boolean).forEach((img) => {
    img.style.transform = "none";
  });

  if (paletteCompareMeta) {
    const scaleLabel = paletteCompareMode === "fit" ? "Fit to window" : `${Math.round(paletteCompareZoom * 100)}% zoom`;
    const sourceLabel = `${width} × ${height}`;
    const resLabel = paletteProcessedResolution && paletteProcessedResolution !== "—" ? ` · Output ${paletteProcessedResolution}` : "";
    paletteCompareMeta.textContent = `${scaleLabel} · Source ${sourceLabel}${resLabel}`;
  }
  requestAnimationFrame(updatePixelSnapGridOverlays);
  if (center) {
    requestAnimationFrame(centerPaletteCompareCanvas);
  }
}

function updateCompareModalImages() {
  if (compareModalSlider) compareModalSlider.value = "50";
  const originalSrc = originalPreview?.getAttribute("src");
  if (!originalSrc || !processedBlobUrl || !compareModalOriginal || !compareModalProcessed) return false;
  compareModalOriginal.src = originalSrc;
  compareModalProcessed.src = processedBlobUrl;
  if (paletteCompareTitle) paletteCompareTitle.textContent = `${selectedFile?.name || "Current Canvas"} — Compare`;
  const refreshLayout = () => {
    buildCompareDifferenceCanvas();
    updateCompareModalSlider();
    applyPaletteCompareMode({ center: true });
    setCompareViewMode(paletteCompareViewMode);
  };
  compareModalOriginal.onload = refreshLayout;
  compareModalProcessed.onload = refreshLayout;
  refreshLayout();
  return true;
}

function openPaletteCompareViewer() {
  if (!paletteCompareModal || !processedBlobUrl) {
    setStatus("Process a preview before opening the compare viewer.");
    return;
  }
  syncCompareControlsFromPalette();
  paletteCompareModal.classList.remove("hidden");
  paletteCompareModal.setAttribute("aria-hidden", "false");
  paletteCompareMode = "fit";
  paletteCompareZoom = 1;
  paletteCompareViewMode = "compare";
  updateCompareModalImages();
  setCompareViewMode("compare");
}

function closePaletteCompareViewer() {
  if (!paletteCompareModal) return;
  paletteCompareModal.classList.add("hidden");
  paletteCompareModal.setAttribute("aria-hidden", "true");
}

function setPaletteCompareFit() {
  paletteCompareMode = "fit";
  paletteCompareZoom = 1;
  applyPaletteCompareMode({ center: true });
}

function setPaletteCompareActual(zoom = 1, options = {}) {
  const point = options.point || getPaletteCompareStageCenter();
  setPaletteCompareZoomAtPoint(zoom, point.x, point.y);
}

function setPaletteCompareZoomAtPoint(nextZoom, clientX, clientY) {
  if (!paletteCompareModalStage || !compareModalCanvas) return;
  const stage = paletteCompareModalStage;
  const canvas = compareModalCanvas;
  const stageRect = stage.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();

  const insideCanvas = clientX >= canvasRect.left && clientX <= canvasRect.right && clientY >= canvasRect.top && clientY <= canvasRect.bottom;
  const relX = insideCanvas && canvasRect.width > 0 ? (clientX - canvasRect.left) / canvasRect.width : 0.5;
  const relY = insideCanvas && canvasRect.height > 0 ? (clientY - canvasRect.top) / canvasRect.height : 0.5;
  const viewportX = insideCanvas ? clientX - stageRect.left : stageRect.width / 2;
  const viewportY = insideCanvas ? clientY - stageRect.top : stageRect.height / 2;

  paletteCompareMode = "zoomed";
  paletteCompareZoom = Math.max(0.25, Math.min(12, nextZoom));
  applyPaletteCompareMode({ center: false });

  requestAnimationFrame(() => {
    const newCanvasRect = canvas.getBoundingClientRect();
    const canvasLeftInScroll = canvas.offsetLeft;
    const canvasTopInScroll = canvas.offsetTop;
    const maxLeft = Math.max(0, stage.scrollWidth - stage.clientWidth);
    const maxTop = Math.max(0, stage.scrollHeight - stage.clientHeight);
    stage.scrollLeft = Math.min(maxLeft, Math.max(0, canvasLeftInScroll + relX * newCanvasRect.width - viewportX));
    stage.scrollTop = Math.min(maxTop, Math.max(0, canvasTopInScroll + relY * newCanvasRect.height - viewportY));
    updatePixelSnapGridOverlays();
  });
}

function revokePaletteCanvasObjectUrl() {
  if (paletteCanvasObjectUrl) {
    URL.revokeObjectURL(paletteCanvasObjectUrl);
    paletteCanvasObjectUrl = null;
  }
}

function setOriginalPreviewFromBlob(blob, filename = "palette_canvas.png") {
  revokePaletteCanvasObjectUrl();
  paletteCanvasObjectUrl = URL.createObjectURL(blob);
  originalPreview.src = paletteCanvasObjectUrl;
  originalPreview.classList.add("pf-viewable-image");
  originalPreview.dataset.viewerTitle = filename;
}

async function getPaletteOutputBlob() {
  if (processedBlobUrl) {
    const response = await fetch(processedBlobUrl);
    return response.blob();
  }
  if (selectedFile && paletteDirty) return selectedFile;
  return null;
}

async function promotePaletteBlobToCanvas(blob, filename = "palette_canvas.png", { dirty = true, detail = "Applied preview to canvas", source = "applied", history = true } = {}) {
  if (!blob) return;
  const file = new File([blob], filename, { type: blob.type || "image/png" });
  selectedFile = file;
  selectedFileSource = source;
  originalPreview.onload = () => {
    updatePaletteMeta({ resolution: `${originalPreview.naturalWidth} × ${originalPreview.naturalHeight}` });
    updatePixelSnapAnalysis();
    renderPaletteStatistics();
    showPaletteCompare({ resetSlider: true });
    requestInitialPalettePreview();
  };
  setOriginalPreviewFromBlob(blob, filename);
  updatePaletteLoadedState({
    filename,
    source,
    detail,
    meta: {
      type: paletteCurrentMeta.type || paletteSourceAsset?.type || "—",
      status: dirty ? "Unsaved" : normalizePaletteAssetStatus(paletteSourceAsset?.status || "accepted"),
      recipe: paletteCurrentMeta.recipe || paletteSourceAsset?.recipe || "—",
      resolution: paletteProcessedResolution && paletteProcessedResolution !== "—" ? paletteProcessedResolution : paletteCurrentMeta.resolution,
    },
  });
  setPaletteDirty(dirty, dirty ? "● Unsaved Changes" : "● Saved");
  if (history) addPaletteHistory(dirty ? "Applied preview" : "Saved canvas", filename);
  updatePaletteSaveControls();
}

function showPaletteCompare({ resetSlider = false } = {}) {
  if (!paletteComparePanel || !selectedFile) return;
  const originalSrc = originalPreview?.getAttribute("src");
  if (!originalSrc) return;
  const hasProcessed = Boolean(processedBlobUrl);
  if (compareSlider && resetSlider) compareSlider.value = hasProcessed ? "50" : "0";
  if (compareOriginalPreview) {
    compareOriginalPreview.onload = () => { applyMainCanvasActualSize(); requestAnimationFrame(updatePixelSnapGridOverlays); };
    compareOriginalPreview.src = originalSrc;
  }
  if (compareProcessedPreview) {
    compareProcessedPreview.onload = () => { applyMainCanvasActualSize(); requestAnimationFrame(updatePixelSnapGridOverlays); };
    compareProcessedPreview.src = hasProcessed ? processedBlobUrl : originalSrc;
  }
  applyMainCanvasActualSize();
  paletteComparePanel.classList.remove("hidden");
  updateCompareSlider();
  buildMainDifferenceCanvas();
  setMainCanvasViewMode(paletteMainViewMode);
  requestAnimationFrame(updatePixelSnapGridOverlays);
}

function clearPaletteProcessedPreview({ addHistory = false, keepDirty = false, keepCanvasState = false } = {}) {
  processedPreview.removeAttribute("src");
  processedPreview.classList.remove("pf-viewable-image");
  if (processedBlobUrl) URL.revokeObjectURL(processedBlobUrl);
  processedBlobUrl = null;
  paletteProcessedResolution = "—";
  if (compareProcessedPreview) compareProcessedPreview.removeAttribute("src");
  if (compareModalProcessed) compareModalProcessed.removeAttribute("src");
  if (compareModalOriginal) compareModalOriginal.removeAttribute("src");
  downloadBtn.disabled = true;
  if (downloadPaletteResultBtn) downloadPaletteResultBtn.disabled = true;
  if (discardPalettePreviewBtn) discardPalettePreviewBtn.disabled = true;
  if (savePaletteAssetBtn) savePaletteAssetBtn.disabled = true;
  if (savePaletteAsAssetBtn) savePaletteAsAssetBtn.disabled = true;
  updatePaletteSaveControls();
  if (selectedFile) showPaletteCompare({ resetSlider: true });
  else paletteComparePanel?.classList.add("hidden");
  closePaletteCompareViewer();
  if (!keepDirty) setPaletteDirty(false);
  updatePixelSnapGridOverlays();
  renderPaletteStatistics();
  if (!keepCanvasState) updatePaletteLoadedState({ filename: selectedFile?.name || "Current Canvas", source: selectedFileSource || "workspace", detail: selectedFile ? "Loaded into Palette Lab" : "No asset loaded" });
  if (addHistory) addPaletteHistory("Discarded preview", "Returned to original source image");
}

function updatePaletteLoadedState({ filename = "Untitled image", source = "workspace", detail = "Ready for cleanup", meta = null } = {}) {
  const sourceLabel = source === "upload" ? "Local upload" : source === "workspace" || source === "asset" ? "Current asset" : source === "applied" ? "Unsaved canvas" : source;
  if (paletteLoadedState) {
    paletteLoadedState.innerHTML = `<strong>${escapeHtml(filename)}</strong><span>${escapeHtml(sourceLabel)} · ${escapeHtml(detail)}</span>`;
  }
  setPaletteFooterStatus(`${sourceLabel}: ${filename || "No asset loaded"} · ${detail}`);
  if (workspaceStatus) workspaceStatus.textContent = filename || "No asset loaded";
  if (meta) updatePaletteMeta(meta);
}

function applyPreviewMode() {
  const mode = previewModeInline?.value || previewMode?.value || "fit";
  if (previewMode && previewMode.value !== mode) previewMode.value = mode;
  if (previewModeInline && previewModeInline.value !== mode) previewModeInline.value = mode;
  [originalPreview, processedPreview].forEach((img) => {
    img.classList.toggle("fit-image", mode === "fit");
    img.classList.toggle("actual-image", mode === "actual");
    const viewport = img.closest(".viewport");
    if (viewport) {
      viewport.classList.toggle("fit-mode", mode === "fit");
      viewport.classList.toggle("actual-mode", mode === "actual");
    }
  });
  requestAnimationFrame(updatePixelSnapGridOverlays);
}

previewMode?.addEventListener("change", applyPreviewMode);
previewModeInline?.addEventListener("change", () => { if (previewMode) previewMode.value = previewModeInline.value; applyPreviewMode(); });

function centerPreviewScroll(host = null) {
  const viewports = host ? [host] : Array.from(document.querySelectorAll(".palette-viewport"));
  requestAnimationFrame(() => {
    viewports.forEach((viewport) => {
      if (!viewport) return;
      viewport.scrollLeft = Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2);
      viewport.scrollTop = Math.max(0, (viewport.scrollHeight - viewport.clientHeight) / 2);
    });
  });
}

function setPreviewModeForAll(mode) {
  if (previewMode) previewMode.value = mode;
  if (previewModeInline) previewModeInline.value = mode;
  applyPreviewMode();
  centerPreviewScroll();
}

document.querySelectorAll("[data-preview-action]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.previewAction || "";
    const mode = action.endsWith("actual") ? "actual" : "fit";
    setPreviewModeForAll(mode);
    const hostName = action.startsWith("original") ? "original" : action.startsWith("processed") ? "processed" : null;
    if (hostName) centerPreviewScroll(document.querySelector(`[data-preview-host="${hostName}"]`));
  });
});

function attachMiniPreviewCamera(viewport) {
  if (!viewport) return;
  viewport.addEventListener("wheel", (event) => {
    if (!event.shiftKey && !event.ctrlKey) return;
    event.preventDefault();
    setPreviewModeForAll(event.deltaY < 0 ? "actual" : "fit");
  }, { passive: false });
  let start = null;
  viewport.addEventListener("mousedown", (event) => {
    if (!event.shiftKey || event.button !== 0) return;
    start = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
    viewport.classList.add("panning");
    event.preventDefault();
  });
  window.addEventListener("mousemove", (event) => {
    if (!start) return;
    viewport.scrollLeft = start.left - (event.clientX - start.x);
    viewport.scrollTop = start.top - (event.clientY - start.y);
  });
  window.addEventListener("mouseup", () => {
    start = null;
    viewport.classList.remove("panning");
  });
}
attachMiniPreviewCamera(document.querySelector('[data-preview-host="original"]'));
attachMiniPreviewCamera(document.querySelector('[data-preview-host="processed"]'));

compareSlider?.addEventListener("input", updateCompareSlider);
compareModalSlider?.addEventListener("input", updateCompareModalSlider);
openCompareViewerBtn?.addEventListener("click", openPaletteCompareViewer);
mainPaletteCanvasStage?.addEventListener("dblclick", openPaletteCompareViewer);
mainCanvasFitBtn?.addEventListener("click", () => setMainCanvasPreviewMode("fit"));
mainCanvasActualBtn?.addEventListener("click", () => setMainCanvasPreviewMode("actual"));
mainCanvasGridToggle?.addEventListener("click", toggleCompareGrid);
mainCanvasDifferenceBtn?.addEventListener("click", () => setMainCanvasViewMode(paletteMainViewMode === "difference" ? "compare" : "difference"));
compareCloseBtn?.addEventListener("click", closePaletteCompareViewer);
document.querySelector("[data-compare-close]")?.addEventListener("click", closePaletteCompareViewer);
compareFitBtn?.addEventListener("click", setPaletteCompareFit);
compareActualBtn?.addEventListener("click", () => setPaletteCompareActual(1));
compareZoomInBtn?.addEventListener("click", () => setPaletteCompareActual((paletteCompareMode === "fit" ? 1 : paletteCompareZoom) * 1.25));
compareZoomOutBtn?.addEventListener("click", () => setPaletteCompareActual((paletteCompareMode === "fit" ? 1 : paletteCompareZoom) / 1.25));
compareDifferenceBtn?.addEventListener("click", () => setCompareViewMode(paletteCompareViewMode === "difference" ? "compare" : "difference"));
compareGridToggle?.addEventListener("click", toggleCompareGrid);
paletteCompareModalStage?.addEventListener("wheel", (event) => {
  if (!paletteCompareModal || paletteCompareModal.classList.contains("hidden")) return;
  event.preventDefault();
  const base = paletteCompareMode === "fit" ? 1 : paletteCompareZoom;
  const next = event.deltaY < 0 ? base * 1.12 : base / 1.12;
  setPaletteCompareZoomAtPoint(next, event.clientX, event.clientY);
}, { passive: false });

paletteCompareModalStage?.addEventListener("dblclick", () => setPaletteCompareFit());
paletteCompareModalStage?.addEventListener("mousemove", updateComparePixelInspector);
paletteCompareModalStage?.addEventListener("mouseleave", () => { if (comparePixelInspector) comparePixelInspector.textContent = "Hover image for pixel info"; });
paletteCompareModalStage?.addEventListener("mousedown", (event) => {
  if (!paletteCompareModalStage || event.button !== 0) return;
  if (!paletteCompareSpaceDown && !event.shiftKey && !event.altKey && !event.metaKey && !event.ctrlKey) return;
  paletteCompareIsPanning = true;
  paletteComparePanStart = {
    x: event.clientX,
    y: event.clientY,
    left: paletteCompareModalStage.scrollLeft,
    top: paletteCompareModalStage.scrollTop,
  };
  paletteCompareModalStage.classList.add("panning");
  event.preventDefault();
});
window.addEventListener("mousemove", (event) => {
  if (!paletteCompareIsPanning || !paletteComparePanStart || !paletteCompareModalStage) return;
  paletteCompareModalStage.scrollLeft = paletteComparePanStart.left - (event.clientX - paletteComparePanStart.x);
  paletteCompareModalStage.scrollTop = paletteComparePanStart.top - (event.clientY - paletteComparePanStart.y);
});
window.addEventListener("mouseup", () => {
  paletteCompareIsPanning = false;
  paletteComparePanStart = null;
  paletteCompareModalStage?.classList.remove("panning");
});
window.addEventListener("keydown", (event) => {
  if (event.code === "Space") paletteCompareSpaceDown = true;
  if (!paletteCompareModal || paletteCompareModal.classList.contains("hidden")) return;
  if (event.key.toLowerCase() === "f") setPaletteCompareFit();
  if (event.key === "1") setPaletteCompareActual(1);
});
window.addEventListener("keyup", (event) => {
  if (event.code === "Space") paletteCompareSpaceDown = false;
});

window.addEventListener("resize", () => {
  if (paletteCompareModal && !paletteCompareModal.classList.contains("hidden")) {
    applyPaletteCompareMode({ center: true });
  }
});

compareDownloadBtn?.addEventListener("click", () => downloadBtn?.click());
compareProcessBtn?.addEventListener("click", processPreviewFromCompareViewer);
[compareResizeScale, comparePaletteColors, comparePixelSize, compareOperation, comparePixelSnapEnabled, comparePaletteEnabled, compareResizeEnabled].forEach((control) => {
  control?.addEventListener("change", () => preservePaletteScroll(() => { clearPixelSnapProcessedReadout(); syncCompareOperationFromToggles(); syncPaletteControlsFromCompare(); scheduleComparePreviewUpdate(); }));
  control?.addEventListener("input", () => preservePaletteScroll(() => { clearPixelSnapProcessedReadout(); syncCompareOperationFromToggles(); syncPaletteControlsFromCompare(); scheduleComparePreviewUpdate(); }));
});
[document.getElementById("resizeScale"), exportTargetSize, document.getElementById("paletteColors"), paletteTargetSlider, palettePreserveTransparency, pixelSnapGridSize, document.getElementById("operation"), pixelSnapEnabled, paletteEnabled, resizeEnabled, smartDownscaleEnabled, orphanCleanupEnabled, orphanCleanupStrength, paletteNormalizeEnabled, paletteNormalizeTolerance, edgeCleanupEnabled, edgeCleanupStrength, morphologyCleanupEnabled, morphologyCleanupStrength, jaggyCleanupEnabled, jaggyCleanupStrength, alphaCleanupEnabled, alphaCleanupThreshold].forEach((control) => {
  control?.addEventListener("change", () => preservePaletteScroll(() => { clearPixelSnapProcessedReadout(); syncOperationFromToolToggles(); updateOperationStackLabels(); syncOpenCompareControlsFromPalette(); schedulePalettePreviewUpdate(); }));
  control?.addEventListener("input", () => preservePaletteScroll(() => { clearPixelSnapProcessedReadout(); syncOperationFromToolToggles(); updateOperationStackLabels(); syncOpenCompareControlsFromPalette(); schedulePalettePreviewUpdate(); }));
});
document.querySelectorAll(".pf-toggle-button-control input[type='checkbox']").forEach((input) => {
  input.addEventListener("change", () => preservePaletteScroll(updateToolToggleLabels));
  input.addEventListener("input", () => preservePaletteScroll(updateToolToggleLabels));
});

function resetPaletteLab({ keepDirty = false } = {}) {
  window.clearTimeout(paletteAutoProcessTimer);
  window.clearTimeout(compareAutoProcessTimer);
  if (processedBlobUrl) URL.revokeObjectURL(processedBlobUrl);
  processedBlobUrl = null;
  selectedFile = null;
  selectedFileSource = null;
  revokePaletteCanvasObjectUrl();
  paletteSourceAsset = null;
  paletteProcessedResolution = "—";
  pixelSnapLastResult = null;
  paletteDirty = false;
  [originalPreview, processedPreview, compareOriginalPreview, compareProcessedPreview, compareModalOriginal, compareModalProcessed].filter(Boolean).forEach((img) => {
    img.removeAttribute("src");
    img.classList.remove("pf-viewable-image");
  });
  paletteComparePanel?.classList.add("hidden");
  closePaletteCompareViewer();
  if (workspaceStatus) workspaceStatus.textContent = "No asset loaded";
  updatePaletteLoadedState({ filename: "No canvas loaded", source: "workspace", detail: "Open an asset, browse assets, or load an image." });
  updatePaletteMeta({ type: "—", status: "Empty", recipe: "—", resolution: "—" });
  paletteHistoryEntries = [];
  renderPaletteHistory();
  renderProcessingHistory();
  setPaletteDirty(false, "● Clean");
  updatePixelSnapAnalysis();
  if (applyPalettePreviewBtn) applyPalettePreviewBtn.disabled = true;
  if (!keepDirty) {
    if (downloadBtn) downloadBtn.disabled = true;
    if (downloadPaletteResultBtn) downloadPaletteResultBtn.disabled = true;
    if (discardPalettePreviewBtn) discardPalettePreviewBtn.disabled = true;
    if (savePaletteAssetBtn) savePaletteAssetBtn.disabled = true;
    if (savePaletteAsAssetBtn) savePaletteAsAssetBtn.disabled = true;
  }
  updatePaletteSaveControls();
  setStatus("Palette Lab reset.");
}


applyRecommendedPipelineBtn?.addEventListener("click", () => preservePaletteScroll(() => {
  applyRecommendedPipeline();
}));

pipelineStageToggles.forEach((button) => {
  button.addEventListener("click", () => preservePaletteScroll(() => {
    const stage = button.dataset.pipelineToggle || "";
    const control = pipelineControlForStage(stage);
    if (!control) return;
    control.checked = !control.checked;
    const targetTab = button.dataset.targetTab;
    if (targetTab) {
      document.querySelector(`[data-repair-tab="${targetTab}"]`)?.click();
    }
    updateToolToggleLabels();
    updateOperationStackLabels();
    syncOperationFromToolToggles();
    schedulePalettePreviewUpdate();
  }));
});

paletteTargetSlider?.addEventListener("input", () => preservePaletteScroll(() => {
  setPaletteTarget(paletteTargetSlider.value, { schedule: false });
}));
paletteTargetSlider?.addEventListener("change", () => preservePaletteScroll(() => {
  setPaletteTarget(paletteTargetSlider.value, { schedule: true });
}));
paletteTargetChips.forEach((button) => {
  button.addEventListener("click", () => preservePaletteScroll(() => setPaletteTarget(button.dataset.paletteTarget || "0", { schedule: true })));
});
palettePreserveTransparency?.addEventListener("change", () => preservePaletteScroll(() => {
  if (pixelSnapAlpha) pixelSnapAlpha.checked = palettePreserveTransparency.checked;
  syncPaletteTransparencyControls({ schedule: true });
}));

discardPalettePreviewBtn?.addEventListener("click", resetPaletteLab);
downloadPaletteResultBtn?.addEventListener("click", () => downloadBtn?.click());
document.getElementById("paletteColors")?.addEventListener("change", () => syncPaletteTargetControls({ schedule: false }));
document.getElementById("resizeScale")?.addEventListener("change", updateOperationStackLabels);
exportTargetSize?.addEventListener("change", updateOperationStackLabels);
document.getElementById("pixelSize")?.addEventListener("change", updateOperationStackLabels);
document.getElementById("operation")?.addEventListener("change", updateOperationStackLabels);
pixelSnapGridSize?.addEventListener("change", () => preservePaletteScroll(() => {
  clearPixelSnapProcessedReadout();
  syncPixelSnapPanelToOperation();
  updatePixelSnapAnalysis();
  schedulePalettePreviewUpdate();
}));
pixelSnapStrength?.addEventListener("input", () => preservePaletteScroll(() => {
  clearPixelSnapProcessedReadout();
  syncPixelSnapPanelToOperation();
  updatePixelSnapAnalysis();
  schedulePalettePreviewUpdate();
}));
pixelSnapPalette?.addEventListener("change", () => preservePaletteScroll(() => {
  clearPixelSnapProcessedReadout();
  if (paletteEnabled && pixelSnapPalette.checked) paletteEnabled.checked = true;
  syncPixelSnapPanelToOperation();
  updatePixelSnapAnalysis();
  schedulePalettePreviewUpdate();
}));
pixelSnapAlpha?.addEventListener("change", () => preservePaletteScroll(() => {
  clearPixelSnapProcessedReadout();
  syncPixelSnapPanelToOperation();
  syncPaletteTransparencyControls({ schedule: false });
  schedulePalettePreviewUpdate();
}));
pixelSnapShowGrid?.addEventListener("change", () => preservePaletteScroll(() => { updateCompareGridToggleLabel(); updatePixelSnapGridOverlays(); }));

orphanCleanupStrength?.addEventListener("input", () => preservePaletteScroll(() => {
  if (orphanCleanupStrengthValue) orphanCleanupStrengthValue.textContent = `${Math.round(Number(orphanCleanupStrength.value || 0) * 100)}%`;
  schedulePalettePreviewUpdate();
}));
orphanCleanupEnabled?.addEventListener("change", () => preservePaletteScroll(() => {
  updateToolToggleLabels();
  schedulePalettePreviewUpdate();
}));

paletteNormalizeTolerance?.addEventListener("input", () => preservePaletteScroll(() => {
  if (paletteNormalizeToleranceValue) paletteNormalizeToleranceValue.textContent = String(Number(paletteNormalizeTolerance.value || 8));
  updateOperationStackLabels();
  schedulePalettePreviewUpdate();
}));
paletteNormalizeEnabled?.addEventListener("change", () => preservePaletteScroll(() => {
  updateToolToggleLabels();
  updateOperationStackLabels();
  schedulePalettePreviewUpdate();
}));

edgeCleanupStrength?.addEventListener("input", () => preservePaletteScroll(() => {
  if (edgeCleanupStrengthValue) edgeCleanupStrengthValue.textContent = `${Math.round(Number(edgeCleanupStrength.value || 0) * 100)}%`;
  updateOperationStackLabels();
  schedulePalettePreviewUpdate();
}));
edgeCleanupEnabled?.addEventListener("change", () => preservePaletteScroll(() => {
  updateToolToggleLabels();
  updateOperationStackLabels();
  schedulePalettePreviewUpdate();
}));

alphaCleanupThreshold?.addEventListener("input", () => preservePaletteScroll(() => {
  if (alphaCleanupThresholdValue) alphaCleanupThresholdValue.textContent = String(Number(alphaCleanupThreshold.value || 0));
  updateOperationStackLabels();
  schedulePalettePreviewUpdate();
}));
alphaCleanupEnabled?.addEventListener("change", () => preservePaletteScroll(() => {
  updateToolToggleLabels();
  updateOperationStackLabels();
  schedulePalettePreviewUpdate();
}));

pixelSnapLivePreview?.addEventListener("change", () => preservePaletteScroll(() => {
  updatePixelSnapAnalysis();
  if (isPixelSnapLivePreviewEnabled()) {
    setStatus("Auto-update preview enabled.");
    schedulePalettePreviewUpdate();
  } else {
    window.clearTimeout(paletteAutoProcessTimer);
    window.clearTimeout(compareAutoProcessTimer);
    setStatus("Auto-update preview disabled. Use Update Preview manually.");
  }
}));
pixelSnapToolBtn?.addEventListener("click", () => {
  syncPixelSnapPanelToOperation();
  updateOperationStackLabels();
  processPalettePreview();
  setStatus("Force updating Pixel Snap preview...");
});
document.getElementById("pixelSize")?.addEventListener("change", syncPixelSnapPanelFromOperation);
syncPaletteTargetControls({ schedule: false });
syncPaletteTransparencyControls({ schedule: false });
updateOperationStackLabels();
syncPixelSnapPanelFromOperation();
updatePaletteSaveControls();

async function refreshWorkspace({ quiet = true } = {}) {
  try {
    const response = await fetch("/api/workspace");
    const data = await response.json();
    workspace = data.workspace || { has_image: false };
    if (workspaceStatus) {
      workspaceStatus.textContent = selectedFile
        ? `${selectedFile.name || workspace.asset_name || "Loaded asset"}`
        : "No asset loaded";
    }
    if (!quiet && workspace.has_image) setStatus("Current asset is available.");
    return workspace;
  } catch (err) {
    if (workspaceStatus) workspaceStatus.textContent = selectedFile ? selectedFile.name : "No asset loaded";
    if (!quiet) setStatus(`Workspace error: ${err.message}`);
    return { has_image: false };
  }
}

async function loadImageIntoPaletteFromUrl(url, filename = "workspace.png", source = "workspace") {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to load image: HTTP ${response.status}`);
  const blob = await response.blob();
  selectedFile = new File([blob], filename, { type: "image/png" });
  selectedFileSource = source;
  if (workspace?.asset_id) {
    paletteSourceAsset = {
      id: workspace.asset_id,
      name: workspace.asset_name || filename,
      type: workspace.asset_type || paletteCurrentMeta.type || "repair",
      recipe: workspace.recipe_name || workspace.recipe_id || paletteCurrentMeta.recipe || "—",
      status: String(workspace.status || "candidate").toLowerCase(),
    };
  } else {
    paletteSourceAsset = null;
  }
  if (workspaceStatus) workspaceStatus.textContent = filename;
  updatePaletteLoadedState({
    filename,
    source,
    detail: "Loaded into Palette Lab",
    meta: {
      type: workspace?.asset_type || paletteCurrentMeta.type || "—",
      status: normalizePaletteAssetStatus(workspace?.status || "clean"),
      recipe: workspace?.recipe_name || workspace?.recipe_id || paletteCurrentMeta.recipe || "—",
      resolution: "loading...",
    },
  });
  updatePaletteSaveControls();
  originalPreview.src = `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;
  originalPreview.classList.add("pf-viewable-image");
  originalPreview.dataset.viewerTitle = filename;
  clearPaletteProcessedPreview();
  addPaletteHistory("Loaded asset", filename);
  originalPreview.onload = () => {
    updatePaletteMeta({ resolution: `${originalPreview.naturalWidth} × ${originalPreview.naturalHeight}` });
    updatePixelSnapAnalysis();
    renderPaletteStatistics();
    showPaletteCompare({ resetSlider: true });
    requestInitialPalettePreview();
  };
  applyPreviewMode();
  updatePixelSnapAnalysis();
}

async function loadWorkspaceIntoPalette() {
  const ws = await refreshWorkspace();
  if (!ws.has_image) {
    setStatus("No asset has been sent from Asset Browser yet.");
    return;
  }
  try {
    await loadImageIntoPaletteFromUrl(ws.image_url, `${ws.asset_name || "workspace"}.png`, "workspace");
    setView("palette");
    setStatus(`Loaded asset from browser into Palette Lab: ${ws.asset_name || "current image"}.`);
  } catch (err) {
    setStatus(`Workspace load failed: ${err.message}`);
  }
}

async function hydratePaletteFromWorkspaceIfNeeded() {
  if (selectedFile) return;
  const ws = await refreshWorkspace();
  if (!ws.has_image) return;
  try {
    await loadImageIntoPaletteFromUrl(ws.image_url, `${ws.asset_name || "workspace"}.png`, "workspace");
    setStatus(`Palette Lab loaded asset from browser: ${ws.asset_name || "current image"}.`);
  } catch (_) {
    // quiet hydration only
  }
}

changePaletteAssetBtn?.addEventListener("click", () => setView("assets"));

imageInput?.addEventListener("change", () => {
  const file = imageInput.files?.[0];
  if (!file) return;
  selectedFile = file;
  selectedFileSource = "upload";
  paletteSourceAsset = null;
  if (workspaceStatus) workspaceStatus.textContent = file.name;
  updatePaletteLoadedState({ filename: file.name, source: "upload", detail: "Loaded into Palette Lab", meta: { type: "Upload", status: "Clean", recipe: "Manual", resolution: "loading..." } });
  setOriginalPreviewFromBlob(file, file.name);
  clearPaletteProcessedPreview();
  updatePaletteSaveControls();
  addPaletteHistory("Loaded upload", file.name);
  originalPreview.onload = () => {
    updatePaletteMeta({ resolution: `${originalPreview.naturalWidth} × ${originalPreview.naturalHeight}` });
    updatePixelSnapAnalysis();
    renderPaletteStatistics();
    showPaletteCompare({ resetSlider: true });
  };
  applyPreviewMode();
  updatePixelSnapAnalysis();
  renderPaletteStatistics();
  setStatus(`Loaded ${file.name}`);
});

async function processPalettePreview({ quiet = false } = {}) {
  if (!selectedFile) {
    if (!quiet) setStatus("Open an asset in Palette Lab first.");
    return;
  }
  if (paletteIsProcessing) return;

  const restoreScroll = quiet ? { x: window.scrollX, y: window.scrollY } : null;
  paletteIsProcessing = true;
  processBtn.disabled = true;
  if (compareProcessBtn) compareProcessBtn.disabled = true;
  if (!quiet) setStatus("Processing Palette Lab preview...");

  syncOperationFromToolToggles();
  const form = new FormData();
  form.append("image", selectedFile);
  form.append("resize_scale", document.getElementById("resizeScale").value);
  form.append("export_target_size", exportTargetSize?.value || "scale");
  form.append("palette_colors", document.getElementById("paletteColors").value);
  form.append("pixel_size", pixelSnapGridSize?.value || document.getElementById("pixelSize")?.value || "0");
  form.append("pixel_strength", pixelSnapStrength?.value || "1");
  form.append("snap_palette", isColorCleanupActive() ? "true" : "false");
  form.append("preserve_alpha", pixelSnapAlpha?.checked === false ? "false" : "true");
  form.append("orphan_cleanup", orphanCleanupEnabled?.checked === true ? "true" : "false");
  form.append("orphan_strength", orphanCleanupStrength?.value || "0.35");
  form.append("palette_normalize", paletteNormalizeEnabled?.checked === true ? "true" : "false");
  form.append("normalize_tolerance", paletteNormalizeTolerance?.value || "8");
  form.append("edge_cleanup", edgeCleanupEnabled?.checked === true ? "true" : "false");
  form.append("edge_strength", edgeCleanupStrength?.value || "0.30");
  form.append("morphology_cleanup", morphologyCleanupEnabled?.checked === true ? "true" : "false");
  form.append("morphology_strength", morphologyCleanupStrength?.value || "0.35");
  form.append("jaggy_cleanup", jaggyCleanupEnabled?.checked === true ? "true" : "false");
  form.append("jaggy_strength", jaggyCleanupStrength?.value || "0.30");
  form.append("alpha_cleanup", alphaCleanupEnabled?.checked === true ? "true" : "false");
  form.append("alpha_threshold", alphaCleanupThreshold?.value || "12");
  const smartDownscaleRequested = smartDownscaleEnabled?.checked === true;
  form.append("smart_downscale", smartDownscaleRequested ? "true" : "false");
  form.append("operation", document.getElementById("operation").value);

  try {
    const response = await fetch("/api/process", { method: "POST", body: form });
    if (!response.ok) {
      let detail = `HTTP ${response.status}`;
      try {
        const errorBody = await response.json();
        detail = errorBody.detail || detail;
        if (Array.isArray(detail)) detail = detail.map((item) => item.msg || JSON.stringify(item)).join("; ");
      } catch (_) {}
      throw new Error(detail);
    }
    pixelSnapLastResult = {
      grid: response.headers.get("X-PF-Detected-Grid"),
      confidence: response.headers.get("X-PF-Grid-Confidence"),
      paletteTarget: response.headers.get("X-PF-Palette-Target"),
      resizeScale: response.headers.get("X-PF-Resize-Scale"),
      exportTargetSize: response.headers.get("X-PF-Export-Target-Size"),
      exportMode: response.headers.get("X-PF-Export-Mode"),
      sourceColors: response.headers.get("X-PF-Source-Colors"),
      outputColors: response.headers.get("X-PF-Output-Colors"),
      changedPixels: response.headers.get("X-PF-Changed-Pixels"),
      changedPercent: response.headers.get("X-PF-Changed-Percent"),
      paletteNormalize: response.headers.get("X-PF-Palette-Normalize"),
      normalizeTolerance: response.headers.get("X-PF-Normalize-Tolerance"),
      edgeCleanup: response.headers.get("X-PF-Edge-Cleanup"),
      edgeStrength: response.headers.get("X-PF-Edge-Strength"),
      processingMs: response.headers.get("X-PF-Processing-MS"),
      smartDownscale: response.headers.get("X-PF-Smart-Downscale"),
      smartDownscaleRequested: response.headers.get("X-PF-Smart-Downscale-Requested") || (smartDownscaleRequested ? "true" : "false"),
      smartDownscaleApplied: response.headers.get("X-PF-Smart-Downscale-Applied") || response.headers.get("X-PF-Smart-Downscale"),
      smartDownscaleGrid: response.headers.get("X-PF-Smart-Downscale-Grid"),
      stepSmartDownscale: response.headers.get("X-PF-Step-Smart-Downscale"),
      stepPixelSnap: response.headers.get("X-PF-Step-Pixel-Snap"),
      stepPaletteQuantize: response.headers.get("X-PF-Step-Palette-Quantize"),
      stepPaletteNormalize: response.headers.get("X-PF-Step-Palette-Normalize"),
      stepOrphanCleanup: response.headers.get("X-PF-Step-Orphan-Cleanup"),
      stepEdgeCleanup: response.headers.get("X-PF-Step-Edge-Cleanup"),
      morphologyCleanup: response.headers.get("X-PF-Morphology-Cleanup"),
      morphologyStrength: response.headers.get("X-PF-Morphology-Strength"),
      stepMorphologyCleanup: response.headers.get("X-PF-Step-Morphology-Cleanup"),
      jaggyCleanup: response.headers.get("X-PF-Jaggy-Cleanup"),
      jaggyStrength: response.headers.get("X-PF-Jaggy-Strength"),
      stepJaggyCleanup: response.headers.get("X-PF-Step-Jaggy-Cleanup"),
      stepAlphaPreserve: response.headers.get("X-PF-Step-Alpha-Preserve"),
      alphaCleanup: response.headers.get("X-PF-Alpha-Cleanup"),
      alphaThreshold: response.headers.get("X-PF-Alpha-Threshold"),
      stepAlphaCleanup: response.headers.get("X-PF-Step-Alpha-Cleanup"),
      stepResizePixels: response.headers.get("X-PF-Step-Resize-Pixels"),
      sourceWidth: response.headers.get("X-PF-Source-Width"),
      sourceHeight: response.headers.get("X-PF-Source-Height"),
      outputWidth: response.headers.get("X-PF-Output-Width"),
      outputHeight: response.headers.get("X-PF-Output-Height"),
      sourceTransparentPercent: response.headers.get("X-PF-Source-Transparent-Percent"),
      outputTransparentPercent: response.headers.get("X-PF-Output-Transparent-Percent"),
      estimatedSpriteWidth: response.headers.get("X-PF-Estimated-Sprite-Width"),
      estimatedSpriteHeight: response.headers.get("X-PF-Estimated-Sprite-Height"),
    };
    renderImageAnalysis();
    renderCleanupDiagnostics();
    renderPixelReport();
    renderImageMetadata();
    addProcessingHistoryEntry();
    const blob = await response.blob();
    if (processedBlobUrl) URL.revokeObjectURL(processedBlobUrl);
    processedBlobUrl = URL.createObjectURL(blob);
    renderPaletteStatistics();
    processedPreview.src = processedBlobUrl;
    processedPreview.classList.add("pf-viewable-image");
    processedPreview.dataset.viewerTitle = "Processed preview";
    processedPreview.onload = () => {
      paletteProcessedResolution = `${processedPreview.naturalWidth} × ${processedPreview.naturalHeight}`;
      updatePixelSnapAnalysis();
      renderImageMetadata();
      if (paletteCompareMeta && paletteCompareModal && !paletteCompareModal.classList.contains("hidden")) {
        buildCompareDifferenceCanvas();
        applyPaletteCompareMode();
        setCompareViewMode(paletteCompareViewMode);
      }
    };
    applyPreviewMode();
    downloadBtn.disabled = false;
    if (applyPalettePreviewBtn) applyPalettePreviewBtn.disabled = false;
    if (downloadPaletteResultBtn) downloadPaletteResultBtn.disabled = false;
    if (discardPalettePreviewBtn) discardPalettePreviewBtn.disabled = false;
    updatePaletteSaveControls();
    setPaletteDirty(true);
    showPaletteCompare({ resetSlider: true });
    syncCompareControlsFromPalette();
    if (paletteCompareModal && !paletteCompareModal.classList.contains("hidden")) updateCompareModalImages();
    const operationLabel = "Process";
    const scaleLabel = document.getElementById("resizeScale")?.value || "1";
    const colorLabel = paletteTargetLabel();
    const pixelSizeLabel = pixelSnapGridSize?.value || document.getElementById("pixelSize")?.value || "0";
    const pixelSizeText = pixelSizeLabel === "0" ? "auto grid" : `${pixelSizeLabel}px grid`;
    const strengthText = document.getElementById("operation")?.value?.startsWith("pixel_snap") ? ` · ${Math.round(Number(pixelSnapStrength?.value || 1) * 100)}% snap` : "";
    const normalizeText = isPaletteNormalizeActive() ? ` · normalize ${Number(paletteNormalizeTolerance?.value || 8)}` : "";
    const smartText = smartDownscaleEnabled?.checked === true ? " · smart downscale" : "";
    const edgeText = edgeCleanupEnabled?.checked === true ? ` · edge ${Math.round(Number(edgeCleanupStrength?.value || 0) * 100)}%` : "";
    const alphaText = alphaCleanupEnabled?.checked === true ? ` · alpha ${Number(alphaCleanupThreshold?.value || 12)}` : "";
    updatePaletteLoadedState({ filename: selectedFile?.name || "Processed preview", source: selectedFileSource || "workspace", detail: `Processed preview ready${paletteProcessedResolution !== "—" ? ` · ${paletteProcessedResolution}` : ""}` });
    const changedText = pixelSnapLastResult?.changedPercent ? ` · ${pixelSnapLastResult.changedPercent}% changed` : "";
    addPaletteHistory(operationLabel, `${colorLabel} · ${scaleLabel}x · ${pixelSizeText}${strengthText}${normalizeText}${smartText}${edgeText}${alphaText}${changedText}`);
    setStatus("Palette Lab preview updated.");
  } catch (err) {
    setStatus(`Error: ${err.message}`);
  } finally {
    paletteIsProcessing = false;
    processBtn.disabled = false;
    if (compareProcessBtn) compareProcessBtn.disabled = false;
    if (restoreScroll) requestAnimationFrame(() => window.scrollTo(restoreScroll.x, restoreScroll.y));
  }
}

function requestInitialPalettePreview() {
  if (!selectedFile) return;
  if (!isPixelSnapLivePreviewEnabled()) {
    showPaletteCompare({ resetSlider: true });
    updatePixelSnapAnalysis();
    return;
  }
  window.clearTimeout(paletteAutoProcessTimer);
  paletteAutoProcessTimer = window.setTimeout(() => processPalettePreview({ quiet: true }), 120);
}

function schedulePalettePreviewUpdate() {
  if (!selectedFile) return;
  if (!isPixelSnapLivePreviewEnabled()) {
    window.clearTimeout(paletteAutoProcessTimer);
    setPaletteDirty(true, "● Preview pending");
    setStatus("Auto-update preview is off. Click Update Preview when ready.");
    return;
  }
  window.clearTimeout(paletteAutoProcessTimer);
  setPaletteDirty(true, "● Preview pending");
  paletteAutoProcessTimer = window.setTimeout(() => processPalettePreview({ quiet: true }), 350);
}

processBtn.addEventListener("click", () => processPalettePreview());

downloadBtn.addEventListener("click", async () => {
  const blob = await getPaletteOutputBlob();
  if (!blob) return;
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = processedBlobUrl ? "pixel_factory_processed.png" : (selectedFile?.name || "pixel_factory_canvas.png");
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
  addPaletteHistory("Downloaded result", a.download);
});

async function applyPalettePreviewToCanvas() {
  if (!processedBlobUrl) {
    setStatus("Update the preview before applying it to the canvas.");
    return;
  }
  const blob = await fetch(processedBlobUrl).then((response) => response.blob());
  const filename = selectedFile?.name || paletteSourceAsset?.name || "palette_lab_canvas.png";
  await promotePaletteBlobToCanvas(blob, filename, {
    dirty: true,
    detail: "Preview applied to canvas · unsaved",
    source: paletteSourceAsset?.id ? "asset" : "applied",
    history: true,
  });
  clearPaletteProcessedPreview({ keepDirty: true, keepCanvasState: true });
  setPaletteDirty(true, "● Unsaved Changes");
  updatePaletteSaveControls();
  setStatus("Applied processed preview to the Palette Lab canvas. Save or Save As when ready.");
}

applyPalettePreviewBtn?.addEventListener("click", applyPalettePreviewToCanvas);

function buildPaletteSaveForm(blob, filename, extra = {}) {
  const form = new FormData();
  form.append("image", blob, filename);
  form.append("operation", document.getElementById("operation")?.value || "palette_lab");
  form.append("palette_colors", document.getElementById("paletteColors")?.value || "0");
  form.append("resize_scale", document.getElementById("resizeScale")?.value || "1");
  form.append("export_target_size", exportTargetSize?.value || "scale");
  form.append("pixel_size", pixelSnapGridSize?.value || document.getElementById("pixelSize")?.value || "0");
  form.append("pixel_strength", pixelSnapStrength?.value || "1");
  form.append("palette_normalize", paletteNormalizeEnabled?.checked === true ? "true" : "false");
  form.append("normalize_tolerance", paletteNormalizeTolerance?.value || "8");
  form.append("edge_cleanup", edgeCleanupEnabled?.checked === true ? "true" : "false");
  form.append("edge_strength", edgeCleanupStrength?.value || "0.30");
  form.append("morphology_cleanup", morphologyCleanupEnabled?.checked === true ? "true" : "false");
  form.append("morphology_strength", morphologyCleanupStrength?.value || "0.35");
  form.append("jaggy_cleanup", jaggyCleanupEnabled?.checked === true ? "true" : "false");
  form.append("jaggy_strength", jaggyCleanupStrength?.value || "0.30");
  form.append("alpha_cleanup", alphaCleanupEnabled?.checked === true ? "true" : "false");
  form.append("alpha_threshold", alphaCleanupThreshold?.value || "12");
  form.append("smart_downscale", smartDownscaleEnabled?.checked === true ? "true" : "false");
  Object.entries(extra).forEach(([key, value]) => form.append(key, value ?? ""));
  return form;
}

function openPaletteSaveAsDialog() {
  if (!hasPaletteSaveableCanvas()) {
    setStatus("Update or apply a preview before saving Palette Lab changes.");
    return;
  }
  if (paletteSaveAsName) paletteSaveAsName.value = suggestedPaletteSaveAsName();
  if (paletteSaveAsType) {
    const type = String(paletteSourceAsset?.type || paletteCurrentMeta.type || "repair").toLowerCase();
    paletteSaveAsType.value = ["tile", "character", "prop", "building", "repair"].includes(type) ? type : "repair";
  }
  if (paletteSaveAsSource) {
    const status = normalizePaletteAssetStatus(paletteSourceAsset?.status || selectedFileSource || "upload");
    paletteSaveAsSource.textContent = `${paletteSourceAsset?.name || selectedFile?.name || "Current canvas"} · ${status}`;
  }
  paletteSaveAsModal?.classList.remove("hidden");
  paletteSaveAsModal?.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => paletteSaveAsName?.focus());
}

function closePaletteSaveAsDialog() {
  paletteSaveAsModal?.classList.add("hidden");
  paletteSaveAsModal?.setAttribute("aria-hidden", "true");
}

async function confirmPaletteSaveAs() {
  const saveAsName = paletteSaveAsName?.value?.trim() || suggestedPaletteSaveAsName();
  const saveAsType = paletteSaveAsType?.value || paletteSourceAsset?.type || "repair";
  paletteSaveAsConfirmBtn.disabled = true;
  try {
    const asset = await savePaletteEdit({ saveAs: true, saveAsName, saveAsType });
    if (asset) closePaletteSaveAsDialog();
  } finally {
    paletteSaveAsConfirmBtn.disabled = false;
  }
}

async function savePaletteEdit({ saveAs = false, saveAsName = "", saveAsType = "" } = {}) {
  const blob = await getPaletteOutputBlob();
  if (!blob) {
    setStatus("Update or apply a preview before saving Palette Lab changes.");
    return null;
  }
  const sourceName = paletteSourceAsset?.name || selectedFile?.name || "palette_lab_result";
  const cleanBase = sourceName.replace(/\.png$/i, "");
  const sourceType = paletteSourceAsset?.type || paletteCurrentMeta.type || "repair";

  let endpoint = "";
  let form = null;

  if (saveAs || !canOverwriteCurrentPaletteAsset()) {
    const newName = String(saveAsName || `${cleanBase}_clean`).trim();
    if (!newName) {
      setStatus("Save As needs an asset name.");
      return null;
    }
    endpoint = "/api/assets/palette-save-as";
    form = buildPaletteSaveForm(blob, `${newName}.png`, {
      name: newName,
      asset_type: saveAsType || sourceType,
      source_asset_id: paletteSourceAsset?.id || "",
      source_asset_name: sourceName,
    });
    setStatus("Saving Palette Lab result as a new accepted asset...");
  } else {
    endpoint = `/api/assets/${encodeURIComponent(paletteSourceAsset.id)}/palette-save`;
    form = buildPaletteSaveForm(blob, `${cleanBase}.png`);
    setStatus("Saving Palette Lab edits to current accepted asset...");
  }

  const response = await fetch(endpoint, { method: "POST", body: form });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    setStatus(data.detail || `Save failed: HTTP ${response.status}`);
    return null;
  }

  const asset = data.asset;
  if (asset) {
    paletteSourceAsset = { ...asset, status: String(asset.status || "accepted").toLowerCase() };
    if (workspaceStatus) workspaceStatus.textContent = asset.name || sourceName;
    updatePaletteMeta({
      type: asset.type || sourceType || "—",
      status: normalizePaletteAssetStatus(asset.status || "accepted"),
      recipe: asset.recipe_name || asset.recipe_id || paletteCurrentMeta.recipe || "—",
      resolution: paletteProcessedResolution || paletteCurrentMeta.resolution || "—",
    });
    await promotePaletteBlobToCanvas(blob, `${asset.name || sourceName}.png`, {
      dirty: false,
      detail: "Saved in Asset Browser",
      source: "asset",
      history: false,
    });
    clearPaletteProcessedPreview({ keepDirty: true, keepCanvasState: true });
    updatePaletteLoadedState({ filename: asset.name || sourceName, source: "asset", detail: "Saved in Asset Browser", meta: paletteCurrentMeta });
  }
  addPaletteHistory(saveAs ? "Saved As" : "Saved", asset?.name || sourceName);
  setPaletteDirty(false, "● Saved");
  updatePaletteSaveControls();
  loadAssets?.();
  setStatus(saveAs ? "Palette Lab result saved as a new accepted asset." : "Palette Lab changes saved to current asset.");
  return asset;
}

savePaletteAssetBtn?.addEventListener("click", () => savePaletteEdit({ saveAs: false }));
savePaletteAsAssetBtn?.addEventListener("click", openPaletteSaveAsDialog);
paletteSaveAsConfirmBtn?.addEventListener("click", confirmPaletteSaveAs);
paletteSaveAsCancelBtn?.addEventListener("click", closePaletteSaveAsDialog);
paletteSaveAsCloseBtn?.addEventListener("click", closePaletteSaveAsDialog);
document.querySelector("[data-save-as-close]")?.addEventListener("click", closePaletteSaveAsDialog);
paletteSaveAsName?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") confirmPaletteSaveAs();
  if (event.key === "Escape") closePaletteSaveAsDialog();
});


// Character Studio

const statusEl = document.getElementById("status");
const navButtons = document.querySelectorAll(".nav-btn[data-view]");
const views = document.querySelectorAll(".view");
const controlPanels = document.querySelectorAll(".view-controls");
let activeViewName = "start";
let exportTargetState = "godot";

function setStatus(message) {
  statusEl.textContent = message;
}

function setView(name, options = {}) {
  const previousView = activeViewName;
  const preserveSelection = Boolean(options.preserveSelection) || name === "exporter";

  if (previousView === "assets" && name !== "assets" && !preserveSelection && exportSelection.size) {
    exportSelection.clear();
    selectedAssetId = null;
  }

  activeViewName = name;
  navButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.view === name));
  views.forEach((view) => view.classList.toggle("active", view.id === `${name}View`));
  controlPanels.forEach((panel) => panel.classList.add("hidden"));
  const panel = document.getElementById(`${name}Controls`);
  if (panel) panel.classList.remove("hidden");

  // Palette Lab intentionally opens blank unless the user explicitly opens an asset or loads current workspace.
  if (name === "assets") {
    loadAssets(selectedAssetId).catch(() => {});
  }
  if (name === "exporter") {
    updateExportSelectionStatus();
    refreshExportStatus();
  }
  updateSelectionBar();
}

navButtons.forEach((btn) => btn.addEventListener("click", () => setView(btn.dataset.view)));

document.querySelectorAll("[data-start-view]").forEach((btn) => {
  btn.addEventListener("click", () => setView(btn.dataset.startView));
});

// Comfy status
const comfyUrl = document.getElementById("comfyUrl");
const checkComfyBtn = document.getElementById("checkComfyBtn");
const reloadUiBtn = document.getElementById("reloadUiBtn");
const comfyStatus = document.getElementById("comfyStatus");

async function checkComfy({ quiet = false } = {}) {
  checkComfyBtn.disabled = true;
  comfyStatus.textContent = "Checking...";
  comfyStatus.className = "engine-status";
  try {
    const response = await fetch("/api/comfy/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: comfyUrl.value }),
    });
    const data = await response.json();
    if (data.connected) {
      comfyStatus.textContent = "Connected";
      comfyStatus.className = "engine-status connected";
      if (!quiet) setStatus("ComfyUI connected.");
      return true;
    }
    comfyStatus.textContent = "Disconnected";
    comfyStatus.className = "engine-status disconnected";
    if (!quiet) setStatus(`ComfyUI not found: ${data.error || "unknown error"}`);
    return false;
  } catch (err) {
    comfyStatus.textContent = "Disconnected";
    comfyStatus.className = "engine-status disconnected";
    if (!quiet) setStatus(`Comfy check failed: ${err.message}`);
    return false;
  } finally {
    checkComfyBtn.disabled = false;
  }
}

checkComfyBtn.addEventListener("click", () => checkComfy());

function reloadPixelFactoryUi() {
  try {
    sessionStorage.setItem("pf-reload-scroll", String(window.scrollY || 0));
  } catch (_) {
    // sessionStorage can be unavailable in some locked-down browser contexts.
  }

  const url = new URL(window.location.href);
  url.searchParams.set("v", String(Date.now()));
  window.location.replace(url.toString());
}

function restoreReloadScrollPosition() {
  try {
    const savedScroll = sessionStorage.getItem("pf-reload-scroll");
    if (!savedScroll) return;
    sessionStorage.removeItem("pf-reload-scroll");
    window.requestAnimationFrame(() => window.scrollTo(0, Number(savedScroll) || 0));
  } catch (_) {
    // Ignore cache-refresh scroll restore failures.
  }
}

reloadUiBtn?.addEventListener("click", reloadPixelFactoryUi);
restoreReloadScrollPosition();

// Palette Lab
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
const pixelSnapDetectedGrid = document.getElementById("pixelSnapDetectedGrid");
const pixelSnapConfidence = document.getElementById("pixelSnapConfidence");
const pixelSnapPaletteEstimate = document.getElementById("pixelSnapPaletteEstimate");
const pixelSnapColorDelta = document.getElementById("pixelSnapColorDelta");
const pixelSnapChangeAmount = document.getElementById("pixelSnapChangeAmount");
const pixelSnapResizeReadout = document.getElementById("pixelSnapResizeReadout");
const pixelSnapModeBadge = document.getElementById("pixelSnapModeBadge");
const pixelSnapEnabled = document.getElementById("pixelSnapEnabled");
const paletteEnabled = document.getElementById("paletteEnabled");
const resizeEnabled = document.getElementById("resizeEnabled");
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

function paletteTargetLabel(value = getPaletteTargetValue()) {
  return Number(value) > 0 ? `${Number(value)} colors` : "Original colors";
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

function updateOperationStackLabels() {
  syncOperationFromToolToggles();
  const operation = document.getElementById("operation")?.value || "resize_palette";
  const pixelSize = pixelSnapGridSize?.value || document.getElementById("pixelSize")?.value || "0";
  const snapStrength = Number(pixelSnapStrength?.value || 1);
  const paletteOn = isColorCleanupActive();
  const resizeOn = resizeEnabled?.checked !== false;
  const snapOn = pixelSnapEnabled?.checked !== false;
  if (opPaletteCount) opPaletteCount.textContent = paletteOn ? paletteTargetLabel() : "Original colors";
  if (opResizeScale) opResizeScale.textContent = resizeOn ? `${document.getElementById("resizeScale")?.value || 2}x` : "Off";
  if (opPixelSize) opPixelSize.textContent = snapOn ? (pixelSize === "0" ? `Auto · ${Math.round(snapStrength * 100)}%` : `${pixelSize}px · ${Math.round(snapStrength * 100)}%`) : "Off";
  document.querySelector('[data-op="palette"]')?.classList.toggle("active", paletteOn);
  document.querySelector('[data-op="resize"]')?.classList.toggle("active", resizeOn);
  if (opPixelSnapRow) opPixelSnapRow.classList.toggle("active", snapOn || operation.startsWith("pixel_snap"));
  if (pixelSnapStrengthValue) pixelSnapStrengthValue.textContent = `${Math.round(snapStrength * 100)}%`;
  if (pixelSnapModeBadge) pixelSnapModeBadge.textContent = snapOn ? (pixelSize === "0" ? "Auto grid" : `${pixelSize}px grid`) : "Pixel Snap off";
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
[document.getElementById("resizeScale"), document.getElementById("paletteColors"), pixelSnapGridSize, document.getElementById("operation"), pixelSnapEnabled, paletteEnabled, resizeEnabled].forEach((control) => {
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

discardPalettePreviewBtn?.addEventListener("click", resetPaletteLab);
downloadPaletteResultBtn?.addEventListener("click", () => downloadBtn?.click());
document.getElementById("paletteColors")?.addEventListener("change", updateOperationStackLabels);
document.getElementById("resizeScale")?.addEventListener("change", updateOperationStackLabels);
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
  schedulePalettePreviewUpdate();
}));
pixelSnapShowGrid?.addEventListener("change", () => preservePaletteScroll(() => { updateCompareGridToggleLabel(); updatePixelSnapGridOverlays(); }));
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
    showPaletteCompare({ resetSlider: true });
  };
  applyPreviewMode();
  updatePixelSnapAnalysis();
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
  form.append("palette_colors", document.getElementById("paletteColors").value);
  form.append("pixel_size", pixelSnapGridSize?.value || document.getElementById("pixelSize")?.value || "0");
  form.append("pixel_strength", pixelSnapStrength?.value || "1");
  form.append("snap_palette", isColorCleanupActive() ? "true" : "false");
  form.append("preserve_alpha", pixelSnapAlpha?.checked === false ? "false" : "true");
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
      sourceColors: response.headers.get("X-PF-Source-Colors"),
      outputColors: response.headers.get("X-PF-Output-Colors"),
      changedPixels: response.headers.get("X-PF-Changed-Pixels"),
      changedPercent: response.headers.get("X-PF-Changed-Percent"),
    };
    const blob = await response.blob();
    if (processedBlobUrl) URL.revokeObjectURL(processedBlobUrl);
    processedBlobUrl = URL.createObjectURL(blob);
    processedPreview.src = processedBlobUrl;
    processedPreview.classList.add("pf-viewable-image");
    processedPreview.dataset.viewerTitle = "Processed preview";
    processedPreview.onload = () => {
      paletteProcessedResolution = `${processedPreview.naturalWidth} × ${processedPreview.naturalHeight}`;
      updatePixelSnapAnalysis();
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
    updatePaletteLoadedState({ filename: selectedFile?.name || "Processed preview", source: selectedFileSource || "workspace", detail: `Processed preview ready${paletteProcessedResolution !== "—" ? ` · ${paletteProcessedResolution}` : ""}` });
    const changedText = pixelSnapLastResult?.changedPercent ? ` · ${pixelSnapLastResult.changedPercent}% changed` : "";
    addPaletteHistory(operationLabel, `${colorLabel} · ${scaleLabel}x · ${pixelSizeText}${strengthText}${changedText}`);
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
  form.append("pixel_size", pixelSnapGridSize?.value || document.getElementById("pixelSize")?.value || "0");
  form.append("pixel_strength", pixelSnapStrength?.value || "1");
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
const characterRecipe = document.getElementById("characterRecipe");
const characterPrompt = document.getElementById("characterPrompt");
const characterNegative = document.getElementById("characterNegative");
const loadCharacterDefaultsBtn = document.getElementById("loadCharacterDefaultsBtn");
const generateCharacterBtn = document.getElementById("generateCharacterBtn");
const characterOutput = document.getElementById("characterOutput");
const randomSeedBtn = document.getElementById("randomSeedBtn");
const reuseSeedBtn = document.getElementById("reuseSeedBtn");
const actualSeedDisplay = document.getElementById("actualSeedDisplay");
const lastSeedGroup = document.getElementById("lastSeedGroup");
let lastActualSeed = null;

async function loadRecipeOptions(selectEl, category) {
  if (!selectEl) return;
  const response = await fetch(`/api/recipes?category=${encodeURIComponent(category)}`);
  const data = await response.json();
  selectEl.innerHTML = "";
  (data.recipes || []).forEach((recipe) => {
    const option = document.createElement("option");
    option.value = recipe.id;
    option.textContent = recipe.display_name || recipe.id;
    selectEl.appendChild(option);
  });
  if (!selectEl.value && selectEl.options.length) {
    selectEl.selectedIndex = 0;
  }
}

async function loadRecipes() {
  return loadRecipeOptions(characterRecipe, "character");
}

async function loadCharacterDefaults() {
  const recipeId = characterRecipe?.value || "character.default";
  setStatus(`Loading recipe ${recipeId}...`);
  const response = await fetch(`/api/workflows/character/defaults?recipe_id=${encodeURIComponent(recipeId)}`);
  const data = await response.json();
  characterPrompt.value = data.positive || "";
  characterNegative.value = data.negative || "";
  const safeSize = ["512", "768", "1024"].includes(String(data.width)) ? String(data.width) : "1024";
  document.getElementById("characterSize").value = safeSize;
  document.getElementById("characterBatch").value = String(data.batch_size || 1);
  document.getElementById("characterSteps").value = String(data.steps || 24);
  const defaultSeed = data.seed ?? -1;
  document.getElementById("characterSeed").value = String(defaultSeed);
  if (lastSeedGroup && lastActualSeed === null) lastSeedGroup.classList.add("hidden");
  if (actualSeedDisplay && lastActualSeed !== null) actualSeedDisplay.value = String(lastActualSeed);
  setStatus(`Recipe loaded: ${data.display_name || recipeId}`);
}

loadCharacterDefaultsBtn.addEventListener("click", loadCharacterDefaults);
characterRecipe?.addEventListener("change", loadCharacterDefaults);
function makePixelFactorySeed() {
  return Math.floor(Math.random() * 2147483646) + 1;
}

randomSeedBtn?.addEventListener("click", () => {
  const seed = makePixelFactorySeed();
  document.getElementById("characterSeed").value = String(seed);
  setStatus(`Random seed selected for next generation: ${seed}.`);
});

reuseSeedBtn?.addEventListener("click", () => {
  if (lastActualSeed === null) return;
  document.getElementById("characterSeed").value = String(lastActualSeed);
  setStatus(`Reusing last generated seed ${lastActualSeed}.`);
});


function addGeneratedImage(src, index, asset = null, label = "character", outputEl = characterOutput) {
  const wrap = document.createElement("div");
  wrap.className = "generated-item";
  const img = document.createElement("img");
  img.src = asset?.image_url || src;
  img.alt = `Generated ${label} ${index + 1}`;
  img.classList.add("pf-viewable-image");
  img.dataset.viewerTitle = asset?.name || `Generated ${label} ${index + 1}`;
  const actions = document.createElement("div");
  actions.className = "generated-actions";
  const download = document.createElement("a");
  download.href = asset?.image_url || src;
  download.download = `${asset?.name || `pixel_factory_${label}_${index + 1}`}.png`;
  download.textContent = "Download";
  actions.appendChild(download);
  if (asset) {
    const palette = document.createElement("button");
    palette.textContent = "Palette Lab";
    palette.addEventListener("click", async () => {
      await sendAssetToPalette(asset);
    });
    actions.appendChild(palette);

    const openAssets = document.createElement("button");
    openAssets.textContent = "Open in Assets";
    openAssets.addEventListener("click", () => { setView("assets"); loadAssets(asset.id); });
    actions.appendChild(openAssets);
  }
  wrap.appendChild(img);
  wrap.appendChild(actions);
  outputEl?.appendChild(wrap);
}

generateCharacterBtn.addEventListener("click", async () => {
  if (!characterPrompt.value.trim()) {
    setStatus("Character prompt is empty.");
    return;
  }

  generateCharacterBtn.disabled = true;
  characterOutput.classList.remove("empty");
  characterOutput.innerHTML = "Generating in ComfyUI...";
  setStatus("Queued Character Studio job...");

  const size = Number(document.getElementById("characterSize").value);
  if (![512, 768, 1024].includes(size)) {
    setStatus("Only safe square generation sizes are enabled: 512, 768, or 1024.");
    generateCharacterBtn.disabled = false;
    return;
  }
  const payload = {
    comfy_url: comfyUrl.value,
    recipe_id: characterRecipe?.value || "character.default",
    prompt: characterPrompt.value,
    negative_prompt: characterNegative.value,
    seed: Number(document.getElementById("characterSeed").value),
    width: size,
    height: size,
    batch_size: Number(document.getElementById("characterBatch").value),
    steps: Number(document.getElementById("characterSteps").value),
  };

  try {
    const response = await fetch("/api/generate/character", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || `HTTP ${response.status}`);
    characterOutput.innerHTML = "";
    if (typeof data.seed !== "undefined") {
      lastActualSeed = data.seed;
      if (actualSeedDisplay) actualSeedDisplay.value = String(data.seed);
      if (lastSeedGroup) lastSeedGroup.classList.remove("hidden");
      if (reuseSeedBtn) reuseSeedBtn.disabled = false;
      document.getElementById("characterSeed").value = String(data.seed);
    }
    (data.assets || []).forEach((asset, i) => addGeneratedImage(data.images?.[i], i, asset));
    if (!data.assets) data.images.forEach(addGeneratedImage);
    await loadAssets();
    await refreshWorkspace();
    // The first returned generation is now the current workspace. Palette Lab will load it automatically when opened.
    setStatus(`Character job complete. ${data.count} image(s) returned. Seed ${data.seed}. A routed asset is ready for Palette Lab.`);
  } catch (err) {
    characterOutput.classList.add("empty");
    characterOutput.textContent = "Generation failed.";
    setStatus(`Generation error: ${err.message}`);
  } finally {
    generateCharacterBtn.disabled = false;
  }
});

loadRecipes().then(loadCharacterDefaults).catch(() => {});

// Tile Studio
const tileRecipe = document.getElementById("tileRecipe");
const tilePrompt = document.getElementById("tilePrompt");
const tileNegative = document.getElementById("tileNegative");
const loadTileDefaultsBtn = document.getElementById("loadTileDefaultsBtn");
const generateTileBtn = document.getElementById("generateTileBtn");
const tileOutput = document.getElementById("tileOutput");
const tileRandomSeedBtn = document.getElementById("tileRandomSeedBtn");
const tileReuseSeedBtn = document.getElementById("tileReuseSeedBtn");
const tileActualSeedDisplay = document.getElementById("tileActualSeedDisplay");
const tileLastSeedGroup = document.getElementById("tileLastSeedGroup");
let lastTileSeed = null;

async function loadTileRecipes() {
  return loadRecipeOptions(tileRecipe, "tile");
}

async function loadTileDefaults() {
  if (!tileRecipe || !tilePrompt || !tileNegative) return;
  const recipeId = tileRecipe.value || "tile.cobblestone";
  setStatus(`Loading tile recipe ${recipeId}...`);
  const response = await fetch(`/api/workflows/tile/defaults?recipe_id=${encodeURIComponent(recipeId)}`);
  const data = await response.json();
  tilePrompt.value = data.positive || "";
  tileNegative.value = data.negative || "";
  const safeSize = ["256", "512", "768", "1024"].includes(String(data.width)) ? String(data.width) : "256";
  document.getElementById("tileSize").value = safeSize;
  document.getElementById("tileBatch").value = String(data.batch_size || 4);
  document.getElementById("tileSteps").value = String(data.steps || 24);
  document.getElementById("tileSeed").value = String(data.seed ?? -1);
  if (tileLastSeedGroup && lastTileSeed === null) tileLastSeedGroup.classList.add("hidden");
  if (tileActualSeedDisplay && lastTileSeed !== null) tileActualSeedDisplay.value = String(lastTileSeed);
  setStatus(`Tile recipe loaded: ${data.display_name || recipeId}`);
}

tileRecipe?.addEventListener("change", loadTileDefaults);
loadTileDefaultsBtn?.addEventListener("click", loadTileDefaults);

tileRandomSeedBtn?.addEventListener("click", () => {
  const seed = makePixelFactorySeed();
  document.getElementById("tileSeed").value = String(seed);
  setStatus(`Random seed selected for next tile generation: ${seed}.`);
});

tileReuseSeedBtn?.addEventListener("click", () => {
  if (lastTileSeed === null) return;
  document.getElementById("tileSeed").value = String(lastTileSeed);
  setStatus(`Reusing last tile seed ${lastTileSeed}.`);
});

generateTileBtn?.addEventListener("click", async () => {
  if (!tilePrompt.value.trim()) {
    setStatus("Tile prompt is empty.");
    return;
  }

  generateTileBtn.disabled = true;
  tileOutput.classList.remove("empty");
  tileOutput.innerHTML = "Generating tile candidates in ComfyUI...";
  setStatus("Queued Tile Studio job...");

  const size = Number(document.getElementById("tileSize").value);
  if (![256, 512, 768, 1024].includes(size)) {
    setStatus("Only safe square tile generation sizes are enabled: 256, 512, 768, or 1024.");
    generateTileBtn.disabled = false;
    return;
  }

  const payload = {
    comfy_url: comfyUrl.value,
    recipe_id: tileRecipe?.value || "tile.cobblestone",
    prompt: tilePrompt.value,
    negative_prompt: tileNegative.value,
    seed: Number(document.getElementById("tileSeed").value),
    width: size,
    height: size,
    batch_size: Number(document.getElementById("tileBatch").value),
    steps: Number(document.getElementById("tileSteps").value),
  };

  try {
    const response = await fetch("/api/generate/tile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || `HTTP ${response.status}`);
    tileOutput.innerHTML = "";
    if (typeof data.seed !== "undefined") {
      lastTileSeed = data.seed;
      if (tileActualSeedDisplay) tileActualSeedDisplay.value = String(data.seed);
      if (tileLastSeedGroup) tileLastSeedGroup.classList.remove("hidden");
      if (tileReuseSeedBtn) tileReuseSeedBtn.disabled = false;
      document.getElementById("tileSeed").value = String(data.seed);
    }
    (data.assets || []).forEach((asset, i) => addGeneratedImage(data.images?.[i], i, asset, "tile", tileOutput));
    if (!data.assets) data.images.forEach((src, i) => addGeneratedImage(src, i, null, "tile", tileOutput));
    await loadAssets();
    await refreshWorkspace();
    setStatus(`Tile job complete. ${data.count} tile candidate(s) returned. Seed ${data.seed}. A routed asset is ready for Palette Lab.`);
  } catch (err) {
    tileOutput.classList.add("empty");
    tileOutput.textContent = "Tile generation failed.";
    setStatus(`Tile generation error: ${err.message}`);
  } finally {
    generateTileBtn.disabled = false;
  }
});

loadTileRecipes().then(loadTileDefaults).catch(() => {});

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function tagsToString(tags) {
  if (Array.isArray(tags)) return tags.join(", ");
  return String(tags || "");
}

function assetDisplayName(asset) {
  return String(asset?.name || asset?.id || "asset");
}

function assetStatusLabel(asset) {
  return asset?.status === "accepted" ? "Accepted" : "Candidate";
}

function assetFolderLabel(asset) {
  if (asset?.status === "accepted" && asset?.accepted_image_path) return asset.accepted_image_path;
  return asset?.image_path || "";
}

async function copyText(value, label = "Text") {
  try {
    await navigator.clipboard.writeText(String(value ?? ""));
    setStatus(`${label} copied.`);
  } catch (_) {
    setStatus(`Could not copy ${label.toLowerCase()}.`);
  }
}

// Asset Browser
const assetGrid = document.getElementById("assetGrid");
const assetInspector = document.getElementById("assetInspector");
const refreshAssetsBtn = document.getElementById("refreshAssetsBtn");
const assetFilter = document.getElementById("assetFilter");
const assetTypeFilter = document.getElementById("assetTypeFilter");
const assetSort = document.getElementById("assetSort");
const clearCandidateAssetsBtn = document.getElementById("clearCandidateAssetsBtn");
const assetBrowserTitle = document.getElementById("assetBrowserTitle");
let assets = [];
let selectedAssetId = null;
let exportSelection = new Set();

function selectedAssets() {
  return assets.filter((asset) => exportSelection.has(asset.id));
}

function viewerItemsFromAssets(items) {
  return (items || []).map((asset) => ({
    id: asset.id,
    src: asset.image_url,
    title: assetDisplayName(asset),
    type: asset.type || "asset",
    status: assetStatusLabel(asset),
  }));
}

function assetCountSummary(items, key) {
  const counts = {};
  items.forEach((item) => {
    const value = String(item?.[key] || "unknown");
    counts[value] = (counts[value] || 0) + 1;
  });
  return counts;
}

function formatCountSummary(counts) {
  const entries = Object.entries(counts);
  if (!entries.length) return "None";
  return entries
    .map(([name, count]) => `${count} ${name}${count === 1 ? "" : "s"}`)
    .join(" · ");
}

function formatStatusSummary(items) {
  const counts = {};
  items.forEach((asset) => {
    const label = assetStatusLabel(asset).toLowerCase();
    counts[label] = (counts[label] || 0) + 1;
  });
  return formatCountSummary(counts);
}

function selectedTagSummary(items, limit = 8) {
  const counts = {};
  items.forEach((item) => {
    (item.tags || []).forEach((tag) => {
      const value = String(tag || "").trim();
      if (!value) return;
      counts[value] = (counts[value] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);
}

function updateSelectionBar(items = selectedAssets()) {
  const bar = document.getElementById("assetSelectionBar");
  const countEl = document.getElementById("assetSelectionCount");
  const metaEl = document.getElementById("assetSelectionMeta");
  if (!bar || !countEl || !metaEl) return;

  const count = exportSelection.size;
  const shouldHide = count === 0 || activeViewName === "exporter";
  bar.classList.toggle("hidden", shouldHide);
  countEl.textContent = `${count} selected`;
  metaEl.textContent = count ? formatCountSummary(assetCountSummary(items, "type")) : "Shift-click assets to multi-select.";
}

function clearAssetSelection({ status = "Selection cleared.", rerender = true } = {}) {
  exportSelection.clear();
  selectedAssetId = null;
  updateExportSelectionStatus();
  if (rerender) {
    renderAssets();
    if (assetInspector) {
      assetInspector.className = "asset-inspector empty";
      assetInspector.textContent = "Select an asset.";
    }
  }
  if (status) setStatus(status);
}

function updateExportSelectionStatus() {
  const count = exportSelection.size;
  const label = `Export selection: ${count}`;
  ["exportSelectionStatus"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = label;
  });
  ["exportSelectedBtn", "selectionBarExporterBtn"].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) btn.disabled = count === 0;
  });
  updateSelectionBar();
  renderExportSelectionPanel();
}

function toggleExportSelection(assetId, checked = null, rerender = true) {
  if (!assetId) return;
  const nextChecked = checked === null ? !exportSelection.has(assetId) : Boolean(checked);
  if (nextChecked) exportSelection.add(assetId);
  else exportSelection.delete(assetId);
  updateExportSelectionStatus();
  if (rerender) renderAssets(selectedAssetId);
  if (exportSelection.size > 1) renderMultiSelectionInspector();
  else if (exportSelection.size === 1) {
    const only = Array.from(exportSelection)[0];
    selectAsset(only, false);
  } else if (selectedAssetId) {
    selectAsset(selectedAssetId, false);
  }
}

assetGrid?.addEventListener("click", async (event) => {
  const favoriteButton = event.target.closest(".asset-card-favorite");
  if (!favoriteButton) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const card = favoriteButton.closest(".asset-card");
  const assetId = favoriteButton.dataset.assetId || card?.dataset.assetId;
  if (!assetId) return;
  await toggleAssetFavorite(assetId);
});

assetGrid?.addEventListener("click", (event) => {
  // Clicking empty grid space exits selection mode. Cards and card controls manage their own clicks.
  if (event.target.closest(".asset-card")) return;
  clearAssetSelection({ status: "Selection cleared." });
});

function assetStatusQuery() {
  const params = new URLSearchParams();
  const status = assetFilter?.value || "";
  const assetType = assetTypeFilter?.value || "";
  if (status === "favorite") params.set("favorite", "true");
  else if (status) params.set("status", status);
  if (assetType) params.set("asset_type", assetType);
  const query = params.toString();
  return query ? `?${query}` : "";
}

function sortAssetsForView(items) {
  const mode = assetSort?.value || "newest";
  const sorted = [...items];
  if (mode === "oldest") sorted.reverse();
  if (mode === "type") sorted.sort((a, b) => String(a.type || "").localeCompare(String(b.type || "")) || String(b.created || "").localeCompare(String(a.created || "")));
  if (mode === "status") sorted.sort((a, b) => String(a.status || "").localeCompare(String(b.status || "")) || String(b.created || "").localeCompare(String(a.created || "")));
  if (mode === "favorite") sorted.sort((a, b) => Number(Boolean(b.favorite)) - Number(Boolean(a.favorite)) || String(b.created || "").localeCompare(String(a.created || "")));
  return sorted;
}

function updateAssetBrowserHeading() {
  if (!assetBrowserTitle) return;
  const value = assetFilter?.value || "";
  const names = {
    "": "All Assets",
    incoming: "Candidate Assets",
    accepted: "Accepted Assets",
    favorite: "Favorite Assets",
  };
  assetBrowserTitle.textContent = names[value] || "Asset Browser";
}

async function loadAssets(selectId = null) {
  if (!assetGrid) return;
  updateAssetBrowserHeading();
  const response = await fetch(`/api/assets${assetStatusQuery()}`);
  const data = await response.json();
  assets = sortAssetsForView(data.assets || []);
  renderAssets(selectId);
}

function renderAssets(selectId = null) {
  if (!assetGrid) return;
  assetGrid.innerHTML = "";
  if (!assets.length) {
    assetGrid.classList.add("empty");
    assetGrid.textContent = "No assets found.";
    assetInspector.className = "asset-inspector empty";
    assetInspector.textContent = "Select an asset.";
    return;
  }
  assetGrid.classList.remove("empty");
  assets.forEach((asset) => {
    const card = document.createElement("div");
    const displayName = assetDisplayName(asset);
    const statusLabel = assetStatusLabel(asset);
    card.className = "asset-card" + (asset.id === selectedAssetId ? " selected" : "") + (exportSelection.has(asset.id) ? " export-selected" : "") + (asset.status === "accepted" ? " accepted" : " incoming");
    card.dataset.assetId = asset.id;
    card.innerHTML = `
      <div class="asset-thumb-wrap">
        <img class="asset-thumb-image" src="${asset.image_url}" alt="${escapeHtml(displayName)}">
        <button class="asset-thumb-zoom" type="button" title="View large" aria-label="View ${escapeHtml(displayName)} large">⌕</button>
        <div class="asset-selected-mark" aria-hidden="true">✓</div>
        <button class="asset-card-favorite ${asset.favorite ? "active" : ""}" type="button" data-asset-id="${escapeHtml(asset.id)}" title="${asset.favorite ? "Unfavorite" : "Favorite"}" aria-label="${asset.favorite ? "Unfavorite" : "Favorite"} ${escapeHtml(displayName)}"><span class="asset-favorite-star" aria-hidden="true">${asset.favorite ? "★" : "☆"}</span></button>
        <span class="asset-status-badge ${asset.status === "accepted" ? "accepted" : "incoming"}">${statusLabel}</span>
      </div>
      <div class="asset-title">${escapeHtml(displayName)}</div>
      <div class="asset-meta">${escapeHtml(asset.type)} · ${escapeHtml(statusLabel)}</div>
      ${Array.isArray(asset.tags) && asset.tags.length ? `<div class="asset-tags">${asset.tags.map((t) => `<span>${escapeHtml(t)}</span>`).join("")}</div>` : ""}
    `;
    card.addEventListener("click", (event) => {
      if (event.shiftKey || event.ctrlKey || event.metaKey) {
        event.preventDefault();
        toggleExportSelection(asset.id);
        return;
      }

      // A normal click leaves multi-select mode and inspects only this asset.
      // Modifier-click is the explicit multi-select behavior.
      selectAsset(asset.id, true);
    });
    card.querySelector(".asset-thumb-zoom")?.addEventListener("click", (event) => {
      event.stopPropagation();
      openImageViewer(asset.image_url, displayName);
    });
    const favoriteButton = card.querySelector(".asset-card-favorite");
    favoriteButton?.addEventListener("pointerdown", (event) => event.stopPropagation());
    favoriteButton?.addEventListener("mousedown", (event) => event.stopPropagation());
    assetGrid.appendChild(card);
  });
  if (selectId) selectAsset(selectId);
  if (exportSelection.size > 1) renderMultiSelectionInspector();
  updateExportSelectionStatus();
}

function renderMultiSelectionInspector() {
  if (!assetInspector) return;
  const items = selectedAssets();
  if (!items.length) {
    assetInspector.className = "asset-inspector empty";
    assetInspector.textContent = "Select an asset.";
    return;
  }

  const typeSummary = formatCountSummary(assetCountSummary(items, "type"));
  const statusSummary = formatStatusSummary(items);
  const tagSummary = selectedTagSummary(items);

  assetInspector.className = "asset-inspector multi";
  assetInspector.innerHTML = `
    <div class="multi-inspector-hero">
      ${items.slice(0, 9).map((asset, index) => `<button class="multi-inspector-thumb" type="button" data-index="${index}" title="View ${escapeHtml(assetDisplayName(asset))}"><img src="${asset.image_url}" alt="${escapeHtml(assetDisplayName(asset))}"></button>`).join("")}
    </div>

    <section class="inspector-section">
      <h3>${items.length} Assets Selected</h3>
      <div class="metadata-grid">
        <div><span>Types</span><strong>${escapeHtml(typeSummary)}</strong></div>
        <div><span>Status</span><strong>${escapeHtml(statusSummary)}</strong></div>
      </div>
      <div class="asset-tags multi-tags">
        ${tagSummary.length ? tagSummary.map(([tag, count]) => `<span>${escapeHtml(tag)} × ${count}</span>`).join("") : "<span>No shared tags found</span>"}
      </div>
    </section>

    <div class="asset-actions multi-actions">
      ${items.some((asset) => asset.status !== "accepted") ? '<button id="multiAcceptSelectedBtn" type="button">Accept Selected</button>' : ""}
      <button id="multiFavoriteSelectedBtn" type="button">Favorite Selected</button>
      <button id="multiDownloadSelectedBtn" type="button">Download Selected</button>
      <button id="multiSendExporterBtn" type="button" class="export-route-btn">Export Selected</button>
    </div>

    <section class="inspector-section">
      <h3>Selection</h3>
      <div class="multi-selection-list">
        ${items.map((asset) => `<div><strong>${escapeHtml(assetDisplayName(asset))}</strong><span>${escapeHtml(asset.type || "asset")} · ${escapeHtml(assetStatusLabel(asset))}</span></div>`).join("")}
      </div>
    </section>
  `;

  assetInspector.querySelectorAll(".multi-inspector-thumb").forEach((button) => {
    button.addEventListener("click", () => openSelectedImageViewer(Number(button.dataset.index || 0)));
  });
  document.getElementById("multiAcceptSelectedBtn")?.addEventListener("click", acceptSelectedAssets);
  document.getElementById("multiFavoriteSelectedBtn")?.addEventListener("click", favoriteSelectedAssets);
  document.getElementById("multiSendExporterBtn")?.addEventListener("click", () => routeSelectionToExporter());
  document.getElementById("multiDownloadSelectedBtn")?.addEventListener("click", downloadSelectedAssets);
}

function renderGenerationSettings(asset) {
  const rows = [
    ["Recipe", asset.recipe_name || asset.recipe_id || "?"],
    ["Workflow", asset.workflow || "?"],
    ["Engine", asset.engine || "?"],
    ["Size", `${asset.width || "?"} x ${asset.height || "?"}`],
    ["Steps", asset.steps || "?"],
    ["Seed", asset.seed ?? "?"],
  ];
  return rows.map(([label, value]) => `<div><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
}

function selectAsset(assetId, clearMultiSelection = false) {
  if (clearMultiSelection && exportSelection.size) {
    exportSelection.clear();
    updateExportSelectionStatus();
  }
  selectedAssetId = assetId;
  const asset = assets.find((a) => a.id === assetId);
  renderAssets();
  if (!asset) return;
  const tags = tagsToString(asset.tags);
  const displayName = assetDisplayName(asset);
  const statusLabel = assetStatusLabel(asset);
  const activePath = assetFolderLabel(asset);
  assetInspector.className = "asset-inspector";
  assetInspector.innerHTML = `
    <div class="inspector-hero">
      <img src="${asset.image_url}" alt="${escapeHtml(displayName)}">
      <button id="inspectorFavoriteBtn" type="button" class="inspector-favorite-btn ${asset.favorite ? "active" : ""}" title="${asset.favorite ? "Unfavorite" : "Favorite"}" aria-label="${asset.favorite ? "Unfavorite" : "Favorite"} ${escapeHtml(displayName)}"><span aria-hidden="true">${asset.favorite ? "★" : "☆"}</span></button>
      <button id="inspectorViewLargeBtn" type="button" class="inspector-view-btn">View Large</button>
      <span class="inspector-status-badge ${asset.status === "accepted" ? "accepted" : "incoming"}">${statusLabel}</span>
    </div>

    <div class="asset-actions">
      ${asset.status === "accepted" ? "" : '<button id="acceptAssetBtn">Accept</button>'}
      <button id="paletteAssetBtn">Open in Palette Lab</button>
      <button id="sendToExporterBtn" class="export-route-btn">Export</button>
      <a href="${asset.image_url}" download="${escapeHtml(asset.name)}.png">Download</a>
      <button id="deleteAssetBtn">Delete</button>
    </div>

    <section class="inspector-section">
      <h3>Identity</h3>
      <label>Asset Name</label>
      <input id="assetNameInput" type="text" value="${escapeHtml(displayName)}">
      <label>Tags</label>
      <input id="assetTagsInput" type="text" value="${escapeHtml(tags)}" placeholder="npc, fisherman, accepted">
      <label>Notes</label>
      <textarea id="assetNotesInput" class="asset-notes" placeholder="Notes for future you...">${escapeHtml(asset.notes || "")}</textarea>
      <button id="saveAssetMetadataBtn" type="button">Save Metadata</button>
    </section>

    <section class="inspector-section">
      <h3>Generation</h3>
      <div class="metadata-grid">${renderGenerationSettings(asset)}</div>
      <div class="metadata-path"><strong>ID:</strong> ${escapeHtml(asset.id)}</div>
      <div class="metadata-path"><strong>Status:</strong> ${escapeHtml(statusLabel)}</div>
      <div class="metadata-path"><strong>Created:</strong> ${escapeHtml(asset.created || "")}</div>
      <div class="metadata-path"><strong>Current Image:</strong> ${escapeHtml(activePath)}</div>
      <div class="metadata-path"><strong>Original:</strong> ${escapeHtml(asset.image_path || "")}</div>
      ${asset.accepted_image_path ? `<div class="metadata-path"><strong>Accepted Copy:</strong> ${escapeHtml(asset.accepted_image_path)}</div>` : ""}
      ${asset.project_root ? `<div class="metadata-path"><strong>Project:</strong> ${escapeHtml(asset.project_root)}</div>` : ""}
    </section>

    <section class="inspector-section">
      <div class="section-title-row"><h3>Prompt</h3><button id="copyPromptBtn" type="button">Copy</button></div>
      <div class="inspector-prompt">${escapeHtml(asset.prompt || "")}</div>
    </section>

    <section class="inspector-section">
      <div class="section-title-row"><h3>Negative Prompt</h3><button id="copyNegativeBtn" type="button">Copy</button></div>
      <div class="inspector-prompt">${escapeHtml(asset.negative_prompt || "")}</div>
    </section>

    ${asset.resolved_prompt ? `<section class="inspector-section"><div class="section-title-row"><h3>Resolved Prompt</h3><button id="copyResolvedPromptBtn" type="button">Copy</button></div><div class="inspector-prompt">${escapeHtml(asset.resolved_prompt)}</div></section>` : ""}
  `;
  document.getElementById("inspectorViewLargeBtn")?.addEventListener("click", () => openImageViewer(asset.image_url, displayName));
  document.getElementById("acceptAssetBtn")?.addEventListener("click", () => acceptAsset(asset.id));
  document.getElementById("inspectorFavoriteBtn")?.addEventListener("click", () => toggleAssetFavorite(asset.id));
  document.getElementById("paletteAssetBtn")?.addEventListener("click", () => sendAssetToPalette(asset));
  document.getElementById("deleteAssetBtn").addEventListener("click", () => deleteAsset(asset.id));
  document.getElementById("sendToExporterBtn")?.addEventListener("click", () => routeAssetToExporter(asset.id));
  document.getElementById("saveAssetMetadataBtn")?.addEventListener("click", () => updateAssetMetadata(asset.id, {
    name: document.getElementById("assetNameInput")?.value || displayName,
    tags: document.getElementById("assetTagsInput")?.value || "",
    notes: document.getElementById("assetNotesInput")?.value || "",
  }));
  document.getElementById("copyPromptBtn")?.addEventListener("click", () => copyText(asset.prompt || "", "Prompt"));
  document.getElementById("copyNegativeBtn")?.addEventListener("click", () => copyText(asset.negative_prompt || "", "Negative prompt"));
  document.getElementById("copyResolvedPromptBtn")?.addEventListener("click", () => copyText(asset.resolved_prompt || "", "Resolved prompt"));
}

async function updateAssetMetadata(assetId, changes) {
  const response = await fetch(`/api/assets/${assetId}/metadata`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(changes),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    setStatus(data.detail || "Metadata update failed.");
    return null;
  }
  setStatus("Asset metadata saved.");
  await loadAssets(assetId);
  return data.asset || true;
}

async function toggleAssetFavorite(assetId) {
  const asset = assets.find((item) => item.id === assetId);
  if (!asset) return;

  const nextFavorite = !asset.favorite;
  const wasSelected = selectedAssetId === assetId;

  // Optimistic UI update so the card responds immediately.
  asset.favorite = nextFavorite;
  renderAssets(wasSelected ? assetId : selectedAssetId);

  const updated = await updateAssetMetadata(assetId, { favorite: nextFavorite });
  if (!updated) {
    asset.favorite = !nextFavorite;
    await loadAssets(wasSelected ? assetId : selectedAssetId);
    return;
  }

  // Favoriting a Candidate promotes it to Accepted on the backend. Reflect that
  // immediately in the local copy before the next render/refresh completes.
  if (typeof updated === "object") {
    asset.favorite = Boolean(updated.favorite);
    asset.status = updated.status || asset.status;
    asset.accepted_image_path = updated.accepted_image_path || asset.accepted_image_path;
  }

  setStatus(nextFavorite ? "Asset favorited and saved to Accepted." : "Asset removed from favorites.");
}

async function acceptAsset(assetId) {
  const response = await fetch(`/api/assets/${assetId}/accept`, { method: "POST" });
  if (!response.ok) { setStatus("Accept failed."); return; }
  setStatus("Asset accepted.");
  await loadAssets(assetId);
}

async function acceptSelectedAssets() {
  const items = selectedAssets();
  if (!items.length) {
    setStatus("Select assets first.");
    return;
  }
  const candidates = items.filter((asset) => asset.status !== "accepted");
  if (!candidates.length) {
    setStatus("Selected assets are already accepted.");
    return;
  }
  setStatus(`Accepting ${candidates.length} selected asset(s)...`);
  let ok = 0;
  for (const asset of candidates) {
    try {
      const response = await fetch(`/api/assets/${asset.id}/accept`, { method: "POST" });
      if (response.ok) ok += 1;
    } catch (_) {}
  }
  setStatus(`Accepted ${ok} selected asset(s).`);
  await loadAssets();
  renderMultiSelectionInspector();
}

async function favoriteSelectedAssets() {
  const items = selectedAssets();
  if (!items.length) {
    setStatus("Select assets first.");
    return;
  }
  setStatus(`Favoriting ${items.length} selected asset(s)...`);
  let ok = 0;
  for (const asset of items) {
    try {
      const response = await fetch(`/api/assets/${asset.id}/metadata`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorite: true }),
      });
      if (response.ok) ok += 1;
    } catch (_) {}
  }
  setStatus(`Favorited and saved ${ok} selected asset(s).`);
  await loadAssets();
  renderMultiSelectionInspector();
}

function downloadSelectedAssets() {
  const items = selectedAssets();
  if (!items.length) {
    setStatus("Select assets first.");
    return;
  }
  items.forEach((asset, index) => {
    setTimeout(() => {
      const link = document.createElement("a");
      link.href = asset.image_url;
      link.download = `${assetDisplayName(asset).replace(/[^a-z0-9_\-]+/gi, "_")}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }, index * 120);
  });
  setStatus(`Downloading ${items.length} selected asset(s).`);
}

async function deleteAsset(assetId) {
  if (!confirm("Delete this asset?")) return;
  const response = await fetch(`/api/assets/${assetId}`, { method: "DELETE" });
  if (!response.ok) { setStatus("Delete failed."); return; }
  selectedAssetId = null;
  exportSelection.delete(assetId);
  updateExportSelectionStatus();
  setStatus("Asset deleted.");
  await loadAssets();
}

async function setWorkspaceFromAsset(asset) {
  const response = await fetch(`/api/workspace/from-asset/${asset.id}`, { method: "POST" });
  if (!response.ok) {
    setStatus("Could not set workspace from asset.");
    return;
  }
  await refreshWorkspace();
  setStatus(`Workspace set to ${assetDisplayName(asset)}.`);
}

async function sendAssetToPalette(asset) {
  const response = await fetch(`/api/workspace/from-asset/${asset.id}`, { method: "POST" });
  if (!response.ok) {
    setStatus("Could not load asset into workspace.");
    return;
  }
  await refreshWorkspace();
  await loadWorkspaceIntoPalette();
  paletteSourceAsset = { id: asset.id, name: assetDisplayName(asset), type: asset.type || "asset", recipe: asset.recipe || asset.recipe_id || asset.generation?.recipe || "—" };
  updatePaletteMeta({
    type: asset.type || "asset",
    status: assetStatusLabel(asset),
    recipe: asset.recipe || asset.recipe_id || asset.generation?.recipe || "—",
  });
  addPaletteHistory("Opened from Asset Browser", assetDisplayName(asset));
  setStatus(`Opened ${assetDisplayName(asset)} in Palette Lab.`);
}




function exportTargetLabel() {
  const target = selectedExportTarget();
  return target === "aseprite" ? "Aseprite" : "Godot";
}

function renderExportSelectionPanel() {
  const panel = document.getElementById("exportSelectionPanel");
  if (!panel) return;

  const items = selectedAssets();
  const target = selectedExportTarget();
  const targetLabel = target === "aseprite" ? "Aseprite" : "Godot";

  if (!items.length) {
    panel.className = "export-selection-panel empty";
    panel.innerHTML = `
      <div class="export-selection-empty">
        <strong>No assets loaded for export.</strong>
        <span>Select assets in Asset Browser, then click Export.</span>
        <div class="export-panel-actions">
          <button id="exportPanelBrowseAssetsBtn" type="button">Browse Assets</button>
          <button id="exportPanelRefreshBtn" type="button">Refresh Export Status</button>
        </div>
      </div>
    `;
      document.getElementById("exportPanelRefreshBtn")?.addEventListener("click", refreshExportStatus);
      document.getElementById("exportPanelBrowseAssetsBtn")?.addEventListener("click", () => setView("assets"));
    return;
  }

  const typeSummary = formatCountSummary(assetCountSummary(items, "type"));
  const statusSummary = formatStatusSummary(items);
  const tagSummary = selectedTagSummary(items, 10);

  panel.className = "export-selection-panel";
  panel.innerHTML = `
    <div class="export-selection-header">
      <div>
        <h3>${items.length} Asset${items.length === 1 ? "" : "s"} Ready</h3>
        <p>Review the loaded selection, choose the export target, then export from here.</p>
      </div>
      <strong>${escapeHtml(targetLabel)}</strong>
    </div>

    <div class="export-target-picker" role="group" aria-label="Export target">
      <button id="exportPanelTargetGodot" type="button" class="${target === "godot" ? "active" : ""}" data-export-target="godot">Godot</button>
      <button id="exportPanelTargetAseprite" type="button" class="${target === "aseprite" ? "active" : ""}" data-export-target="aseprite">Aseprite</button>
    </div>

    <div class="export-selection-preview">
      ${items.slice(0, 12).map((asset) => `
        <div class="export-preview-tile" title="${escapeHtml(assetDisplayName(asset))}">
          <img src="${asset.image_url}" alt="${escapeHtml(assetDisplayName(asset))}">
        </div>
      `).join("")}
      ${items.length > 12 ? `<div class="export-preview-more">+${items.length - 12}</div>` : ""}
    </div>

    <div class="metadata-grid export-selection-meta">
      <div><span>Types</span><strong>${escapeHtml(typeSummary)}</strong></div>
      <div><span>Status</span><strong>${escapeHtml(statusSummary)}</strong></div>
    </div>

    <div class="asset-tags export-selection-tags">
      ${tagSummary.length ? tagSummary.map(([tag, count]) => `<span>${escapeHtml(tag)} × ${count}</span>`).join("") : ""}
    </div>

    <div class="export-panel-actions export-panel-actions-clean">
      <button id="exportPanelSelectedBtn" type="button" class="pf-primary-action">Export to ${escapeHtml(targetLabel)}</button>
    </div>
  `;

  document.querySelectorAll("[data-export-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
      applyExportTarget(btn.dataset.exportTarget);
      renderExportSelectionPanel();
    });
  });
  document.getElementById("exportPanelSelectedBtn")?.addEventListener("click", exportSelectedAssets);
}
function applyExportTarget(target = null) {
  if (!target) return;
  exportTargetState = target === "aseprite" ? "aseprite" : "godot";
  const exporterTarget = document.getElementById("exportTarget");
  if (exporterTarget) exporterTarget.value = exportTargetState;
}

function routeSelectionToExporter(target = null) {
  if (!exportSelection.size) {
    setStatus("Shift-click one or more assets before opening the Exporter.");
    return;
  }
  applyExportTarget(target);
  updateExportSelectionStatus();
  setView("exporter", { preserveSelection: true });
  setStatus(`Loaded ${exportSelection.size} selected asset(s) into Exporter.`);
}

function routeAssetToExporter(assetId, target = null) {
  if (!assetId) {
    routeSelectionToExporter(target);
    return;
  }

  exportSelection.clear();
  exportSelection.add(assetId);
  applyExportTarget(target);
  updateExportSelectionStatus();
  setView("exporter", { preserveSelection: true });
  setStatus(`Loaded 1 asset into Exporter.`);
}

function clearExportSelection() {
  exportSelection.clear();
  updateExportSelectionStatus();
  renderAssets(selectedAssetId);
  if (selectedAssetId) selectAsset(selectedAssetId, false);
  else {
    assetInspector.className = "asset-inspector empty";
    assetInspector.textContent = "Select an asset.";
  }
}


async function exportAsset(assetId, target) {
  if (!assetId) {
    setStatus("Export failed: no asset selected.");
    return null;
  }
  const response = await fetch(`/api/assets/${assetId}/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data.detail || data.error || response.status;
    setStatus(`Export failed for ${assetId}: ${detail}`);
    await refreshExportStatus();
    return null;
  }
  const exportedPath = data.export?.image_path || "export folder";
  setStatus(`Exported ${assetId} to ${target}: ${exportedPath}`);
  await refreshExportStatus();
  return data.export;
}

function selectedExportTarget() {
  return document.getElementById("exportTarget")?.value || exportTargetState || "godot";
}

async function exportSelectedAssets() {
  const target = selectedExportTarget();
  const btn = document.getElementById("exportSelectedBtn");
  const panelBtn = document.getElementById("exportPanelSelectedBtn");
  if (!exportSelection.size) {
    setStatus("Select one or more assets first.");
    return;
  }
  if (btn) btn.disabled = true;
  if (panelBtn) panelBtn.disabled = true;
  try {
    const response = await fetch(`/api/exports/${target}/assets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ asset_ids: Array.from(exportSelection) }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || `HTTP ${response.status}`);
    const failureText = data.failures?.length ? ` ${data.failures.length} failed.` : "";
    setStatus(`Exported ${data.count || 0} selected asset(s) to ${target}.${failureText}`);
    await refreshExportStatus();
  } catch (err) {
    setStatus(`Export selected failed: ${err.message}`);
    await refreshExportStatus();
  } finally {
    if (btn) btn.disabled = false;
    if (panelBtn) panelBtn.disabled = false;
    updateExportSelectionStatus();
  }
}

async function exportAcceptedAssets() {
  const target = selectedExportTarget();
  const btn = document.getElementById("exportAcceptedBtn");
  const panelBtn = document.getElementById("exportPanelAcceptedBtn");
  if (btn) btn.disabled = true;
  if (panelBtn) panelBtn.disabled = true;
  try {
    const response = await fetch(`/api/exports/${target}/accepted`, { method: "POST" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || `HTTP ${response.status}`);
    const failureText = data.failures?.length ? ` ${data.failures.length} failed.` : "";
    setStatus(`Exported ${data.count || 0} accepted asset(s) to ${target}.${failureText}`);
    await refreshExportStatus();
  } catch (err) {
    setStatus(`Export accepted failed: ${err.message}`);
    await refreshExportStatus();
  } finally {
    if (btn) btn.disabled = false;
    if (panelBtn) panelBtn.disabled = false;
  }
}

async function refreshExportStatus() {
  const panel = document.getElementById("exportStatusPanel");
  if (!panel) return;
  try {
    const response = await fetch("/api/exports");
    const data = await response.json();
    const targets = data.targets || {};
    panel.innerHTML = `
      <details class="export-details-panel">
        <summary>Export history, paths, and manifest details</summary>
        <div class="export-summary-grid">
          <div><span>Selected assets</span><strong>${escapeHtml(exportSelection.size)}</strong></div>
          <div><span>Accepted assets</span><strong>${escapeHtml(data.accepted_count ?? 0)}</strong></div>
          <div><span>Candidate assets</span><strong>${escapeHtml(data.incoming_count ?? 0)}</strong></div>
          <div><span>Exports root</span><strong>${escapeHtml(data.exports_root || "Exports")}</strong></div>
        </div>
        ${Object.entries(targets).map(([key, info]) => `
          <div class="export-target-row">
            <div class="export-target-header">
              <strong>${escapeHtml(key)}</strong>
              <span>${escapeHtml(info.count || 0)} exported</span>
            </div>
            <div class="metadata-path"><strong>Folder:</strong> ${escapeHtml(info.folder || "")}</div>
            <div class="metadata-path"><strong>Manifest:</strong> ${escapeHtml(info.manifest_path || "")} ${info.manifest_exists ? "✓" : "not created yet"}</div>
            ${Array.isArray(info.recent_exports) && info.recent_exports.length ? `
              <div class="export-recent-list">
                ${info.recent_exports.map((item) => `
                  <div class="export-recent-item">
                    <strong>${escapeHtml(item.name || item.asset_id || "asset")}</strong>
                    <span>${escapeHtml(item.image_path || "")}</span>
                    <span>${item.image_exists ? "PNG exists ✓" : "PNG missing"} · ${item.metadata_exists ? "JSON exists ✓" : "JSON missing"}</span>
                  </div>
                `).join("")}
              </div>
            ` : `<div class="export-empty-note">No exports yet for ${escapeHtml(key)}.</div>`}
          </div>
        `).join("")}
      </details>
    `;
    renderExportSelectionPanel();
  } catch (err) {
    panel.textContent = `Could not load export status: ${err.message}`;
  }
}

document.getElementById("exportSelectedBtn")?.addEventListener("click", exportSelectedAssets);
function clearExportSelectionWithStatus() {
  clearExportSelection();
  setStatus("Selection cleared.");
}
document.getElementById("refreshExportsBtn")?.addEventListener("click", refreshExportStatus);

async function clearUnsavedCandidates() {
  if (!confirm("Delete all unsaved candidate assets? This wipes them from the Asset Browser. Accepted and favorited assets are kept.")) return;
  if (clearCandidateAssetsBtn) clearCandidateAssetsBtn.disabled = true;
  setStatus("Deleting unsaved candidates...");

  try {
    let response = await fetch("/api/assets/candidates/clear", { method: "POST" });
    // Fallback for cached older routes during local testing.
    if (response.status === 404 || response.status === 405) {
      response = await fetch("/api/assets/candidates", { method: "DELETE" });
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || data.error || `HTTP ${response.status}`);

    selectedAssetId = null;
    exportSelection.clear();
    if (data.workspace_cleared) {
      selectedFile = null;
      selectedFileSource = null;
      originalPreview?.removeAttribute("src");
      processedPreview?.removeAttribute("src");
      if (downloadBtn) downloadBtn.disabled = true;
    }
    await refreshWorkspace();
    await loadAssets();
    updateExportSelectionStatus();
    setStatus(`Deleted ${data.deleted || 0} unsaved candidate asset(s). Kept ${data.kept || 0} saved asset(s).`);
  } catch (err) {
    setStatus(`Could not delete candidates: ${err.message}`);
  } finally {
    if (clearCandidateAssetsBtn) clearCandidateAssetsBtn.disabled = false;
  }
}

refreshAssetsBtn?.addEventListener("click", () => loadAssets());
document.getElementById("selectionBarViewBtn")?.addEventListener("click", () => openSelectedImageViewer(0));
document.getElementById("selectionBarClearBtn")?.addEventListener("click", () => clearAssetSelection({ status: "Selection cleared." }));
document.getElementById("selectionBarExporterBtn")?.addEventListener("click", () => routeSelectionToExporter());

assetFilter?.addEventListener("change", () => loadAssets());
assetTypeFilter?.addEventListener("change", () => loadAssets());
assetSort?.addEventListener("change", () => { assets = sortAssetsForView(assets); renderAssets(selectedAssetId); });
clearCandidateAssetsBtn?.addEventListener("click", clearUnsavedCandidates);



// PF-0009 Universal Image Viewer
const imageViewerModal = document.getElementById("imageViewerModal");
const imageViewerImage = document.getElementById("imageViewerImage");
const imageViewerStage = document.getElementById("imageViewerStage");
const imageViewerTitle = document.getElementById("imageViewerTitle");
const imageViewerMeta = document.getElementById("imageViewerMeta");
const viewerDownloadLink = document.getElementById("viewerDownloadLink");
const viewerDownloadAllBtn = document.getElementById("viewerDownloadAllBtn");
const viewerCloseBtn = document.getElementById("viewerCloseBtn");
const viewerFitBtn = document.getElementById("viewerFitBtn");
const viewerActualBtn = document.getElementById("viewerActualBtn");
const viewerZoomInBtn = document.getElementById("viewerZoomInBtn");
const viewerZoomOutBtn = document.getElementById("viewerZoomOutBtn");
const viewerPrevBtn = document.getElementById("viewerPrevBtn");
const viewerNextBtn = document.getElementById("viewerNextBtn");
const imageViewerStrip = document.getElementById("imageViewerStrip");

let viewerCollection = [];
let viewerIndex = -1;
let viewerZoom = 1;
let viewerMode = "fit";
let viewerDragging = false;
let viewerDragStart = { x: 0, y: 0, scrollLeft: 0, scrollTop: 0 };

function updateViewerMeta() {
  if (!imageViewerMeta) return;
  const pct = Math.round(viewerZoom * 100);
  imageViewerMeta.textContent = viewerMode === "fit" ? "Fit to window" : `${pct}%`;
}

function centerViewerScroll() {
  if (!imageViewerStage) return;
  requestAnimationFrame(() => {
    imageViewerStage.scrollLeft = Math.max(0, (imageViewerStage.scrollWidth - imageViewerStage.clientWidth) / 2);
    imageViewerStage.scrollTop = Math.max(0, (imageViewerStage.scrollHeight - imageViewerStage.clientHeight) / 2);
  });
}

function applyViewerMode({ center = false } = {}) {
  if (!imageViewerImage || !imageViewerStage) return;
  imageViewerStage.classList.toggle("fit", viewerMode === "fit");
  imageViewerStage.classList.toggle("actual", viewerMode !== "fit");
  imageViewerImage.style.transform = "none";

  if (viewerMode === "fit") {
    imageViewerImage.style.width = "auto";
    imageViewerImage.style.height = "auto";
    imageViewerImage.style.maxWidth = "100%";
    imageViewerImage.style.maxHeight = "100%";
  } else {
    const naturalWidth = imageViewerImage.naturalWidth || imageViewerImage.width || 1;
    imageViewerImage.style.maxWidth = "none";
    imageViewerImage.style.maxHeight = "none";
    imageViewerImage.style.width = `${Math.max(1, Math.round(naturalWidth * viewerZoom))}px`;
    imageViewerImage.style.height = "auto";
  }
  updateViewerMeta();
  if (center || viewerMode === "fit") centerViewerScroll();
}

function renderViewerStrip() {
  if (!imageViewerStrip) return;
  const hasCollection = viewerCollection.length > 1;
  imageViewerStrip.classList.toggle("hidden", !hasCollection);
  if (!hasCollection) {
    imageViewerStrip.innerHTML = "";
  } else {
    imageViewerStrip.innerHTML = viewerCollection.map((item, index) => `
      <button class="viewer-strip-thumb ${index === viewerIndex ? "active" : ""}" type="button" data-index="${index}" title="${escapeHtml(item.title || "Image")}">
        <img src="${item.src}" alt="${escapeHtml(item.title || "Image")}">
      </button>
    `).join("");
    imageViewerStrip.querySelectorAll(".viewer-strip-thumb").forEach((button) => {
      button.addEventListener("click", () => showViewerItem(Number(button.dataset.index || 0)));
    });
  }
  if (viewerPrevBtn) viewerPrevBtn.disabled = !hasCollection;
  if (viewerNextBtn) viewerNextBtn.disabled = !hasCollection;
  if (viewerDownloadAllBtn) {
    viewerDownloadAllBtn.disabled = !hasCollection;
    viewerDownloadAllBtn.classList.toggle("hidden", !hasCollection);
  }
}

function showViewerItem(index) {
  if (!imageViewerImage) return;
  if (!viewerCollection.length) return;
  viewerIndex = (index + viewerCollection.length) % viewerCollection.length;
  const item = viewerCollection[viewerIndex];
  imageViewerImage.src = item.src;
  imageViewerTitle.textContent = item.title || "Image";
  viewerDownloadLink.href = item.src;
  viewerDownloadLink.download = `${(item.title || "pixel_factory_image").replace(/[^a-z0-9_\-]+/gi, "_")}.png`;
  viewerMode = "fit";
  viewerZoom = 1;
  renderViewerStrip();
  if (imageViewerImage.complete) applyViewerMode({ center: true });
  else imageViewerImage.onload = () => applyViewerMode({ center: true });
}

function openImageViewer(src, title = "Image", collection = null, index = 0) {
  if (!imageViewerModal || !imageViewerImage) return;
  viewerCollection = Array.isArray(collection) && collection.length ? collection : [{ src, title }];
  viewerIndex = Math.max(0, Math.min(Number(index) || 0, viewerCollection.length - 1));
  imageViewerModal.classList.remove("hidden");
  imageViewerModal.setAttribute("aria-hidden", "false");
  showViewerItem(viewerIndex);
}

function openSelectedImageViewer(index = 0) {
  const items = selectedAssets();
  if (!items.length) return;
  const collection = viewerItemsFromAssets(items);
  openImageViewer(collection[index]?.src || collection[0].src, collection[index]?.title || collection[0].title, collection, index);
}

function downloadViewerCollection() {
  if (!viewerCollection.length) return;
  viewerCollection.forEach((item, index) => {
    setTimeout(() => {
      const link = document.createElement("a");
      link.href = item.src;
      link.download = `${(item.title || "pixel_factory_image").replace(/[^a-z0-9_\-]+/gi, "_")}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }, index * 120);
  });
  setStatus(`Downloading ${viewerCollection.length} image(s).`);
}

function closeImageViewer() {
  if (!imageViewerModal) return;
  imageViewerModal.classList.add("hidden");
  imageViewerModal.setAttribute("aria-hidden", "true");
  if (imageViewerImage) imageViewerImage.removeAttribute("src");
  viewerCollection = [];
  viewerIndex = -1;
  renderViewerStrip();
}

function setViewerActual(zoom = 1, { center = true } = {}) {
  viewerMode = "actual";
  viewerZoom = Math.max(0.1, Math.min(8, zoom));
  applyViewerMode({ center });
}

function setViewerFit() {
  viewerMode = "fit";
  viewerZoom = 1;
  applyViewerMode({ center: true });
}

viewerCloseBtn?.addEventListener("click", closeImageViewer);
viewerDownloadAllBtn?.addEventListener("click", downloadViewerCollection);
document.querySelector("[data-viewer-close]")?.addEventListener("click", closeImageViewer);
viewerFitBtn?.addEventListener("click", setViewerFit);
viewerActualBtn?.addEventListener("click", () => setViewerActual(1));
viewerZoomInBtn?.addEventListener("click", () => setViewerActual(viewerZoom * 1.25));
viewerZoomOutBtn?.addEventListener("click", () => setViewerActual(viewerZoom / 1.25));
viewerPrevBtn?.addEventListener("click", () => showViewerItem(viewerIndex - 1));
viewerNextBtn?.addEventListener("click", () => showViewerItem(viewerIndex + 1));

let viewerWheelNavAt = 0;
imageViewerStage?.addEventListener("wheel", (event) => {
  if (!imageViewerImage?.src) return;
  event.preventDefault();

  // Shift + mouse wheel navigates the active selected image collection.
  if (event.shiftKey && viewerCollection.length > 1) {
    const now = Date.now();
    if (now - viewerWheelNavAt > 180) {
      viewerWheelNavAt = now;
      showViewerItem(viewerIndex + (event.deltaY > 0 ? 1 : -1));
    }
    return;
  }

  const direction = event.deltaY < 0 ? 1.15 : 1 / 1.15;
  setViewerActual((viewerMode === "fit" ? 1 : viewerZoom) * direction, { center: viewerMode === "fit" });
}, { passive: false });

imageViewerStage?.addEventListener("mousedown", (event) => {
  if (viewerMode === "fit") return;
  viewerDragging = true;
  imageViewerStage.classList.add("dragging");
  viewerDragStart = {
    x: event.clientX,
    y: event.clientY,
    scrollLeft: imageViewerStage.scrollLeft,
    scrollTop: imageViewerStage.scrollTop,
  };
});
window.addEventListener("mousemove", (event) => {
  if (!viewerDragging || !imageViewerStage) return;
  imageViewerStage.scrollLeft = viewerDragStart.scrollLeft - (event.clientX - viewerDragStart.x);
  imageViewerStage.scrollTop = viewerDragStart.scrollTop - (event.clientY - viewerDragStart.y);
});
window.addEventListener("mouseup", () => {
  viewerDragging = false;
  imageViewerStage?.classList.remove("dragging");
});

document.addEventListener("keydown", (event) => {
  if (paletteCompareModal && !paletteCompareModal.classList.contains("hidden")) {
    if (event.key === "Escape") closePaletteCompareViewer();
    return;
  }
  if (imageViewerModal?.classList.contains("hidden")) return;
  if (event.key === "Escape") closeImageViewer();
  if (event.key === "0") setViewerFit();
  if (event.key === "1") setViewerActual(1);
  if (event.key === "ArrowLeft") showViewerItem(viewerIndex - 1);
  if (event.key === "ArrowRight") showViewerItem(viewerIndex + 1);
});

document.addEventListener("click", (event) => {
  const img = event.target.closest("img.pf-viewable-image");
  if (!img || !img.src) return;
  // Asset cards use explicit controls: click selects, magnify opens, star favorites.
  if (event.target.closest(".asset-card")) return;
  openImageViewer(img.src, img.dataset.viewerTitle || img.alt || "Image");
});

// Startup
(async function initPixelFactory() {
  updateToolToggleLabels();
  applyPreviewMode();
  await refreshWorkspace();
  await loadAssets().catch(() => {});
  await checkComfy({ quiet: true });
})();

// PF-0019.1: Palette Lab control clicks must never yank the page scroll position.
(function stabilizePaletteLabControlScroll() {
  const paletteView = document.getElementById("paletteView");
  if (!paletteView) return;
  const restore = () => {
    const x = window.scrollX || 0;
    const y = window.scrollY || 0;
    requestAnimationFrame(() => window.scrollTo(x, y));
    window.setTimeout(() => window.scrollTo(x, y), 40);
    window.setTimeout(() => window.scrollTo(x, y), 140);
  };
  ["pointerdown", "mousedown", "click", "change", "input"].forEach((eventName) => {
    paletteView.addEventListener(eventName, (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".pixel-snap-panel, .palette-canvas-actions, .palette-active-actions")) {
        restore();
      }
    }, true);
  });
})();

const statusEl = document.getElementById("status");
const navButtons = document.querySelectorAll(".nav-btn[data-view]");
const views = document.querySelectorAll(".view");
const controlPanels = document.querySelectorAll(".view-controls");

function setStatus(message) {
  statusEl.textContent = message;
}

function setView(name) {
  navButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.view === name));
  views.forEach((view) => view.classList.toggle("active", view.id === `${name}View`));
  controlPanels.forEach((panel) => panel.classList.add("hidden"));
  const panel = document.getElementById(`${name}Controls`);
  if (panel) panel.classList.remove("hidden");

  if (name === "palette") {
    hydratePaletteFromWorkspaceIfNeeded();
  }
}

navButtons.forEach((btn) => btn.addEventListener("click", () => setView(btn.dataset.view)));

// Comfy status
const comfyUrl = document.getElementById("comfyUrl");
const checkComfyBtn = document.getElementById("checkComfyBtn");
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

// Palette Lab
const imageInput = document.getElementById("imageInput");
const originalPreview = document.getElementById("originalPreview");
const processedPreview = document.getElementById("processedPreview");
const processBtn = document.getElementById("processBtn");
const downloadBtn = document.getElementById("downloadBtn");
const previewMode = document.getElementById("previewMode");
const loadWorkspaceBtn = document.getElementById("loadWorkspaceBtn");
const workspaceStatus = document.getElementById("workspaceStatus");

let selectedFile = null;
let selectedFileSource = null;
let processedBlobUrl = null;
let workspace = { has_image: false };

function applyPreviewMode() {
  const mode = previewMode?.value || "fit";
  [originalPreview, processedPreview].forEach((img) => {
    img.classList.toggle("fit-image", mode === "fit");
    img.classList.toggle("actual-image", mode === "actual");
    const viewport = img.closest(".viewport");
    if (viewport) {
      viewport.classList.toggle("fit-mode", mode === "fit");
      viewport.classList.toggle("actual-mode", mode === "actual");
    }
  });
}

previewMode?.addEventListener("change", applyPreviewMode);

async function refreshWorkspace({ quiet = true } = {}) {
  try {
    const response = await fetch("/api/workspace");
    const data = await response.json();
    workspace = data.workspace || { has_image: false };
    if (workspaceStatus) {
      workspaceStatus.textContent = workspace.has_image
        ? `Workspace: ${workspace.asset_name || workspace.source || "image loaded"}`
        : "Workspace: empty";
    }
    loadWorkspaceBtn.disabled = !workspace.has_image;
    if (!quiet && workspace.has_image) setStatus("Workspace refreshed.");
    return workspace;
  } catch (err) {
    if (workspaceStatus) workspaceStatus.textContent = "Workspace: unavailable";
    loadWorkspaceBtn.disabled = true;
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
  originalPreview.src = `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`;
  originalPreview.classList.add("pf-viewable-image");
  originalPreview.dataset.viewerTitle = filename;
  processedPreview.removeAttribute("src");
  downloadBtn.disabled = true;
  applyPreviewMode();
}

async function loadWorkspaceIntoPalette() {
  const ws = await refreshWorkspace();
  if (!ws.has_image) {
    setStatus("Workspace is empty. Generate or select an asset first.");
    return;
  }
  try {
    await loadImageIntoPaletteFromUrl(ws.image_url, `${ws.asset_name || "workspace"}.png`, "workspace");
    setView("palette");
    setStatus(`Loaded workspace into Palette Lab: ${ws.asset_name || "current image"}.`);
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
    setStatus(`Palette Lab loaded current workspace: ${ws.asset_name || "current image"}.`);
  } catch (_) {
    // quiet hydration only
  }
}

loadWorkspaceBtn?.addEventListener("click", loadWorkspaceIntoPalette);

imageInput.addEventListener("change", () => {
  const file = imageInput.files?.[0];
  if (!file) return;
  selectedFile = file;
  selectedFileSource = "upload";
  originalPreview.src = URL.createObjectURL(file);
  originalPreview.classList.add("pf-viewable-image");
  originalPreview.dataset.viewerTitle = file.name;
  processedPreview.removeAttribute("src");
  downloadBtn.disabled = true;
  applyPreviewMode();
  setStatus(`Loaded ${file.name}`);
});

processBtn.addEventListener("click", async () => {
  if (!selectedFile) {
    setStatus("Load an image first, or use the current workspace.");
    return;
  }

  processBtn.disabled = true;
  setStatus("Processing...");

  const form = new FormData();
  form.append("image", selectedFile);
  form.append("resize_scale", document.getElementById("resizeScale").value);
  form.append("palette_colors", document.getElementById("paletteColors").value);
  form.append("operation", document.getElementById("operation").value);

  try {
    const response = await fetch("/api/process", { method: "POST", body: form });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    if (processedBlobUrl) URL.revokeObjectURL(processedBlobUrl);
    processedBlobUrl = URL.createObjectURL(blob);
    processedPreview.src = processedBlobUrl;
    processedPreview.classList.add("pf-viewable-image");
    processedPreview.dataset.viewerTitle = "Processed preview";
    applyPreviewMode();
    downloadBtn.disabled = false;
    setStatus("Processed preview ready.");
  } catch (err) {
    setStatus(`Error: ${err.message}`);
  } finally {
    processBtn.disabled = false;
  }
});

downloadBtn.addEventListener("click", () => {
  if (!processedBlobUrl) return;
  const a = document.createElement("a");
  a.href = processedBlobUrl;
  a.download = "pixel_factory_processed.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
});

// Character Studio
const characterRecipe = document.getElementById("characterRecipe");
const characterPrompt = document.getElementById("characterPrompt");
const characterNegative = document.getElementById("characterNegative");
const loadCharacterDefaultsBtn = document.getElementById("loadCharacterDefaultsBtn");
const generateCharacterBtn = document.getElementById("generateCharacterBtn");
const characterOutput = document.getElementById("characterOutput");

async function loadRecipes() {
  if (!characterRecipe) return;
  const response = await fetch("/api/recipes?category=character");
  const data = await response.json();
  characterRecipe.innerHTML = "";
  (data.recipes || []).forEach((recipe) => {
    const option = document.createElement("option");
    option.value = recipe.id;
    option.textContent = recipe.display_name || recipe.id;
    characterRecipe.appendChild(option);
  });
  if (!characterRecipe.value && characterRecipe.options.length) {
    characterRecipe.selectedIndex = 0;
  }
}

async function loadCharacterDefaults() {
  const recipeId = characterRecipe?.value || "character.default";
  setStatus(`Loading recipe ${recipeId}...`);
  const response = await fetch(`/api/workflows/character/defaults?recipe_id=${encodeURIComponent(recipeId)}`);
  const data = await response.json();
  characterPrompt.value = data.positive || "";
  characterNegative.value = data.negative || "";
  document.getElementById("characterSize").value = String(data.width || 1024);
  document.getElementById("characterBatch").value = String(data.batch_size || 1);
  document.getElementById("characterSteps").value = String(data.steps || 24);
  setStatus(`Recipe loaded: ${data.display_name || recipeId}`);
}

loadCharacterDefaultsBtn.addEventListener("click", loadCharacterDefaults);
characterRecipe?.addEventListener("change", loadCharacterDefaults);

function addGeneratedImage(src, index, asset = null) {
  const wrap = document.createElement("div");
  wrap.className = "generated-item";
  const img = document.createElement("img");
  img.src = asset?.image_url || src;
  img.alt = `Generated character ${index + 1}`;
  img.classList.add("pf-viewable-image");
  img.dataset.viewerTitle = asset?.name || `Generated character ${index + 1}`;
  const actions = document.createElement("div");
  actions.className = "generated-actions";
  const download = document.createElement("a");
  download.href = asset?.image_url || src;
  download.download = `${asset?.name || `pixel_factory_character_${index + 1}`}.png`;
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
  characterOutput.appendChild(wrap);
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
    (data.assets || []).forEach((asset, i) => addGeneratedImage(data.images?.[i], i, asset));
    if (!data.assets) data.images.forEach(addGeneratedImage);
    await loadAssets();
    await refreshWorkspace();
    // The first returned generation is now the current workspace. Palette Lab will load it automatically when opened.
    setStatus(`Character job complete. ${data.count} image(s) returned. Current workspace is ready for Palette Lab.`);
  } catch (err) {
    characterOutput.classList.add("empty");
    characterOutput.textContent = "Generation failed.";
    setStatus(`Generation error: ${err.message}`);
  } finally {
    generateCharacterBtn.disabled = false;
  }
});

loadRecipes().then(loadCharacterDefaults).catch(() => {});


// Asset Browser
const assetGrid = document.getElementById("assetGrid");
const assetInspector = document.getElementById("assetInspector");
const refreshAssetsBtn = document.getElementById("refreshAssetsBtn");
const assetFilter = document.getElementById("assetFilter");
let assets = [];
let selectedAssetId = null;

function assetStatusQuery() {
  const status = assetFilter?.value || "";
  return status ? `?status=${encodeURIComponent(status)}` : "";
}

async function loadAssets(selectId = null) {
  if (!assetGrid) return;
  const response = await fetch(`/api/assets${assetStatusQuery()}`);
  const data = await response.json();
  assets = data.assets || [];
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
    card.className = "asset-card" + (asset.id === selectedAssetId ? " selected" : "");
    card.innerHTML = `
      <div class="asset-thumb-wrap">
        <img class="pf-viewable-image asset-thumb-image" src="${asset.image_url}" alt="${asset.name}" data-viewer-title="${asset.name}">
        <span class="asset-thumb-zoom" aria-hidden="true">⌕</span>
      </div>
      <div class="asset-title">${asset.name}</div>
      <div class="asset-meta">${asset.type} · ${asset.status}</div>
    `;
    card.addEventListener("click", () => selectAsset(asset.id));
    const thumbWrap = card.querySelector(".asset-thumb-wrap");
    const zoomBtn = card.querySelector(".asset-thumb-zoom");
    zoomBtn?.addEventListener("click", (event) => {
      event.stopPropagation();
      openImageViewer(asset.image_url, asset.name);
    });
    thumbWrap?.addEventListener("dblclick", (event) => {
      event.stopPropagation();
      openImageViewer(asset.image_url, asset.name);
    });
    assetGrid.appendChild(card);
  });
  if (selectId) selectAsset(selectId);
}

function selectAsset(assetId) {
  selectedAssetId = assetId;
  const asset = assets.find((a) => a.id === assetId);
  renderAssets();
  if (!asset) return;
  assetInspector.className = "asset-inspector";
  assetInspector.innerHTML = `
    <img class="pf-viewable-image" src="${asset.image_url}" alt="${asset.name}" data-viewer-title="${asset.name}">
    <div class="asset-actions">
      <button id="viewAssetBtn">View Large</button>
      ${asset.status === "accepted" ? "" : '<button id="acceptAssetBtn">Accept</button>'}
      <button id="paletteAssetBtn">Palette Lab</button>
      <button id="workspaceAssetBtn">Set Workspace</button>
      <a href="${asset.image_url}" download="${asset.name}.png">Download</a>
      <button id="deleteAssetBtn">Delete</button>
    </div>
    <div class="inspector-details">
      <strong>${asset.name}</strong><br>
      ID: ${asset.id}<br>
      Type: ${asset.type}<br>
      Status: ${asset.status}<br>
      Recipe: ${asset.recipe_name || asset.recipe_id || "?"}<br>
      Created: ${asset.created || ""}<br>
      Size: ${asset.width || "?"} x ${asset.height || "?"}<br>
      Steps: ${asset.steps || "?"}<br>
      Seed: ${asset.seed ?? "?"}
    </div>
    <h3>Prompt</h3>
    <div class="inspector-prompt">${asset.prompt || ""}</div>
  `;
  document.getElementById("viewAssetBtn")?.addEventListener("click", () => openImageViewer(asset.image_url, asset.name));
  document.getElementById("acceptAssetBtn")?.addEventListener("click", () => acceptAsset(asset.id));
  document.getElementById("paletteAssetBtn").addEventListener("click", () => sendAssetToPalette(asset));
  document.getElementById("workspaceAssetBtn").addEventListener("click", () => setWorkspaceFromAsset(asset));
  document.getElementById("deleteAssetBtn").addEventListener("click", () => deleteAsset(asset.id));
}

async function acceptAsset(assetId) {
  const response = await fetch(`/api/assets/${assetId}/accept`, { method: "POST" });
  if (!response.ok) { setStatus("Accept failed."); return; }
  setStatus("Asset accepted.");
  await loadAssets(assetId);
}

async function deleteAsset(assetId) {
  if (!confirm("Delete this asset?")) return;
  const response = await fetch(`/api/assets/${assetId}`, { method: "DELETE" });
  if (!response.ok) { setStatus("Delete failed."); return; }
  selectedAssetId = null;
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
  setStatus(`Workspace set to ${asset.name}.`);
}

async function sendAssetToPalette(asset) {
  const response = await fetch(`/api/workspace/from-asset/${asset.id}`, { method: "POST" });
  if (!response.ok) {
    setStatus("Could not load asset into workspace.");
    return;
  }
  await refreshWorkspace();
  await loadWorkspaceIntoPalette();
}

refreshAssetsBtn?.addEventListener("click", () => loadAssets());
assetFilter?.addEventListener("change", () => loadAssets());



// PF-0009 Universal Image Viewer
const imageViewerModal = document.getElementById("imageViewerModal");
const imageViewerImage = document.getElementById("imageViewerImage");
const imageViewerStage = document.getElementById("imageViewerStage");
const imageViewerTitle = document.getElementById("imageViewerTitle");
const imageViewerMeta = document.getElementById("imageViewerMeta");
const viewerDownloadLink = document.getElementById("viewerDownloadLink");
const viewerCloseBtn = document.getElementById("viewerCloseBtn");
const viewerFitBtn = document.getElementById("viewerFitBtn");
const viewerActualBtn = document.getElementById("viewerActualBtn");
const viewerZoomInBtn = document.getElementById("viewerZoomInBtn");
const viewerZoomOutBtn = document.getElementById("viewerZoomOutBtn");

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

function openImageViewer(src, title = "Image") {
  if (!imageViewerModal || !imageViewerImage) return;
  imageViewerImage.src = src;
  imageViewerTitle.textContent = title || "Image";
  viewerDownloadLink.href = src;
  viewerDownloadLink.download = `${(title || "pixel_factory_image").replace(/[^a-z0-9_\-]+/gi, "_")}.png`;
  viewerMode = "fit";
  viewerZoom = 1;
  imageViewerModal.classList.remove("hidden");
  imageViewerModal.setAttribute("aria-hidden", "false");
  if (imageViewerImage.complete) applyViewerMode({ center: true });
  else imageViewerImage.onload = () => applyViewerMode({ center: true });
}

function closeImageViewer() {
  if (!imageViewerModal) return;
  imageViewerModal.classList.add("hidden");
  imageViewerModal.setAttribute("aria-hidden", "true");
  if (imageViewerImage) imageViewerImage.removeAttribute("src");
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
document.querySelector("[data-viewer-close]")?.addEventListener("click", closeImageViewer);
viewerFitBtn?.addEventListener("click", setViewerFit);
viewerActualBtn?.addEventListener("click", () => setViewerActual(1));
viewerZoomInBtn?.addEventListener("click", () => setViewerActual(viewerZoom * 1.25));
viewerZoomOutBtn?.addEventListener("click", () => setViewerActual(viewerZoom / 1.25));

imageViewerStage?.addEventListener("wheel", (event) => {
  if (!imageViewerImage?.src) return;
  event.preventDefault();
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
  if (imageViewerModal?.classList.contains("hidden")) return;
  if (event.key === "Escape") closeImageViewer();
  if (event.key === "0") setViewerFit();
  if (event.key === "1") setViewerActual(1);
});

document.addEventListener("click", (event) => {
  const img = event.target.closest("img.pf-viewable-image");
  if (!img || !img.src) return;
  // Asset cards use explicit controls: click selects, magnify opens, double-click thumbnail opens.
  if (event.target.closest(".asset-card")) return;
  openImageViewer(img.src, img.dataset.viewerTitle || img.alt || "Image");
});

// Startup
(async function initPixelFactory() {
  applyPreviewMode();
  await refreshWorkspace();
  await loadAssets().catch(() => {});
  await checkComfy({ quiet: true });
})();

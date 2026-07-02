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
const randomSeedBtn = document.getElementById("randomSeedBtn");
const reuseSeedBtn = document.getElementById("reuseSeedBtn");
const actualSeedDisplay = document.getElementById("actualSeedDisplay");
let lastActualSeed = null;

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
  const safeSize = ["512", "768", "1024"].includes(String(data.width)) ? String(data.width) : "1024";
  document.getElementById("characterSize").value = safeSize;
  document.getElementById("characterBatch").value = String(data.batch_size || 1);
  document.getElementById("characterSteps").value = String(data.steps || 24);
  const defaultSeed = data.seed ?? -1;
  document.getElementById("characterSeed").value = String(defaultSeed);
  if (actualSeedDisplay) actualSeedDisplay.value = "—";
  setStatus(`Recipe loaded: ${data.display_name || recipeId}`);
}

loadCharacterDefaultsBtn.addEventListener("click", loadCharacterDefaults);
characterRecipe?.addEventListener("change", loadCharacterDefaults);
randomSeedBtn?.addEventListener("click", () => {
  document.getElementById("characterSeed").value = "-1";
  if (actualSeedDisplay) actualSeedDisplay.value = "Random on next generate";
  setStatus("Random seed enabled. Pixel Factory will save the actual seed after generation.");
});

reuseSeedBtn?.addEventListener("click", () => {
  if (lastActualSeed === null) return;
  document.getElementById("characterSeed").value = String(lastActualSeed);
  if (actualSeedDisplay) actualSeedDisplay.value = String(lastActualSeed);
  setStatus(`Reusing seed ${lastActualSeed}.`);
});


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
      if (reuseSeedBtn) reuseSeedBtn.disabled = false;
      document.getElementById("characterSeed").value = String(data.seed);
    }
    (data.assets || []).forEach((asset, i) => addGeneratedImage(data.images?.[i], i, asset));
    if (!data.assets) data.images.forEach(addGeneratedImage);
    await loadAssets();
    await refreshWorkspace();
    // The first returned generation is now the current workspace. Palette Lab will load it automatically when opened.
    setStatus(`Character job complete. ${data.count} image(s) returned. Seed ${data.seed}. Current workspace is ready for Palette Lab.`);
  } catch (err) {
    characterOutput.classList.add("empty");
    characterOutput.textContent = "Generation failed.";
    setStatus(`Generation error: ${err.message}`);
  } finally {
    generateCharacterBtn.disabled = false;
  }
});

loadRecipes().then(loadCharacterDefaults).catch(() => {});



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
  return asset?.status === "accepted" ? "Accepted" : "Incoming";
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
    const displayName = assetDisplayName(asset);
    const statusLabel = assetStatusLabel(asset);
    card.className = "asset-card" + (asset.id === selectedAssetId ? " selected" : "") + (asset.status === "accepted" ? " accepted" : " incoming");
    card.innerHTML = `
      <div class="asset-thumb-wrap">
        <img class="asset-thumb-image" src="${asset.image_url}" alt="${escapeHtml(displayName)}">
        <button class="asset-thumb-zoom" type="button" title="View large" aria-label="View ${escapeHtml(displayName)} large">⌕</button>
        <span class="asset-status-badge ${asset.status === "accepted" ? "accepted" : "incoming"}">${statusLabel}</span>
        ${asset.favorite ? '<span class="asset-favorite-badge" title="Favorite">★</span>' : ''}
      </div>
      <div class="asset-title">${asset.favorite ? '★ ' : ''}${escapeHtml(displayName)}</div>
      <div class="asset-meta">${escapeHtml(asset.type)} · ${escapeHtml(statusLabel)}</div>
      ${Array.isArray(asset.tags) && asset.tags.length ? `<div class="asset-tags">${asset.tags.map((t) => `<span>${escapeHtml(t)}</span>`).join("")}</div>` : ""}
    `;
    card.addEventListener("click", () => selectAsset(asset.id));
    card.querySelector(".asset-thumb-zoom")?.addEventListener("click", (event) => {
      event.stopPropagation();
      openImageViewer(asset.image_url, displayName);
    });
    assetGrid.appendChild(card);
  });
  if (selectId) selectAsset(selectId);
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

function selectAsset(assetId) {
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
      <button id="inspectorViewLargeBtn" type="button" class="inspector-view-btn">View Large</button>
      <span class="inspector-status-badge ${asset.status === "accepted" ? "accepted" : "incoming"}">${statusLabel}</span>
    </div>

    <div class="asset-actions">
      ${asset.status === "accepted" ? "" : '<button id="acceptAssetBtn">Accept</button>'}
      <button id="favoriteAssetBtn">${asset.favorite ? "Unfavorite" : "Favorite"}</button>
      <button id="paletteAssetBtn">Palette Lab</button>
      <button id="workspaceAssetBtn">Set Workspace</button>
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
  document.getElementById("favoriteAssetBtn")?.addEventListener("click", () => updateAssetMetadata(asset.id, { favorite: !asset.favorite }));
  document.getElementById("paletteAssetBtn").addEventListener("click", () => sendAssetToPalette(asset));
  document.getElementById("workspaceAssetBtn").addEventListener("click", () => setWorkspaceFromAsset(asset));
  document.getElementById("deleteAssetBtn").addEventListener("click", () => deleteAsset(asset.id));
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
  if (!response.ok) {
    setStatus("Metadata update failed.");
    return;
  }
  setStatus("Asset metadata saved.");
  await loadAssets(assetId);
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

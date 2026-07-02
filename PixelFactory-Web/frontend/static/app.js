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
}

navButtons.forEach((btn) => btn.addEventListener("click", () => setView(btn.dataset.view)));

// Comfy status
const comfyUrl = document.getElementById("comfyUrl");
const checkComfyBtn = document.getElementById("checkComfyBtn");
const comfyStatus = document.getElementById("comfyStatus");

checkComfyBtn.addEventListener("click", async () => {
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
      setStatus("ComfyUI connected.");
    } else {
      comfyStatus.textContent = "Disconnected";
      comfyStatus.className = "engine-status disconnected";
      setStatus(`ComfyUI not found: ${data.error || "unknown error"}`);
    }
  } catch (err) {
    comfyStatus.textContent = "Disconnected";
    comfyStatus.className = "engine-status disconnected";
    setStatus(`Comfy check failed: ${err.message}`);
  } finally {
    checkComfyBtn.disabled = false;
  }
});

// Palette Lab
const imageInput = document.getElementById("imageInput");
const originalPreview = document.getElementById("originalPreview");
const processedPreview = document.getElementById("processedPreview");
const processBtn = document.getElementById("processBtn");
const downloadBtn = document.getElementById("downloadBtn");

let selectedFile = null;
let processedBlobUrl = null;

imageInput.addEventListener("change", () => {
  const file = imageInput.files?.[0];
  if (!file) return;
  selectedFile = file;
  originalPreview.src = URL.createObjectURL(file);
  processedPreview.removeAttribute("src");
  downloadBtn.disabled = true;
  setStatus(`Loaded ${file.name}`);
});

processBtn.addEventListener("click", async () => {
  if (!selectedFile) {
    setStatus("Load an image first.");
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
const characterPrompt = document.getElementById("characterPrompt");
const characterNegative = document.getElementById("characterNegative");
const loadCharacterDefaultsBtn = document.getElementById("loadCharacterDefaultsBtn");
const generateCharacterBtn = document.getElementById("generateCharacterBtn");
const characterOutput = document.getElementById("characterOutput");

async function loadCharacterDefaults() {
  setStatus("Loading Character workflow defaults...");
  const response = await fetch("/api/workflows/character/defaults");
  const data = await response.json();
  characterPrompt.value = data.positive || "";
  characterNegative.value = data.negative || "";
  document.getElementById("characterSize").value = String(data.width || 1024);
  document.getElementById("characterBatch").value = String(data.batch_size || 1);
  document.getElementById("characterSteps").value = String(data.steps || 24);
  setStatus("Character defaults loaded.");
}

loadCharacterDefaultsBtn.addEventListener("click", loadCharacterDefaults);

function addGeneratedImage(src, index, asset = null) {
  const wrap = document.createElement("div");
  wrap.className = "generated-item";
  const img = document.createElement("img");
  img.src = asset?.image_url || src;
  img.alt = `Generated character ${index + 1}`;
  const actions = document.createElement("div");
  actions.className = "generated-actions";
  const download = document.createElement("a");
  download.href = asset?.image_url || src;
  download.download = `${asset?.name || `pixel_factory_character_${index + 1}`}.png`;
  download.textContent = "Download";
  actions.appendChild(download);
  if (asset) {
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
    setStatus(`Character job complete. ${data.count} image(s) returned and saved as asset(s).`);
  } catch (err) {
    characterOutput.classList.add("empty");
    characterOutput.textContent = "Generation failed.";
    setStatus(`Generation error: ${err.message}`);
  } finally {
    generateCharacterBtn.disabled = false;
  }
});

loadCharacterDefaults().catch(() => {});


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
      <img src="${asset.image_url}" alt="${asset.name}">
      <div class="asset-title">${asset.name}</div>
      <div class="asset-meta">${asset.type} · ${asset.status}</div>
    `;
    card.addEventListener("click", () => selectAsset(asset.id));
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
    <img src="${asset.image_url}" alt="${asset.name}">
    <div class="asset-actions">
      <button id="acceptAssetBtn">Accept</button>
      <button id="paletteAssetBtn">Palette Lab</button>
      <a href="${asset.image_url}" download="${asset.name}.png">Download</a>
      <button id="deleteAssetBtn">Delete</button>
    </div>
    <div class="inspector-details">
      <strong>${asset.name}</strong><br>
      ID: ${asset.id}<br>
      Type: ${asset.type}<br>
      Status: ${asset.status}<br>
      Created: ${asset.created || ""}<br>
      Size: ${asset.width || "?"} x ${asset.height || "?"}<br>
      Steps: ${asset.steps || "?"}<br>
      Seed: ${asset.seed ?? "?"}
    </div>
    <h3>Prompt</h3>
    <div class="inspector-prompt">${asset.prompt || ""}</div>
  `;
  document.getElementById("acceptAssetBtn").addEventListener("click", () => acceptAsset(asset.id));
  document.getElementById("paletteAssetBtn").addEventListener("click", () => sendAssetToPalette(asset));
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

async function sendAssetToPalette(asset) {
  const response = await fetch(asset.image_url);
  const blob = await response.blob();
  selectedFile = new File([blob], `${asset.name}.png`, { type: "image/png" });
  originalPreview.src = asset.image_url;
  processedPreview.removeAttribute("src");
  downloadBtn.disabled = true;
  setView("palette");
  setStatus(`Loaded ${asset.name} into Palette Lab.`);
}

refreshAssetsBtn?.addEventListener("click", () => loadAssets());
assetFilter?.addEventListener("change", () => loadAssets());
loadAssets().catch(() => {});

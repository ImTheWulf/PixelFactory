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

function addGeneratedImage(src, index) {
  const wrap = document.createElement("div");
  wrap.className = "generated-item";
  const img = document.createElement("img");
  img.src = src;
  img.alt = `Generated character ${index + 1}`;
  const actions = document.createElement("div");
  actions.className = "generated-actions";
  const download = document.createElement("a");
  download.href = src;
  download.download = `pixel_factory_character_${index + 1}.png`;
  download.textContent = "Download";
  actions.appendChild(download);
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
    data.images.forEach(addGeneratedImage);
    setStatus(`Character job complete. ${data.count} image(s) returned.`);
  } catch (err) {
    characterOutput.classList.add("empty");
    characterOutput.textContent = "Generation failed.";
    setStatus(`Generation error: ${err.message}`);
  } finally {
    generateCharacterBtn.disabled = false;
  }
});

loadCharacterDefaults().catch(() => {});

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

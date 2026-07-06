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

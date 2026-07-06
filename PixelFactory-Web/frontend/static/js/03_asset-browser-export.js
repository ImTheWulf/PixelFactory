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

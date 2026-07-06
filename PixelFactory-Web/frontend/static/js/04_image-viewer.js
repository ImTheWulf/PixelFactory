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


// PF-0019.9 Repair Toolbox tabs: one active tool panel, canvas remains primary.
(() => {
  const tabs = Array.from(document.querySelectorAll('[data-repair-tab]'));
  const panes = Array.from(document.querySelectorAll('[data-repair-pane]'));
  if (!tabs.length || !panes.length) return;
  function setRepairTab(name) {
    tabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.repairTab === name));
    panes.forEach((pane) => pane.classList.toggle('active', pane.dataset.repairPane === name));
  }
  tabs.forEach((tab) => {
    tab.addEventListener('click', (event) => {
      event.preventDefault();
      setRepairTab(tab.dataset.repairTab || 'snap');
    });
  });
  setRepairTab('snap');
})();

from __future__ import annotations

import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Optional

from PIL import Image
from PySide6.QtCore import QObject, QRunnable, Qt, QThreadPool, Signal, Slot
from PySide6.QtGui import QImage, QPixmap
from PySide6.QtWidgets import (
    QApplication,
    QFileDialog,
    QFrame,
    QGroupBox,
    QHBoxLayout,
    QLabel,
    QMainWindow,
    QMessageBox,
    QPushButton,
    QProgressBar,
    QSpinBox,
    QVBoxLayout,
    QWidget,
)


@dataclass
class ImageState:
    original: Optional[Image.Image] = None
    processed: Optional[Image.Image] = None
    path: Optional[Path] = None


class WorkerSignals(QObject):
    finished = Signal(object)
    error = Signal(str)


class ImageWorker(QRunnable):
    def __init__(self, fn: Callable[[], Image.Image]):
        super().__init__()
        self.fn = fn
        self.signals = WorkerSignals()

    @Slot()
    def run(self):
        try:
            result = self.fn()
            self.signals.finished.emit(result)
        except Exception as exc:  # noqa: BLE001
            self.signals.error.emit(str(exc))


class PixelFactoryWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Pixel Factory by Wulf - v0.1.1")
        self.resize(1200, 800)
        self.state = ImageState()
        self.thread_pool = QThreadPool.globalInstance()

        root = QWidget()
        self.setCentralWidget(root)
        layout = QHBoxLayout(root)

        controls = QVBoxLayout()
        controls.setAlignment(Qt.AlignmentFlag.AlignTop)
        layout.addLayout(controls, 0)

        self.open_btn = QPushButton("Open Image")
        self.open_btn.clicked.connect(self.open_image)
        controls.addWidget(self.open_btn)

        resize_box = QGroupBox("Nearest Resize")
        resize_layout = QVBoxLayout(resize_box)
        self.scale_spin = QSpinBox()
        self.scale_spin.setRange(1, 16)
        self.scale_spin.setValue(2)
        self.scale_spin.setSuffix("x")
        self.resize_btn = QPushButton("Apply Nearest Resize")
        self.resize_btn.clicked.connect(self.apply_resize)
        resize_layout.addWidget(self.scale_spin)
        resize_layout.addWidget(self.resize_btn)
        controls.addWidget(resize_box)

        palette_box = QGroupBox("Palette Preview")
        palette_layout = QVBoxLayout(palette_box)
        self.palette_spin = QSpinBox()
        self.palette_spin.setRange(2, 256)
        self.palette_spin.setValue(64)
        self.palette_spin.setSuffix(" colors")
        self.palette_btn = QPushButton("Reduce Palette")
        self.palette_btn.clicked.connect(self.apply_palette)
        palette_layout.addWidget(self.palette_spin)
        palette_layout.addWidget(self.palette_btn)
        controls.addWidget(palette_box)

        self.reset_btn = QPushButton("Reset to Original")
        self.reset_btn.clicked.connect(self.reset_original)
        controls.addWidget(self.reset_btn)

        self.save_btn = QPushButton("Save Processed PNG")
        self.save_btn.clicked.connect(self.save_image)
        controls.addWidget(self.save_btn)

        self.status_label = QLabel("Ready")
        self.status_label.setWordWrap(True)
        controls.addWidget(self.status_label)

        self.progress = QProgressBar()
        self.progress.setRange(0, 1)
        self.progress.setValue(0)
        controls.addWidget(self.progress)

        self.preview = QLabel("Open an image to begin")
        self.preview.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.preview.setFrameShape(QFrame.Shape.StyledPanel)
        self.preview.setStyleSheet("background-color: #202020; color: #dddddd;")
        layout.addWidget(self.preview, 1)

        self.set_busy(False)

    def set_busy(self, busy: bool, message: str = ""):
        for widget in [
            self.open_btn,
            self.resize_btn,
            self.palette_btn,
            self.reset_btn,
            self.save_btn,
            self.scale_spin,
            self.palette_spin,
        ]:
            widget.setEnabled(not busy)
        self.progress.setRange(0, 0 if busy else 1)
        self.progress.setValue(0 if busy else 1)
        if message:
            self.status_label.setText(message)

    def current_image(self) -> Optional[Image.Image]:
        return self.state.processed or self.state.original

    def open_image(self):
        filename, _ = QFileDialog.getOpenFileName(
            self,
            "Open Image",
            "",
            "Images (*.png *.jpg *.jpeg *.webp *.bmp)",
        )
        if not filename:
            return
        try:
            img = Image.open(filename).convert("RGBA")
            self.state = ImageState(original=img.copy(), processed=img.copy(), path=Path(filename))
            self.update_preview(img)
            self.status_label.setText(f"Loaded: {Path(filename).name} ({img.width}x{img.height})")
        except Exception as exc:  # noqa: BLE001
            QMessageBox.critical(self, "Open failed", str(exc))

    def run_image_job(self, message: str, fn: Callable[[], Image.Image]):
        self.set_busy(True, message)
        worker = ImageWorker(fn)
        worker.signals.finished.connect(self.on_job_finished)
        worker.signals.error.connect(self.on_job_error)
        self.thread_pool.start(worker)

    def on_job_finished(self, img: Image.Image):
        self.state.processed = img.copy()
        self.update_preview(img)
        self.set_busy(False, f"Done. Current image: {img.width}x{img.height}")

    def on_job_error(self, error: str):
        self.set_busy(False, "Error")
        QMessageBox.critical(self, "Processing failed", error)

    def apply_resize(self):
        img = self.current_image()
        if img is None:
            return
        scale = self.scale_spin.value()

        def job() -> Image.Image:
            base = img.copy()
            return base.resize((base.width * scale, base.height * scale), Image.Resampling.NEAREST)

        self.run_image_job(f"Nearest resizing {scale}x...", job)

    def apply_palette(self):
        img = self.current_image()
        if img is None:
            return
        colors = self.palette_spin.value()

        def job() -> Image.Image:
            base = img.copy().convert("RGBA")
            alpha = base.getchannel("A")
            rgb = base.convert("RGB")
            paletted = rgb.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
            reduced = paletted.convert("RGBA")
            reduced.putalpha(alpha)
            return reduced

        self.run_image_job(f"Reducing palette to {colors} colors...", job)

    def reset_original(self):
        if self.state.original is None:
            return
        self.state.processed = self.state.original.copy()
        self.update_preview(self.state.processed)
        self.status_label.setText("Reset to original")

    def save_image(self):
        img = self.current_image()
        if img is None:
            return
        default_name = "pixel_factory_processed.png"
        if self.state.path:
            default_name = f"{self.state.path.stem}_processed.png"
        filename, _ = QFileDialog.getSaveFileName(self, "Save PNG", default_name, "PNG Image (*.png)")
        if not filename:
            return
        try:
            img.save(filename)
            self.status_label.setText(f"Saved: {Path(filename).name}")
        except Exception as exc:  # noqa: BLE001
            QMessageBox.critical(self, "Save failed", str(exc))

    def update_preview(self, img: Image.Image):
        rgba = img.convert("RGBA")
        data = rgba.tobytes("raw", "RGBA")
        qimg = QImage(data, rgba.width, rgba.height, rgba.width * 4, QImage.Format.Format_RGBA8888).copy()
        pixmap = QPixmap.fromImage(qimg)
        target = self.preview.size()
        scaled = pixmap.scaled(target, Qt.AspectRatioMode.KeepAspectRatio, Qt.TransformationMode.FastTransformation)
        self.preview.setPixmap(scaled)

    def resizeEvent(self, event):  # noqa: N802
        super().resizeEvent(event)
        img = self.current_image()
        if img is not None:
            self.update_preview(img)


def main():
    app = QApplication(sys.argv)
    win = PixelFactoryWindow()
    win.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()

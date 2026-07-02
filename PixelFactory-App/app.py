import sys
from pathlib import Path
from PIL import Image
from PySide6.QtCore import Qt
from PySide6.QtGui import QPixmap, QImage
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QLabel, QPushButton, QFileDialog,
    QVBoxLayout, QHBoxLayout, QSpinBox, QMessageBox, QGroupBox
)


class PixelFactory(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Pixel Factory by Wulf - v0.1")
        self.resize(1100, 720)
        self.image_path: Path | None = None
        self.image: Image.Image | None = None
        self.processed: Image.Image | None = None

        root = QWidget()
        self.setCentralWidget(root)
        main = QHBoxLayout(root)

        controls = QVBoxLayout()
        main.addLayout(controls, 0)

        self.preview = QLabel("Open an image to begin")
        self.preview.setAlignment(Qt.AlignCenter)
        self.preview.setMinimumSize(720, 640)
        self.preview.setStyleSheet("background:#222; color:#aaa; border:1px solid #444;")
        main.addWidget(self.preview, 1)

        open_btn = QPushButton("Open Image")
        open_btn.clicked.connect(self.open_image)
        controls.addWidget(open_btn)

        scale_group = QGroupBox("Nearest Resize")
        scale_layout = QVBoxLayout(scale_group)
        self.scale_spin = QSpinBox()
        self.scale_spin.setRange(1, 16)
        self.scale_spin.setValue(2)
        self.scale_spin.setSuffix("x")
        scale_layout.addWidget(self.scale_spin)
        resize_btn = QPushButton("Apply Nearest Resize")
        resize_btn.clicked.connect(self.apply_nearest_resize)
        scale_layout.addWidget(resize_btn)
        controls.addWidget(scale_group)

        palette_group = QGroupBox("Palette Preview")
        palette_layout = QVBoxLayout(palette_group)
        self.palette_spin = QSpinBox()
        self.palette_spin.setRange(2, 256)
        self.palette_spin.setValue(64)
        self.palette_spin.setSuffix(" colors")
        palette_layout.addWidget(self.palette_spin)
        palette_btn = QPushButton("Reduce Palette")
        palette_btn.clicked.connect(self.reduce_palette)
        palette_layout.addWidget(palette_btn)
        controls.addWidget(palette_group)

        reset_btn = QPushButton("Reset to Original")
        reset_btn.clicked.connect(self.reset_image)
        controls.addWidget(reset_btn)

        save_btn = QPushButton("Save Processed PNG")
        save_btn.clicked.connect(self.save_image)
        controls.addWidget(save_btn)

        controls.addStretch(1)

    def open_image(self):
        path, _ = QFileDialog.getOpenFileName(self, "Open image", "", "Images (*.png *.jpg *.jpeg *.webp)")
        if not path:
            return
        self.image_path = Path(path)
        self.image = Image.open(path).convert("RGBA")
        self.processed = self.image.copy()
        self.update_preview()

    def reset_image(self):
        if self.image is None:
            return
        self.processed = self.image.copy()
        self.update_preview()

    def apply_nearest_resize(self):
        if self.processed is None:
            self.warn_no_image()
            return
        scale = self.scale_spin.value()
        w, h = self.processed.size
        self.processed = self.processed.resize((w * scale, h * scale), Image.Resampling.NEAREST)
        self.update_preview()

    def reduce_palette(self):
        if self.processed is None:
            self.warn_no_image()
            return
        colors = self.palette_spin.value()
        rgba = self.processed.convert("RGBA")
        # Pillow quantize needs RGB/P mode; preserve alpha by quantizing RGB then restoring alpha.
        alpha = rgba.getchannel("A")
        rgb = rgba.convert("RGB")
        q = rgb.quantize(colors=colors, method=Image.Quantize.MEDIANCUT).convert("RGB")
        q.putalpha(alpha)
        self.processed = q
        self.update_preview()

    def save_image(self):
        if self.processed is None:
            self.warn_no_image()
            return
        default = "pixel_factory_output.png"
        if self.image_path:
            default = self.image_path.with_name(self.image_path.stem + "_pf.png").name
        path, _ = QFileDialog.getSaveFileName(self, "Save PNG", default, "PNG (*.png)")
        if not path:
            return
        if not path.lower().endswith(".png"):
            path += ".png"
        self.processed.save(path)
        QMessageBox.information(self, "Saved", f"Saved:\n{path}")

    def update_preview(self):
        if self.processed is None:
            return
        img = self.processed.convert("RGBA")
        w, h = img.size
        data = img.tobytes("raw", "RGBA")
        qimage = QImage(data, w, h, QImage.Format_RGBA8888)
        pixmap = QPixmap.fromImage(qimage)
        pixmap = pixmap.scaled(self.preview.size(), Qt.KeepAspectRatio, Qt.FastTransformation)
        self.preview.setPixmap(pixmap)

    def resizeEvent(self, event):
        super().resizeEvent(event)
        if self.processed is not None:
            self.update_preview()

    def warn_no_image(self):
        QMessageBox.warning(self, "No image", "Open an image first.")


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = PixelFactory()
    window.show()
    sys.exit(app.exec())

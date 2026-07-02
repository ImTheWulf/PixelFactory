from pathlib import Path
from PySide6.QtWidgets import QApplication, QMainWindow, QFileDialog, QLabel, QPushButton, QVBoxLayout, QWidget
from PySide6.QtGui import QPixmap
from PySide6.QtCore import Qt


class PixelFactoryWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Pixel Factory")
        self.resize(1000, 700)

        self.preview = QLabel("Open a PNG to begin")
        self.preview.setAlignment(Qt.AlignCenter)
        self.preview.setMinimumHeight(500)

        open_button = QPushButton("Open Image")
        open_button.clicked.connect(self.open_image)

        layout = QVBoxLayout()
        layout.addWidget(open_button)
        layout.addWidget(self.preview)

        root = QWidget()
        root.setLayout(layout)
        self.setCentralWidget(root)

    def open_image(self):
        path, _ = QFileDialog.getOpenFileName(self, "Open image", "", "Images (*.png *.jpg *.jpeg *.webp)")
        if not path:
            return
        pixmap = QPixmap(path)
        self.preview.setPixmap(pixmap.scaled(self.preview.size(), Qt.KeepAspectRatio, Qt.FastTransformation))


if __name__ == "__main__":
    app = QApplication([])
    window = PixelFactoryWindow()
    window.show()
    app.exec()

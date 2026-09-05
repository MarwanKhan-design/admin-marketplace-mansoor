import React, { useRef, useState } from "react";
import "./AvatarCropper.css";

export default function AvatarCropper({ src, onCancel, onConfirm }) {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [zoom, setZoom] = useState(1);
  const dragRef = useRef(null);

  const move = (event) => {
    if (!dragRef.current) return;
    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;
    dragRef.current = { x: event.clientX, y: event.clientY };
    setPos((current) => ({
      x: Math.max(0, Math.min(100, current.x - dx / 2)),
      y: Math.max(0, Math.min(100, current.y - dy / 2)),
    }));
  };

  const confirm = () => {
    const image = new Image();
    image.onload = () => {
      const size = Math.min(image.naturalWidth, image.naturalHeight) / zoom;
      const sx = (image.naturalWidth - size) * (pos.x / 100);
      const sy = (image.naturalHeight - size) * (pos.y / 100);
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 320;
      canvas
        .getContext("2d")
        .drawImage(image, sx, sy, size, size, 0, 0, 320, 320);
      onConfirm(canvas.toDataURL("image/jpeg", 0.88));
    };
    image.src = src;
  };

  return (
    <div
      className="avatar-crop-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Adjust profile photo"
    >
      <section className="avatar-crop-dialog">
        <header>
          <h3>Adjust photo</h3>
          <button type="button" onClick={onCancel} aria-label="Close">
            ×
          </button>
        </header>
        <div
          className="avatar-crop-preview"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            dragRef.current = { x: event.clientX, y: event.clientY };
          }}
          onPointerMove={move}
          onPointerUp={() => {
            dragRef.current = null;
          }}
        >
          <img
            src={src}
            alt="Crop preview"
            style={{
              objectPosition: `${pos.x}% ${pos.y}%`,
              transform: `scale(${zoom})`,
            }}
          />
          <i className="avatar-crop-ring" />
        </div>
        <label className="avatar-crop-zoom">
          Zoom
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          />
        </label>
        <p className="avatar-crop-hint">
          Drag to reposition. This is how your photo will appear everywhere.
        </p>
        <footer>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="avatar-crop-confirm" onClick={confirm}>
            Use photo
          </button>
        </footer>
      </section>
    </div>
  );
}
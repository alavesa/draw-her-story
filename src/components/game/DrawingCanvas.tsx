import React, { useRef, useState, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import { Eraser, Undo2, Trash2 } from "lucide-react";
import { useMultiplayer, StrokeData } from "@/context/MultiplayerContext";

const COLORS = ["#1a1a2e", "#E04580", "#F47A5B", "#EF4444", "#5B8DEF"];
const COLOR_NAMES = ["Black", "Pink", "Coral", "Red", "Blue"];
const SIZE_NAMES = ["Small", "Medium", "Large"];
const SIZES = [3, 8, 16];

export interface DrawingCanvasHandle {
  getDataURL: () => string;
  clear: () => void;
}

interface Props {
  disabled?: boolean;
}

const DrawingCanvas = forwardRef<DrawingCanvasHandle, Props>(({ disabled = false }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(SIZES[1]);
  const [isEraser, setIsEraser] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const strokeBatch = useRef<StrokeData[]>([]);
  const batchTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const mp = useMultiplayer();
  const isMultiplayer = mp.isMultiplayer;

  const getCtx = useCallback(() => canvasRef.current?.getContext("2d"), []);

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const w = rect.width;
      const h = Math.min(rect.height, 500);
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, w, h);
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Register remote stroke/clear/undo callbacks for multiplayer guessers
  useEffect(() => {
    if (!isMultiplayer) return;

    mp.onRemoteStrokes.current = (strokes: StrokeData[]) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) return;

      for (const s of strokes) {
        // Convert normalized coordinates (0-1) back to canvas pixels
        const fromX = s.fromX * canvas.width;
        const fromY = s.fromY * canvas.height;
        const toX = s.toX * canvas.width;
        const toY = s.toY * canvas.height;
        const lineSize = s.size * Math.min(canvas.width, canvas.height);

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.strokeStyle = s.isEraser ? "#FFFFFF" : s.color;
        ctx.lineWidth = s.isEraser ? lineSize * 2 : lineSize;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
      }
    };

    mp.onRemoteClear.current = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx && canvas) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    mp.onRemoteUndo.current = () => {
      // Undo not fully supported for remote — clear is available
    };

    return () => {
      mp.onRemoteStrokes.current = null;
      mp.onRemoteClear.current = null;
      mp.onRemoteUndo.current = null;
    };
  }, [isMultiplayer, mp]);

  // Batch flush interval for artist stroke sync
  useEffect(() => {
    if (!isMultiplayer || disabled) return;

    batchTimer.current = setInterval(() => {
      if (strokeBatch.current.length > 0) {
        mp.sendMessage({ type: "stroke", data: strokeBatch.current });
        strokeBatch.current = [];
      }
    }, 100);

    return () => {
      if (batchTimer.current) clearInterval(batchTimer.current);
      // Flush remaining strokes
      if (strokeBatch.current.length > 0) {
        mp.sendMessage({ type: "stroke", data: strokeBatch.current });
        strokeBatch.current = [];
      }
    };
  }, [isMultiplayer, disabled, mp]);

  useImperativeHandle(ref, () => ({
    getDataURL: () => canvasRef.current?.toDataURL() || "",
    clear: () => {
      const ctx = getCtx();
      const canvas = canvasRef.current;
      if (ctx && canvas) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setHistory([]);
      }
    },
  }));

  const saveHistory = useCallback(() => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (ctx && canvas) {
      setHistory(prev => [...prev.slice(-20), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    }
  }, [getCtx]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    e.preventDefault();
    saveHistory();
    setIsDrawing(true);
    const pos = getPos(e);
    lastPos.current = pos;
    const ctx = getCtx();
    if (ctx) {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, (isEraser ? size * 2 : size) / 2, 0, Math.PI * 2);
      ctx.fillStyle = isEraser ? "#FFFFFF" : color;
      ctx.fill();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;
    e.preventDefault();
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !lastPos.current || !canvas) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = isEraser ? "#FFFFFF" : color;
    ctx.lineWidth = isEraser ? size * 2 : size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    // In multiplayer, batch normalized stroke data for sync
    if (isMultiplayer) {
      strokeBatch.current.push({
        fromX: lastPos.current.x / canvas.width,
        fromY: lastPos.current.y / canvas.height,
        toX: pos.x / canvas.width,
        toY: pos.y / canvas.height,
        color,
        size: size / Math.min(canvas.width, canvas.height),
        isEraser,
      });
    }

    lastPos.current = pos;
  };

  const endDraw = () => {
    setIsDrawing(false);
    // Flush any remaining strokes immediately on draw end
    if (isMultiplayer && strokeBatch.current.length > 0) {
      mp.sendMessage({ type: "stroke", data: strokeBatch.current });
      strokeBatch.current = [];
    }
  };

  const undo = () => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (ctx && canvas && history.length > 0) {
      const prev = history[history.length - 1];
      ctx.putImageData(prev, 0, 0);
      setHistory(h => h.slice(0, -1));
      if (isMultiplayer) {
        mp.sendMessage({ type: "undo-canvas" });
      }
    }
  };

  const clearCanvas = () => {
    saveHistory();
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (ctx && canvas) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (isMultiplayer) {
        mp.sendMessage({ type: "clear-canvas" });
      }
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="border-2 border-border overflow-hidden shadow-card bg-card">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Drawing canvas area"
          className={`w-full touch-none ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-crosshair"}`}
          style={{ height: "clamp(280px, 40vh, 500px)" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>
      {!disabled && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-center">
          <div className="flex gap-1 sm:gap-1.5">
            {COLORS.map((c, i) => (
              <button
                key={c}
                onClick={() => { setColor(c); setIsEraser(false); }}
                aria-label={`${COLOR_NAMES[i]} color${color === c && !isEraser ? " (selected)" : ""}`}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-transform ${color === c && !isEraser ? "scale-125 border-foreground" : "border-transparent hover:scale-110"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="w-px h-5 sm:h-6 bg-border" />
          <div className="flex gap-1 sm:gap-1.5">
            {SIZES.map((s, i) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                aria-label={`${SIZE_NAMES[i]} brush${size === s ? " (selected)" : ""}`}
                className={`w-7 h-7 sm:w-8 sm:h-8 border flex items-center justify-center transition-all ${size === s ? "bg-primary border-primary" : "bg-card border-border hover:bg-secondary"}`}
              >
                <div
                  className="rounded-full"
                  style={{ width: 4 + i * 4, height: 4 + i * 4, backgroundColor: size === s ? "white" : "currentColor" }}
                />
              </button>
            ))}
          </div>
          <div className="w-px h-5 sm:h-6 bg-border" />
          <button
            onClick={() => setIsEraser(!isEraser)}
            aria-label={isEraser ? "Eraser (active)" : "Eraser"}
            aria-pressed={isEraser}
            className={`w-7 h-7 sm:w-8 sm:h-8 border flex items-center justify-center transition-all ${isEraser ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border hover:bg-secondary"}`}
          >
            <Eraser size={16} aria-hidden="true" />
          </button>
          <button onClick={undo} aria-label="Undo" className="w-7 h-7 sm:w-8 sm:h-8 border border-border bg-card hover:bg-secondary flex items-center justify-center">
            <Undo2 size={16} aria-hidden="true" />
          </button>
          <button onClick={clearCanvas} aria-label="Clear canvas" className="w-7 h-7 sm:w-8 sm:h-8 border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center transition-all">
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
});

DrawingCanvas.displayName = "DrawingCanvas";
export default DrawingCanvas;

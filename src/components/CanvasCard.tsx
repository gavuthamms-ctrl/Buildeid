'use client';
import { useEffect, useRef, useCallback } from 'react';

interface CanvasCardProps {
  imageSrc: string;
  name: string;
  role: string;
  title: string;
}

const W = 1080;
const H = 1350;
const SLOT_X = 54;
const SLOT_Y = 130;
const SLOT_W = W - 108;
const SLOT_H = Math.floor(H * 0.52);
const SLOT_R = 28;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function coverFit(
  imgW: number, imgH: number, slotW: number, slotH: number
): { sx: number; sy: number; sw: number; sh: number } {
  const imgRatio = imgW / imgH;
  const slotRatio = slotW / slotH;
  if (imgRatio > slotRatio) {
    const sh = imgH;
    const sw = slotRatio * imgH;
    return { sx: (imgW - sw) / 2, sy: 0, sw, sh };
  } else {
    const sw = imgW;
    const sh = imgW / slotRatio;
    return { sx: 0, sy: (imgH - sh) / 2, sw, sh };
  }
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  minSize: number,
  weight: string,
  family: string
): number {
  let size = startSize;
  ctx.font = `${weight} ${size}px ${family}`;
  while (ctx.measureText(text).width > maxWidth && size > minSize) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

export default function CanvasCard({ imageSrc, name, role, title }: CanvasCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const draw = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── BACKGROUND GRADIENT ──────────────────────────────
    const bgGrad = ctx.createLinearGradient(0, 0, W * 0.4, H);
    bgGrad.addColorStop(0, '#1a0533');   // deep purple-black
    bgGrad.addColorStop(0.45, '#4a1942'); // dark violet
    bgGrad.addColorStop(0.75, '#8b2252'); // muted rose
    bgGrad.addColorStop(1, '#0d3b5e');   // deep ocean
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Warm horizon glow
    const horizonGrad = ctx.createRadialGradient(W / 2, SLOT_Y + SLOT_H, 0, W / 2, SLOT_Y + SLOT_H, W * 0.9);
    horizonGrad.addColorStop(0, 'rgba(255,140,50,0.35)');
    horizonGrad.addColorStop(0.5, 'rgba(255,90,90,0.12)');
    horizonGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = horizonGrad;
    ctx.fillRect(0, 0, W, H);

    // ── WAVE DECORATION (abstract lines) ─────────────────
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
      const yOffset = SLOT_Y + SLOT_H + 20 + i * 60;
      ctx.beginPath();
      ctx.moveTo(0, yOffset);
      for (let x = 0; x <= W; x += 60) {
        ctx.quadraticCurveTo(x + 30, yOffset + (i % 2 === 0 ? 18 : -18), x + 60, yOffset);
      }
      ctx.stroke();
    }
    ctx.restore();

    // ── CORNER NOTCH (die-cut badge effect) ──────────────
    const notchR = 24;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.beginPath(); ctx.arc(0, 0, notchR, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(W, 0, notchR, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // ── PHOTO SLOT ───────────────────────────────────────
    ctx.save();
    roundRect(ctx, SLOT_X, SLOT_Y, SLOT_W, SLOT_H, SLOT_R);
    ctx.clip();

    const { sx, sy, sw, sh } = coverFit(img.naturalWidth, img.naturalHeight, SLOT_W, SLOT_H);
    ctx.drawImage(img, sx, sy, sw, sh, SLOT_X, SLOT_Y, SLOT_W, SLOT_H);

    // Subtle bottom vignette inside photo slot
    const vigGrad = ctx.createLinearGradient(0, SLOT_Y + SLOT_H * 0.6, 0, SLOT_Y + SLOT_H);
    vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vigGrad.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(SLOT_X, SLOT_Y, SLOT_W, SLOT_H);

    ctx.restore();

    // ── PHOTO BORDER / GLOW ───────────────────────────────
    ctx.save();
    roundRect(ctx, SLOT_X, SLOT_Y, SLOT_W, SLOT_H, SLOT_R);
    ctx.strokeStyle = 'rgba(255,200,100,0.5)';
    ctx.lineWidth = 4;
    ctx.shadowColor = 'rgba(255,140,50,0.6)';
    ctx.shadowBlur = 28;
    ctx.stroke();
    ctx.restore();

    // ── FRAME DECORATIVE LINES (top corners) ─────────────
    const lineLen = 80;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,200,100,0.7)';
    ctx.lineWidth = 3;
    // Top-left
    ctx.beginPath(); ctx.moveTo(SLOT_X + SLOT_R, SLOT_Y - 18); ctx.lineTo(SLOT_X + SLOT_R + lineLen, SLOT_Y - 18); ctx.stroke();
    // Top-right
    ctx.beginPath(); ctx.moveTo(SLOT_X + SLOT_W - SLOT_R - lineLen, SLOT_Y - 18); ctx.lineTo(SLOT_X + SLOT_W - SLOT_R, SLOT_Y - 18); ctx.stroke();
    ctx.restore();

    // ── TEXT BLOCK ────────────────────────────────────────
    const textTop = SLOT_Y + SLOT_H + 60;
    const cx = W / 2;

    // Scrim behind text area
    const scrimGrad = ctx.createLinearGradient(0, textTop - 40, 0, textTop + 360);
    scrimGrad.addColorStop(0, 'rgba(0,0,0,0)');
    scrimGrad.addColorStop(0.2, 'rgba(0,0,0,0.55)');
    scrimGrad.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = scrimGrad;
    ctx.fillRect(0, textTop - 40, W, 420);

    // Name
    const displayName = name.trim() || 'Your Name';
    ctx.save();
    fitText(ctx, displayName, W - 120, 76, 32, '700', '"Space Grotesk", "Arial Black", sans-serif');
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 12;
    ctx.fillText(displayName, cx, textTop + 72);
    ctx.restore();

    // Role
    const displayRole = role.trim() || 'Builder';
    ctx.save();
    ctx.font = '32px "JetBrains Mono", "Courier New", monospace';
    ctx.fillStyle = 'rgba(255,210,130,0.95)';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 8;
    ctx.fillText(displayRole, cx, textTop + 126);
    ctx.restore();

    // Builder title pill
    const pillTitle = `⚡ ${title || 'Ship‑Fast Operator'}`;
    ctx.save();
    ctx.font = '28px "JetBrains Mono", "Courier New", monospace';
    const pillMetrics = ctx.measureText(pillTitle);
    const pillPadX = 40, pillPadY = 16;
    const pillW = pillMetrics.width + pillPadX * 2;
    const pillH = 56;
    const pillX = cx - pillW / 2;
    const pillY = textTop + 156;
    // Pill background
    const pillGrad = ctx.createLinearGradient(pillX, pillY, pillX + pillW, pillY);
    pillGrad.addColorStop(0, '#00e5a0');
    pillGrad.addColorStop(1, '#00b8d4');
    ctx.fillStyle = pillGrad;
    ctx.shadowColor = 'rgba(0,229,160,0.5)';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.fillText(pillTitle, cx, pillY + pillH - 16);
    ctx.restore();

    // ── HEADER BAR ────────────────────────────────────────
    // Top gradient bar
    const headerGrad = ctx.createLinearGradient(0, 0, W, 0);
    headerGrad.addColorStop(0, 'rgba(255,140,50,0.18)');
    headerGrad.addColorStop(1, 'rgba(0,100,180,0.18)');
    ctx.fillStyle = headerGrad;
    ctx.fillRect(0, 0, W, 110);

    ctx.save();
    ctx.font = '26px "JetBrains Mono", "Courier New", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.textAlign = 'left';
    ctx.fillText('HH GOA 2026', 54, 68);
    // Badge number
    ctx.font = '700 28px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(255,200,100,0.9)';
    ctx.textAlign = 'right';
    ctx.fillText('#247', W - 54, 68);
    ctx.restore();

    // Thin separator line under header
    ctx.save();
    ctx.strokeStyle = 'rgba(255,200,100,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(54, 86);
    ctx.lineTo(W - 54, 86);
    ctx.stroke();
    ctx.restore();

    // ── FOOTER ────────────────────────────────────────────
    ctx.save();
    ctx.font = '22px "JetBrains Mono", "Courier New", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('#FrameInGoa  ·  28‑31 Oct  ·  Goa, India', cx, H - 50);
    ctx.restore();

    // Outer card border glow
    ctx.save();
    ctx.strokeStyle = 'rgba(255,200,100,0.15)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);
    ctx.restore();

  }, [name, role, title]);

  const scheduleDraw = useCallback(() => {
    if (drawTimeoutRef.current) clearTimeout(drawTimeoutRef.current);
    if (!imgRef.current) return;
    drawTimeoutRef.current = setTimeout(() => {
      if (imgRef.current) draw(imgRef.current);
    }, 150);
  }, [draw]);

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      draw(img);
    };
    img.src = imageSrc;
  }, [imageSrc, draw]);

  useEffect(() => {
    scheduleDraw();
  }, [name, role, title, scheduleDraw]);

  return (
    <canvas
      id="card-canvas"
      ref={canvasRef}
      width={W}
      height={H}
      className="canvas-preview"
    />
  );
}

import { hslToRgb } from './color';
import type { HslColor } from './types';

export class ColorWheel {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly offscreen: HTMLCanvasElement;
  private readonly cx: number;
  private readonly cy: number;
  private readonly radius: number;
  private cursor: { x: number; y: number };
  private active = true;
  private lightness = 50;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get 2d context');
    this.ctx = ctx;

    this.cx = canvas.width / 2;
    this.cy = canvas.height / 2;
    this.radius = this.cx - 4;
    this.cursor = { x: this.cx, y: this.cy };

    this.offscreen = document.createElement('canvas');
    this.offscreen.width = canvas.width;
    this.offscreen.height = canvas.height;

    this.buildWheel();
    this.render();
  }

  setLightness(l: number): void {
    this.lightness = l;
    this.buildWheel();
    this.render();
  }

  private buildWheel(): void {
    const offCtx = this.offscreen.getContext('2d')!;
    const { width: W, height: H } = this.offscreen;
    const { cx, cy, radius, lightness } = this;
    const img = offCtx.createImageData(W, H);

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d <= radius) {
          const hue = ((Math.atan2(dy, dx) * 180 / Math.PI) + 360) % 360;
          const sat = (d / radius) * 100;
          const [r, g, b] = hslToRgb(hue, sat, lightness);
          const i = (y * W + x) * 4;
          img.data[i]     = r;
          img.data[i + 1] = g;
          img.data[i + 2] = b;
          img.data[i + 3] = 255;
        }
      }
    }

    offCtx.putImageData(img, 0, 0);
  }

  render(): void {
    const { ctx, canvas, offscreen, cursor } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offscreen, 0, 0);

    ctx.beginPath();
    ctx.arc(cursor.x, cursor.y, 12, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cursor.x, cursor.y, 12, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  reset(): void {
    this.cursor = { x: this.cx, y: this.cy };
    this.active = true;
    this.render();
  }

  lock(): void {
    this.active = false;
  }

  getColor(): HslColor {
    const { cursor, cx, cy, radius, lightness } = this;
    const dx = cursor.x - cx;
    const dy = cursor.y - cy;
    return {
      h: ((Math.atan2(dy, dx) * 180 / Math.PI) + 360) % 360,
      s: Math.min(Math.sqrt(dx * dx + dy * dy), radius) / radius * 100,
      l: lightness,
    };
  }

  private clamp(x: number, y: number): { x: number; y: number } {
    const { cx, cy, radius } = this;
    const dx = x - cx;
    const dy = y - cy;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > radius) {
      const a = Math.atan2(dy, dx);
      return { x: cx + Math.cos(a) * radius, y: cy + Math.sin(a) * radius };
    }
    return { x, y };
  }

  private toCanvasPos(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return this.clamp(
      (clientX - rect.left) * (this.canvas.width / rect.width),
      (clientY - rect.top)  * (this.canvas.height / rect.height),
    );
  }

  onColorChange(handler: (color: HslColor) => void): void {
    let pressing = false;

    // Move cursor visually on hover; only fire handler when pressing (click/drag)
    const moveCursor = (clientX: number, clientY: number) => {
      if (!this.active) return;
      this.cursor = this.toCanvasPos(clientX, clientY);
      this.render();
    };

    const selectColor = (clientX: number, clientY: number) => {
      moveCursor(clientX, clientY);
      if (this.active) handler(this.getColor());
    };

    this.canvas.addEventListener('mousemove', e => {
      if (pressing) selectColor(e.clientX, e.clientY);
      else moveCursor(e.clientX, e.clientY);
    });
    this.canvas.addEventListener('mousedown', e => {
      pressing = true;
      selectColor(e.clientX, e.clientY);
    });
    window.addEventListener('mouseup', () => { pressing = false; });

    this.canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      selectColor(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
    this.canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      selectColor(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
  }
}

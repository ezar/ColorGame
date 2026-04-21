interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  color: string;
  rot: number; vrot: number;
  life: number;
}

const COLORS = ['#f87171','#fb923c','#fbbf24','#a3e635','#34d399','#38bdf8','#818cf8','#e879f9'];

export function launchConfetti(): void {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:999';
  document.body.appendChild(canvas);

  const W = canvas.width  = window.innerWidth;
  const H = canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d')!;
  const particles: Particle[] = [];

  for (let i = 0; i < 120; i++) {
    particles.push({
      x: W * 0.3 + Math.random() * W * 0.4,
      y: H * 0.35,
      vx: (Math.random() - 0.5) * 10,
      vy: -8 - Math.random() * 8,
      r: 4 + Math.random() * 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.3,
      life: 1,
    });
  }

  let frame: number;
  const tick = (): void => {
    ctx.clearRect(0, 0, W, H);
    let alive = false;
    for (const p of particles) {
      p.vy  += 0.35;
      p.x   += p.vx;
      p.y   += p.vy;
      p.rot += p.vrot;
      p.vx  *= 0.99;
      p.life -= 0.012;
      if (p.life <= 0) continue;
      alive = true;
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r);
      ctx.restore();
    }
    if (alive) { frame = requestAnimationFrame(tick); }
    else { canvas.remove(); }
  };
  frame = requestAnimationFrame(tick);

  // safety cleanup after 4s
  setTimeout(() => { cancelAnimationFrame(frame); canvas.remove(); }, 4000);
}

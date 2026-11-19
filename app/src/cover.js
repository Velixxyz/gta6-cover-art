// Vice City Multi-Panel Studio — cover composition engine.
// Draws GTA-style multi-panel poster covers on canvas: asymmetric panel grids,
// a global Vice City sunset/neon grade, code-drawn skyline + palms, and bold
// Anton caption lettering. No Rockstar assets: every graphic here is drawn in
// code, every font is a bundled SIL OFL file under app/fonts/.

export const PANEL_GUTTER = 0.012;

export const COVER_LAYOUTS = {
  classicVice: {
    label: 'Classic Vice',
    cells: [
      { role: 'hero', c0: 0, r0: 0, c1: 7, r1: 12 },
      { role: 'face', c0: 7, r0: 0, c1: 10, r1: 6 },
      { role: 'action', c0: 10, r0: 0, c1: 12, r1: 6 },
      { role: 'street', c0: 7, r0: 6, c1: 10, r1: 12 },
      { role: 'night', c0: 10, r0: 6, c1: 12, r1: 12 },
    ],
  },
  duoStory: {
    label: 'Duo Story',
    cells: [
      { role: 'hero', c0: 0, r0: 0, c1: 6, r1: 8 },
      { role: 'face', c0: 6, r0: 0, c1: 12, r1: 8 },
      { role: 'action', c0: 0, r0: 8, c1: 4, r1: 12 },
      { role: 'street', c0: 4, r0: 8, c1: 8, r1: 12 },
      { role: 'night', c0: 8, r0: 8, c1: 12, r1: 12 },
    ],
  },
  cityNights: {
    label: 'City Nights',
    cells: [
      { role: 'hero', c0: 0, r0: 0, c1: 12, r1: 7 },
      { role: 'street', c0: 0, r0: 7, c1: 4, r1: 12 },
      { role: 'action', c0: 4, r0: 7, c1: 8, r1: 12 },
      { role: 'night', c0: 8, r0: 7, c1: 12, r1: 12 },
    ],
  },
  actionGrid: {
    label: 'Action Grid',
    cells: [
      { role: 'hero', c0: 0, r0: 0, c1: 7, r1: 8 },
      { role: 'face', c0: 7, r0: 0, c1: 12, r1: 4 },
      { role: 'action', c0: 7, r0: 4, c1: 12, r1: 8 },
      { role: 'street', c0: 0, r0: 8, c1: 4, r1: 12 },
      { role: 'detail', c0: 4, r0: 8, c1: 8, r1: 12 },
      { role: 'night', c0: 8, r0: 8, c1: 12, r1: 12 },
    ],
  },
  sunsetEdition: {
    label: 'Sunset Edition',
    cells: [
      { role: 'face', c0: 0, r0: 0, c1: 5, r1: 4 },
      { role: 'street', c0: 0, r0: 4, c1: 5, r1: 8 },
      { role: 'night', c0: 0, r0: 8, c1: 5, r1: 12 },
      { role: 'hero', c0: 5, r0: 0, c1: 12, r1: 12 },
    ],
  },
  minimalCrime: {
    label: 'Minimal Crime',
    cells: [
      { role: 'hero', c0: 0, r0: 0, c1: 9, r1: 12 },
      { role: 'face', c0: 9, r0: 0, c1: 12, r1: 6 },
      { role: 'detail', c0: 9, r0: 6, c1: 12, r1: 12 },
    ],
  },
};

export const COVER_GRADES = {
  viceSunset: {
    label: 'Vice City Sunset',
    filter: 'saturate(1.28) contrast(1.07) sepia(0.16) hue-rotate(-6deg) brightness(1.02)',
    tintTop: '#ff9a3d', tintBottom: '#ff2e88',
    sky: ['#ffcf6e', '#ff7a3d', '#ff2e88', '#7b2fff'],
    title: '#fff7e6', accent: '#ff2e88',
  },
  neonNights: {
    label: 'Neon Nights',
    filter: 'saturate(1.35) contrast(1.15) hue-rotate(18deg) brightness(0.95)',
    tintTop: '#7b2fff', tintBottom: '#00e5ff',
    sky: ['#2b1a5e', '#7b2fff', '#ff2e88', '#00e5ff'],
    title: '#eafcff', accent: '#00e5ff',
  },
  tropicalHeat: {
    label: 'Tropical Heat',
    filter: 'saturate(1.15) contrast(1.03) sepia(0.08) brightness(1.05)',
    tintTop: '#ffd76a', tintBottom: '#19c2b8',
    sky: ['#fff3b0', '#ffd76a', '#ff9a3d', '#19c2b8'],
    title: '#fffbe8', accent: '#ffd76a',
  },
  crimeDrama: {
    label: 'Crime Drama',
    filter: 'saturate(0.82) contrast(1.12) sepia(0.22) hue-rotate(-12deg) brightness(0.94)',
    tintTop: '#0e3a4a', tintBottom: '#ff9a3d',
    sky: ['#3a2b3f', '#7a3b4d', '#c96a3b', '#0e3a4a'],
    title: '#ffe9c4', accent: '#ffb347',
  },
};

export const EXPORT_SIZES = {
  square: { label: 'Square 1080 × 1080', w: 1080, h: 1080 },
  portrait: { label: 'Portrait 1080 × 1350', w: 1080, h: 1350 },
  landscape: { label: 'Landscape 1920 × 1080', w: 1920, h: 1080 },
};

// Deterministic pseudo-random from a fixed seed, so the drawn skyline is
// identical on every render of the same cover.
export function seededRandom(seed) {
  let s = seed >>> 0;
  return function nextSeeded() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Grid cell (12 x 12) -> pixel rect, inset by the dark gutter.
export function gridCellRect(cell, canvasW, canvasH) {
  const g = PANEL_GUTTER * Math.min(canvasW, canvasH);
  const unitW = canvasW / 12;
  const unitH = canvasH / 12;
  return {
    x: cell.c0 * unitW + g / 2,
    y: cell.r0 * unitH + g / 2,
    w: (cell.c1 - cell.c0) * unitW - g,
    h: (cell.r1 - cell.r0) * unitH - g,
    role: cell.role,
  };
}

export function layoutPanels(layoutId, canvasW, canvasH) {
  const layout = COVER_LAYOUTS[layoutId] || COVER_LAYOUTS.classicVice;
  return layout.cells.map((cell) => gridCellRect(cell, canvasW, canvasH));
}

// Default per-role crop: one photo fills every panel with a different crop,
// so a single-photo cover still reads as a multi-panel poster.
export function defaultCropForRole(role, panelIndex) {
  const presets = {
    hero: { zoom: 1.05, ox: 0.5, oy: 0.42, flip: false },
    face: { zoom: 1.7, ox: 0.5, oy: 0.26, flip: false },
    action: { zoom: 1.25, ox: 0.5, oy: 0.55, flip: false },
    street: { zoom: 1.0, ox: 0.5, oy: 0.62, flip: false },
    detail: { zoom: 2.1, ox: 0.5, oy: 0.68, flip: false },
    night: { zoom: 1.35, ox: 0.5, oy: 0.5, flip: false },
  };
  const base = presets[role] || presets.street;
  const nudge = (panelIndex % 3 - 1) * 0.06;
  return { zoom: base.zoom, ox: Math.min(0.85, Math.max(0.15, base.ox + nudge)), oy: base.oy, flip: base.flip };
}

// Cover-fit source window for a photo inside a panel rect. Never stretches:
// scale = max(panelW / imgW, panelH / imgH), window centred on the focus point.
export function fitPhotoToPanel(imgW, imgH, panelW, panelH, crop) {
  const scale = Math.max(panelW / imgW, panelH / imgH) * (crop.zoom || 1);
  const winW = panelW / scale;
  const winH = panelH / scale;
  const cx = (crop.ox ?? 0.5) * imgW;
  const cy = (crop.oy ?? 0.5) * imgH;
  const sx = Math.min(Math.max(cx - winW / 2, 0), Math.max(imgW - winW, 0));
  const sy = Math.min(Math.max(cy - winH / 2, 0), Math.max(imgH - winH, 0));
  return { sx, sy, sw: Math.min(winW, imgW), sh: Math.min(winH, imgH) };
}

// A palm tree silhouette, drawn in code: curved trunk + five drooping fronds.
export function drawPalmSilhouette(ctx, x, y, size, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.045);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + size * 0.08, y - size * 0.55, x + size * 0.22, y - size * 0.95);
  ctx.stroke();
  const topX = x + size * 0.22;
  const topY = y - size * 0.95;
  for (let i = 0; i < 5; i++) {
    const a = (-0.15 - i * 0.42) * Math.PI;
    const len = size * (0.42 - Math.abs(i - 2) * 0.05);
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(
      topX + Math.cos(a) * len * 0.6, topY + Math.sin(a) * len * 0.45 - size * 0.08,
      topX + Math.cos(a) * len, topY + Math.sin(a) * len * 0.7 + size * 0.14,
    );
    ctx.stroke();
  }
  ctx.restore();
}

// A city skyline silhouette with lit windows, drawn in code.
export function drawSkylineSilhouette(ctx, x, y, w, h, color, seed) {
  const rnd = seededRandom(seed);
  ctx.save();
  ctx.fillStyle = color;
  let bx = x;
  while (bx < x + w) {
    const bw = w * (0.06 + rnd() * 0.09);
    const bh = h * (0.35 + rnd() * 0.65);
    ctx.fillRect(bx, y + h - bh, bw, bh);
    if (rnd() > 0.6) ctx.fillRect(bx + bw * 0.35, y + h - bh - h * 0.12, bw * 0.3, h * 0.12);
    ctx.fillStyle = 'rgba(255, 214, 106, 0.85)';
    const floors = Math.max(1, Math.floor(bh / (h * 0.16)));
    for (let f = 0; f < floors; f++) {
      for (let col = 0; col < 3; col++) {
        if (rnd() > 0.55) ctx.fillRect(bx + bw * (0.18 + col * 0.28), y + h - bh + h * 0.09 + f * h * 0.16, bw * 0.12, h * 0.06);
      }
    }
    ctx.fillStyle = color;
    bx += bw + w * 0.012;
  }
  ctx.restore();
}

// One photo panel: cover-fit draw with the global grade filter, then a soft
// warm/cool tint wash so every panel shares one colour temperature.
export function drawPanelPhoto(ctx, panel, img, crop, grade) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(panel.x, panel.y, panel.w, panel.h);
  ctx.clip();
  if (!img) {
    const empty = ctx.createLinearGradient(panel.x, panel.y, panel.x, panel.y + panel.h);
    empty.addColorStop(0, '#3a2140');
    empty.addColorStop(1, '#120a1c');
    ctx.fillStyle = empty;
    ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
    ctx.restore();
    return;
  }
  const win = fitPhotoToPanel(img.naturalWidth, img.naturalHeight, panel.w, panel.h, crop);
  ctx.filter = grade.filter;
  if (crop.flip) {
    ctx.translate(panel.x + panel.w, panel.y);
    ctx.scale(-1, 1);
    ctx.drawImage(img, win.sx, win.sy, win.sw, win.sh, 0, 0, panel.w, panel.h);
  } else {
    ctx.drawImage(img, win.sx, win.sy, win.sw, win.sh, panel.x, panel.y, panel.w, panel.h);
  }
  ctx.filter = 'none';
  const wash = ctx.createLinearGradient(panel.x, panel.y, panel.x, panel.y + panel.h);
  wash.addColorStop(0, grade.tintTop);
  wash.addColorStop(1, grade.tintBottom);
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = wash;
  ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}

// Full-bleed sunset sky behind the panels: visible in the dark gutters and
// as the base the title scrim sits on.
export function drawViceSkyBackground(ctx, w, h, grade) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  grade.sky.forEach((stop, i) => sky.addColorStop(i / (grade.sky.length - 1), stop));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  const sunX = w * 0.78;
  const sunY = h * 0.2;
  const sunR = Math.min(w, h) * 0.16;
  const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 2.4);
  glow.addColorStop(0, 'rgba(255, 236, 170, 0.9)');
  glow.addColorStop(0.35, 'rgba(255, 170, 90, 0.45)');
  glow.addColorStop(1, 'rgba(255, 120, 80, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
}

// Fine film grain + a gentle vignette over the whole cover.
export function drawFilmGrain(ctx, w, h) {
  const tile = document.createElement('canvas');
  tile.width = 128;
  tile.height = 128;
  const tctx = tile.getContext('2d');
  const data = tctx.createImageData(128, 128);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = 118 + Math.floor(Math.random() * 40);
    data.data[i] = v; data.data[i + 1] = v; data.data[i + 2] = v; data.data[i + 3] = 255;
  }
  tctx.putImageData(data, 0, 0);
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.globalCompositeOperation = 'overlay';
  const pattern = ctx.createPattern(tile, 'repeat');
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

export function drawCoverVignette(ctx, w, h) {
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.30)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

// Three-level caption lettering: big Anton title, Oswald subtitle with wide
// tracking, small Inter micro-detail. Auto-fits the title to the width and
// never covers a face: the scrim sits behind the text, not over the hero.
export function renderCaptionLettering(ctx, w, h, state, grade) {
  const title = (state.title || '').trim().toUpperCase().slice(0, 24);
  const subtitle = (state.subtitle || '').trim().toUpperCase().slice(0, 45);
  const micro = (state.micro || '').trim().toUpperCase().slice(0, 60);
  const pos = state.titlePos || 'bottom';
  const pad = w * 0.045;
  const zoneH = h * (pos === 'center' ? 0.34 : 0.30);
  const zoneY = pos === 'top' ? 0 : pos === 'center' ? (h - zoneH) / 2 : h - zoneH;
  const scrim = ctx.createLinearGradient(0, zoneY, 0, zoneY + zoneH);
  if (pos === 'top') {
    scrim.addColorStop(0, 'rgba(8,4,16,0.82)');
    scrim.addColorStop(1, 'rgba(8,4,16,0)');
  } else if (pos === 'center') {
    scrim.addColorStop(0, 'rgba(8,4,16,0)');
    scrim.addColorStop(0.5, 'rgba(8,4,16,0.72)');
    scrim.addColorStop(1, 'rgba(8,4,16,0)');
  } else {
    scrim.addColorStop(0, 'rgba(8,4,16,0)');
    scrim.addColorStop(1, 'rgba(8,4,16,0.85)');
  }
  ctx.fillStyle = scrim;
  ctx.fillRect(0, zoneY, w, zoneH);
  // Neon accent rule along the very top edge — never over a face.
  ctx.fillStyle = grade.accent;
  ctx.fillRect(0, 0, w, Math.max(3, h * 0.007));
  const baseline = pos === 'top' ? zoneY + h * 0.20 : pos === 'center' ? h * 0.52 : h - h * 0.075;
  let titleSize = 0;
  if (title) {
    let size = Math.min(w * 0.105, h * 0.13);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
    while (ctx.measureText(title).width > w - pad * 2 && size > 14) {
      size -= 2;
      ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
    }
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(3, size * 0.09);
    ctx.strokeStyle = 'rgba(10,4,18,0.92)';
    ctx.shadowColor = 'rgba(0,0,0,0.65)';
    ctx.shadowBlur = size * 0.18;
    ctx.shadowOffsetY = size * 0.05;
    ctx.strokeText(title, pad, baseline);
    ctx.fillStyle = grade.title;
    ctx.fillText(title, pad, baseline);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    titleSize = size;
  }
  if (subtitle) {
    const subSize = Math.max(13, Math.min(w * 0.026, h * 0.032));
    ctx.font = `600 ${subSize}px Oswald, 'Arial Narrow', sans-serif`;
    try { ctx.letterSpacing = `${Math.max(2, subSize * 0.28)}px`; } catch (e) { /* older canvas: no tracking */ }
    ctx.fillStyle = grade.accent;
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = subSize * 0.3;
    const subY = pos === 'top' ? baseline + subSize * 1.9 : baseline - titleSize * 1.15;
    ctx.fillText(subtitle, pad, subY);
    ctx.shadowBlur = 0;
    try { ctx.letterSpacing = '0px'; } catch (e) { /* older canvas */ }
  }
  if (micro) {
    const microSize = Math.max(11, Math.min(w * 0.016, h * 0.02));
    ctx.font = `500 ${microSize}px Inter, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.78)';
    const microY = pos === 'bottom' ? h - h * 0.028 : pos === 'top' ? zoneY + zoneH - h * 0.03 : h * 0.62;
    ctx.fillText(micro, pad, microY);
  }
}

// Full cover render: sky base, graded panels, code-drawn skyline + palms on
// the hero panel foot, grain, vignette, then the caption lettering.
export function renderComicCover(canvas, w, h, state) {
  const ctx = canvas.getContext('2d');
  canvas.width = w;
  canvas.height = h;
  const grade = COVER_GRADES[state.grade] || COVER_GRADES.viceSunset;
  drawViceSkyBackground(ctx, w, h, grade);
  const panels = layoutPanels(state.layout, w, h);
  panels.forEach((panel, i) => {
    const photo = panelPhotoForState(state, i);
    const crop = panelCropForState(state, i, panel.role);
    drawPanelPhoto(ctx, panel, photo, crop, grade);
  });
  const hero = panels.find((p) => p.role === 'hero') || panels[0];
  if (hero) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(hero.x, hero.y, hero.w, hero.h);
    ctx.clip();
    const bandH = Math.min(hero.h * 0.14, h * 0.11);
    drawSkylineSilhouette(ctx, hero.x, hero.y + hero.h - bandH, hero.w, bandH, 'rgba(12,6,20,0.88)', 20261119);
    // One small palm rising from the skyline at the hero's far right edge,
    // clear of the left-aligned caption.
    const palmSize = bandH * 0.85;
    drawPalmSilhouette(ctx, hero.x + hero.w * 0.97, hero.y + hero.h - 2, palmSize, 'rgba(12,6,20,0.92)');
    ctx.restore();
  }
  drawFilmGrain(ctx, w, h);
  drawCoverVignette(ctx, w, h);
  renderCaptionLettering(ctx, w, h, state, grade);
  return canvas;
}

// Which loaded photo fills panel i: the panel's assigned photo, else cycle
// the loaded photos so one photo fills every panel with different crops.
export function panelPhotoForState(state, panelIndex) {
  const photos = state.photos || [];
  if (!photos.length) return null;
  const assigned = (state.panelPhotos || [])[panelIndex];
  if (assigned != null && photos[assigned]) return photos[assigned].img;
  return photos[panelIndex % photos.length].img;
}

export function panelCropForState(state, panelIndex, role) {
  const stored = (state.panelCrops || [])[panelIndex];
  if (stored) return stored;
  return defaultCropForRole(role, panelIndex);
}

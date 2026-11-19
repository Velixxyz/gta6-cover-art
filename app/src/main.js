// Vice City Multi-Panel Studio — editor wiring.
// Upload 1-10 local photos, pick one of 6 art-directed layouts, one of 4
// global grades, type a 3-level caption, crop each panel independently by
// dragging on the preview, then export the exact-size PNG. Photos never leave
// the machine: FileReader / object URLs only, no upload, no network.
import { COVER_LAYOUTS, COVER_GRADES, EXPORT_SIZES, layoutPanels, renderComicCover, defaultCropForRole, fitPhotoToPanel } from './cover.js';
import { runShotScene } from './shots.js';

export const coverCanvas = document.getElementById('coverCanvas');
const statusLine = document.getElementById('statusLine');
const photoStrip = document.getElementById('photoStrip');

export const editorState = {
  photos: [],
  layout: 'classicVice',
  grade: 'viceSunset',
  title: 'SUNSET HEIST',
  subtitle: 'WELCOME TO LEONIDA',
  micro: 'VICE CITY • LEONIDA',
  titlePos: 'bottom',
  size: 'landscape',
  panelPhotos: [],
  panelCrops: [],
  selectedPanel: 0,
};

const undoStack = [];
const redoStack = [];
let photoCounter = 0;

export function setStatus(text) {
  statusLine.textContent = text;
}

export function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('photo failed to load'));
    img.src = url;
  });
}

export function snapshotEditorState() {
  return JSON.stringify({
    layout: editorState.layout, grade: editorState.grade,
    title: editorState.title, subtitle: editorState.subtitle, micro: editorState.micro,
    titlePos: editorState.titlePos, size: editorState.size,
    panelPhotos: editorState.panelPhotos, panelCrops: editorState.panelCrops,
  });
}

export function pushUndoSnapshot() {
  undoStack.push(snapshotEditorState());
  if (undoStack.length > 40) undoStack.shift();
  redoStack.length = 0;
}

export function restoreEditorSnapshot(json) {
  const s = JSON.parse(json);
  Object.assign(editorState, s);
  syncEditorControls();
  redrawCoverPreview();
}

export function undoEditorStep() {
  if (!undoStack.length) return;
  redoStack.push(snapshotEditorState());
  restoreEditorSnapshot(undoStack.pop());
  setStatus('Undid last step');
}

export function redoEditorStep() {
  if (!redoStack.length) return;
  undoStack.push(snapshotEditorState());
  restoreEditorSnapshot(redoStack.pop());
  setStatus('Redid step');
}

export function redrawCoverPreview() {
  const size = EXPORT_SIZES[editorState.size] || EXPORT_SIZES.landscape;
  renderComicCover(coverCanvas, size.w, size.h, editorState);
  coverCanvas.style.aspectRatio = `${size.w} / ${size.h}`;
  updatePanelInspector();
}

export async function addPhotoFiles(fileList) {
  const files = [...fileList].filter((f) => /^image\/(jpeg|png|webp)$/.test(f.type));
  if (!files.length) { setStatus('Pick a JPG, PNG or WebP photo'); return; }
  for (const file of files.slice(0, 10 - editorState.photos.length)) {
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImageFromUrl(url);
      editorState.photos.push({ id: photoCounter++, name: file.name, img, url });
    } catch (e) { URL.revokeObjectURL(url); }
  }
  renderPhotoStrip();
  redrawCoverPreview();
  setStatus(`${editorState.photos.length} photo${editorState.photos.length === 1 ? '' : 's'} loaded — click a panel, then a photo to place it`);
}

export function renderPhotoStrip() {
  photoStrip.innerHTML = '';
  editorState.photos.forEach((photo, idx) => {
    const thumb = document.createElement('button');
    thumb.className = 'photoThumb';
    thumb.type = 'button';
    thumb.title = photo.name;
    const img = document.createElement('img');
    img.src = photo.url;
    img.alt = photo.name;
    thumb.appendChild(img);
    thumb.addEventListener('click', () => {
      pushUndoSnapshot();
      editorState.panelPhotos[editorState.selectedPanel] = idx;
      redrawCoverPreview();
      setStatus(`Photo ${idx + 1} placed in panel ${editorState.selectedPanel + 1}`);
    });
    photoStrip.appendChild(thumb);
  });
  const hint = document.createElement('span');
  hint.className = 'stripHint';
  hint.textContent = editorState.photos.length ? 'Click a photo to place it in the selected panel' : 'No photos yet — drop photos or use a sample';
  photoStrip.appendChild(hint);
}

export function buildLayoutPicker() {
  const grid = document.getElementById('layoutGrid');
  Object.entries(COVER_LAYOUTS).forEach(([id, layout]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'layoutBtn';
    btn.dataset.layout = id;
    btn.textContent = layout.label;
    btn.addEventListener('click', () => {
      pushUndoSnapshot();
      editorState.layout = id;
      editorState.selectedPanel = 0;
      syncEditorControls();
      redrawCoverPreview();
      setStatus(`Layout: ${layout.label}`);
    });
    grid.appendChild(btn);
  });
}

export function buildGradePicker() {
  const row = document.getElementById('gradeRow');
  Object.entries(COVER_GRADES).forEach(([id, grade]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gradeBtn';
    btn.dataset.grade = id;
    btn.textContent = grade.label;
    btn.style.setProperty('--grade-accent', grade.accent);
    btn.addEventListener('click', () => {
      pushUndoSnapshot();
      editorState.grade = id;
      syncEditorControls();
      redrawCoverPreview();
      setStatus(`Grade: ${grade.label}`);
    });
    row.appendChild(btn);
  });
}

export function buildSizePicker() {
  const row = document.getElementById('sizeRow');
  Object.entries(EXPORT_SIZES).forEach(([id, size]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sizeBtn';
    btn.dataset.size = id;
    btn.textContent = size.label;
    btn.addEventListener('click', () => {
      editorState.size = id;
      syncEditorControls();
      redrawCoverPreview();
      setStatus(`Preview size: ${size.label}`);
    });
    row.appendChild(btn);
  });
}

export function syncEditorControls() {
  document.querySelectorAll('.layoutBtn').forEach((b) => b.classList.toggle('active', b.dataset.layout === editorState.layout));
  document.querySelectorAll('.gradeBtn').forEach((b) => b.classList.toggle('active', b.dataset.grade === editorState.grade));
  document.querySelectorAll('.sizeBtn').forEach((b) => b.classList.toggle('active', b.dataset.size === editorState.size));
  document.getElementById('titleInput').value = editorState.title;
  document.getElementById('subtitleInput').value = editorState.subtitle;
  document.getElementById('microInput').value = editorState.micro;
  document.getElementById('titlePosSelect').value = editorState.titlePos;
  const panels = layoutPanels(editorState.layout, coverCanvas.width, coverCanvas.height);
  const label = document.getElementById('panelLabel');
  const panel = panels[editorState.selectedPanel];
  label.textContent = panel ? `Panel ${editorState.selectedPanel + 1} — ${panel.role}` : 'No panel selected';
}

export function updatePanelInspector() {
  const panels = layoutPanels(editorState.layout, coverCanvas.width, coverCanvas.height);
  const panel = panels[editorState.selectedPanel];
  if (!panel) return;
  const crop = editorState.panelCrops[editorState.selectedPanel] || defaultCropForRole(panel.role, editorState.selectedPanel);
  document.getElementById('zoomRange').value = String(crop.zoom);
  document.getElementById('zoomValue').textContent = `${crop.zoom.toFixed(2)}×`;
}

// Drag on the preview pans the selected panel's crop; click selects a panel.
export function attachCanvasCropDrag() {
  let drag = null;
  coverCanvas.addEventListener('pointerdown', (e) => {
    const rect = coverCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (coverCanvas.width / rect.width);
    const y = (e.clientY - rect.top) * (coverCanvas.height / rect.height);
    const panels = layoutPanels(editorState.layout, coverCanvas.width, coverCanvas.height);
    const hit = panels.findIndex((p) => x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h);
    if (hit < 0) return;
    editorState.selectedPanel = hit;
    const panel = panels[hit];
    const crop = editorState.panelCrops[hit] || defaultCropForRole(panel.role, hit);
    editorState.panelCrops[hit] = { ...crop };
    pushUndoSnapshot();
    drag = { panel, startX: e.clientX, startY: e.clientY, crop: { ...crop } };
    coverCanvas.setPointerCapture(e.pointerId);
    syncEditorControls();
  });
  coverCanvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const rect = coverCanvas.getBoundingClientRect();
    const scaleX = coverCanvas.width / rect.width;
    const dx = (e.clientX - drag.startX) * scaleX;
    const dy = (e.clientY - drag.startY) * (coverCanvas.height / rect.height);
    const photo = editorState.photos[(editorState.panelPhotos[editorState.selectedPanel] ?? editorState.selectedPanel % Math.max(1, editorState.photos.length))];
    const img = photo ? photo.img : null;
    if (!img) return;
    const win = fitPhotoToPanel(img.naturalWidth, img.naturalHeight, drag.panel.w, drag.panel.h, drag.crop);
    const ox = Math.min(0.95, Math.max(0.05, drag.crop.ox - (dx * win.sw / drag.panel.w) / img.naturalWidth));
    const oy = Math.min(0.95, Math.max(0.05, drag.crop.oy - (dy * win.sh / drag.panel.h) / img.naturalHeight));
    editorState.panelCrops[editorState.selectedPanel] = { ...drag.crop, ox, oy };
    redrawCoverPreview();
  });
  coverCanvas.addEventListener('pointerup', () => { drag = null; });
  coverCanvas.addEventListener('dblclick', () => {
    const panels = layoutPanels(editorState.layout, coverCanvas.width, coverCanvas.height);
    const panel = panels[editorState.selectedPanel];
    if (!panel) return;
    pushUndoSnapshot();
    editorState.panelCrops[editorState.selectedPanel] = defaultCropForRole(panel.role, editorState.selectedPanel);
    redrawCoverPreview();
    setStatus('Crop reset — double-click a panel to reset its crop');
  });
}

// Export: render the exact same composition offscreen at full target size,
// then download it as a PNG. Preview and export share renderComicCover, so
// what you see is what the file holds.
export function exportPng1080() { return exportCoverPng('square'); }
export function exportPngPortrait() { return exportCoverPng('portrait'); }
export function exportPngLandscape() { return exportCoverPng('landscape'); }

export function exportCoverPng(sizeId) {
  const size = EXPORT_SIZES[sizeId];
  if (!size) return;
  const off = document.createElement('canvas');
  renderComicCover(off, size.w, size.h, editorState);
  off.toBlob((blob) => {
    if (!blob) { setStatus('Export failed — try again'); return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cover-${size.w}x${size.h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    setStatus(`Saved cover-${size.w}x${size.h}.png`);
  }, 'image/png');
}

export function exportAllSizes() {
  ['square', 'portrait', 'landscape'].forEach((id, i) => {
    setTimeout(() => exportCoverPng(id), i * 350);
  });
  setStatus('Exporting all 3 sizes…');
}

export function resetWholeDesign() {
  pushUndoSnapshot();
  editorState.layout = 'classicVice';
  editorState.grade = 'viceSunset';
  editorState.title = 'SUNSET HEIST';
  editorState.subtitle = 'WELCOME TO LEONIDA';
  editorState.micro = 'VICE CITY • LEONIDA';
  editorState.titlePos = 'bottom';
  editorState.panelPhotos = [];
  editorState.panelCrops = [];
  editorState.selectedPanel = 0;
  syncEditorControls();
  redrawCoverPreview();
  setStatus('Design reset');
}

export function wireEditorControls() {
  document.getElementById('photoInput').addEventListener('change', (e) => addPhotoFiles(e.target.files));
  const dropZone = document.getElementById('dropZone');
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragOver'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragOver'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragOver');
    addPhotoFiles(e.dataTransfer.files);
  });
  document.getElementById('samplePier').addEventListener('click', () => loadSamplePhoto('pier'));
  document.getElementById('sampleBoulevard').addEventListener('click', () => loadSamplePhoto('boulevard'));
  document.getElementById('titleInput').addEventListener('input', (e) => { editorState.title = e.target.value; redrawCoverPreview(); });
  document.getElementById('subtitleInput').addEventListener('input', (e) => { editorState.subtitle = e.target.value; redrawCoverPreview(); });
  document.getElementById('microInput').addEventListener('input', (e) => { editorState.micro = e.target.value; redrawCoverPreview(); });
  document.getElementById('titlePosSelect').addEventListener('change', (e) => {
    pushUndoSnapshot();
    editorState.titlePos = e.target.value;
    redrawCoverPreview();
  });
  document.getElementById('zoomRange').addEventListener('input', (e) => {
    const panels = layoutPanels(editorState.layout, coverCanvas.width, coverCanvas.height);
    const panel = panels[editorState.selectedPanel];
    if (!panel) return;
    const crop = editorState.panelCrops[editorState.selectedPanel] || defaultCropForRole(panel.role, editorState.selectedPanel);
    editorState.panelCrops[editorState.selectedPanel] = { ...crop, zoom: parseFloat(e.target.value) };
    redrawCoverPreview();
  });
  document.getElementById('flipBtn').addEventListener('click', () => {
    const panels = layoutPanels(editorState.layout, coverCanvas.width, coverCanvas.height);
    const panel = panels[editorState.selectedPanel];
    if (!panel) return;
    pushUndoSnapshot();
    const crop = editorState.panelCrops[editorState.selectedPanel] || defaultCropForRole(panel.role, editorState.selectedPanel);
    editorState.panelCrops[editorState.selectedPanel] = { ...crop, flip: !crop.flip };
    redrawCoverPreview();
    setStatus(crop.flip ? 'Flip off' : 'Flipped panel horizontally');
  });
  document.getElementById('resetCropBtn').addEventListener('click', () => {
    const panels = layoutPanels(editorState.layout, coverCanvas.width, coverCanvas.height);
    const panel = panels[editorState.selectedPanel];
    if (!panel) return;
    pushUndoSnapshot();
    editorState.panelCrops[editorState.selectedPanel] = defaultCropForRole(panel.role, editorState.selectedPanel);
    redrawCoverPreview();
    setStatus('Crop reset');
  });
  document.getElementById('fillAllBtn').addEventListener('click', () => {
    if (!editorState.photos.length) return;
    pushUndoSnapshot();
    const first = 0;
    const panels = layoutPanels(editorState.layout, coverCanvas.width, coverCanvas.height);
    editorState.panelPhotos = panels.map(() => first);
    redrawCoverPreview();
    setStatus('One photo now fills every panel with different crops');
  });
  document.getElementById('undoBtn').addEventListener('click', undoEditorStep);
  document.getElementById('redoBtn').addEventListener('click', redoEditorStep);
  document.getElementById('resetBtn').addEventListener('click', resetWholeDesign);
  document.getElementById('exportSquare').addEventListener('click', exportPng1080);
  document.getElementById('exportPortrait').addEventListener('click', exportPngPortrait);
  document.getElementById('exportLandscape').addEventListener('click', exportPngLandscape);
  document.getElementById('exportAll').addEventListener('click', exportAllSizes);
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undoEditorStep(); }
    if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); redoEditorStep(); }
  });
}

export async function loadSamplePhoto(sampleName) {
  try {
    const img = await loadImageFromUrl(`samples/${sampleName}.jpg`);
    const existing = editorState.photos.findIndex((p) => p.name === `${sampleName}.jpg`);
    if (existing >= 0) {
      editorState.panelPhotos[editorState.selectedPanel] = existing;
    } else {
      editorState.photos.push({ id: photoCounter++, name: `${sampleName}.jpg`, img, url: `samples/${sampleName}.jpg` });
    }
    renderPhotoStrip();
    redrawCoverPreview();
    setStatus(`Sample ${sampleName} loaded — made with an image model for this bounty, free to use`);
  } catch (e) {
    setStatus('Sample photo failed to load');
  }
}

// Boot: build the pickers, wire the controls, then either run a fixed
// screenshot scene (?shot=…) or open the editor with the pier sample ready,
// so the first thing anyone sees is already a finished-looking poster.
buildLayoutPicker();
buildGradePicker();
buildSizePicker();
wireEditorControls();
attachCanvasCropDrag();
syncEditorControls();

const shotParams = new URLSearchParams(location.search);
if (shotParams.get('shot')) {
  document.documentElement.classList.add('shotMode');
  runShotScene(shotParams);
} else {
  loadSamplePhoto('pier').then(() => {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => redrawCoverPreview());
    redrawCoverPreview();
  });
}

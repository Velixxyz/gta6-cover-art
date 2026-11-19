// Fixed scenes for screenshots, reproducible from a URL alone.
// ?shot=cover shows the exported cover full-bleed; ?shot=editor shows the
// editor with a photo loaded. Query params pick the sample photo, caption,
// layout, grade and export size. window.__shotReady is set once the fonts
// are in and the cover has painted, so a screenshot never catches a fallback.
import { editorState, loadImageFromUrl, redrawCoverPreview, renderPhotoStrip, syncEditorControls } from './main.js';

export async function runShotScene(query) {
  const scene = query.get('shot') || 'cover';
  const photoName = query.get('photo') || 'pier';
  const caption = query.get('caption') || 'SUNSET HEIST';
  const layout = query.get('layout') || 'classicVice';
  const grade = query.get('grade') || 'viceSunset';
  const size = query.get('size') || (scene === 'portrait' ? 'portrait' : scene === 'cover' ? 'landscape' : 'landscape');
  if (scene === 'cover' || scene === 'portrait') document.body.classList.add('shotCover');
  if (scene === 'editor') document.body.classList.add('shotEditor');

  editorState.layout = layout;
  editorState.grade = grade;
  editorState.size = size;
  editorState.title = caption.toUpperCase().slice(0, 24);
  editorState.subtitle = query.get('subtitle') || 'WELCOME TO LEONIDA';
  editorState.micro = query.get('micro') || 'VICE CITY • LEONIDA';
  editorState.titlePos = query.get('titlePos') || 'bottom';

  const secondPhoto = query.get('photo2');
  try {
    const img = await loadImageFromUrl(`samples/${photoName}.jpg`);
    editorState.photos = [{ id: 0, name: `${photoName}.jpg`, img, url: `samples/${photoName}.jpg` }];
    if (secondPhoto && secondPhoto !== photoName) {
      const img2 = await loadImageFromUrl(`samples/${secondPhoto}.jpg`);
      editorState.photos.push({ id: 1, name: `${secondPhoto}.jpg`, img: img2, url: `samples/${secondPhoto}.jpg` });
    }
  } catch (e) {
    editorState.photos = [];
  }
  editorState.panelPhotos = [];
  editorState.panelCrops = [];
  renderPhotoStrip();
  syncEditorControls();
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; await document.fonts.load('16px Anton'); await document.fonts.load('600 16px Oswald'); } catch (e) { /* fall back to system sans */ }
  }
  redrawCoverPreview();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}

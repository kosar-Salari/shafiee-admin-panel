export default function makeFitCanvas(editor) {
  const dm = editor.DeviceManager;

  function parsePx(px) {
    if (!px) return null;
    const n = parseFloat(String(px).replace('px', ''));
    return Number.isFinite(n) ? n : null;
  }

  function currentDeviceWidthPx() {
    const id = dm.getSelected()?.id || editor.getDevice();
    const dev = dm.getDevices().find(d => d.id === id) || dm.getSelected();
    const width = dev?.get ? dev.get('width') : dev?.width;
    const px = parsePx(width);
    return px || 1200;
  }

  function fit() {
    const canvasEl = editor.Canvas.getElement();
    if (!canvasEl) return;

    const wrapperWidth = canvasEl.clientWidth;
    const deviceWidth = currentDeviceWidthPx();

    const safe = 48;
    const available = Math.max(0, wrapperWidth - safe);

    let zoom = available > 0 ? available / deviceWidth : 1;
    zoom = Math.min(1, Math.max(0.2, zoom));

    editor.Canvas.setZoom(zoom);
  }

  const debouncedFit = debounce(fit, 50);

  editor.on('load', debouncedFit);
  editor.on('device:select', debouncedFit);
  editor.on('canvas:resize', debouncedFit);
  window.addEventListener('resize', debouncedFit);
  editor.on('canvas:frame:loaded', debouncedFit);

  editor.on('destroy', () => {
    window.removeEventListener('resize', debouncedFit);
  });

  setTimeout(debouncedFit, 0);
}

function debounce(fn, delay = 100) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

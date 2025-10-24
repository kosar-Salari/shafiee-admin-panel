// fitCanvas.js
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
    // dev may be model or plain; handle both
    const width = dev?.get ? dev.get('width') : dev?.width;
    const px = parsePx(width);
    // اگر دسکتاپ عرض خالی داشت، یک پایه منطقی در نظر بگیر
    return px || 1200; 
  }

  function fit() {
    const canvasEl = editor.Canvas.getElement(); // div .gjs-cv-canvas
    if (!canvasEl) return;

    const wrapperWidth = canvasEl.clientWidth; // فضای موجود
    const deviceWidth = currentDeviceWidthPx();

    // حاشیه/پدینگ ایمن برای اسکرول‌نشدن
    const safe = 48;
    const available = Math.max(0, wrapperWidth - safe);

    // زوم پیشنهادی
    let zoom = available > 0 ? available / deviceWidth : 1;
    zoom = Math.min(1, Math.max(0.2, zoom)); // بین 0.2 تا 1 نگه‌دار

    editor.Canvas.setZoom(zoom);

    // برای وسط‌چین دقیق، کانواس فِلکس است؛ اینجا کافی است.
    // اگر لازم بود می‌توان فریم را اسکرول کرد:
    // canvasEl.scrollTop = 0; // از بالا شروع کند
  }

  // اجراهای اولیه و رویدادها
  const debouncedFit = debounce(fit, 50);

  editor.on('load', debouncedFit);
  editor.on('device:select', debouncedFit);
  editor.on('canvas:resize', debouncedFit); // وقتی Grapes سایز را گزارش می‌کند
  window.addEventListener('resize', debouncedFit);

  // اگر فریم‌ها لِیت لود شدند:
  editor.on('canvas:frame:loaded', debouncedFit);

  // cleanup برای وقتی ادیتور destroy می‌شود
  editor.on('destroy', () => {
    window.removeEventListener('resize', debouncedFit);
  });

  // اجرای فوری
  setTimeout(debouncedFit, 0);
}

// کمک‌تابع debounce سبک
function debounce(fn, delay = 100) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

export function savePage(slug, { html, css }) {
  const data = { slug, html, css, timestamp: new Date().toISOString() };
  localStorage.setItem(`page-${slug}`, JSON.stringify(data));
}

export function loadPage(slug) {
  const raw = localStorage.getItem(`page-${slug}`);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

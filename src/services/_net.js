// src/services/_net.js
export async function fetchJSON(url, { timeoutMs = 8000, init = {} } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(new DOMException('Timeout', 'AbortError')), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal, mode: 'cors' });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${res.statusText}${txt ? ` – ${txt.slice(0,120)}` : ''}`);
    }
    return await res.json();
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Network timeout – request took too long.');
    if (String(e).includes('Failed to fetch')) {
      throw new Error('Network error – fetch was blocked or the server is unreachable (CORS/Ad-block/VPN?).');
    }
    throw e;
  } finally {
    clearTimeout(t);
  }
}

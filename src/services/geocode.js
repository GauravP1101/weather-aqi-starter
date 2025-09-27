// src/services/geocode.js
import { fetchJSON } from './_net.js'

const CACHE_MIN = 60 * 60 * 1000 // 1 hour
const CACHE_VER = 'v2:' // bump to invalidate old cached results

export async function geocode(query) {
  const q = (query || '').trim()
  if (!q) return null

  // Parse optional country bias: "City, IN" or "City, India"
  let cityPart = q
  let countryBias = null
  const m = q.match(/^(.*?)[,\s]+([A-Za-z]{2}|[A-Za-z ]{3,})$/)
  if (m) {
    cityPart = m[1].trim()
    const tail = m[2].trim()
    countryBias = tail.length === 2 ? tail.toUpperCase() : normalizeCountryName(tail)
  }

  const key = `${CACHE_VER}geo:${cityPart.toLowerCase()}${countryBias ? ':'+countryBias : ''}`
  const cached = getCache(key)
  if (cached) return cached

  // If user typed "lat, lon"
  const coord = parseCoords(q)
  if (coord) {
    const place = { name: 'Location', admin: '', country: '', lat: coord.lat, lon: coord.lon }
    setCache(key, place)
    return place
  }

  const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
  url.searchParams.set('name', cityPart)
  url.searchParams.set('count', '10')
  url.searchParams.set('language', 'en')
  url.searchParams.set('format', 'json')

  const js = await fetchJSON(url.toString(), { timeoutMs: 8000 })
  const list = js?.results || []
  if (!list.length) return null

  const best = pickBestMatch(list, cityPart, countryBias)
  const place = {
    name: best.name,
    admin: best.admin1 || best.admin2 || '',
    country: best.country || best.country_code || '',
    lat: best.latitude,
    lon: best.longitude,
  }
  setCache(key, place)
  return place
}

// ---------- helpers ----------
function pickBestMatch(list, cityPart, countryBias) {
  const nameLc = cityPart.toLowerCase()
  const bias2 = countryBias && countryBias.length === 2 ? countryBias.toUpperCase() : null
  const biasName = countryBias && countryBias.length > 2 ? countryBias.toLowerCase() : null

  let best = null, bestScore = -Infinity
  for (const r of list) {
    const rName = (r.name || '').toLowerCase()
    const rAlt = (r.alternative_names || []).map(s => (s || '').toLowerCase())
    const rCountry = (r.country_code || r.country || '').toString().toUpperCase()
    const rCountryName = (r.country || '').toLowerCase()
    const pop = Number.isFinite(r.population) ? r.population : 0
    const feat = (r.feature_code || '').toUpperCase() // e.g., PPLC (capital), PPLA (admin)

    let score = 0
    if (rName === nameLc || rAlt.includes(nameLc)) score += 50
    if (bias2 && rCountry === bias2) score += 40
    if (biasName && rCountryName.includes(biasName)) score += 30
    if (/^PPL[AC]$/.test(feat)) score += 20
    score += Math.log10(pop + 1) * 5
    score += -levenshtein(rName, nameLc) * 0.5

    if (score > bestScore) { bestScore = score; best = r }
  }
  return best || list[0]
}

function normalizeCountryName(name) {
  const n = name.toLowerCase().trim()
  if (n === 'india') return 'IN'
  if (n === 'united states' || n === 'usa' || n === 'us') return 'US'
  if (n === 'united kingdom' || n === 'uk') return 'GB'
  return name.toUpperCase()
}

function parseCoords(q) {
  const m = q.match(/^\s*([-+]?\d+(\.\d+)?)\s*,\s*([-+]?\d+(\.\d+)?)\s*$/)
  if (!m) return null
  const lat = parseFloat(m[1]), lon = parseFloat(m[3])
  if (isFinite(lat) && isFinite(lon)) return { lat, lon }
  return null
}

function levenshtein(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  }
  return dp[m][n]
}

function getCache(k) {
  try {
    const raw = localStorage.getItem(k)
    if (!raw) return null
    const { t, v } = JSON.parse(raw)
    if (Date.now() - t > CACHE_MIN) return null
    return v
  } catch { return null }
}
function setCache(k, v) {
  try { localStorage.setItem(k, JSON.stringify({ t: Date.now(), v })) } catch {}
}

// src/services/aqi.js
import { fetchJSON } from './_net.js'

const CACHE_MIN = 15 * 60 * 1000 // 15 minutes

export async function getAQI(lat, lon) {
  const key = `aqi:${lat.toFixed(2)},${lon.toFixed(2)}`
  const cached = getCache(key)
  if (cached) return cached

  // Try OpenAQ (measured)
  const openaqUrl = new URL('https://api.openaq.org/v2/latest')
  openaqUrl.searchParams.set('coordinates', `${lat},${lon}`)
  openaqUrl.searchParams.set('radius', '10000')
  openaqUrl.searchParams.set('limit', '100')
  openaqUrl.searchParams.set('parameter', 'pm25,pm10,co,no2,so2,o3')

  try {
    const js = await fetchJSON(openaqUrl.toString(), { timeoutMs: 8000 })
    const result = aggregateOpenAQ(js)
    setCache(key, result)
    return result
  } catch (e) {
    console.warn('OpenAQ failed, falling back to Open-Meteo Air Quality:', e.message)
  }

  // Fallback: Open-Meteo (modeled)
  const omUrl = new URL('https://air-quality-api.open-meteo.com/v1/air-quality')
  omUrl.searchParams.set('latitude', lat)
  omUrl.searchParams.set('longitude', lon)
  omUrl.searchParams.set('hourly', 'pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone')
  omUrl.searchParams.set('timezone', 'auto')

  const js2 = await fetchJSON(omUrl.toString(), { timeoutMs: 8000 })
  const result = mapOpenMeteoAQ(js2)
  setCache(key, result)
  return result
}

function aggregateOpenAQ(js) {
  const items = js?.results ?? []
  const stationCount = items.length
  const sums = {}, counts = {}, units = {}, sourcesSet = new Set()

  for (const it of items) {
    if (Array.isArray(it?.measurements)) {
      for (const m of it.measurements) {
        const p = (m.parameter || '').toLowerCase()
        if (!p) continue
        const val = Number(m.value)
        if (!Number.isFinite(val)) continue
        sums[p] = (sums[p] || 0) + val
        counts[p] = (counts[p] || 0) + 1
        const u = (m.unit || '').trim()
        units[p] = units[p] || u
      }
    }
    if (it?.sourceName) sourcesSet.add(it.sourceName)
    if (Array.isArray(it?.sources)) for (const s of it.sources) sourcesSet.add(s)
  }

  const parameters = {}
  for (const [p, total] of Object.entries(sums)) {
    parameters[p] = { value: +(total / (counts[p] || 1)).toFixed(1), unit: units[p] || 'μg/m³' }
  }

  return { stationCount, parameters, sources: Array.from(sourcesSet).slice(0, 10), sourceType: 'OpenAQ' }
}

function mapOpenMeteoAQ(js) {
  const last = (arr) => (Array.isArray(arr) && arr.length ? arr[arr.length - 1] : null)
  const h = js?.hourly || {}
  const parameters = {}
  if (h.pm2_5) parameters.pm25 = { value: +(+last(h.pm2_5)).toFixed(1), unit: 'μg/m³' }
  if (h.pm10)  parameters.pm10 = { value: +(+last(h.pm10)).toFixed(1), unit: 'μg/m³' }
  if (h.carbon_monoxide) parameters.co = { value: +(+last(h.carbon_monoxide)).toFixed(1), unit: 'μg/m³' }
  if (h.nitrogen_dioxide) parameters.no2 = { value: +(+last(h.nitrogen_dioxide)).toFixed(1), unit: 'μg/m³' }
  if (h.sulphur_dioxide)  parameters.so2 = { value: +(+last(h.sulphur_dioxide)).toFixed(1), unit: 'μg/m³' }
  if (h.ozone)  parameters.o3 = { value: +(+last(h.ozone)).toFixed(1), unit: 'μg/m³' }

  return { stationCount: null, parameters, sources: ['Open-Meteo Air Quality'], sourceType: 'Open-Meteo' }
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

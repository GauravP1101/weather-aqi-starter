// src/services/weather.js
import { fetchJSON } from './_net.js'

const CACHE_MIN = 10 * 60 * 1000 // 10 minutes

export async function getWeather(lat, lon) {
  const key = `wx:${lat.toFixed(2)},${lon.toFixed(2)}`
  const cached = getCache(key)
  if (cached) return cached

  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', lat)
  url.searchParams.set('longitude', lon)
  url.searchParams.set('hourly', 'temperature_2m')
  url.searchParams.set('daily', 'uv_index_max')
  url.searchParams.set('current', 'temperature_2m,apparent_temperature,relative_humidity_2m,surface_pressure,wind_speed_10m,weather_code')
  url.searchParams.set('timezone', 'auto')

  const js = await fetchJSON(url.toString(), { timeoutMs: 8000 })

  const codeMap = {
    0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Depositing rime fog', 51: 'Drizzle', 61: 'Rain',
    71: 'Snow', 80: 'Rain showers', 95: 'Thunderstorm'
  }
  if (js?.current?.weather_code != null) {
    js.current.weathercode_text = codeMap[js.current.weather_code] || '—'
  }

  setCache(key, js)
  return js
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

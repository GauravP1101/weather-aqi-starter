# Weather + AQI Dashboard

_End-to-end, keyless dashboard for current weather, 5-day outlook, 24h temps, and nearby air quality._

<!-- Tech badges -->
<p>
  <a href="https://react.dev/">
    <img alt="React" src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
  </a>
  <a href="https://vitejs.dev/">
    <img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=fff">
  </a>
  <a href="https://recharts.org/">
    <img alt="Recharts" src="https://img.shields.io/badge/Recharts-1E293B?style=for-the-badge&labelColor=0B1220&color=38BDF8">
  </a>
  <a href="https://open-meteo.com/">
    <img alt="Open-Meteo API" src="https://img.shields.io/badge/Open--Meteo-API-0EA5E9?style=for-the-badge">
  </a>
  <a href="https://openaq.org/">
    <img alt="OpenAQ API" src="https://img.shields.io/badge/OpenAQ-API-10B981?style=for-the-badge">
  </a>
  <a href="https://pages.github.com/">
    <img alt="GitHub Pages" src="https://img.shields.io/badge/GitHub%20Pages-181717?style=for-the-badge&logo=github&logoColor=fff">
  </a>
</p>

---

## Features
- City search (Open-Meteo Geocoding)
- Current weather + **5-day** highs/lows
- **Next-24h** temperature line chart (Recharts)
- Nearby air-quality averages: PM2.5, PM10, CO, NO₂, SO₂, O₃ (OpenAQ)
- LocalStorage caching • Responsive dark UI • No API keys

## Quick Start
```bash
npm install
npm run dev
```
Build & Preview
```bash
npm run build
npm run preview
```
APIs (no keys)

- Geocoding: `https://geocoding-api.open-meteo.com/v1/search?name=Boston&count=5`
- Forecast: `https://api.open-meteo.com/v1/forecast?latitude=..&longitude=..&current_weather=true&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
- Air Quality: `https://api.openaq.org/v2/latest?coordinates=lat,lon&radius=15000&limit=50`

(Notes): OpenAQ may return no stations for some cities—try a larger radius or a nearby city.

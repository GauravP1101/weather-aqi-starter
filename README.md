# Weather + AQI Dashboard (Free APIs)

Live (after deploy): `https://<your-username>.github.io/weather-aqi`

## Stack
- React (Vite)
- Recharts
- Open-Meteo (weather + geocoding, no key)
- OpenAQ (air quality, no key)
- GitHub Pages (free hosting)

## Features
- City search via Open‑Meteo Geocoding
- Current weather + 5‑day highs/lows
- Next‑24h temperature line chart
- Nearby air‑quality averages (PM2.5, PM10, CO, NO2, SO2, O3)
- Caching with localStorage (reduce API calls)
- Responsive, dark UI

## Getting Started
```bash
npm install
npm run dev
```

## Deploy to GitHub Pages
1. Create a GitHub repository named `weather-aqi` and push this project.
2. In `package.json`, optionally set a homepage (not required for GH Pages with custom base).
3. Deploy:
```bash
npm run deploy
```
4. In GitHub repo settings → Pages, ensure it serves from `gh-pages` branch.

## Notes
- APIs are public/free; be courteous with request frequency.
- If OpenAQ returns no stations nearby, try a larger radius or another city.

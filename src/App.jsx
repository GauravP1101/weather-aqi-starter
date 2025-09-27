import React, { useEffect, useMemo, useState } from 'react'
import SearchBar from './components/SearchBar.jsx'
import WeatherCard from './components/WeatherCard.jsx'
import AQICard from './components/AQICard.jsx'
import TempChart from './components/TempChart.jsx'
import { geocode } from './services/geocode.js'
import { getWeather } from './services/weather.js'
import { getAQI } from './services/aqi.js'

const DEFAULT_CITY = 'New York'

export default function App(){
  const [query, setQuery] = useState('')
  const [place, setPlace] = useState(null)
  const [weather, setWeather] = useState(null)
  const [aqi, setAqi] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

  function showToast(msg){
    setToast(msg)
    setTimeout(()=>setToast(''), 2200)
  }

  async function search(){
    const q = query.trim() || DEFAULT_CITY
    setLoading(true)
    setWeather(null)
    setAqi(null)
    try{
      const p = await geocode(q)
      if(!p){
        showToast('Place not found')
        return
      }
      setPlace(p)

      const [w, a] = await Promise.all([
        getWeather(p.lat, p.lon),
        getAQI(p.lat, p.lon),
      ])
      setWeather(w)
      setAqi(a)
      showToast(`Showing data for ${p.name}${p.admin?`, ${p.admin}`:''}`)
    }catch(e){
      console.error(e)
      const msg = e?.message ? String(e.message) : 'Something went wrong.'
      showToast(msg.slice(0, 140))
    }finally{
      setLoading(false)
    }
  }

  // Load a default city on first mount
  useEffect(()=>{ if(!place && !weather) search() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const hourlyData = useMemo(()=>{
    if(!weather?.hourly?.time || !weather?.hourly?.temperature_2m) return []
    return weather.hourly.time
      .map((iso, i)=>({
        t: new Date(iso).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
        temp: weather.hourly.temperature_2m[i]
      }))
      .slice(0, 24)
  }, [weather])

  return (
    <div className="container">
      <header className="header">
        <div className="title">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 13a6 6 0 1112 0 7 7 0 01-7 7h-2" stroke="url(#g)" strokeWidth="1.8" strokeLinecap="round" />
            <defs>
              <linearGradient id="g" x1="0" x2="24" y1="0" y2="24">
                <stop stopColor="#60a5fa"/><stop offset="1" stopColor="#a78bfa"/>
              </linearGradient>
            </defs>
          </svg>
          <span>Weather + AQI</span>
          <span className="badge">React · Vite</span>
        </div>
        <div className="controls">
          <button className="btn" onClick={search}>{loading ? 'Loading…' : 'Refresh'}</button>
          <a className="btn" href="https://open-meteo.com/" target="_blank" rel="noreferrer">APIs</a>
        </div>
      </header>

      <SearchBar
        query={query}
        onChange={setQuery}
        onSubmit={search}
        searching={loading}
      />

      <div className="grid" style={{marginTop:16}}>
        <WeatherCard place={place} weather={weather} loading={loading} />
        {/* Pass place so AQI switches to India NAQI when country === 'IN' */}
        <AQICard aqi={aqi} loading={loading} place={place} />
      </div>

      <section style={{marginTop:16}}>
        <TempChart data={hourlyData} />
      </section>

      <p className="footer">
        Data: <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> ·
        &nbsp;<a href="https://openaq.org/" target="_blank" rel="noreferrer">OpenAQ</a> · Built with React (Vite) · Deploy on GitHub Pages
      </p>

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}

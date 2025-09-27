import React from 'react'

function Stat({k, v}){
  return (
    <div className="item">
      <div className="k">{k}</div>
      <div className="v">{v}</div>
    </div>
  )
}

export default function WeatherCard({place, weather, loading}){
  return (
    <div className="card">
      <div className="spread" style={{marginBottom:8}}>
        <h2>Weather</h2>
        {place && <div className="subtle">{place.name}{place.admin ? `, ${place.admin}`:''} · {place.country}</div>}
      </div>

      {!weather && loading && <div className="skeleton" style={{height:120}} />}
      {!weather && !loading && <p className="subtle">No weather data yet. Try searching a city.</p>}
      {weather && (
        <div className="row" style={{alignItems:'stretch'}}>
          <div style={{minWidth:220, flex:'0 0 auto'}}>
            <div className="bigtemp">{Math.round(weather.current.temperature_2m)}°</div>
            <div className="chips" style={{marginTop:8}}>
              <span className="chip">Feels {Math.round(weather.current.apparent_temperature)}°</span>
              <span className="chip">{weather.current.weathercode_text || '—'}</span>
            </div>
          </div>

          <div className="kv" style={{flex:1}}>
            <Stat k="Wind" v={`${Math.round(weather.current.wind_speed_10m)} km/h`} />
            <Stat k="Humidity" v={`${weather.current.relative_humidity_2m}%`} />
            <Stat k="Pressure" v={`${weather.current.surface_pressure} hPa`} />
            <Stat k="UV Index" v={weather.daily?.uv_index_max?.[0] ?? '—'} />
          </div>
        </div>
      )}
    </div>
  )
}

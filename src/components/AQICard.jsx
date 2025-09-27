import React from 'react'

/** ---------- US EPA (default) PM breakpoints (μg/m³) ---------- */
const US_PM25 = [
  [0.0,12.0,  0,50,'Good','good'],
  [12.1,35.4, 51,100,'Moderate','moderate'],
  [35.5,55.4, 101,150,'Unhealthy (SG)','unhealthy'],
  [55.5,150.4,151,200,'Unhealthy','unhealthy'],
  [150.5,250.4,201,300,'Very Unhealthy','vunhealthy'],
  [250.5,500.4,301,500,'Hazardous','hazard'],
]
const US_PM10 = [
  [0,54,   0,50,'Good','good'],
  [55,154, 51,100,'Moderate','moderate'],
  [155,254,101,150,'Unhealthy (SG)','unhealthy'],
  [255,354,151,200,'Unhealthy','unhealthy'],
  [355,424,201,300,'Very Unhealthy','vunhealthy'],
  [425,604,301,500,'Hazardous','hazard'],
]

/** ---------- India CPCB/NAQI breakpoints ---------- */
const IN_PM25 = [
  [0,30,    0,50,'Good','good'],
  [31,60,   51,100,'Satisfactory','moderate'],
  [61,90,   101,200,'Moderately Polluted','unhealthy'],
  [91,120,  201,300,'Poor','unhealthy'],
  [121,250, 301,400,'Very Poor','vunhealthy'],
  [251,500, 401,500,'Severe','hazard'],
]
const IN_PM10 = [
  [0,50,    0,50,'Good','good'],
  [51,100,  51,100,'Satisfactory','moderate'],
  [101,250, 101,200,'Moderately Polluted','unhealthy'],
  [251,350, 201,300,'Poor','unhealthy'],
  [351,430, 301,400,'Very Poor','vunhealthy'],
  [431,600, 401,500,'Severe','hazard'],
]
const IN_NO2 = [
  [0,40,    0,50,'Good','good'],
  [41,80,   51,100,'Satisfactory','moderate'],
  [81,180,  101,200,'Moderately Polluted','unhealthy'],
  [181,280, 201,300,'Poor','unhealthy'],
  [281,400, 301,400,'Very Poor','vunhealthy'],
  [401,1000,401,500,'Severe','hazard'],
]
const IN_SO2 = [
  [0,40,     0,50,'Good','good'],
  [41,80,    51,100,'Satisfactory','moderate'],
  [81,380,   101,200,'Moderately Polluted','unhealthy'],
  [381,800,  201,300,'Poor','unhealthy'],
  [801,1600, 301,400,'Very Poor','vunhealthy'],
  [1601,3000,401,500,'Severe','hazard'],
]
const IN_O3 = [
  [0,50,    0,50,'Good','good'],
  [51,100,  51,100,'Satisfactory','moderate'],
  [101,168, 101,200,'Moderately Polluted','unhealthy'],
  [169,208, 201,300,'Poor','unhealthy'],
  [209,748, 301,400,'Very Poor','vunhealthy'],
  [749,1200,401,500,'Severe','hazard'],
]
const IN_CO_mg = [
  [0,1,     0,50,'Good','good'],
  [1.1,2,   51,100,'Satisfactory','moderate'],
  [2.1,10,  101,200,'Moderately Polluted','unhealthy'],
  [10.1,17, 201,300,'Poor','unhealthy'],
  [17.1,34, 301,400,'Very Poor','vunhealthy'],
  [34.1,60, 401,500,'Severe','hazard'],
]

function interp(value, table) {
  if (value == null) return null
  for (const [Clow, Chigh, Ilow, Ihigh, label, cls] of table) {
    if (value >= Clow && value <= Chigh) {
      const I = (Ihigh - Ilow) / (Chigh - Clow) * (value - Clow) + Ilow
      return { aqi: Math.round(I), label, cls }
    }
  }
  const last = table[table.length - 1]
  if (value > last[1]) return { aqi: last[3], label: last[4], cls: last[5] }
  return null
}
function pickMaxAQI(parts) {
  const valid = parts.filter(Boolean)
  if (!valid.length) return null
  return valid.reduce((a, b) => (a.aqi >= b.aqi ? a : b))
}
function toMgPerM3(value, unit) {
  if (value == null) return null
  if (!unit) return value
  const u = unit.toLowerCase()
  if (u.includes('mg/m')) return value
  if (u.includes('µg/m') || u.includes('ug/m')) return value / 1000
  return value
}

export default function AQICard({ aqi, loading, place }) {
  const pm25 = aqi?.parameters?.pm25?.value ?? null
  const pm25u = aqi?.parameters?.pm25?.unit || 'μg/m³'
  const pm10 = aqi?.parameters?.pm10?.value ?? null
  const pm10u = aqi?.parameters?.pm10?.unit || 'μg/m³'
  const no2  = aqi?.parameters?.no2?.value  ?? null
  const no2u = aqi?.parameters?.no2?.unit || 'μg/m³'
  const so2  = aqi?.parameters?.so2?.value  ?? null
  const so2u = aqi?.parameters?.so2?.unit || 'μg/m³'
  const o3   = aqi?.parameters?.o3?.value   ?? null
  const o3u  = aqi?.parameters?.o3?.unit || 'μg/m³'
  const co   = aqi?.parameters?.co?.value   ?? null
  const cou  = aqi?.parameters?.co?.unit || 'μg/m³'

  const isIN = (place?.country || '').toUpperCase() === 'IN'

  let pm25AQI, pm10AQI, no2AQI, so2AQI, o3AQI, coAQI
  if (isIN) {
    pm25AQI = interp(pm25, IN_PM25)
    pm10AQI = interp(pm10, IN_PM10)
    no2AQI  = interp(no2, IN_NO2)
    so2AQI  = interp(so2, IN_SO2)
    o3AQI   = interp(o3,  IN_O3)
    coAQI   = interp(toMgPerM3(co, cou), IN_CO_mg) // NAQI expects mg/m³
  } else {
    pm25AQI = interp(pm25, US_PM25)
    pm10AQI = interp(pm10, US_PM10)
    // (optional) add US gas breakpoints if desired
  }

  const overall = pickMaxAQI([
    pm25AQI, pm10AQI,
    isIN ? no2AQI : null,
    isIN ? so2AQI : null,
    isIN ? o3AQI  : null,
    isIN ? coAQI  : null
  ])

  return (
    <div className="card">
      <div className="spread" style={{marginBottom:8}}>
        <h2>Air Quality</h2>
        <div className="aqiScale subtle">
          <span className="dot good" /> {isIN ? 'Good' : 'Good'}
          <span className="dot moderate" /> {isIN ? 'Satisfactory' : 'Moderate'}
          <span className="dot unhealthy" /> {isIN ? 'Moderately/Poor' : 'Unhealthy'}
          <span className="dot vunhealthy" /> {isIN ? 'Very Poor' : 'Very Unhealthy'}
          <span className="dot hazard" /> {isIN ? 'Severe' : 'Hazardous'}
        </div>
      </div>

      {!aqi && loading && <div className="skeleton" style={{height:110}} />}
      {!aqi && !loading && <p className="subtle">No AQ data found near this location.</p>}

      {aqi && (
        <>
          <div className="overallAQI">
            <span className={`dot ${overall?.cls || ''}`} />
            <span className="overallNum">{overall ? `AQI ${overall.aqi}` : 'AQI —'}</span>
            <span className="overallLabel">{overall ? overall.label : 'Unknown'}</span>
            <span className="subtle" style={{marginLeft:8}}>({aqi.sourceType})</span>
          </div>

          <div className="aqiGrid">
            <div className="stat"><div className="k">Stations</div><div className="v">{aqi.stationCount ?? '—'}</div></div>

            <div className="stat">
              <div className="k">PM2.5</div><div className="v">{pm25 != null ? `${pm25} ${pm25u}` : '—'}</div>
              {pm25AQI && <div className={`tag ${pm25AQI.cls}`}>AQI {pm25AQI.aqi}</div>}
            </div>

            <div className="stat">
              <div className="k">PM10</div><div className="v">{pm10 != null ? `${pm10} ${pm10u}` : '—'}</div>
              {pm10AQI && <div className={`tag ${pm10AQI.cls}`}>AQI {pm10AQI.aqi}</div>}
            </div>

            <div className="stat"><div className="k">NO₂</div><div className="v">{no2 != null ? `${no2} ${no2u}` : '—'}</div>{isIN && no2AQI && <div className={`tag ${no2AQI.cls}`}>AQI {no2AQI.aqi}</div>}</div>
            <div className="stat"><div className="k">SO₂</div><div className="v">{so2 != null ? `${so2} ${so2u}` : '—'}</div>{isIN && so2AQI && <div className={`tag ${so2AQI.cls}`}>AQI {so2AQI.aqi}</div>}</div>
            <div className="stat"><div className="k">O₃</div><div className="v">{o3 != null ? `${o3} ${o3u}` : '—'}</div>{isIN && o3AQI && <div className={`tag ${o3AQI.cls}`}>AQI {o3AQI.aqi}</div>}</div>
            <div className="stat"><div className="k">CO</div><div className="v">{co != null ? `${co} ${cou}` : '—'}</div>{isIN && coAQI && <div className={`tag ${coAQI.cls}`}>AQI {coAQI.aqi}</div>}</div>
          </div>

          {(aqi.sources?.length) ? (
            <div style={{marginTop:10}}>
              <div className="section-title">Sources</div>
              <ul className="subtle" style={{marginTop:6, marginBottom:0}}>
                {aqi.sources.slice(0,6).map((s, i)=><li key={i}>{s}</li>)}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}

import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function TempChart({data}){
  return (
    <div>
      <h2 style={{marginBottom:8}}>24-hour Temperature</h2>
      <div className="card" style={{padding:0}}>
        <div style={{height:260, padding:12}}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data ?? []} margin={{left:12,right:24, top:10}}>
              <CartesianGrid strokeOpacity={0.15} />
              <XAxis dataKey="t" tick={{fontSize:12}} />
              <YAxis unit="°" tick={{fontSize:12}} />
              <Tooltip cursor={{strokeOpacity:.25}} contentStyle={{background:'#0b1220', border:'1px solid rgba(255,255,255,.1)', borderRadius:10}} />
              <Line type="monotone" dataKey="temp" dot={false} strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

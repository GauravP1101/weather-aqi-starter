import React, { useRef } from 'react'

export default function SearchBar({query, onChange, onSubmit, searching}) {
  const inputRef = useRef(null)

  function handleKey(e){
    if(e.key === 'Enter') onSubmit?.()
  }
  function clear(){
    onChange?.('')
    inputRef.current?.focus()
  }

  return (
    <div className="search" role="search">
      <input
        ref={inputRef}
        list="city-suggestions"
        value={query}
        onChange={e=>onChange?.(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Search city or coordinates… (e.g., Boston / 48.85, 2.35)"
        aria-label="Search city or coordinates"
      />
      <datalist id="city-suggestions">
        <option>New York</option><option>San Francisco</option><option>London</option><option>Paris</option>
        <option>Tokyo</option><option>Delhi</option><option>Mumbai</option><option>Berlin</option>
      </datalist>
      {query && (
        <button className="btn iconbtn" onClick={clear} title="Clear">
          ×
        </button>
      )}
      <button className="btn" onClick={onSubmit} disabled={searching}>
        {searching ? 'Searching…' : 'Search'}
      </button>
    </div>
  )
}

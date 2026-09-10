import { useEffect, useRef, useState } from 'react'

export default function CollegeLogoMarquee({ colleges, direction = 'left', speed = 40 }) {
  const trackRef = useRef(null)
  const [paused, setPaused] = useState(false)
  const [boost, setBoost] = useState(1) // speed multiplier for mouse velocity

  // Mouse velocity → speed boost
  useEffect(() => {
    const el = trackRef.current?.parentElement
    if (!el) return
    let lastX = 0, lastT = performance.now()
    const onMove = (e) => {
      const t = performance.now()
      const dt = Math.max(t - lastT, 1)
      const vx = Math.abs(e.clientX - lastX) / dt
      lastX = e.clientX
      lastT = t
      const target = Math.min(1 + vx * 8, 3)
      setBoost((b) => b + (target - b) * 0.15)
    }
    const decay = setInterval(() => setBoost((b) => b + (1 - b) * 0.06), 60)
    el.addEventListener('mousemove', onMove)
    return () => {
      el.removeEventListener('mousemove', onMove)
      clearInterval(decay)
    }
  }, [])

  const duration = (speed / boost) * (paused ? 4 : 1) // slow to ~25% on hover

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[var(--card)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[var(--card)] to-transparent" />
      <div
        ref={trackRef}
        className="flex w-max items-center gap-4"
        style={{
          animation: `${direction === 'left' ? 'marquee' : 'marqueeReverse'} ${duration}s linear infinite`,
        }}
      >
        {[...colleges, ...colleges].map((c, i) => (
          <div
            key={`${direction}-${i}`}
            className="group relative flex h-24 w-40 shrink-0 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4 transition-all duration-300 hover:border-[#00C271]/50 hover:scale-105 hover:shadow-[0_10px_30px_-10px_rgba(0,194,113,0.4)]"
          >
            <img
              src={`/colleges/${c.file}`}
              alt={c.name}
              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block' }}
              className="max-h-14 max-w-full object-contain grayscale opacity-70 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100"
            />
            <span className="hidden text-center text-xs font-semibold text-[var(--ink)]">{c.name}</span>

            {/* Tooltip */}
            <span className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-full bg-[#0B1220] px-3 py-1 text-[10px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100">
              {c.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
import { useState, useRef } from 'react'
import { Play } from 'lucide-react'

/**
 * FoundersVideo — cinematic background video placeholder
 * Replace `src` prop with real founders video URL later.
 */
export default function FoundersVideo({ src = '' }) {
  const [hovered, setHovered] = useState(false)
  const videoRef = useRef(null)

  const handleEnter = () => {
    setHovered(true)
    if (videoRef.current) videoRef.current.play().catch(() => {})
  }

  const handleLeave = () => {
    setHovered(false)
    if (videoRef.current) videoRef.current.pause()
  }

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={`group relative aspect-video overflow-hidden rounded-2xl border cursor-pointer ${
        hovered ? 'founders-hover border-[#00C271]/40' : 'founders-idle border-white/5'
      }`}
    >
      {/* Video or animated gradient fallback */}
      {src ? (
        <video
          ref={videoRef}
          src={src}
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1220] via-[#00C271]/20 to-[#0B1220]">
          <div className="absolute -inset-8 opacity-60 blur-3xl">
            <div className="absolute left-1/4 top-1/4 h-32 w-32 rounded-full bg-[#00C271]/50 animate-pulse" />
            <div className="absolute right-1/4 bottom-1/4 h-32 w-32 rounded-full bg-white/10 animate-pulse [animation-delay:1s]" />
          </div>
        </div>
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Idle micro label (top left) */}
      <div className={`absolute left-4 top-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-white/80 transition-opacity duration-500 ${hovered ? 'opacity-0' : 'opacity-100'}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-[#00C271] live-pulse" />
        Founders
      </div>

      {/* Content — visible on hover */}
      <div className={`absolute inset-0 flex flex-col justify-end p-5 sm:p-6 transition-opacity duration-500 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
        <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] font-semibold text-white/90">
          Founders
        </div>
        <h3 className="text-xl font-semibold text-white sm:text-2xl">Meet the Founders</h3>
        <p className="mt-1 text-xs text-white/70 sm:text-sm">Why we built NGG</p>
      </div>

      {/* Play button */}
      <div className={`absolute right-4 bottom-4 sm:right-5 sm:bottom-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 transition-all duration-500 ${hovered ? 'opacity-100 scale-100 bg-[#00C271] border-[#00C271]' : 'opacity-40 scale-90'}`}>
        <Play className="h-4 w-4 fill-white text-white" />
      </div>
    </div>
  )
}
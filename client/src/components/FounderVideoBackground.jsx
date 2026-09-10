import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, X } from 'lucide-react'

/**
 * Integrated hero background video.
 * Idle: blended into hero. Active on mouse proximity.
 * Click: opens fullscreen modal.
 */
export default function FounderVideoBackground({ src = '', poster = '' }) {
  const hostRef = useRef(null)
  const videoRef = useRef(null)
  const modalVideoRef = useRef(null)
  const [active, setActive] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  // Mouse proximity
  useEffect(() => {
    const el = hostRef.current
    if (!el) return
    const isTouch = 'ontouchstart' in window
    if (isTouch) return

    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy)
      const threshold = Math.max(rect.width, rect.height) * 0.7
      setActive(dist < threshold)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // Modal esc + scroll lock
  useEffect(() => {
    if (!modalOpen) return
    document.body.classList.add('modal-open')
    const onKey = (e) => e.key === 'Escape' && setModalOpen(false)
    window.addEventListener('keydown', onKey)
    // play in modal
    setTimeout(() => modalVideoRef.current?.play().catch(() => {}), 100)
    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', onKey)
    }
  }, [modalOpen])

  return (
    <>
      {/* Ambient background — blended into hero */}
      <div
        ref={hostRef}
        onClick={() => setModalOpen(true)}
        className="pointer-events-auto absolute inset-0 cursor-pointer"
        aria-label="Meet the founders"
      >
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            opacity: active ? 0.55 : 0.12,
            filter: active ? 'blur(0px) saturate(1)' : 'blur(10px) saturate(0.6)',
            transform: active ? 'scale(1.03)' : 'scale(1)',
            transition: 'opacity 600ms cubic-bezier(0.16,1,0.3,1), filter 600ms, transform 600ms',
          }}
        >
          {src ? (
            <video
              ref={videoRef}
              src={src}
              poster={poster}
              autoPlay muted loop playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            /* placeholder — animated gradient acting as video */
            <div className="relative h-full w-full">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0B1220] via-[#00C271]/25 to-[#0B1220]" />
              <div className="absolute -inset-16 opacity-60 blur-3xl">
                <div className="absolute left-[15%] top-[20%] h-64 w-64 rounded-full bg-[#00C271]/40 animate-pulse" />
                <div className="absolute right-[10%] bottom-[15%] h-72 w-72 rounded-full bg-white/8 animate-pulse [animation-delay:1.2s]" />
                <div className="absolute left-[50%] top-[60%] h-48 w-48 rounded-full bg-[#00C271]/30 animate-pulse [animation-delay:2s]" />
              </div>
            </div>
          )}
          {/* Dark scrim so hero content stays legible */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/70 to-[var(--bg)]/40" />
        </div>

        {/* Discovery UI — bottom-right of hero region */}
        <div
          className="pointer-events-none absolute bottom-8 right-6 hidden lg:flex items-center gap-3 transition-opacity duration-500"
          style={{ opacity: active ? 1 : 0.35 }}
        >
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[var(--muted)]">Founders</div>
            <div
              className="mt-0.5 text-sm font-semibold text-[var(--ink)] transition-opacity duration-500"
              style={{ opacity: active ? 1 : 0 }}
            >
              Meet the Founders
            </div>
            <div
              className="text-xs text-[var(--muted)] transition-opacity duration-500"
              style={{ opacity: active ? 1 : 0 }}
            >
              Why we built NGG
            </div>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-500 ${
            active
              ? 'border-[#00C271] bg-[#00C271] shadow-[0_10px_30px_-5px_rgba(0,194,113,0.5)]'
              : 'border-[var(--line)] bg-[var(--card)]/80 backdrop-blur-sm'
          }`}>
            <Play className={`h-4 w-4 fill-current ${active ? 'text-white' : 'text-[var(--ink)]'}`} />
          </div>
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#0B1220]"
            >
              <button
                onClick={() => setModalOpen(false)}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white transition hover:bg-white/20"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="aspect-video">
                {src ? (
                  <video
                    ref={modalVideoRef}
                    src={src}
                    controls
                    autoPlay
                    playsInline
                    className="h-full w-full"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#0B1220] via-[#00C271]/20 to-[#0B1220] text-white">
                    <div className="text-xs uppercase tracking-[0.3em] text-[#00C271]">Founders</div>
                    <div className="text-3xl font-semibold sm:text-5xl">Meet the Founders</div>
                    <div className="text-white/60">Why we built NGG · video coming soon</div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
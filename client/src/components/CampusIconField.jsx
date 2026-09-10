import { useEffect, useRef, useState } from 'react'
import {
  GraduationCap, MapPin, Users, Smartphone, Camera, MessageCircle,
  Building2, Target, Zap, Share2, BarChart3, IdCard,
  Megaphone, Star, QrCode, Calendar, Network, TrendingUp,
} from 'lucide-react'

/**
 * Ecosystem icons floating in the background.
 * Mouse-reactive with distance-based parallax.
 */
const ICONS = [
  { Icon: GraduationCap, x: 8,  y: 15, size: 22, depth: 0.6, base: 0.10 },
  { Icon: MapPin,        x: 92, y: 12, size: 18, depth: 1.2, base: 0.09 },
  { Icon: Users,         x: 78, y: 22, size: 20, depth: 0.9, base: 0.10 },
  { Icon: Smartphone,    x: 15, y: 42, size: 18, depth: 1.4, base: 0.08 },
  { Icon: Camera,        x: 88, y: 40, size: 22, depth: 0.7, base: 0.10 },
  { Icon: MessageCircle, x: 22, y: 68, size: 18, depth: 1.1, base: 0.09 },
  { Icon: Building2,     x: 6,  y: 80, size: 24, depth: 0.5, base: 0.11 },
  { Icon: Target,        x: 82, y: 78, size: 20, depth: 1.3, base: 0.10 },
  { Icon: Zap,           x: 40, y: 8,  size: 16, depth: 1.6, base: 0.08 },
  { Icon: Share2,        x: 62, y: 88, size: 18, depth: 1.0, base: 0.09 },
  { Icon: BarChart3,     x: 96, y: 62, size: 20, depth: 0.8, base: 0.10 },
  { Icon: IdCard,        x: 30, y: 32, size: 18, depth: 1.5, base: 0.08 },
  { Icon: Megaphone,     x: 55, y: 72, size: 20, depth: 0.9, base: 0.10 },
  { Icon: Star,          x: 70, y: 6,  size: 16, depth: 1.4, base: 0.09 },
  { Icon: QrCode,        x: 12, y: 58, size: 20, depth: 1.1, base: 0.10 },
  { Icon: Calendar,      x: 48, y: 92, size: 18, depth: 0.7, base: 0.09 },
  { Icon: Network,       x: 34, y: 55, size: 22, depth: 1.2, base: 0.10 },
  { Icon: TrendingUp,    x: 90, y: 92, size: 18, depth: 1.0, base: 0.09 },
]

export default function CampusIconField() {
  const ref = useRef(null)
  const [mouse, setMouse] = useState({ x: -9999, y: -9999, active: false })
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mm = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mm.matches)
    const isTouch = 'ontouchstart' in window
    if (isTouch) return

    const el = ref.current
    if (!el) return

    let raf
    const onMove = (e) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        setMouse({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          active: true,
        })
      })
    }
    const onLeave = () => setMouse((m) => ({ ...m, active: false }))

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden">
      {ICONS.map(({ Icon, x, y, size, depth, base }, i) => {
        const rect = ref.current?.getBoundingClientRect()
        let dx = 0, dy = 0, opacity = base
        if (rect && mouse.active && !reducedMotion) {
          const iconX = (x / 100) * rect.width
          const iconY = (y / 100) * rect.height
          const distX = mouse.x - iconX
          const distY = mouse.y - iconY
          const dist = Math.hypot(distX, distY)
          const maxDist = 260
          if (dist < maxDist) {
            const strength = 1 - dist / maxDist       // 0..1
            const pushMag = 14 * strength / depth
            dx = -(distX / dist) * pushMag
            dy = -(distY / dist) * pushMag
            opacity = base + strength * 0.22
          }
        }

        return (
          <div
            key={i}
            className={`absolute ${reducedMotion ? '' : 'icon-float'}`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: `translate(-50%, -50%) translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)`,
              opacity,
              transition: 'transform 500ms cubic-bezier(0.16,1,0.3,1), opacity 400ms',
              animationDelay: `${i * 0.35}s`,
              animationDuration: `${5 + (i % 5)}s`,
              willChange: 'transform, opacity',
            }}
          >
            <Icon
              size={size}
              className="text-[#00C271]"
              strokeWidth={1.4}
            />
          </div>
        )
      })}
    </div>
  )
}
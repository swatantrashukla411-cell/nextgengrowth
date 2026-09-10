import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

export default function InteractiveServiceCard({ service, index, hoveredIdx, setHoveredIdx }) {
  const { icon: Icon, title, desc, micro } = service
  const isActive = hoveredIdx === index
  const isDimmed = hoveredIdx !== null && hoveredIdx !== index

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHoveredIdx(index)}
      onMouseLeave={() => setHoveredIdx(null)}
      className="group relative overflow-hidden rounded-2xl border p-6 transition-all duration-400"
      style={{
        borderColor: isActive ? 'rgba(0,194,113,0.4)' : 'var(--line)',
        background: isActive
          ? 'linear-gradient(180deg, var(--card) 0%, rgba(0,194,113,0.04) 100%)'
          : 'var(--card)',
        opacity: isDimmed ? 0.55 : 1,
        transform: isActive ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isActive ? '0 20px 40px -20px rgba(0,194,113,0.35)' : 'none',
      }}
    >
      {/* Icon with unique micro-animation */}
      <div className={`relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-400 ${
        isActive ? 'bg-[#00C271] text-white' : 'bg-[var(--bg)] text-[var(--ink)]'
      }`}>
        <Icon className="h-5 w-5" strokeWidth={1.6} />
        {isActive && micro === 'radar' && (
          <>
            <span className="radar-ping absolute inset-0 rounded-xl border-2 border-[#00C271]" />
            <span className="radar-ping absolute inset-0 rounded-xl border-2 border-[#00C271]" style={{ animationDelay: '0.5s' }} />
          </>
        )}
        {isActive && micro === 'scan' && (
          <span className="scan-line absolute inset-x-1 top-1 bottom-1 border-t-2 border-[#00C271]" />
        )}
        {isActive && micro === 'pulse' && (
          <span className="absolute inset-0 rounded-xl border-2 border-white/30 animate-ping" />
        )}
      </div>

      {/* Title */}
      <h3 className="mt-5 text-base font-semibold tracking-tight">{title}</h3>

      {/* Description — reveals on hover */}
      <div
        className="svc-desc overflow-hidden"
        style={{
          opacity: isActive ? 1 : 0,
          maxHeight: isActive ? '120px' : '0px',
          marginTop: isActive ? '8px' : '0px',
        }}
      >
        <p className="text-sm leading-relaxed text-[var(--muted)]">{desc}</p>
      </div>

      {/* Learn more link on active */}
      <div
        className="svc-desc mt-3 flex items-center gap-1 text-xs font-semibold text-[#00C271]"
        style={{
          opacity: isActive ? 1 : 0,
          maxHeight: isActive ? '20px' : '0px',
        }}
      >
        Learn more <ArrowUpRight className="h-3 w-3" />
      </div>

      {/* Arrow indicator */}
      <ArrowUpRight
        className="absolute right-5 top-5 h-4 w-4 text-[var(--muted)] transition-all duration-400"
        style={{ opacity: isActive ? 1 : 0, transform: isActive ? 'translate(2px,-2px)' : 'translate(0,0)' }}
      />
    </motion.article>
  )
}
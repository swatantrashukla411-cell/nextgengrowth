import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  ArrowRight, ArrowUpRight, Menu, X, MessageCircle, Copy, Check,
  Target, Users, Video, MapPin, BarChart3, Sparkles, Shield,
  Workflow, ChevronDown, ArrowUp, Zap, Play, Award, Quote,
  Sun, Moon, ChevronLeft, Radar, ScanLine, Radio,
} from 'lucide-react'
import '../styles/campus.css'
import CampusIconField from '../components/CampusIconField'
import CollegeLogoMarquee from '../components/CollegeLogoMarquee'


/* ---------- data ---------- */
const services = [
  { icon: Users, title: 'Campus Ambassador Programs', desc: 'Recruit, train, and manage student brand leads inside colleges.', micro: 'pulse' },
  { icon: Video, title: 'UGC & Content Campaigns', desc: 'Authentic reels, reviews, and campus stories that feel native.', micro: 'pulse' },
  { icon: Sparkles, title: 'Student Influencer Marketing', desc: 'Micro and nano creators with real peer audiences.', micro: 'pulse' },
  { icon: Radar, title: 'On-Ground Activations', desc: 'Fests, pop-ups, sports meets, sanctioned campus events.', micro: 'radar' },
  { icon: Zap, title: 'Product Sampling', desc: 'Hostels, canteens, peer-led trials with verified feedback.', micro: 'pulse' },
  { icon: Target, title: 'College Outreach', desc: 'Right campuses, right cities, right student mix.', micro: 'radar' },
  { icon: Radio, title: 'Community Marketing', desc: 'Clubs, E-Cells, WhatsApp and student networks.', micro: 'pulse' },
  { icon: ScanLine, title: 'QR Feedback & Reporting', desc: 'Scans, sentiment, proof of work — not fake screenshots.', micro: 'scan' },
  { icon: Workflow, title: 'End-to-End Management', desc: 'Strategy, execution, reporting under one roof.', micro: 'pulse' },
]

const phases = [
  { n: '01', t: 'Planning & Campus Selection', d: 'KPIs, brand-fit colleges, city and campus mapping.' },
  { n: '02', t: 'Ambassador Recruitment', d: 'Vetted student leaders, onboarding, brand briefing.' },
  { n: '03', t: 'On-Ground Execution', d: 'Sampling, events, permissions, logistics, ops control.' },
  { n: '04', t: 'UGC & Content', d: 'Reels, graphics, peer storytelling from campus floor.' },
  { n: '05', t: 'Monitor & Report', d: 'QR metrics, engagement logs, executive summary.' },
]

const faqs = [
  { q: 'Do you only operate in Delhi-NCR?', a: 'No. We run pan-India campus programs and map colleges to brand fit across Tier-1, 2, and 3 markets.' },
  { q: 'Is this only ambassador hiring?', a: 'No. Ambassadors, UGC, sampling, on-ground activations, community, and reporting — full stack.' },
  { q: 'How do you prove delivery?', a: 'QR scans, content logs, ambassador reports, and executive dossiers. Verified work — not screenshot theatre.' },
  { q: 'Are students treated as free labour?', a: 'Never. Students get real experience, certificates, portfolio work, and paid opportunities where relevant.' },
  { q: 'How does pricing work?', a: 'Custom to scope: campuses, services, duration. Strategy call → clear proposal.' },
  { q: 'How fast can we start?', a: 'After the brief and campus fit, onboarding + calendar usually inside a few weeks — not months.' },
]

const colleges = [
  { name: 'NIET', file: 'niet.png' },
  { name: 'GL Bajaj', file: 'glbajaj.png' },
  { name: 'NIU', file: 'niu.png' },
  { name: 'Quantum University', file: 'quantum.png' },
  { name: 'Haridwar University', file: 'haridwar.png' },
  { name: 'RIT Roorkee', file: 'rit.png' },
  { name: 'Amity', file: 'amity.png' },
  { name: 'Galgotias', file: 'galgotias.png' },
  { name: 'Delhi University', file: 'du.png' },
  { name: 'LPU', file: 'lpu.png' },
  { name: 'Christ University', file: 'christ.png' },
  { name: 'Shiv Nadar', file: 'shivnadar.png' },
]

/* Brands strip that slides in on scroll */
const brands = [
  'Sleepy Owl', 'MasterChow', 'Snitch', 'Nobero', 'Dot & Key',
  'La Pino\'z', 'Burgrill', 'Belgium Waffle', 'ChakDeBharat',
  'Startup Uttarakhand', 'SparkX', 'Fi Money', 'Groww',
  'Coding Ninjas', 'Scaler',
]

const founders = [
  {
    name: 'Swatantra Shukla',
    role: 'Founder',
    file: 'swatantra.jpg',
    quote: 'We are not building an agency. We are building the operating system that runs Gen-Z marketing in India.',
  },
  {
    name: 'Yuvraj Singh',
    role: 'Co-founder',
    file: 'yuvraj.jpg',
    quote: 'Students are the ecosystem. When you build with them, the brand doesn\'t just reach campus — it belongs there.',
  },
]

/* Case studies — graph only on ChakDeBharat */
const cases = [
  {
    id: 'chakde',
    tag: 'Sports · Youth platform',
    name: 'ChakDeBharat',
    tags: ['Sports', 'Ambassadors', 'On-ground', 'UGC', 'Podcast ops'],
    desc: '6-university deployment across Noida & Uttarakhand: 70+ campus ambassadors, live sports activations, community building, end-to-end social ops and podcast production. Offline momentum systematically turned into digital content.',
    image: '/brands/chakdebharat.png',
    ran: ['Ambassador recruitment', 'Campus event execution', 'Social management', 'Podcast production'],
    outcomes: ['70+ ambassadors', '6 universities', 'Self-sustaining communities', 'Retained partnership'],
    hasGraph: true,
    bars: [{x:20,h:90,l:'NIET'},{x:65,h:130,l:'GL Bajaj'},{x:110,h:75,l:'NIU'},{x:155,h:145,l:'Quantum'},{x:200,h:110,l:'Haridwar'},{x:245,h:100,l:'RIT'}],
    stats: [['450K+','Views'],['7.2%','ER'],['1.4K','QR']],
  },
  {
    id: 'belgium',
    tag: 'F&B · Delhi-NCR',
    name: 'Belgium Waffle',
    tags: ['Sampling', 'Ambassadors', 'Store visits', 'UGC'],
    desc: 'Ambassador-led awareness across Amity, Galgotias, GL Bajaj, NIET and DU cluster — adapted for real campus permission constraints. Store-visit strategy drove student footfall to actual outlets.',
    image: '/brands/belgiumwaffle.png',
    ran: ['40-50 ambassadors', 'PR distribution', 'Certificate program', 'Cross-campus events'],
    outcomes: ['5 Delhi-NCR colleges', 'Product trials', 'Store footfall', 'UGC pipeline'],
    hasGraph: false,
    highlights: [
      { v: '5', l: 'Colleges' },
      { v: '50', l: 'Ambassadors' },
      { v: '3-4x', l: 'Footfall lift' },
      { v: 'NCR', l: 'Coverage' },
    ],
  },
  {
    id: 'startupuk',
    tag: 'Gov · Startup ecosystem',
    name: 'Startup Uttarakhand',
    tags: ['Outreach', 'Events', 'Student engagement'],
    desc: 'University outreach across 5 campuses with 20 ambassadors — student-powered event and startup ecosystem support for the Government of Uttarakhand initiative.',
    image: '/brands/startupuk.png',
    ran: ['University outreach', 'Event support', 'Ambassador coordination', 'Reporting'],
    outcomes: ['5 UK campuses', '20 ambassadors', 'Live event participation', 'Ecosystem growth'],
    hasGraph: false,
    highlights: [
      { v: '5', l: 'Campuses' },
      { v: '20', l: 'Ambassadors' },
      { v: '100%', l: 'Delivery' },
      { v: 'Gov', l: 'Partnership' },
    ],
  },
  {
    id: 'sparkx',
    tag: 'Innovation · Youth activation',
    name: 'SparkX',
    tags: ['Campus outreach', 'Ambassadors', 'Community'],
    desc: 'Student-powered campus outreach and community-led activation across select universities — connecting SparkX with authentic Gen-Z audiences through peer networks.',
    image: '/brands/sparkx.png',
    ran: ['Campus mapping', 'Ambassador program', 'Community amplification', 'Event support'],
    outcomes: ['Peer-led reach', 'Authentic engagement', 'Community traction', 'Continued partnership'],
    hasGraph: false,
    highlights: [
      { v: 'Multi', l: 'Campus' },
      { v: 'Peer', l: 'Led' },
      { v: 'Live', l: 'Activation' },
      { v: '✓', l: 'Retained' },
    ],
  },
]

/* ---------- hooks ---------- */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .draw-line')
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => e.isIntersecting && e.target.classList.add('in'))
    }, { threshold: 0.12 })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function useCounter(target, duration = 1600, start = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let raf, startTime
    const numeric = parseInt(String(target).replace(/[^0-9]/g,'')) || 0
    const step = (t) => {
      if (!startTime) startTime = t
      const p = Math.min((t - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.floor(eased * numeric))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, start])
  const suffix = String(target).replace(/[0-9,]/g, '')
  return `${value.toLocaleString()}${suffix}`
}

function CountUp({ value, className }) {
  const ref = useRef(null)
  const [start, setStart] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setStart(true), { threshold: 0.4 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  const display = useCounter(value, 1600, start)
  return <span ref={ref} className={className}>{display}</span>
}

/* ---------- reusable image slot ---------- */
function ImageSlot({ src, alt, ratio = 'square', label }) {
  const [errored, setErrored] = useState(false)
  const ratioClass = ratio === 'square' ? 'aspect-square' : ratio === 'portrait' ? 'aspect-[3/4]' : 'aspect-video'
  return (
    <div className={`group relative ${ratioClass} overflow-hidden rounded-2xl bg-[#0B1220]`}>
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00C271]/25 via-transparent to-[#0B1220]" />
        <div className="absolute -inset-8 opacity-70 blur-2xl">
          <div className="absolute left-0 top-0 h-40 w-40 rounded-full bg-[#00C271]/40 animate-pulse" />
          <div className="absolute right-0 bottom-0 h-40 w-40 rounded-full bg-white/10 animate-pulse [animation-delay:800ms]" />
        </div>
      </div>
      {src && !errored && (
        <img src={src} alt={alt} onError={() => setErrored(true)} className="relative z-10 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      )}
      {(!src || errored) && label && (
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center p-3 text-center">
          <div className="text-[10px] uppercase tracking-widest text-white/50">Photo slot</div>
          <div className="mt-1 text-sm font-medium text-white">{label}</div>
        </div>
      )}
    </div>
  )
}

/* ---------- toast ---------- */
function Toast({ show, msg, type }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={`fixed bottom-24 right-4 z-[100] flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium shadow-2xl md:bottom-6 ${type === 'success' ? 'bg-[#0B1220] text-white' : 'bg-red-600 text-white'}`}
        >
          {type === 'success' ? <Check className="h-4 w-4 text-[#00C271]" /> : <X className="h-4 w-4" />}
          {msg}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ---------- rotating word ---------- */
function RotatingWord({ words }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % words.length), 2400)
    return () => clearInterval(t)
  }, [words.length])
  return (
    <span className="relative inline-block">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[idx]}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-block"
        >
          {words[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/* ---------- Founders video (bigger, visible faces) ---------- */
function FoundersVideo({ src = '' }) {
  const [modalOpen, setModalOpen] = useState(false)
  const modalRef = useRef(null)

  useEffect(() => {
    if (!modalOpen) return
    document.body.classList.add('modal-open')
    const onKey = (e) => e.key === 'Escape' && setModalOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', onKey)
    }
  }, [modalOpen])

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        className="group relative aspect-video cursor-pointer overflow-hidden rounded-2xl border border-[var(--line)] bg-[#0B1220] transition-all duration-500 hover:border-[#00C271]/50 hover:shadow-[0_20px_60px_-20px_rgba(0,194,113,0.35)]"
      >
        {src ? (
          <video src={src} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0B1220] via-[#00C271]/25 to-[#0B1220]" />
            <div className="absolute -inset-16 opacity-70 blur-3xl">
              <div className="absolute left-[15%] top-[20%] h-56 w-56 rounded-full bg-[#00C271]/50 animate-pulse" />
              <div className="absolute right-[10%] bottom-[15%] h-56 w-56 rounded-full bg-white/10 animate-pulse [animation-delay:1.2s]" />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/70">
              <Users className="h-10 w-10 text-[#00C271]" />
              <div className="text-xs uppercase tracking-[0.3em]">Founders</div>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00C271] live-pulse" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white/80">Founders</span>
        </div>

        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <div>
            <div className="text-lg font-semibold text-white sm:text-xl">Meet the Founders</div>
            <div className="mt-0.5 text-xs text-white/70">Why we built NGG</div>
          </div>
        </div>

        <div className="absolute right-4 bottom-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 transition-all duration-500 group-hover:bg-[#00C271] group-hover:border-[#00C271] group-hover:scale-110">
          <Play className="h-4 w-4 fill-white text-white" />
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#0B1220]"
              ref={modalRef}
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
                  <video src={src} controls autoPlay playsInline className="h-full w-full" />
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

/* ---------- Interactive service card ---------- */
function InteractiveServiceCard({ service, index, hoveredIdx, setHoveredIdx }) {
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
        background: isActive ? 'linear-gradient(180deg, var(--card) 0%, rgba(0,194,113,0.04) 100%)' : 'var(--card)',
        opacity: isDimmed ? 0.55 : 1,
        transform: isActive ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isActive ? '0 20px 40px -20px rgba(0,194,113,0.35)' : 'none',
      }}
    >
      <div className={`relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-400 ${isActive ? 'bg-[#00C271] text-white' : 'bg-[var(--bg)] text-[var(--ink)]'}`}>
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

      <h3 className="mt-5 text-base font-semibold tracking-tight">{title}</h3>

      <div className="svc-desc overflow-hidden" style={{ opacity: isActive ? 1 : 0, maxHeight: isActive ? '120px' : '0px', marginTop: isActive ? '8px' : '0px' }}>
        <p className="text-sm leading-relaxed text-[var(--muted)]">{desc}</p>
      </div>

      <div className="svc-desc mt-3 flex items-center gap-1 text-xs font-semibold text-[#00C271]" style={{ opacity: isActive ? 1 : 0, maxHeight: isActive ? '20px' : '0px' }}>
        Learn more <ArrowUpRight className="h-3 w-3" />
      </div>

      <ArrowUpRight className="absolute right-5 top-5 h-4 w-4 text-[var(--muted)] transition-all duration-400" style={{ opacity: isActive ? 1 : 0, transform: isActive ? 'translate(2px,-2px)' : 'translate(0,0)' }} />
    </motion.article>
  )
}

/* ---------- Brand strip that slides in on scroll ---------- */
function ScrollBrandStrip() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const x = useTransform(scrollYProgress, [0, 1], ['20%', '-40%'])

  return (
    <section ref={ref} className="border-y border-[var(--line)] bg-[var(--card)] py-16 sm:py-20 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="reveal flex flex-col items-start justify-between gap-2 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Trusted by</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Brands we build with.
            </h2>
          </div>
          <p className="text-sm text-[var(--muted)]">Scroll to explore →</p>
        </div>
      </div>

      <motion.div style={{ x }} className="mt-10 flex w-max items-center gap-4 will-change-transform">
        {brands.map((b, i) => (
          <div
            key={i}
            className="flex h-20 min-w-[180px] items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-6 text-sm font-semibold tracking-tight text-[var(--ink)] transition-colors hover:border-[#00C271]/50 hover:text-[#00C271]"
          >
            {b}
          </div>
        ))}
      </motion.div>
    </section>
  )
}

/* ---------- app ---------- */
export default function App() {
  useReveal()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showTop, setShowTop] = useState(false)
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' })
  const [activeSection, setActiveSection] = useState('')
  const [dark, setDark] = useState(false)
  const [cursor, setCursor] = useState({ x: -1000, y: -1000, visible: false })
  const [activeCase, setActiveCase] = useState('chakde')
  const [step, setStep] = useState(1)
  const [hoveredSvc, setHoveredSvc] = useState(null)
  const heroRef = useRef(null)
  const formRef = useRef(null)

  const { scrollYProgress } = useScroll()
  const parallaxY = useTransform(scrollYProgress, [0, 0.2], [0, -40])

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', company: '',
    goal: 'Campus Ambassadors', message: '',
  })
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
      setShowTop(window.scrollY > 800)
      const sections = ['services', 'process', 'work', 'faq']
      let current = ''
      for (const id of sections) {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 120 && rect.bottom >= 120) current = id
        }
      }
      setActiveSection(current)
    }
    window.addEventListener('scroll', onScroll)
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        e.preventDefault()
        document.getElementById('field-fullName')?.focus()
        formRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
      if (e.key.toLowerCase() === 't' && e.shiftKey) window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    const enter = () => setCursor(c => ({ ...c, visible: true }))
    const leave = () => setCursor(c => ({ ...c, visible: false }))
    const move = (e) => setCursor({ x: e.clientX, y: e.clientY, visible: true })
    hero.addEventListener('mouseenter', enter)
    hero.addEventListener('mouseleave', leave)
    hero.addEventListener('mousemove', move)
    return () => {
      hero.removeEventListener('mouseenter', enter)
      hero.removeEventListener('mouseleave', leave)
      hero.removeEventListener('mousemove', move)
    }
  }, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const nextStep = () => {
    if (!form.fullName || !form.email || !form.phone || !form.company) {
      setToast({ show: true, msg: 'Please fill all fields first.', type: 'error' })
      setTimeout(() => setToast(t => ({ ...t, show: false })), 2500)
      return
    }
    setStep(2)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      await new Promise(r => setTimeout(r, 1100))
      console.log('Campus lead:', form)
      setStatus('success')
      setToast({ show: true, msg: 'Lead received — we\'ll be in touch.', type: 'success' })
      setForm({ fullName: '', email: '', phone: '', company: '', goal: 'Campus Ambassadors', message: '' })
      setStep(1)
      setTimeout(() => setToast(t => ({ ...t, show: false })), 3500)
    } catch {
      setStatus('error')
      setToast({ show: true, msg: 'Something went wrong. Try WhatsApp.', type: 'error' })
      setTimeout(() => setToast(t => ({ ...t, show: false })), 3500)
    }
  }

  const copyEmail = async () => {
    await navigator.clipboard.writeText('hello@nextgengrowth.in')
    setCopied(true)
    setToast({ show: true, msg: 'Email copied.', type: 'success' })
    setTimeout(() => { setCopied(false); setToast(t => ({ ...t, show: false })) }, 2000)
  }

  const WA = 'https://wa.me/91XXXXXXXXXX'
  const currentCase = useMemo(() => cases.find(c => c.id === activeCase), [activeCase])

  const navItems = [
    { href: '#services', label: 'Services', id: 'services' },
    { href: '#process', label: 'Process', id: 'process' },
    { href: '#work', label: 'Work', id: 'work' },
    { href: '#faq', label: 'FAQ', id: 'faq' },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <a href="#main" className="skip-link">Skip to content</a>

      <motion.div style={{ scaleX: scrollYProgress }} className="fixed top-0 left-0 right-0 z-[60] h-[3px] origin-left bg-[#00C271]" />

      <div className="cursor-glow" style={{ left: cursor.x, top: cursor.y, opacity: cursor.visible ? 1 : 0 }} />

      {/* HEADER */}
      <header className={`fixed inset-x-0 top-3 z-50 transition-all duration-300 ${scrolled ? 'translate-y-0' : 'translate-y-1'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 sm:px-6">
          <a href="#" className={`flex items-center gap-2.5 rounded-full border border-[var(--line)] px-3 py-2 shadow-sm transition-all ${scrolled ? 'bg-[var(--card)]/95 backdrop-blur-md' : 'bg-[var(--card)]/70 backdrop-blur-sm'}`}>
            <img src="/logo.png" alt="NextGenGrowth" className="h-8 w-8 rounded-full object-cover" />
            <div className="hidden leading-tight sm:block">
              <div className="text-xs font-semibold tracking-tight">NextGenGrowth</div>
              <div className="text-[10px] text-[var(--muted)]">Campus Marketing</div>
            </div>
          </a>

          <nav className={`hidden items-center gap-1 rounded-full border border-[var(--line)] px-1.5 py-1.5 shadow-sm md:flex ${scrolled ? 'bg-[var(--card)]/95 backdrop-blur-md' : 'bg-[var(--card)]/70 backdrop-blur-sm'}`}>
            {navItems.map(n => {
              const active = activeSection === n.id
              return (
                <a key={n.href} href={n.href} className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition ${active ? 'text-[var(--ink)]' : 'text-[var(--muted)] hover:text-[var(--ink)]'}`}>
                  {active && <motion.span layoutId="navPill" transition={{ type: 'spring', stiffness: 380, damping: 30 }} className="absolute inset-0 rounded-full bg-[#00C271]/10 border border-[#00C271]/30" />}
                  <span className="relative">{n.label}</span>
                </a>
              )
            })}
          </nav>

          <div className={`hidden items-center gap-1 rounded-full border border-[var(--line)] px-1.5 py-1.5 shadow-sm md:flex ${scrolled ? 'bg-[var(--card)]/95 backdrop-blur-md' : 'bg-[var(--card)]/70 backdrop-blur-sm'}`}>
            <button onClick={() => setDark(!dark)} className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--bg)] hover:text-[var(--ink)] transition" aria-label="Toggle dark mode">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <a href={WA} target="_blank" rel="noreferrer" className="hidden lg:inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-[var(--muted)] hover:text-[var(--ink)] transition">
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
            <a href="#contact" className="group inline-flex items-center gap-2 rounded-full bg-[#0B1220] px-4 py-2 text-sm font-medium text-white transition hover:bg-black">
              Book a call <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </a>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button onClick={() => setDark(!dark)} className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--card)]/90 backdrop-blur-md shadow-sm">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--card)]/90 backdrop-blur-md shadow-sm" aria-label="Menu">
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mx-auto mt-2 max-w-7xl px-3 md:hidden">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)]/95 p-2 shadow-xl backdrop-blur-md">
                {navItems.map(n => (
                  <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)} className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${activeSection === n.id ? 'bg-[#00C271]/10 text-[var(--ink)]' : 'text-[var(--muted)] hover:bg-[var(--bg)]'}`}>{n.label}</a>
                ))}
                <a href="#contact" onClick={() => setMenuOpen(false)} className="mt-1 block rounded-xl bg-[#0B1220] px-4 py-3 text-center text-sm font-medium text-white">Book a call</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main id="main">
        {/* HERO with interactive floating ecosystem icons */}
        <section ref={heroRef} className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
          <CampusIconField />
          <div className="pointer-events-none absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-[#00C271]/8 blur-3xl" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">

              {/* LEFT */}
              <div className="lg:col-span-7">
                <motion.h1 initial="hidden" animate="show" className="text-5xl font-semibold tracking-tight text-[var(--ink)] sm:text-6xl lg:text-7xl lg:leading-[1.02]">
                  <motion.span className="block overflow-hidden" variants={{ hidden:{opacity:0}, show:{opacity:1, transition:{staggerChildren:0.08, delayChildren:0.1}} }}>
                    {['Reach','Gen-Z'].map((w,i)=>(
                      <motion.span key={i} className="mr-3 inline-block" variants={{hidden:{y:40,opacity:0,filter:'blur(6px)'}, show:{y:0,opacity:1,filter:'blur(0px)', transition:{duration:0.7, ease:[0.16,1,0.3,1]}}}}>{w}</motion.span>
                    ))}
                  </motion.span>
                  <motion.span className="block overflow-hidden" variants={{ hidden:{opacity:0}, show:{opacity:1, transition:{staggerChildren:0.08, delayChildren:0.35}} }}>
                    {['where','they'].map((w,i)=>(
                      <motion.span key={i} className="mr-3 inline-block" variants={{hidden:{y:40,opacity:0,filter:'blur(6px)'}, show:{y:0,opacity:1,filter:'blur(0px)', transition:{duration:0.7, ease:[0.16,1,0.3,1]}}}}>{w}</motion.span>
                    ))}
                  </motion.span>
                  <motion.span className="block overflow-hidden" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.75, duration:0.6}}>
                    <motion.span initial={{y:40,opacity:0,filter:'blur(6px)'}} animate={{y:0,opacity:1,filter:'blur(0px)'}} transition={{delay:0.8, duration:0.8, ease:[0.16,1,0.3,1]}} className="inline-block">
                      <span className="green-shimmer">
                        <RotatingWord words={['actually live.','actually trust.','actually buy.','actually talk.']} />
                      </span>
                    </motion.span>
                  </motion.span>
                </motion.h1>

                <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:1.1,duration:0.7}} className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
                  End-to-end campus ambassador programs, UGC, sampling, and on-ground activations across India — one operating system, not five vendors.
                </motion.p>

                <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:1.3,duration:0.6}} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a href="#contact" className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#00C271] px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-[#00C271]/20 transition-all duration-300 hover:bg-[#00b068] hover:shadow-[0_10px_40px_-5px_rgba(0,194,113,0.5)] hover:-translate-y-0.5">
                    Book Campus Strategy Call
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </a>
                  <a href="#work" className="group inline-flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B1220] text-white transition-transform duration-300 group-hover:scale-110">
                      <Play className="h-3.5 w-3.5 fill-white" />
                    </span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">See our work</span>
                  </a>
                </motion.div>

                {/* Founders video — BIGGER, faces visible */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 0.8 }} className="mt-10 max-w-lg">
                  <FoundersVideo src="" />
                </motion.div>
              </div>

              {/* RIGHT */}
              <motion.div style={{ y: parallaxY }} className="lg:col-span-5 relative">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <motion.div initial={{opacity:0,y:30,filter:'blur(6px)'}} animate={{opacity:1,y:0,filter:'blur(0px)'}} transition={{delay:1.1,duration:0.7}} whileHover={{y:-4}} className="col-span-2 rounded-3xl bg-[var(--card)] border border-[var(--line)] p-6 sm:p-7 transition-shadow duration-300 hover:shadow-[0_20px_60px_-20px_rgba(0,194,113,0.3)] hover:border-[#00C271]/30">
                    <div className="flex items-baseline gap-2">
                      <CountUp value="100+" className="text-5xl font-semibold tracking-tight sm:text-6xl" />
                      <motion.span initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2.8,duration:0.5}} className="text-sm text-[var(--muted)]">campuses activated</motion.span>
                    </div>
                    <div className="mt-5 flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {['#00C271','#0B1220','#F59E0B'].map((c,i)=>(<div key={i} className="circle-pulse-once h-8 w-8 rounded-full border-2 border-[var(--card)]" style={{background:c, animationDelay:`${1.4 + i*0.15}s`}} />))}
                      </div>
                      <p className="text-xs text-[var(--muted)]">Ambassadors, creators, campus leads across India</p>
                    </div>
                  </motion.div>

                  <motion.div initial={{opacity:0,y:30,filter:'blur(6px)'}} animate={{opacity:1,y:0,filter:'blur(0px)'}} transition={{delay:1.25,duration:0.7}} whileHover={{y:-4}} className="group rounded-3xl bg-[#0B1220] p-6 text-white border border-transparent transition-colors duration-300 hover:border-[#00C271]/40 relative overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_50%_0%,rgba(0,194,113,0.2),transparent_60%)]" />
                    <CountUp value="70+" className="relative text-4xl font-semibold" />
                    <div className="relative mt-2 text-[11px] uppercase tracking-wider text-white/60">Campus<br/>ambassadors</div>
                  </motion.div>

                  <motion.div initial={{opacity:0,y:30,filter:'blur(6px)'}} animate={{opacity:1,y:0,filter:'blur(0px)'}} transition={{delay:1.4,duration:0.7}} whileHover={{y:-4}} className="rounded-3xl bg-[#00C271] p-6 text-white transition-all duration-300 hover:shadow-[0_20px_50px_-10px_rgba(0,194,113,0.5)]">
                    <CountUp value="100+" className="text-4xl font-semibold" />
                    <div className="mt-2 text-[11px] uppercase tracking-wider text-white/85">Projects<br/>delivered</div>
                  </motion.div>

                  <motion.div initial={{opacity:0,y:30,filter:'blur(6px)'}} animate={{opacity:1,y:0,filter:'blur(0px)'}} transition={{delay:1.55,duration:0.7}} whileHover={{y:-4}} className="col-span-2 rounded-3xl bg-[var(--card)] border border-[var(--line)] p-5 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">Pan-India network</div>
                      <div className="text-xs text-[var(--muted)]">Tier 1, 2 & 3 colleges</div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-[var(--bg)] px-3 py-1.5 text-xs font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00C271] live-pulse" /> Active
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:1.75,duration:0.6}} className="mt-14 grid grid-cols-2 gap-3 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 sm:grid-cols-4 sm:p-6">
              {[['5+','States covered'],['20+','Team members'],['₹1L','University grant'],['100%','End-to-end ops']].map(([v,l], i)=>(
                <motion.div key={l} initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:1.85+i*0.1,duration:0.5}} whileHover={{y:-3}} className="group cursor-default border-r border-[var(--line)] px-2 last:border-none sm:px-4 transition-all duration-300 rounded-lg hover:bg-[var(--bg)]">
                  <CountUp value={v} className="text-2xl font-semibold text-[var(--ink)] transition-colors duration-300 group-hover:text-[#00C271]" />
                  <div className="text-xs text-[var(--muted)]">{l}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* BRAND STRIP — slides in on scroll */}
        <ScrollBrandStrip />

        {/* COLLEGE LOGOS — restored simple dual marquee */}
        <section className="border-y border-[var(--line)] bg-[var(--card)] py-14 sm:py-16 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="reveal flex flex-col items-start justify-between gap-2 md:flex-row md:items-end">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                <span className="text-[#00C271]">100+</span> campuses across India
              </h2>
              <p className="text-sm text-[var(--muted)]">Selected institutions from our network</p>
            </div>
          </div>

          <div className="mt-10 space-y-4">
            <CollegeLogoMarquee colleges={colleges} direction="left" speed={35} />
            <CollegeLogoMarquee colleges={[...colleges].reverse()} direction="right" speed={40} />
          </div>
          <p className="mt-8 text-center text-xs text-[var(--muted)]">And many more across Delhi-NCR, UP, Uttarakhand, Punjab, and beyond.</p>
        </section>

        {/* PROBLEM */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="reveal">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">The problem</p>
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">Traditional marketing dies at the college gate.</h2>
              <p className="mt-4 max-w-2xl text-[var(--muted)] leading-relaxed">Gen-Z ignores banners. Top-down campaigns feel fake. Most agencies collect screenshots and call it engagement.</p>
            </div>
            <div className="reveal mt-16 rounded-3xl border border-[var(--line)] bg-[var(--card)] p-6 sm:p-10">
              <div className="grid gap-6 md:grid-cols-3 md:gap-4 relative">
                <svg className="hidden md:block absolute top-16 left-1/3 -translate-x-8 w-16 h-2" viewBox="0 0 100 10">
                  <path d="M0 5 L95 5" className="draw-line" stroke="#00C271" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M85 1 L95 5 L85 9" className="draw-line" stroke="#00C271" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
                <svg className="hidden md:block absolute top-16 left-2/3 -translate-x-8 w-16 h-2" viewBox="0 0 100 10">
                  <path d="M0 5 L95 5" className="draw-line" stroke="#00C271" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M85 1 L95 5 L85 9" className="draw-line" stroke="#00C271" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
                {[
                  { icon: Target, t: 'Brand runs ad', d: 'Digital spend on Meta / YouTube targeted at Gen-Z.', tone: 'ink' },
                  { icon: Shield, t: 'Student scrolls past', d: 'Peer trust is missing. Feels like every other ad.', tone: 'muted' },
                  { icon: X, t: 'Zero cultural lift', d: 'No campus conversation. No community. Spend wasted.', tone: 'danger' },
                ].map((step,i)=>(
                  <div key={step.t} className="relative rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-6">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${step.tone==='ink'?'bg-[#0B1220] text-white':step.tone==='muted'?'bg-[var(--card)] text-[var(--ink)] border border-[var(--line)]':'bg-red-50 text-red-600'}`}>
                      <step.icon className="h-4 w-4" />
                    </div>
                    <div className="mt-4 text-xs font-medium text-[var(--muted)]">Step 0{i+1}</div>
                    <h3 className="mt-1 text-lg font-semibold">{step.t}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{step.d}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex items-center gap-3 rounded-2xl bg-[#0B1220] p-5 text-white">
                <Zap className="h-5 w-5 shrink-0 text-[#00C271]" />
                <p className="text-sm"><span className="font-semibold">The fix:</span> flip the model. Students execute the campaign — you get real cultural adoption + verified proof.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SOLUTION */}
        <section className="border-y border-[var(--line)] bg-[#0B1220] py-24 text-white sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="reveal">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#00C271]">Our model</p>
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">With students. Not to students.</h2>
              <p className="mt-5 max-w-2xl text-white/70 leading-relaxed">We build a student-powered execution layer inside colleges — ambassadors, creators, influencers, and on-ground leads — managed as one system.</p>
              <blockquote className="mt-12 max-w-3xl border-l-2 border-[#00C271] pl-6 text-xl font-medium leading-snug text-white/95 sm:text-2xl">
                "We help students turn their skills into real-world experience."
                <footer className="mt-3 text-sm font-normal text-white/50">Never portray students as free labour.</footer>
              </blockquote>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="reveal max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Services</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Full-stack campus marketing. One partner.</h2>
              <p className="mt-4 text-[var(--muted)]">Hover a service to explore.</p>
            </div>
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" onMouseLeave={() => setHoveredSvc(null)}>
              {services.map((s, i) => (
                <InteractiveServiceCard key={s.title} service={s} index={i} hoveredIdx={hoveredSvc} setHoveredIdx={setHoveredSvc} />
              ))}
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section id="process" className="border-y border-[var(--line)] bg-[var(--card)] py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="reveal">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Process</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">A system. Not a hustle.</h2>
            </div>
            <div className="reveal mt-14 space-y-4">
              {phases.map((p)=>(
                <div key={p.n} className="group relative flex flex-col gap-4 rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-5 md:flex-row md:items-center md:gap-8 md:p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--card)] border border-[var(--line)] text-sm font-semibold text-[#00C271] transition group-hover:bg-[#00C271] group-hover:text-white group-hover:border-[#00C271]">{p.n}</div>
                  <div className="flex-1">
                    <div className="font-semibold">{p.t}</div>
                    <div className="mt-1 text-sm text-[var(--muted)]">{p.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WORK — tabs, only ChakDe has graph */}
        <section id="work" className="bg-[#0B1220] py-24 text-white sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="reveal">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#00C271]">Selected work</p>
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">Proof over promises.</h2>
              <p className="mt-4 max-w-xl text-white/60">Multi-state campus campaigns delivered end-to-end. Numbers verified — not screenshots.</p>
            </div>

            {/* Flip cards — fixed */}
            <div className="reveal mt-14 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {[
                ['6','Campuses','ChakDe deployment across Noida + Uttarakhand'],
                ['70+','Ambassadors','Verified student leaders trained in-person'],
                ['25+','UGC assets','Reels, graphics, campus stories'],
                ['450K+','Impressions','Cross-platform reach, verified'],
                ['2,000','Samples','Product trials in hostels + canteens'],
                ['1,400+','QR scans','Real feedback, not fake screenshots'],
              ].map(([v,l,back])=>(
                <div key={l} className="flip-card h-28">
                  <div className="flip-inner h-full">
                    <div className="flip-face flip-front rounded-2xl border border-white/10 bg-white/5 px-4 py-5 flex-col text-center">
                      <div className="text-2xl font-semibold">{v}</div>
                      <div className="mt-1 text-[11px] uppercase tracking-wider text-white/50">{l}</div>
                    </div>
                    <div className="flip-face flip-back rounded-2xl border border-[#00C271]/40 bg-[#00C271]/10 p-3 text-center">
                      <p className="text-[11px] leading-snug text-white/90">{back}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CASE TABS */}
            <div className="reveal mt-12">
              <div className="flex flex-wrap gap-2">
                {cases.map(c => (
                  <button key={c.id} onClick={() => setActiveCase(c.id)} className={`rounded-full border px-4 py-2 text-sm font-medium transition ${activeCase === c.id ? 'border-[#00C271] bg-[#00C271]/10 text-white' : 'border-white/10 bg-white/5 text-white/60 hover:text-white'}`}>
                    {c.name}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={currentCase.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }} className="mt-6 grid gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-10 lg:grid-cols-5">
                  <div className={currentCase.hasGraph ? 'lg:col-span-3' : 'lg:col-span-5'}>
                    <div className="flex flex-wrap items-center gap-2">
                      {currentCase.tags.map(t=>(<span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70">{t}</span>))}
                    </div>
                    <h3 className="mt-4 text-3xl font-semibold sm:text-4xl">{currentCase.name}</h3>
                    <p className="mt-3 text-white/70 leading-relaxed">{currentCase.desc}</p>
                    <div className="mt-6">
                      <ImageSlot src={currentCase.image} alt={currentCase.name} ratio="video" label={`${currentCase.name} visual`} />
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs uppercase tracking-wider text-white/50">What we ran</div>
                        <ul className="mt-2 space-y-1.5 text-sm">
                          {currentCase.ran.map(r=>(<li key={r} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-[#00C271]" /> {r}</li>))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider text-white/50">Outcomes</div>
                        <ul className="mt-2 space-y-1.5 text-sm">
                          {currentCase.outcomes.map(o=>(<li key={o} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-[#00C271]" /> {o}</li>))}
                        </ul>
                      </div>
                    </div>

                    {/* Highlights row when no graph */}
                    {!currentCase.hasGraph && currentCase.highlights && (
                      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {currentCase.highlights.map((h, i)=>(
                          <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                            <div className="text-2xl font-semibold">{h.v}</div>
                            <div className="mt-1 text-[10px] uppercase tracking-wider text-white/50">{h.l}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Graph — ONLY for ChakDeBharat */}
                  {currentCase.hasGraph && (
                    <div className="lg:col-span-2">
                      <div className="rounded-2xl border border-white/10 bg-[#0B1220] p-6">
                        <div className="flex items-center justify-between">
                          <div className="text-xs uppercase tracking-wider text-white/50">Campus engagement</div>
                          <div className="text-xs text-[#00C271]">Verified</div>
                        </div>
                        <svg viewBox="0 0 300 180" className="mt-4 w-full">
                          {currentCase.bars.map(b=>(
                            <g key={b.l}>
                              <rect x={b.x} y={160-b.h} width="30" height={b.h} rx="4" fill="#00C271" opacity="0.85" className="grow-bar" />
                              <text x={b.x+15} y="175" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.5)">{b.l}</text>
                            </g>
                          ))}
                        </svg>
                        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center">
                          {currentCase.stats.map(([v,l])=>(
                            <div key={l}><div className="text-lg font-semibold">{v}</div><div className="text-[10px] uppercase tracking-wider text-white/50">{l}</div></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* GRANT */}
        <section className="py-24 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="reveal grid gap-8 rounded-3xl border border-[var(--line)] bg-[var(--card)] p-6 sm:p-10 lg:grid-cols-2 lg:gap-12">
              <div>
                <ImageSlot src="/grant/cheque.jpg" alt="₹1 Lakh University Grant" ratio="video" label="₹1 Lakh cheque photo" />
              </div>
              <div className="flex flex-col justify-center">
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#00C271]/10 px-3 py-1 text-xs font-medium text-[#007A47]">
                  <Award className="h-3.5 w-3.5" /> Recognized & funded
                </div>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Backed by a <span className="text-[#00C271]">₹1 Lakh</span> university grant.
                </h2>
                <p className="mt-4 text-[var(--muted)] leading-relaxed">
                  NextGenGrowth was formally recognized and funded through a ₹1 Lakh university-backed grant — validating our model of ethical, student-powered campus marketing at scale.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[['100+','Projects'],['70+','Ambassadors'],['6+','States']].map(([v,l])=>(
                    <div key={l} className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4">
                      <CountUp value={v} className="text-xl font-semibold" />
                      <div className="text-[11px] uppercase tracking-wider text-[var(--muted)]">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOUNDERS — Swatantra = Founder, Yuvraj = Co-founder */}
        <section className="border-y border-[var(--line)] bg-[var(--card)] py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="reveal">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Founders</p>
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">Built by operators who ran campaigns before they wrote decks.</h2>
            </div>
            <div className="reveal mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
              {founders.map((f)=>(
                <div key={f.name} className="rounded-3xl border border-[var(--line)] bg-[var(--bg)] p-5">
                  <ImageSlot src={`/founders/${f.file}`} alt={f.name} ratio="portrait" label={`${f.name} photo`} />
                  <div className="mt-5">
                    <div className="text-lg font-semibold">{f.name}</div>
                    <div className="text-xs uppercase tracking-wider text-[var(--muted)]">{f.role}</div>
                    <Quote className="mt-4 h-4 w-4 text-[#00C271]" />
                    <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] italic">"{f.quote}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="border-t border-[var(--line)] bg-[var(--bg)] py-24 sm:py-32">
          <div ref={formRef} className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
            <div className="reveal">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Start here</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Launch your next campus campaign.</h2>
              <p className="mt-4 text-[var(--muted)] leading-relaxed">Tell us your brand, goal, and timeline. We'll come back with a campus strategy path.</p>
              <div className="mt-8 space-y-3 text-sm">
                {['Strategy call within 48 hours','Campaign brief intake','WhatsApp for fast replies'].map(x=>(
                  <p key={x} className="flex items-center gap-2 text-[var(--muted)]"><Check className="h-4 w-4 text-[#00C271]" /> {x}</p>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a href={WA} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium transition hover:border-[var(--ink)]">
                  <MessageCircle className="h-4 w-4 text-[#00C271]" /> WhatsApp
                </a>
                <button onClick={copyEmail} className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium transition hover:border-[var(--ink)]">
                  {copied ? <Check className="h-4 w-4 text-[#00C271]" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'hello@nextgengrowth.in'}
                </button>
              </div>
              <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 text-xs text-[var(--muted)]">
                <div className="font-medium text-[var(--ink)]">Keyboard shortcuts</div>
                <div className="mt-2 space-y-1">
                  <div><kbd className="rounded bg-[var(--bg)] px-1.5 py-0.5 border border-[var(--line)]">/</kbd> focus form</div>
                  <div><kbd className="rounded bg-[var(--bg)] px-1.5 py-0.5 border border-[var(--line)]">Shift + T</kbd> back to top</div>
                  <div><kbd className="rounded bg-[var(--bg)] px-1.5 py-0.5 border border-[var(--line)]">Esc</kbd> close menu</div>
                </div>
              </div>
            </div>

            <form onSubmit={onSubmit} className="reveal rounded-3xl border border-[var(--line)] bg-[var(--card)] p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition ${step >= 1 ? 'bg-[#00C271] text-white' : 'bg-[var(--bg)] text-[var(--muted)]'}`}>1</div>
                  <span className="text-xs font-medium">About you</span>
                </div>
                <div className={`h-px flex-1 transition ${step >= 2 ? 'bg-[#00C271]' : 'bg-[var(--line)]'}`} />
                <div className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition ${step >= 2 ? 'bg-[#00C271] text-white' : 'bg-[var(--bg)] text-[var(--muted)]'}`}>2</div>
                  <span className="text-xs font-medium">Your goal</span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field id="field-fullName" label="Full name" name="fullName" value={form.fullName} onChange={onChange} required />
                      <Field label="Work email" name="email" type="email" value={form.email} onChange={onChange} required />
                      <Field label="Phone / WhatsApp" name="phone" value={form.phone} onChange={onChange} required />
                      <Field label="Company / Brand" name="company" value={form.company} onChange={onChange} required />
                    </div>
                    <button type="button" onClick={nextStep} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0B1220] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-black">
                      Continue <ArrowRight className="h-4 w-4" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                    <label className="block text-sm">
                      <span className="mb-1.5 block font-medium">Primary goal</span>
                      <select name="goal" value={form.goal} onChange={onChange} className="w-full rounded-xl border border-[var(--line)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none transition focus:border-[#00C271]">
                        <option>Campus Ambassadors</option>
                        <option>UGC / Content</option>
                        <option>Product Sampling</option>
                        <option>On-ground Activation</option>
                        <option>Full-funnel campus program</option>
                        <option>Not sure yet</option>
                      </select>
                    </label>
                    <label className="mt-4 block text-sm">
                      <span className="mb-1.5 block font-medium">Message / brief</span>
                      <textarea name="message" rows={4} value={form.message} onChange={onChange} className="w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none transition focus:border-[#00C271]" placeholder="Cities, campuses, timeline, rough budget…" />
                    </label>
                    <div className="mt-6 flex gap-3">
                      <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--card)] px-5 py-3.5 text-sm font-semibold transition hover:border-[var(--ink)]">
                        <ChevronLeft className="h-4 w-4" /> Back
                      </button>
                      <button type="submit" disabled={status==='loading'} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#00C271] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#00b068] disabled:opacity-60">
                        {status==='loading'?(<><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Sending…</>):(<>Launch Campus Campaign <ArrowRight className="h-4 w-4" /></>)}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {status==='loading' && (<div className="mt-4 space-y-2"><div className="skeleton h-3 rounded" /><div className="skeleton h-3 w-2/3 rounded" /></div>)}
              {status==='success' && (<div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800"><div className="flex items-center gap-2 font-medium"><Check className="h-4 w-4" /> Received.</div><div className="mt-1 text-emerald-700">Our campus team will reach out shortly.</div></div>)}
              {status==='error' && (<div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">Something went wrong. Try WhatsApp or email.</div>)}
            </form>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-[var(--line)] bg-[var(--card)] py-24 sm:py-32">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="reveal">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">FAQ</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Questions brands ask.</h2>
            </div>
            <div className="mt-10 space-y-3">
              {faqs.map((f,i)=>(<FAQItem key={i} q={f.q} a={f.a} />))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bg-[var(--bg)] pb-24 pt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="reveal rounded-3xl bg-[#0B1220] px-8 py-14 text-center text-white sm:px-16 sm:py-20">
              <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">Your next 10,000 Gen-Z conversations won't come from another ad account.</h2>
              <p className="mx-auto mt-4 max-w-xl text-white/60">They'll come from campuses — if you show up the right way.</p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a href="#contact" className="rounded-full bg-[#00C271] px-7 py-3.5 text-sm font-semibold text-white hover:bg-[#00b068]">Book Campus Strategy Call</a>
                <a href="#contact" className="rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/5">Launch Campus Campaign</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--line)] bg-[var(--card)] py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="h-8 w-8 rounded-full" />
            <div>
              <div className="text-sm font-semibold">NextGenGrowth</div>
              <div className="text-xs text-[var(--muted)]">Where skills meet opportunity</div>
            </div>
          </div>
          <p className="text-xs text-[var(--muted)]">© {new Date().getFullYear()} NextGenGrowth · Campus Marketing</p>
        </div>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[var(--card)]/95 p-3 backdrop-blur md:hidden">
        <div className="flex gap-2">
          <a href="#contact" className="flex-1 rounded-full bg-[#00C271] py-3 text-center text-sm font-semibold text-white">Book call</a>
          <a href={WA} className="flex-1 rounded-full border border-[var(--line)] py-3 text-center text-sm font-semibold">WhatsApp</a>
        </div>
      </div>

      <AnimatePresence>
        {showTop && (
          <motion.button initial={{opacity:0,scale:0.5}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.5}} onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} className="fixed bottom-24 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[#0B1220] text-white shadow-xl transition hover:scale-110 md:bottom-6" aria-label="Back to top">
            <ArrowUp className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>

      <Toast show={toast.show} msg={toast.msg} type={toast.type} />
    </div>
  )
}

function Field({ id, label, name, value, onChange, type='text', required }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium">{label}</span>
      <input id={id} type={type} name={name} value={value} onChange={onChange} required={required} className="w-full rounded-xl border border-[var(--line)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none transition focus:border-[#00C271]" />
    </label>
  )
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="reveal overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg)]">
      <button onClick={()=>setOpen(!open)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium transition hover:bg-[var(--card)] sm:px-6">
        <span>{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--muted)] transition-transform ${open?'rotate-180':''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.25}} className="overflow-hidden">
            <p className="px-5 pb-5 text-sm leading-relaxed text-[var(--muted)] sm:px-6">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
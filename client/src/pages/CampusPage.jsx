import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import {
  ArrowRight, Menu, X, MessageCircle, Copy, Check,
  Target, Users, Video, BarChart3, Sparkles, Shield,
  Workflow, ChevronDown, ArrowUp, Zap, Play, Award, Quote,
  ChevronLeft, Radar, ScanLine, Radio, Sun, Moon, ExternalLink,
} from 'lucide-react'

/* ================= DATA ================= */
const services = [
  { icon: Users, title: 'Campus Ambassador Programs', desc: 'Recruit, train, and manage student brand leads inside colleges.', cat: 'Reach' },
  { icon: Video, title: 'UGC & Content Campaigns', desc: 'Authentic reels, reviews, and campus stories that feel native.', cat: 'Create' },
  { icon: Sparkles, title: 'Student Influencer Marketing', desc: 'Micro and nano creators with real peer audiences.', cat: 'Create' },
  { icon: Radar, title: 'On-Ground Activations', desc: 'Fests, pop-ups, sports meets, sanctioned campus events.', cat: 'Activate' },
  { icon: Zap, title: 'Product Sampling', desc: 'Hostels, canteens, peer-led trials with verified feedback.', cat: 'Activate' },
  { icon: Target, title: 'College Outreach', desc: 'Right campuses, right cities, right student mix.', cat: 'Reach' },
  { icon: Radio, title: 'Community Marketing', desc: 'Clubs, E-Cells, WhatsApp and student networks.', cat: 'Reach' },
  { icon: ScanLine, title: 'QR Feedback & Reporting', desc: 'Scans, sentiment, proof of work — not fake screenshots.', cat: 'Measure' },
  { icon: Workflow, title: 'End-to-End Management', desc: 'Strategy, execution, reporting under one roof.', cat: 'Measure' },
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

const founders = [
  {
    name: 'Swatantra Shukla',
    role: 'Founder',
    file: 'swatantra.jpg',
    quote: 'We are not building an agency. We are building the operating system that runs Gen-Z marketing in India.',
    bio: 'Leads strategy, campus partnerships, and brand growth. Believes students are infrastructure — not free labour.',
    linkedin: 'http://linkedin.com/in/swatantra-shukla-aaa2a82bb',
  },
  {
    name: 'Yuvraj Singh',
    role: 'Co-founder',
    file: 'yuvraj.jpg',
    quote: "Students are the ecosystem. When you build with them, the brand doesn't just reach campus — it belongs there.",
    bio: 'Owns execution systems, ambassador ops, and on-ground quality. Turns campus chaos into clean delivery.',
    linkedin: 'http://linkedin.com/in/yuvraj-singh-483746327',
  },
]

const cases = [
  {
    id: 'chakde',
    name: 'ChakDeBharat',
    tags: ['Sports', 'Ambassadors', 'On-ground', 'UGC'],
    desc: '6-university deployment across Noida & Uttarakhand: 70+ campus ambassadors, live sports activations, community building, social + podcast ops.',
    image: '/brands/chakdebharat.png',
    ran: ['Ambassador recruitment', 'Campus event execution', 'Social management', 'Podcast production'],
    outcomes: ['70+ ambassadors', '6 universities', 'Self-sustaining communities', 'Retained partnership'],
    panel: 'graph',
    bars: [
      { x: 20, h: 90, l: 'NIET' },
      { x: 65, h: 130, l: 'GL Bajaj' },
      { x: 110, h: 75, l: 'NIU' },
      { x: 155, h: 145, l: 'Quantum' },
      { x: 200, h: 110, l: 'Haridwar' },
      { x: 245, h: 100, l: 'RIT' },
    ],
    stats: [['450K+', 'Views'], ['7.2%', 'ER'], ['1.4K', 'QR']],
  },
  {
    id: 'belgium',
    name: 'Belgium Waffle',
    tags: ['F&B', 'Ambassadors', 'Delhi-NCR', 'Store visits'],
    desc: 'Ambassador-led brand awareness across Delhi-NCR colleges. Where in-campus activations were restricted, we routed students from campus communities to store locations — turning permission limits into footfall.',
    image: '/brands/belgiumwaffle.png',
    ran: [
      '40–50 campus ambassadors targeted',
      'Amity, Galgotias, GL Bajaj, NIET, DU cluster seeding',
      'Store-visit push when campus entry was blocked',
      'Student perks: free waffles, PR kits, certificates',
    ],
    outcomes: [
      'Multi-college NCR coverage',
      'Campus → store movement strategy',
      'Peer-led awareness loops',
      'Permission-aware execution playbook',
    ],
    panel: 'map',
    mapPins: [
      { name: 'Amity', x: 72, y: 38, n: '12' },
      { name: 'Galgotias', x: 78, y: 52, n: '10' },
      { name: 'GL Bajaj', x: 70, y: 58, n: '9' },
      { name: 'NIET', x: 74, y: 64, n: '8' },
      { name: 'DU cluster', x: 48, y: 32, n: '11' },
      { name: 'Store hubs', x: 55, y: 48, n: '→' },
    ],
    highlights: [
      { v: '5', l: 'College clusters' },
      { v: '40–50', l: 'Ambassadors' },
      { v: 'NCR', l: 'Primary market' },
      { v: 'Store', l: 'Visit strategy' },
    ],
  },
]

const SOLUTION_QUOTE = 'We help students turn their skills into real-world experience.'

/* ================= HOOKS ================= */
function useScrollFade() {
  useEffect(() => {
    const els = document.querySelectorAll('.scroll-fade, .draw-line, .timeline-line, .shake-once, .quote-pulse')
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in')
          e.target.classList.remove('out')
        } else if (e.target.classList.contains('scroll-fade')) {
          e.target.classList.remove('in')
          e.target.classList.add('out')
        }
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function useCounter(target, duration = 1600, start = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let raf, t0
    const n = parseInt(String(target).replace(/[^0-9]/g, ''), 10) || 0
    const step = (t) => {
      if (!t0) t0 = t
      const p = Math.min((t - t0) / duration, 1)
      setValue(Math.floor((1 - Math.pow(1 - p, 3)) * n))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, start])
  return `${value.toLocaleString()}${String(target).replace(/[0-9,]/g, '')}`
}

function CountUp({ value, className, onDone }) {
  const ref = useRef(null)
  const [start, setStart] = useState(false)
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setStart(true), { threshold: 0.4 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  const display = useCounter(value, 1600, start)
  useEffect(() => {
    if (!start || done) return
    const t = setTimeout(() => {
      setDone(true)
      onDone?.()
    }, 1700)
    return () => clearTimeout(t)
  }, [start, done, onDone])
  return <span ref={ref} className={className}>{display}</span>
}

function MagneticButton({ children, className, href }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 280, damping: 20 })
  const sy = useSpring(y, { stiffness: 280, damping: 20 })

  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    if (Math.hypot(dx, dy) < 80) {
      x.set(dx * 0.18)
      y.set(dy * 0.18)
    }
  }
  const onLeave = () => { x.set(0); y.set(0) }

  return (
    <motion.a ref={ref} href={href} style={{ x: sx, y: sy }} onMouseMove={onMove} onMouseLeave={onLeave} className={className}>
      {children}
    </motion.a>
  )
}

function Typewriter({ text, className, speed = 22 }) {
  const [out, setOut] = useState('')
  const [started, setStarted] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setStarted(true), { threshold: 0.5 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (!started) return
    let i = 0
    const t = setInterval(() => {
      i++
      setOut(text.slice(0, i))
      if (i >= text.length) clearInterval(t)
    }, speed)
    return () => clearInterval(t)
  }, [started, text, speed])
  return (
    <p ref={ref} className={className}>
      {out}
      <span className="animate-pulse text-[#00C271]">|</span>
    </p>
  )
}

function ImageSlot({ src, alt, ratio = 'square', label }) {
  const [errored, setErrored] = useState(false)
  const ratioClass = ratio === 'square' ? 'aspect-square' : ratio === 'portrait' ? 'aspect-[3/4]' : 'aspect-video'
  return (
    <div className={`group relative ${ratioClass} overflow-hidden rounded-2xl bg-[#0B1220]`}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#00C271]/25 via-transparent to-[#0B1220]" />
      {src && !errored && (
        <img
          src={src}
          alt={alt}
          onError={() => setErrored(true)}
          className="relative z-10 h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
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

function Toast({ show, msg, type }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className={`fixed bottom-24 right-4 z-[100] flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium shadow-2xl md:bottom-6 ${
            type === 'success' ? 'bg-[#0B1220] text-white' : 'bg-red-600 text-white'
          }`}
        >
          {type === 'success' ? <Check className="h-4 w-4 text-[#00C271]" /> : <X className="h-4 w-4" />}
          {msg}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function RotatingWord({ words }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % words.length), 2400)
    return () => clearInterval(t)
  }, [words.length])
  return (
    <span className="relative inline-block">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[idx]}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="inline-block"
        >
          {words[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function FoundersVideo({ src = '', poster = '' }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    document.body.classList.add('modal-open')
    const k = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', k)
    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', k)
    }
  }, [open])

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="group relative aspect-video cursor-pointer overflow-hidden rounded-2xl border border-[var(--line)] bg-[#0B1220] transition hover:border-[#00C271]/50"
      >
        {src ? (
          <video src={src} poster={poster || undefined} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#0B1220] via-[#00C271]/25 to-[#0B1220] text-white/70">
            <Users className="h-10 w-10 text-[#00C271]" />
            <div className="text-xs uppercase tracking-[0.3em]">Founders</div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00C271] live-pulse" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">Founders</span>
        </div>
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <div className="text-lg font-semibold text-white">Meet the Founders</div>
          <div className="text-xs text-white/70">Why we built NGG</div>
        </div>
        <div className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 group-hover:border-[#00C271] group-hover:bg-[#00C271]">
          <Play className="h-4 w-4 fill-white text-white" />
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#0B1220]"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="aspect-video bg-black">
                {src ? (
                  <video src={src} poster={poster || undefined} controls autoPlay playsInline className="h-full w-full" />
                ) : (
                  <div className="flex h-full items-center justify-center p-8 text-center text-white">
                    <div>
                      <div className="text-xs uppercase tracking-[0.3em] text-[#00C271]">Founders</div>
                      <div className="mt-2 text-3xl font-semibold">Meet the Founders</div>
                      <div className="mt-2 text-white/60">Add file at public/videos/founders.mp4</div>
                    </div>
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

function Field({ id, label, name, value, onChange, type = 'text', required }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium">{label}</span>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-xl border border-[var(--line)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none focus:border-[#00C271]"
      />
    </label>
  )
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="scroll-fade overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--bg)]">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium">
        <span>{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="px-5 pb-5 text-sm text-[var(--muted)]">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ================= APP ================= */
export default function App() {
  useScrollFade()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showTop, setShowTop] = useState(false)
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' })
  const [activeSection, setActiveSection] = useState('')
  const [activeCase, setActiveCase] = useState('chakde')
  const [step, setStep] = useState(1)
  const [dark, setDark] = useState(false)
  const [showGrowing, setShowGrowing] = useState(false)
  const [svcFilter, setSvcFilter] = useState('All')
  const [activePhase, setActivePhase] = useState(0)
  const formRef = useRef(null)
  const { scrollYProgress } = useScroll()
  const workParallax = useTransform(scrollYProgress, [0.45, 0.7], [0, -40])

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    goal: 'Campus Ambassadors',
    message: '',
  })
  const [status, setStatus] = useState('idle')

  const formProgress = useMemo(() => {
    const fields =
      step === 1
        ? [form.fullName, form.email, form.phone, form.company]
        : [form.fullName, form.email, form.phone, form.company, form.goal, form.message]
    const filled = fields.filter((v) => String(v || '').trim().length > 0).length
    return Math.round((filled / fields.length) * 100)
  }, [form, step])

  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12)
      setShowTop(window.scrollY > 800)
      const sections = ['services', 'process', 'work', 'faq']
      let current = ''
      for (const id of sections) {
        const el = document.getElementById(id)
        if (el) {
          const r = el.getBoundingClientRect()
          if (r.top <= 100 && r.bottom >= 100) current = id
        }
      }
      setActiveSection(current)

      const process = document.getElementById('process')
      if (process) {
        const items = process.querySelectorAll('[data-phase]')
        if (items.length) {
          let idx = 0
          let best = Infinity
          items.forEach((el, i) => {
            const r = el.getBoundingClientRect()
            const dist = Math.abs(r.top - window.innerHeight * 0.4)
            if (r.top < window.innerHeight * 0.75 && dist < best) {
              best = dist
              idx = i
            }
          })
          setActivePhase(idx)
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
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

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const nextStep = () => {
    if (!form.fullName || !form.email || !form.phone || !form.company) {
      setToast({ show: true, msg: 'Please fill all fields first.', type: 'error' })
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500)
      return
    }
    setStep(2)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      await new Promise((r) => setTimeout(r, 900))
      setStatus('success')
      setToast({ show: true, msg: "Lead received — we'll be in touch.", type: 'success' })
      setForm({ fullName: '', email: '', phone: '', company: '', goal: 'Campus Ambassadors', message: '' })
      setStep(1)
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 3500)
    } catch {
      setStatus('error')
    }
  }

  const copyEmail = async () => {
    await navigator.clipboard.writeText('hello@nextgengrowth.in')
    setCopied(true)
    setToast({ show: true, msg: 'Email copied.', type: 'success' })
    setTimeout(() => { setCopied(false); setToast((t) => ({ ...t, show: false })) }, 2000)
  }

  const WA = 'https://wa.me/919532792303'
  const currentCase = useMemo(() => cases.find((c) => c.id === activeCase), [activeCase])
  const filteredServices = svcFilter === 'All' ? services : services.filter((s) => s.cat === svcFilter)
  const navItems = [
    { href: '#services', label: 'Services', id: 'services' },
    { href: '#process', label: 'Process', id: 'process' },
    { href: '#work', label: 'Work', id: 'work' },
    { href: '#faq', label: 'FAQ', id: 'faq' },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <a href="#main" className="skip-link">Skip to content</a>
      <motion.div style={{ scaleX: scrollYProgress }} className="fixed left-0 right-0 top-0 z-[60] h-[2px] origin-left bg-[#00C271]" />

      {/* HEADER */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-[var(--line)] bg-[var(--bg)]/95 shadow-sm backdrop-blur-md' : 'bg-[var(--bg)]/80 backdrop-blur-sm'}`}>
        <div className="mx-auto flex h-[64px] max-w-7xl items-center justify-between gap-3 px-4 sm:h-[72px] sm:px-6">
          <a href="#" className="flex shrink-0 items-center gap-2.5">
            <img src="/logo.png" alt="NextGenGrowth" className="h-9 w-9 rounded-full object-cover" />
            <div className="hidden leading-tight sm:block">
              <div className="text-sm font-semibold">NextGenGrowth</div>
              <div className="text-[10px] text-[var(--muted)]">Campus Marketing</div>
            </div>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((n) => (
              <a key={n.href} href={n.href} className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${activeSection === n.id ? 'bg-[#00C271]/10 text-[var(--ink)]' : 'text-[var(--muted)] hover:text-[var(--ink)]'}`}>
                {n.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <button type="button" onClick={() => setDark((d) => !d)} className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--card)] text-[var(--muted)]" aria-label="Toggle theme">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <a href={WA} target="_blank" rel="noreferrer" className="px-2 text-sm text-[var(--muted)]">WhatsApp</a>
            <a href="#contact" className="inline-flex items-center gap-2 rounded-full bg-[#0B1220] px-4 py-2.5 text-sm font-medium text-white">
              Book a call <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button type="button" onClick={() => setDark((d) => !d)} className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--card)]">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--card)]" aria-label="Menu">
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-[var(--line)] bg-[var(--bg)] md:hidden">
              <div className="flex flex-col gap-1 px-4 py-3">
                {navItems.map((n) => (
                  <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium">{n.label}</a>
                ))}
                <a href="#contact" onClick={() => setMenuOpen(false)} className="mt-1 rounded-lg bg-[#0B1220] px-3 py-2.5 text-center text-sm font-medium text-white">Book a call</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="h-[64px] sm:h-[72px]" aria-hidden />

      <main id="main">
        {/* HERO */}
        <section className="relative overflow-hidden pb-16 pt-10 sm:pb-24 sm:pt-14">
          {[
            { t: '12%', l: '8%', s: 6, d: '0s' },
            { t: '28%', l: '88%', s: 4, d: '1s' },
            { t: '62%', l: '12%', s: 5, d: '2s' },
            { t: '74%', l: '78%', s: 3, d: '0.5s' },
            { t: '40%', l: '50%', s: 4, d: '1.5s' },
            { t: '18%', l: '42%', s: 3, d: '2.5s' },
          ].map((p, i) => (
            <span key={i} className="particle hidden sm:block" style={{ top: p.t, left: p.l, width: p.s, height: p.s, animationDelay: p.d }} />
          ))}

          <div className="pointer-events-none absolute -top-40 right-0 h-[420px] w-[420px] rounded-full bg-[#00C271]/8 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                  className="text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl lg:leading-[1.05]"
                >
                  Reach Gen-Z<br />where they<br />
                  <span className="green-shimmer">
                    <RotatingWord words={['actually live.', 'actually trust.', 'actually buy.', 'actually talk.']} />
                  </span>
                </motion.h1>

                <Typewriter
                  text="End-to-end campus ambassadors, UGC, sampling, and on-ground activations — one OS, not five vendors."
                  className="mt-6 min-h-[3.5rem] max-w-xl text-lg leading-relaxed text-[var(--muted)]"
                />

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <MagneticButton href="#contact" className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#00C271] px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-[#00C271]/20 hover:bg-[#00b068]">
                    Book Campus Strategy Call <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </MagneticButton>
                  <MagneticButton href="#work" className="inline-flex items-center gap-2 text-sm font-semibold">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B1220] text-white">
                      <Play className="h-3.5 w-3.5 fill-white" />
                    </span>
                    See our work
                  </MagneticButton>
                </div>

                <div className="mt-10 max-w-lg">
                  <FoundersVideo src="/videos/founders.mp4" />
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="col-span-2 rounded-3xl border border-[var(--line)] bg-[var(--card)] p-6 sm:p-7">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <CountUp value="100+" className="text-5xl font-semibold sm:text-6xl" onDone={() => setShowGrowing(true)} />
                      <span className="text-sm text-[var(--muted)]">campus network</span>
                    </div>
                    <AnimatePresence>
                      {showGrowing && (
                        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-xs font-medium text-[#00C271]">and growing</motion.p>
                      )}
                    </AnimatePresence>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                      Students across <span className="font-medium text-[var(--ink)]">100+ colleges</span> have already agreed to join as campus ambassadors — ready when your brand launches.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                      <span className="rounded-full bg-[var(--bg)] px-2.5 py-1 text-[var(--muted)]">Network size</span>
                      <span className="rounded-full bg-[#00C271]/10 px-2.5 py-1 text-[#007A47]">Not a single-campaign count</span>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-[#0B1220] p-6 text-white">
                    <CountUp value="70+" className="text-4xl font-semibold" />
                    <div className="mt-2 text-[11px] uppercase tracking-wider text-white/60">Ambassadors<br />deployed</div>
                    <div className="mt-3 text-[10px] text-white/40">In flagship runs</div>
                  </div>

                  <div className="rounded-3xl bg-[#00C271] p-6 text-white">
                    <CountUp value="100+" className="text-4xl font-semibold" />
                    <div className="mt-2 text-[11px] uppercase tracking-wider text-white/85">Projects<br />delivered</div>
                    <div className="mt-3 text-[10px] text-white/70">Company lifetime</div>
                  </div>

                  <div className="col-span-2 flex items-center justify-between rounded-3xl border border-[var(--line)] bg-[var(--card)] p-5">
                    <div>
                      <div className="text-sm font-semibold">Pan-India network</div>
                      <div className="text-xs text-[var(--muted)]">Ready ambassadors · Tier 1–3</div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-[var(--bg)] px-3 py-1.5 text-xs font-medium">
                      <span className="live-pulse h-1.5 w-1.5 rounded-full bg-[#00C271]" /> Active
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-3 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 sm:grid-cols-4 sm:p-6">
              {[
                ['5+', 'States covered'],
                ['20+', 'Team members'],
                ['₹1L', 'University grant'],
                ['6', 'Unis in flagship run'],
              ].map(([v, l]) => (
                <div key={l} className="border-r border-[var(--line)] px-2 last:border-none sm:px-4">
                  <CountUp value={v} className="text-2xl font-semibold" />
                  <div className="text-xs text-[var(--muted)]">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COLLEGE MARQUEE */}
        <section className="overflow-hidden border-y border-[var(--line)] bg-[var(--card)] py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="scroll-fade">
              <h2 className="text-2xl font-semibold sm:text-3xl">
                <span className="text-[#00C271]">100+</span> colleges in the ambassador network
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
                Students at these campuses have already opted in as ambassadors — brands plug into a ready network.
              </p>
            </div>
          </div>
          <div className="relative mt-10">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[var(--card)] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[var(--card)] to-transparent" />
            <div className="marquee-track flex w-max gap-4">
              {[...colleges, ...colleges].map((c, i) => (
                <div key={`a-${i}`} className="group flex h-20 w-36 shrink-0 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3 transition hover:border-[#00C271]/50 hover:bg-[var(--card)]">
                  <img
                    src={`/colleges/${c.file}`}
                    alt={c.name}
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block' }}
                    className="max-h-12 max-w-full object-contain grayscale opacity-70 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105"
                  />
                  <span className="hidden text-center text-xs font-semibold">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative mt-3">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[var(--card)] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[var(--card)] to-transparent" />
            <div className="marquee-track-reverse flex w-max gap-4">
              {[...colleges].reverse().concat([...colleges].reverse()).map((c, i) => (
                <div key={`b-${i}`} className="group flex h-20 w-36 shrink-0 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3 transition hover:border-[#00C271]/50 hover:bg-[var(--card)]">
                  <img
                    src={`/colleges/${c.file}`}
                    alt={c.name}
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block' }}
                    className="max-h-12 max-w-full object-contain grayscale opacity-70 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105"
                  />
                  <span className="hidden text-center text-xs font-semibold">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROBLEM */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="scroll-fade">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">The problem</p>
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold sm:text-5xl">Traditional marketing dies at the college gate.</h2>
            </div>

            <div className="scroll-fade mt-12 rounded-3xl border border-[var(--line)] bg-[var(--card)] p-6 sm:p-10">
              <div className="grid gap-0 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
                <div className="shake-once rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B1220] text-white"><Target className="h-4 w-4" /></div>
                  <div className="mt-3 text-xs font-medium text-[var(--muted)]">Step 01</div>
                  <h3 className="mt-1 text-lg font-semibold">Brand runs ad</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">Digital spend on Meta / YouTube targeted at Gen-Z.</p>
                </div>

                <div className="hidden items-center justify-center px-2 md:flex" aria-hidden>
                  <div className="flex items-center">
                    <div className="h-[2px] w-8 bg-[#00C271] md:w-10 lg:w-14" />
                    <div className="h-0 w-0 border-y-[5px] border-y-transparent border-l-[8px] border-l-[#00C271]" />
                  </div>
                </div>
                <div className="flex justify-center py-3 md:hidden" aria-hidden>
                  <div className="flex flex-col items-center">
                    <div className="h-6 w-[2px] bg-[#00C271]" />
                    <div className="h-0 w-0 border-x-[5px] border-x-transparent border-t-[8px] border-t-[#00C271]" />
                  </div>
                </div>

                <div className="shake-once rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--card)] text-[var(--ink)]"><Shield className="h-4 w-4" /></div>
                  <div className="mt-3 text-xs font-medium text-[var(--muted)]">Step 02</div>
                  <h3 className="mt-1 text-lg font-semibold">Student scrolls past</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">No peer trust. Feels like every other ad.</p>
                </div>

                <div className="hidden items-center justify-center px-2 md:flex" aria-hidden>
                  <div className="flex items-center">
                    <div className="h-[2px] w-8 bg-[#00C271] md:w-10 lg:w-14" />
                    <div className="h-0 w-0 border-y-[5px] border-y-transparent border-l-[8px] border-l-[#00C271]" />
                  </div>
                </div>
                <div className="flex justify-center py-3 md:hidden" aria-hidden>
                  <div className="flex flex-col items-center">
                    <div className="h-6 w-[2px] bg-[#00C271]" />
                    <div className="h-0 w-0 border-x-[5px] border-x-transparent border-t-[8px] border-t-[#00C271]" />
                  </div>
                </div>

                <div className="shake-once rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600"><X className="h-4 w-4" /></div>
                  <div className="mt-3 text-xs font-medium text-[var(--muted)]">Step 03</div>
                  <h3 className="mt-1 text-lg font-semibold">Zero cultural lift</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">No campus conversation. Spend wasted.</p>
                </div>
              </div>

              <div className="mt-8 flex items-start gap-3 rounded-2xl bg-[#0B1220] p-5 text-white">
                <Zap className="mt-0.5 h-5 w-5 shrink-0 text-[#00C271]" />
                <p className="text-sm"><span className="font-semibold">The fix:</span> activate students who already opted in — cultural adoption + verified proof.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SOLUTION */}
        <section className="border-y border-[var(--line)] bg-[#0B1220] py-20 text-white sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="scroll-fade">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#00C271]">Our model</p>
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold sm:text-5xl">With students. Not to students.</h2>
              <p className="mt-5 max-w-2xl text-white/70">A student-powered execution layer — ambassadors, creators, influencers, on-ground leads — managed as one system.</p>
              <div className="quote-pulse mt-10 max-w-3xl border-l-2 border-[#00C271] pl-6">
                <Typewriter text={`“${SOLUTION_QUOTE}”`} className="min-h-[3rem] text-xl font-medium text-white/95 sm:text-2xl" speed={28} />
                <footer className="mt-3 text-sm text-white/50">Never portray students as free labour.</footer>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="scroll-fade max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Services</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Full-stack campus marketing.</h2>
              <p className="mt-3 text-sm text-[var(--muted)]">One partner. Filter by funnel stage — descriptions always visible.</p>
            </div>

            <div className="scroll-fade mt-8 flex flex-wrap gap-2">
              {['All', 'Reach', 'Create', 'Activate', 'Measure'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSvcFilter(c)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    svcFilter === c
                      ? 'border-[#00C271] bg-[#00C271] text-white shadow-sm'
                      : 'border-[var(--line)] bg-[var(--card)] text-[var(--muted)] hover:border-[#00C271]/40 hover:text-[var(--ink)]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <p className="mt-4 text-xs text-[var(--muted)]">
              Showing <span className="font-semibold text-[var(--ink)]">{filteredServices.length}</span> service{filteredServices.length === 1 ? '' : 's'}
              {svcFilter !== 'All' ? ` in “${svcFilter}”` : ''}
            </p>

            <div className="mt-8 grid min-h-[280px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredServices.map((s) => (
                  <motion.div
                    key={s.title}
                    layout
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    className="group rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 transition hover:border-[#00C271]/40 hover:shadow-[0_12px_40px_-16px_rgba(0,194,113,0.25)]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--bg)] text-[var(--ink)] transition group-hover:bg-[#00C271] group-hover:text-white">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <div className="mt-3">
                      <span className="rounded-full bg-[var(--bg)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--muted)]">
                        {s.cat}
                      </span>
                    </div>
                    <h3 className="mt-3 font-semibold tracking-tight">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{s.desc}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredServices.length === 0 && (
              <div className="mt-8 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--bg)] p-10 text-center text-sm text-[var(--muted)]">
                No services in this filter.
              </div>
            )}
          </div>
        </section>

        {/* PROCESS */}
        <section id="process" className="border-y border-[var(--line)] bg-[var(--card)] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Process</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">A system. Not a hustle.</h2>
              <p className="mt-4 max-w-xl text-sm text-[var(--muted)]">
                Five clear stages from brief to verified reporting — no chaos, no screenshot theatre.
              </p>
            </motion.div>

            <div className="relative mt-14">
              <div className="absolute bottom-4 left-5 top-4 hidden w-px bg-[var(--line)] md:block" aria-hidden />
              <motion.div
                className="absolute left-5 top-4 hidden w-px origin-top bg-[#00C271] md:block"
                style={{ height: 'calc(100% - 2rem)' }}
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                aria-hidden
              />

              <div className="space-y-4">
                {phases.map((p, i) => {
                  const active = activePhase === i
                  return (
                    <motion.div
                      key={p.n}
                      data-phase={i}
                      initial={{ opacity: 0, x: -18 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      className={`relative flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6 ${
                        active
                          ? 'border-[#00C271]/45 bg-[#00C271]/[0.06] shadow-[0_12px_40px_-20px_rgba(0,194,113,0.35)]'
                          : 'border-[var(--line)] bg-[var(--bg)]'
                      }`}
                      style={{ transition: 'border-color 0.35s ease, background 0.35s ease, box-shadow 0.35s ease' }}
                    >
                      <motion.div
                        className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                          active ? 'bg-[#00C271] text-white shadow-lg shadow-[#00C271]/30' : 'border border-[var(--line)] bg-[var(--card)] text-[#00C271]'
                        }`}
                        animate={active ? { scale: 1.06 } : { scale: 1 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                      >
                        {p.n}
                      </motion.div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold tracking-tight">{p.t}</h3>
                          {active && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="rounded-full bg-[#00C271]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#007A47]"
                            >
                              Current
                            </motion.span>
                          )}
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{p.d}</p>
                      </div>

                      <div className="hidden text-right text-[11px] text-[var(--muted)] sm:block">
                        Step {i + 1} / {phases.length}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-10 max-w-2xl text-sm italic text-[var(--muted)]"
            >
              “Operational excellence is invisible. Students get a seamless experience; clients get verified metrics.”
            </motion.p>
          </div>
        </section>

        {/* WORK */}
        <section id="work" className="bg-[#0B1220] py-20 text-white sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="scroll-fade">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#00C271]">Selected work</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">Executed campaigns. Verified proof.</h2>
              <p className="mt-4 max-w-xl text-white/60">Separate from the 100+ college ambassador network.</p>
            </div>

            <div className="scroll-fade mt-12 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {[
                ['6', 'Campuses run', 'Flagship multi-uni'],
                ['70+', 'Ambassadors live', 'Single program'],
                ['25+', 'UGC assets', 'Reels & stories'],
                ['450K+', 'Impressions', 'Verified reach'],
                ['2,000', 'Samples', 'Product trials'],
                ['1,400+', 'QR scans', 'Real feedback'],
              ].map(([v, l, back]) => (
                <div key={l} className="flip-card h-28">
                  <div className="flip-inner h-full">
                    <div className="flip-face flip-front flex-col rounded-2xl border border-white/10 bg-white/5 px-3 py-4 text-center">
                      <div className="text-2xl font-semibold">{v}</div>
                      <div className="mt-1 text-[10px] uppercase tracking-wider text-white/50">{l}</div>
                    </div>
                    <div className="flip-face flip-back rounded-2xl border border-[#00C271]/40 bg-[#00C271]/10 p-3 text-center">
                      <p className="text-[11px] text-white/90">{back}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="scroll-fade mt-10">
              <div className="flex flex-wrap gap-2">
                {cases.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveCase(c.id)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      activeCase === c.id
                        ? 'border-[#00C271] bg-[#00C271]/10 text-white'
                        : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentCase.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 grid gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-10 lg:grid-cols-5"
                >
                  <div className="lg:col-span-3">
                    <div className="flex flex-wrap gap-2">
                      {currentCase.tags.map((t) => (
                        <span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70">{t}</span>
                      ))}
                    </div>
                    <h3 className="mt-4 text-3xl font-semibold">{currentCase.name}</h3>
                    <p className="mt-3 leading-relaxed text-white/70">{currentCase.desc}</p>

                    <motion.div style={{ y: workParallax }} className="mt-6">
                      <ImageSlot src={currentCase.image} alt={currentCase.name} ratio="video" label={`${currentCase.name} visual`} />
                    </motion.div>

                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <div className="text-xs uppercase tracking-wider text-white/50">What we ran</div>
                        <ul className="mt-2 space-y-1.5 text-sm">
                          {currentCase.ran.map((r) => (
                            <li key={r} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00C271]" /><span>{r}</span></li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider text-white/50">Outcomes</div>
                        <ul className="mt-2 space-y-1.5 text-sm">
                          {currentCase.outcomes.map((o) => (
                            <li key={o} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00C271]" /><span>{o}</span></li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    {currentCase.panel === 'graph' && (
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
                        <div className="flex items-center justify-between text-xs">
                          <span className="uppercase tracking-wider text-white/50">Campus engagement</span>
                          <span className="text-[#00C271]">Verified</span>
                        </div>
                        <svg viewBox="0 0 300 180" className="mt-4 w-full">
                          {currentCase.bars.map((b) => (
                            <g key={b.l}>
                              <rect x={b.x} y={160 - b.h} width="30" height={b.h} rx="4" fill="#00C271" opacity="0.85" className="grow-bar" />
                              <text x={b.x + 15} y="175" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.5)">{b.l}</text>
                            </g>
                          ))}
                        </svg>
                        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center">
                          {currentCase.stats.map(([v, l]) => (
                            <div key={l}>
                              <div className="text-lg font-semibold">{v}</div>
                              <div className="text-[10px] uppercase text-white/50">{l}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentCase.panel === 'map' && (
                      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-5 sm:p-6">
                        <div className="flex items-center justify-between text-xs">
                          <span className="uppercase tracking-wider text-white/50">Delhi-NCR footprint</span>
                          <span className="text-[#00C271]">Sample map</span>
                        </div>

                        <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#0B1220] via-[#102018] to-[#0B1220]">
                          <div className="absolute left-[18%] top-[18%] h-28 w-28 rounded-full bg-[#00C271]/10 blur-2xl" />
                          <div className="absolute bottom-[20%] right-[14%] h-32 w-32 rounded-full bg-[#00C271]/15 blur-2xl" />

                          <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M20 30 C35 28, 45 40, 55 48 S75 55, 82 62" stroke="#00C271" strokeWidth="0.6" fill="none" strokeDasharray="2 2" />
                            <path d="M48 22 C52 35, 58 42, 70 58" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" fill="none" />
                            <path d="M40 70 C55 60, 65 55, 78 48" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" fill="none" />
                          </svg>

                          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                              <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                                <path d="M0,0 L6,3 L0,6 Z" fill="#00C271" />
                              </marker>
                            </defs>
                            <path d="M72 38 C68 44, 62 46, 55 48" stroke="#00C271" strokeWidth="0.9" fill="none" markerEnd="url(#arrow)" opacity="0.9" />
                          </svg>

                          {currentCase.mapPins?.map((pin) => (
                            <div
                              key={pin.name}
                              className="absolute -translate-x-1/2 -translate-y-1/2"
                              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                            >
                              <div className="flex flex-col items-center">
                                <div
                                  className={`flex h-8 min-w-8 items-center justify-center rounded-full border px-2 text-[10px] font-bold shadow-lg ${
                                    pin.name === 'Store hubs'
                                      ? 'border-[#00C271] bg-[#00C271] text-white'
                                      : 'border-white/20 bg-[#0B1220] text-white'
                                  }`}
                                >
                                  {pin.n}
                                </div>
                                <div className="mt-1 whitespace-nowrap rounded-full bg-black/50 px-2 py-0.5 text-[9px] text-white/80 backdrop-blur-sm">
                                  {pin.name}
                                </div>
                              </div>
                            </div>
                          ))}

                          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
                            <span className="rounded-full border border-white/10 bg-black/40 px-2 py-1 text-[10px] text-white/70">● College clusters</span>
                            <span className="rounded-full border border-[#00C271]/40 bg-[#00C271]/15 px-2 py-1 text-[10px] text-[#00C271]">● Store visit push</span>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {currentCase.highlights.map((h) => (
                            <div key={h.l} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center">
                              <div className="text-lg font-semibold text-white">{h.v}</div>
                              <div className="mt-0.5 text-[10px] uppercase tracking-wider text-white/50">{h.l}</div>
                            </div>
                          ))}
                        </div>

                        <p className="mt-4 text-xs leading-relaxed text-white/50">
                          Illustrative NCR footprint for presentation — not a live GPS map. Shows campus clusters and the campus→store routing used when on-ground permissions were limited.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* GRANT */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="scroll-fade grid gap-8 rounded-3xl border border-[var(--line)] bg-[var(--card)] p-6 sm:p-10 lg:grid-cols-2">
              <ImageSlot src="/grant/cheque.jpg" alt="₹1 Lakh grant" ratio="video" label="₹1 Lakh cheque photo" />
              <div className="flex flex-col justify-center">
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#00C271]/10 px-3 py-1 text-xs font-medium text-[#007A47]">
                  <Award className="h-3.5 w-3.5" /> Recognized & funded
                </div>
                <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
                  Backed by a <span className="text-[#00C271]">₹1 Lakh</span> university grant.
                </h2>
                <p className="mt-4 text-[var(--muted)]">Formally recognized and funded — validating ethical, student-powered campus marketing.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FOUNDERS — fixed, no flip, plain <img> */}
        <section className="border-y border-[var(--line)] bg-[var(--card)] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Founders</p>
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
                Built by operators who ran campaigns before they wrote decks.
              </h2>
            </motion.div>

            <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
              {founders.map((f, i) => (
                <motion.article
                  key={f.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="group overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--bg)] transition hover:border-[#00C271]/35 hover:shadow-[0_20px_50px_-24px_rgba(0,194,113,0.35)]"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#0B1220]">
                    <img
                      src={`/founders/${f.file}`}
                      alt={f.name}
                      loading="eager"
                      decoding="async"
                      className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                      onError={(e) => {
                        e.currentTarget.style.opacity = '0'
                        const fb = e.currentTarget.parentElement?.querySelector('[data-fallback]')
                        if (fb) fb.classList.remove('hidden')
                      }}
                    />
                    <div
                      data-fallback
                      className="absolute inset-0 hidden flex-col items-center justify-center bg-gradient-to-br from-[#0B1220] via-[#00C271]/25 to-[#0B1220] p-6 text-center"
                    >
                      <div className="text-[10px] uppercase tracking-widest text-white/50">Add photo</div>
                      <div className="mt-2 text-lg font-semibold text-white">{f.name}</div>
                      <div className="mt-2 text-xs text-white/40">public/founders/{f.file}</div>
                    </div>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--bg)] to-transparent" />
                  </div>

                  <div className="relative px-5 pb-6 pt-2">
                    <div className="text-lg font-semibold tracking-tight">{f.name}</div>
                    <div className="mt-0.5 text-xs font-medium uppercase tracking-wider text-[#00C271]">{f.role}</div>

                    <Quote className="mt-4 h-4 w-4 text-[#00C271]" />
                    <p className="mt-2 text-sm italic leading-relaxed text-[var(--muted)]">“{f.quote}”</p>

                    <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">{f.bio}</p>

                    <a
                      href={f.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--card)] px-4 py-2.5 text-sm font-semibold transition hover:border-[#00C271]/50 hover:text-[#00C271]"
                    >
                      <ExternalLink className="h-4 w-4" />
                      LinkedIn
                    </a>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="py-20 sm:py-28">
          <div ref={formRef} className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
            <div className="scroll-fade">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">Start here</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">Launch your next campus campaign.</h2>
              <p className="mt-4 text-[var(--muted)]">Tell us your brand, goal, and timeline.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={WA} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium">
                  <MessageCircle className="h-4 w-4 text-[#00C271]" /> WhatsApp
                </a>
                <button type="button" onClick={copyEmail} className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium">
                  {copied ? <Check className="h-4 w-4 text-[#00C271]" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'hello@nextgengrowth.in'}
                </button>
              </div>
            </div>

            <form onSubmit={onSubmit} className="scroll-fade rounded-3xl border border-[var(--line)] bg-[var(--card)] p-6 sm:p-8">
              <div className="mb-5">
                <div className="mb-2 flex items-center justify-between text-xs text-[var(--muted)]">
                  <span>Form progress</span>
                  <span className="font-medium text-[var(--ink)]">{formProgress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg)]">
                  <motion.div className="h-full rounded-full bg-[#00C271]" animate={{ width: `${formProgress}%` }} transition={{ duration: 0.25 }} />
                </div>
              </div>

              <div className="mb-6 flex items-center gap-3">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${step >= 1 ? 'bg-[#00C271] text-white' : 'bg-[var(--bg)]'}`}>1</div>
                <span className="text-xs font-medium">About you</span>
                <div className={`h-px flex-1 ${step >= 2 ? 'bg-[#00C271]' : 'bg-[var(--line)]'}`} />
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${step >= 2 ? 'bg-[#00C271] text-white' : 'bg-[var(--bg)]'}`}>2</div>
                <span className="text-xs font-medium">Your goal</span>
              </div>

              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div key="s1" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field id="field-fullName" label="Full name" name="fullName" value={form.fullName} onChange={onChange} required />
                      <Field label="Work email" name="email" type="email" value={form.email} onChange={onChange} required />
                      <Field label="Phone / WhatsApp" name="phone" value={form.phone} onChange={onChange} required />
                      <Field label="Company / Brand" name="company" value={form.company} onChange={onChange} required />
                    </div>
                    <button type="button" onClick={nextStep} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0B1220] px-6 py-3.5 text-sm font-semibold text-white">
                      Continue <ArrowRight className="h-4 w-4" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="s2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                    <label className="block text-sm">
                      <span className="mb-1.5 block font-medium">Primary goal</span>
                      <select name="goal" value={form.goal} onChange={onChange} className="w-full rounded-xl border border-[var(--line)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none focus:border-[#00C271]">
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
                      <textarea name="message" rows={4} value={form.message} onChange={onChange} className="w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--card)] px-3 py-2.5 text-sm outline-none focus:border-[#00C271]" placeholder="Cities, campuses, timeline…" />
                    </label>
                    <div className="mt-6 flex gap-3">
                      <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-5 py-3.5 text-sm font-semibold">
                        <ChevronLeft className="h-4 w-4" /> Back
                      </button>
                      <button type="submit" disabled={status === 'loading'} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#00C271] px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-60">
                        {status === 'loading' ? 'Sending…' : (<>Launch Campus Campaign <ArrowRight className="h-4 w-4" /></>)}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {status === 'success' && (
                <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">Received. Our team will reach out shortly.</div>
              )}
            </form>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-[var(--line)] bg-[var(--card)] py-20 sm:py-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="scroll-fade">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">FAQ</p>
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Questions brands ask.</h2>
            </div>
            <div className="mt-10 space-y-3">
              {faqs.map((f, i) => (<FAQItem key={i} q={f.q} a={f.a} />))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bg-[var(--bg)] pb-24 pt-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="scroll-fade rounded-3xl bg-[#0B1220] px-8 py-14 text-center text-white sm:px-16">
              <h2 className="mx-auto max-w-3xl text-3xl font-semibold sm:text-4xl">
                Your next 10,000 Gen-Z conversations won’t come from another ad account.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/60">They’ll come from campuses — if you show up the right way.</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a href="#contact" className="rounded-full bg-[#00C271] px-7 py-3.5 text-sm font-semibold text-white">Book Campus Strategy Call</a>
                <a href="#contact" className="rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white">Launch Campus Campaign</a>
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
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[#0B1220] text-white shadow-xl md:bottom-6"
            aria-label="Back to top"
          >
            <ArrowUp className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>

      <Toast show={toast.show} msg={toast.msg} type={toast.type} />
    </div>
  )
}
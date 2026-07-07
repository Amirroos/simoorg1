import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown, Waves, Compass, Ship, Sparkles, ArrowLeft, Package } from "lucide-react";

const HERO_POSTER = "/media/hero-poster.png";
const HERO_VIDEO = "/media/hero-deck.mp4";

// قطعات کشتی SVG inline که با اسکرول بیرون می‌آیند
const ShipParts = ({ scrollProgress }: { scrollProgress: any }) => {
  // transform scroll progress to various animation values
  const propellerX = useTransform(scrollProgress, [0, 0.3, 0.6], [-300, 0, 80]);
  const propellerY = useTransform(scrollProgress, [0, 0.3, 0.6], [200, 100, 50]);
  const propellerRotate = useTransform(scrollProgress, [0, 1], [0, 720]);
  const propellerOpacity = useTransform(scrollProgress, [0, 0.15, 0.5], [0, 1, 0.6]);

  const anchorX = useTransform(scrollProgress, [0.05, 0.35, 0.7], [400, 100, -50]);
  const anchorY = useTransform(scrollProgress, [0.05, 0.35, 0.7], [300, 50, -20]);
  const anchorRotate = useTransform(scrollProgress, [0.05, 0.5], [45, -15]);
  const anchorOpacity = useTransform(scrollProgress, [0.05, 0.2, 0.55], [0, 1, 0.3]);

  const wheelX = useTransform(scrollProgress, [0.1, 0.4, 0.75], [-400, -100, 0]);
  const wheelY = useTransform(scrollProgress, [0.1, 0.4, 0.75], [150, 0, -100]);
  const wheelRotate = useTransform(scrollProgress, [0, 1], [0, -540]);
  const wheelOpacity = useTransform(scrollProgress, [0.1, 0.25, 0.6], [0, 1, 0.5]);

  const gearX = useTransform(scrollProgress, [0.15, 0.5, 0.85], [500, 200, 0]);
  const gearY = useTransform(scrollProgress, [0.15, 0.5, 0.85], [100, 0, -50]);
  const gearRotate = useTransform(scrollProgress, [0, 1], [0, 360]);
  const gearOpacity = useTransform(scrollProgress, [0.15, 0.3, 0.7], [0, 1, 0.5]);

  const shipX = useTransform(scrollProgress, [0, 0.5, 1], [-200, 0, 300]);
  const shipY = useTransform(scrollProgress, [0, 0.5, 1], [50, -30, -80]);
  const shipOpacity = useTransform(scrollProgress, [0, 0.2, 0.8, 1], [0.2, 1, 0.8, 0]);

  const compassX = useTransform(scrollProgress, [0.2, 0.55, 0.9], [300, 0, -200]);
  const compassY = useTransform(scrollProgress, [0.2, 0.55, 0.9], [200, 100, 0]);
  const compassRotate = useTransform(scrollProgress, [0, 1], [0, 180]);
  const compassOpacity = useTransform(scrollProgress, [0.2, 0.35, 0.75], [0, 1, 0.4]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Propeller */}
      <motion.div
        style={{ x: propellerX, y: propellerY, opacity: propellerOpacity, left: "15%", top: "55%" }}
        className="absolute"
      >
        <motion.svg width="140" height="140" viewBox="0 0 140 140" style={{ rotate: propellerRotate }}>
          <g>
            <circle cx="70" cy="70" r="15" fill="url(#propellerGrad)" stroke="#f59e0b" strokeWidth="2" />
            {[0, 90, 180, 270].map((angle) => (
              <g key={angle} transform={`rotate(${angle} 70 70)`}>
                <ellipse cx="70" cy="30" rx="12" ry="28" fill="url(#propellerGrad)" opacity="0.9" />
                <ellipse cx="70" cy="30" rx="8" ry="22" fill="#fbbf24" opacity="0.4" />
              </g>
            ))}
          </g>
          <defs>
            <radialGradient id="propellerGrad">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#b45309" />
            </radialGradient>
          </defs>
        </motion.svg>
      </motion.div>

      {/* Anchor */}
      <motion.div
        style={{ x: anchorX, y: anchorY, opacity: anchorOpacity, left: "70%", top: "20%" }}
        className="absolute"
      >
        <motion.svg width="120" height="140" viewBox="0 0 120 140" style={{ rotate: anchorRotate }}>
          <g fill="none" stroke="#0ea5e9" strokeWidth="5" strokeLinecap="round">
            <circle cx="60" cy="20" r="10" fill="#0ea5e9" />
            <line x1="60" y1="30" x2="60" y2="110" />
            <line x1="30" y1="50" x2="90" y2="50" />
            <path d="M 20 100 Q 60 140 100 100" />
            <path d="M 15 95 L 25 105 L 30 95" />
            <path d="M 105 95 L 95 105 L 90 95" />
          </g>
        </motion.svg>
      </motion.div>

      {/* Ship Wheel */}
      <motion.div
        style={{ x: wheelX, y: wheelY, opacity: wheelOpacity, left: "20%", top: "15%" }}
        className="absolute"
      >
        <motion.svg width="150" height="150" viewBox="0 0 150 150" style={{ rotate: wheelRotate }}>
          <g>
            <circle cx="75" cy="75" r="60" fill="none" stroke="#fef3c7" strokeWidth="6" />
            <circle cx="75" cy="75" r="18" fill="#92400e" stroke="#fef3c7" strokeWidth="3" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <g key={angle} transform={`rotate(${angle} 75 75)`}>
                <line x1="75" y1="75" x2="75" y2="20" stroke="#fef3c7" strokeWidth="4" strokeLinecap="round" />
                <circle cx="75" cy="18" r="8" fill="#b45309" stroke="#fef3c7" strokeWidth="2" />
              </g>
            ))}
          </g>
        </motion.svg>
      </motion.div>

      {/* Gear */}
      <motion.div
        style={{ x: gearX, y: gearY, opacity: gearOpacity, left: "75%", top: "65%" }}
        className="absolute"
      >
        <motion.svg width="130" height="130" viewBox="0 0 130 130" style={{ rotate: gearRotate }}>
          <g>
            <circle cx="65" cy="65" r="35" fill="#334155" stroke="#64748b" strokeWidth="3" />
            <circle cx="65" cy="65" r="12" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
            {Array.from({ length: 10 }).map((_, i) => {
              const angle = (i * 360) / 10;
              return (
                <g key={i} transform={`rotate(${angle} 65 65)`}>
                  <rect x="58" y="8" width="14" height="18" fill="#334155" stroke="#64748b" strokeWidth="2" rx="2" />
                </g>
              );
            })}
          </g>
        </motion.svg>
      </motion.div>

      {/* Compass */}
      <motion.div
        style={{ x: compassX, y: compassY, opacity: compassOpacity, left: "50%", top: "30%" }}
        className="absolute"
      >
        <motion.svg width="130" height="130" viewBox="0 0 130 130" style={{ rotate: compassRotate }}>
          <circle cx="65" cy="65" r="55" fill="#fef3c7" stroke="#78350f" strokeWidth="3" />
          <circle cx="65" cy="65" r="45" fill="none" stroke="#78350f" strokeWidth="1" opacity="0.5" />
          <polygon points="65,25 72,65 65,75 58,65" fill="#dc2626" />
          <polygon points="65,105 58,65 65,55 72,65" fill="#1e293b" />
          <circle cx="65" cy="65" r="5" fill="#78350f" />
          {["N", "E", "S", "W"].map((d, i) => {
            const positions = [[65, 15], [115, 68], [65, 120], [15, 68]];
            return (
              <text
                key={d}
                x={positions[i][0]}
                y={positions[i][1]}
                textAnchor="middle"
                fill="#78350f"
                fontSize="12"
                fontWeight="bold"
              >
                {d}
              </text>
            );
          })}
        </motion.svg>
      </motion.div>

      {/* Ship silhouette */}
      <motion.div
        style={{ x: shipX, y: shipY, opacity: shipOpacity, left: "40%", top: "40%" }}
        className="absolute"
      >
        <svg width="220" height="140" viewBox="0 0 220 140">
          <defs>
            <linearGradient id="shipGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e40af" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>
          <path
            d="M 10 90 L 30 90 L 40 120 L 180 120 L 200 90 L 210 90 L 195 70 L 30 70 Z"
            fill="url(#shipGrad)"
            stroke="#60a5fa"
            strokeWidth="2"
          />
          <rect x="60" y="35" width="100" height="40" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1.5" />
          <rect x="70" y="45" width="15" height="12" fill="#fef3c7" opacity="0.8" />
          <rect x="95" y="45" width="15" height="12" fill="#fef3c7" opacity="0.8" />
          <rect x="120" y="45" width="15" height="12" fill="#fef3c7" opacity="0.8" />
          <rect x="100" y="15" width="25" height="22" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1.5" />
          <line x1="112" y1="15" x2="112" y2="0" stroke="#94a3b8" strokeWidth="2" />
          <circle cx="112" cy="5" r="3" fill="#f59e0b" />
          {/* waves */}
          <path d="M 0 125 Q 30 115 60 125 T 120 125 T 180 125 T 220 125" fill="none" stroke="#0ea5e9" strokeWidth="2" opacity="0.6" />
        </svg>
      </motion.div>
    </div>
  );
};

export function ParallaxHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // parallax for background video
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.55, 0.75, 0.9]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-80%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={containerRef} className="relative h-[100vh] min-h-[700px] overflow-hidden">
      {/* Video Background */}
      <motion.div
        style={{ y: videoY, scale: videoScale }}
        className="absolute inset-0 bg-slate-950"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(6,182,212,0.38),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(245,158,11,0.24),transparent_28%),linear-gradient(135deg,#082f49_0%,#0f172a_48%,#020617_100%)]" />
          <div className="absolute inset-x-[-10%] bottom-0 h-2/3 opacity-70">
            <svg viewBox="0 0 1440 520" className="w-full h-full" preserveAspectRatio="none">
              <path d="M0 320 C170 250 310 360 500 295 C710 220 880 365 1080 280 C1220 220 1330 245 1440 195 L1440 520 L0 520Z" fill="#0f172a" opacity="0.78" />
              <path d="M0 352 C180 294 320 390 520 330 C720 270 900 398 1100 330 C1250 280 1340 292 1440 250" fill="none" stroke="#22d3ee" strokeOpacity="0.62" strokeWidth="7" />
              <path d="M0 408 C210 354 380 438 580 382 C790 324 950 448 1160 388 C1270 356 1360 362 1440 330" fill="none" stroke="#f59e0b" strokeOpacity="0.34" strokeWidth="5" />
            </svg>
          </div>
        </div>
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster={HERO_POSTER}
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
        {/* Animated gradient overlay */}
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 bg-gradient-to-bl from-slate-900/80 via-blue-900/50 to-cyan-900/60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
      </motion.div>

      {/* Ship Parts Animation */}
      <ShipParts scrollProgress={scrollYProgress} />

      {/* Animated waves at bottom */}
      <div className="absolute bottom-0 inset-x-0 z-10">
        <svg viewBox="0 0 1440 100" className="w-full h-20" preserveAspectRatio="none">
          <path
            d="M0,50 C240,90 480,10 720,50 C960,90 1200,10 1440,50 L1440,100 L0,100 Z"
            fill="#f8fafc"
            opacity="0.95"
          />
        </svg>
      </div>

      {/* Content */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-20 h-full flex items-center justify-center px-4 sm:px-6"
      >
        <div className="max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-cyan-200 text-sm mb-6"
          >
            <Sparkles className="w-4 h-4" />
            <span>اولین بازارگاه تخصصی B2B دریایی ایران</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-tight mb-6"
          >
            تأمین تجهیزات و قطعات
            <br />
            <span className="gradient-text">شناورها در یک کلیک</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg sm:text-xl text-slate-200 max-w-2xl mx-auto mb-8 leading-9"
          >
            از موتورخانه تا ناوبری، از قطعات نایاب تا تجهیزات ایمنی — همه را از فروشندگان تأییدشده
            بخواهید، مقایسه کنید و با اطمینان خرید کنید.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              to="/products"
              className="group relative px-8 py-4 rounded-2xl bg-gradient-to-l from-cyan-500 to-blue-600 text-white font-bold shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-500/70 transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>مشاهده بازارگاه</span>
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
            </Link>
            <Link
              to="/rfq"
              className="px-8 py-4 rounded-2xl glass text-white font-bold hover:bg-white/20 transition flex items-center gap-2"
            >
              <span>درخواست استعلام قیمت</span>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 max-w-3xl mx-auto"
          >
            {[
              { value: "۲۵۰۰+", label: "قطعه ثبت شده", icon: Package },
              { value: "۱۲۰+", label: "فروشنده تأییدشده", icon: Ship },
              { value: "۸۵٪", label: "پاسخ سریع RFQ", icon: Compass },
              { value: "۲۴/۷", label: "پشتیبانی", icon: Waves },
            ].map((stat, i) => (
              <div
                key={i}
                className="glass rounded-2xl p-4 hover:bg-white/15 transition"
              >
                <stat.icon className="w-5 h-5 text-cyan-300 mx-auto mb-2" />
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-slate-300">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 text-white/70 flex flex-col items-center gap-2"
      >
        <span className="text-xs">اسکرول کنید</span>
        <ChevronDown className="w-5 h-5" />
      </motion.div>
    </section>
  );
}

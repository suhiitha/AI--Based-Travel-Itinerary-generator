import React, { useContext, useState, useEffect, useRef } from 'react';
import './AllCss/Dashboard.css';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import { motion, useInView } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';
import {
  FiCpu, FiEdit3, FiMap,
  FiCalendar, FiMapPin, FiStar, FiAward,
  FiArrowRight
} from 'react-icons/fi';

import imgHero from './images/hampi.png';
import imgGokarna from './images/gokarna.png';
import imgCoorg from './images/coorg.png';
import imgMysuru from './images/mysuru.png';

/* ── Greeting ── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ── Count-up hook ── */
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === null || target === undefined || isNaN(Number(target))) return;
    const n = Number(target);
    if (n === 0) { setCount(0); return; }
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * n));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return count;
}

/* ── Individual stat with count-up ── */
function StatItem({ icon, value, label, loading }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const numericTarget = (inView && !loading && !isNaN(Number(value))) ? Number(value) : null;
  const countedValue = useCountUp(numericTarget);
  const displayValue = loading ? '···' : isNaN(Number(value)) ? value : (inView ? countedValue : 0);

  return (
    <div className="pdash__stat" ref={ref}>
      <div className="pdash__stat-icon">{icon}</div>
      <div className={`pdash__stat-value${loading ? ' pdash__stat-value--loading' : ''}`}>
        {displayValue}
      </div>
      <div className="pdash__stat-label">{label}</div>
    </div>
  );
}

/* ── Data ── */
const ACTION_CARDS = [
  {
    icon: <FiCpu />,
    title: 'AI Trip Planner',
    desc: 'Tell us your mood and preferences. Our AI builds a personalized Karnataka itinerary in seconds.',
    cta: 'Start Planning',
    photo: imgMysuru,
    route: '/Main/mood-form',
  },
  {
    icon: <FiEdit3 />,
    title: 'Manual Itinerary',
    desc: 'Pick your districts, days, and destinations. Full control over your Karnataka journey.',
    cta: 'Build Manually',
    photo: imgCoorg,
    route: '/Main/ItineraryDisplay',
  },
  {
    icon: <FiMap />,
    title: 'My Itineraries',
    desc: 'View your saved trips, track visited places, and revisit past journeys.',
    cta: 'View All',
    photo: imgHero,
    route: '/Main/my-itineraries',
  },
];

const DESTINATIONS = [
  {
    name: 'Hampi',
    tag: 'Heritage',
    photo: imgHero,
    large: true,
  },
  {
    name: 'Gokarna',
    tag: 'Coastal',
    photo: imgGokarna,
    large: false,
  },
  {
    name: 'Coorg',
    tag: 'Nature',
    photo: imgCoorg,
    large: false,
  },
  {
    name: 'Mysuru',
    tag: 'Culture',
    photo: imgMysuru,
    large: false,
  },
];

/* ── Stagger variants ── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
};

/* ================================================================
   COMPONENT
   ================================================================ */
export default function Dashboard() {
  const { user } = useContext(UserContext);
  const navigate  = useNavigate();
  const username  = user?.username || 'Traveller';

  const [tripCount,         setTripCount]         = useState(null);
  const [districtsExplored, setDistrictsExplored] = useState(null);
  const [statsLoading,      setStatsLoading]      = useState(true);
  const [scrollY,           setScrollY]           = useState(0);

  /* Parallax scroll tracking */
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Fetch user stats */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userEmail = user?.useremail || localStorage.getItem('userEmail');
        if (!userEmail) { setTripCount(0); setDistrictsExplored(0); setStatsLoading(false); return; }
        const { data } = await axiosInstance.get('/api/trip-places/all');
        const mine = (data || []).filter(t => t.user === userEmail);
        setTripCount(mine.length);
        setDistrictsExplored(new Set(mine.map(t => t.district).filter(Boolean)).size);
      } catch {
        setTripCount(0);
        setDistrictsExplored(0);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const statsData = [
    { icon: <FiCalendar />, value: statsLoading ? null : tripCount,         label: 'Trips Planned'     },
    { icon: <FiMapPin   />, value: statsLoading ? null : districtsExplored, label: 'Districts Explored' },
    { icon: <FiStar     />, value: 'AI',                                    label: 'Mood Planning'     },
    { icon: <FiAward    />, value: 'Top',                                   label: 'Explorer Tier'     },
  ];

  return (
    <div className="pdash">

      {/* ════════════════════════════════════════════════
          HERO — Full viewport, real Hampi photo, dark overlay
          ════════════════════════════════════════════════ */}
      <div className="pdash__hero">
        {/* Parallax photo layer */}
        <div
          className="pdash__hero-bg"
          style={{ transform: `translateY(${scrollY * 0.35}px)` }}
        />
        {/* Dark gradient overlay */}
        <div className="pdash__hero-overlay" />
        {/* Grain texture */}
        <div className="pdash__hero-grain" aria-hidden="true" />

        {/* Avatar — top right */}
        <div className="pdash__hero-avatar">
          {username.charAt(0).toUpperCase()}
        </div>

        {/* Copy */}
        <motion.div
          className="pdash__hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="pdash__greeting-label">{getGreeting()}</div>
          <h1 className="pdash__greeting-title">
            Welcome back, <em>{username}</em>
          </h1>
          <div className="pdash__badge">Karnataka Explorer</div>
        </motion.div>
      </div>

      {/* ════════════════════════════════════════════════
          MAIN CONTENT
          ════════════════════════════════════════════════ */}
      <div className="pdash__inner">

        {/* ── Action Cards ── */}
        <div style={{ paddingTop: 72 }}>
          <div className="pdash__section-eyebrow">Begin your journey</div>
          <div className="pdash__section-title">Where to next, <span>explorer?</span></div>

          <motion.div
            className="pdash__actions"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {ACTION_CARDS.map((card) => (
              <motion.div
                key={card.title}
                className="pdash__action-card"
                variants={itemVariants}
                onClick={() => navigate(card.route)}
              >
                {/* Full-card photo */}
                <div
                  className="pdash__card-photo"
                  style={{ backgroundImage: `url(${card.photo})` }}
                />
                {/* Bottom dark gradient */}
                <div className="pdash__card-fade" />

                {/* Icon chip — top-left */}
                <div className="pdash__card-content">
                  <div className="pdash__card-icon">{card.icon}</div>
                  <h3 className="pdash__card-title">{card.title}</h3>
                  <p className="pdash__card-desc">{card.desc}</p>
                  <div className="pdash__card-cta">
                    {card.cta}
                    <FiArrowRight className="pdash__card-arrow" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>{/* end inner */}

      {/* ════════════════════════════════════════════════
          STATS — Full-width dark credibility band
          ════════════════════════════════════════════════ */}
      <motion.div
        className="pdash__stats-band"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
      >
        <div className="pdash__stats">
          {statsData.map((s) => (
            <StatItem
              key={s.label}
              icon={s.icon}
              value={s.value}
              label={s.label}
              loading={statsLoading && (s.label === 'Trips Planned' || s.label === 'Districts Explored')}
            />
          ))}
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════
          DESTINATIONS — Asymmetric magazine grid
          ════════════════════════════════════════════════ */}
      <div className="pdash__inner">
        <div className="pdash__section-eyebrow" style={{ paddingTop: 0 }}>Discover Karnataka</div>
        <div className="pdash__section-title">Popular <span>destinations</span></div>

        <motion.div
          className="pdash__dest-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {DESTINATIONS.map((d) => (
            <motion.div
              key={d.name}
              className={`pdash__dest-card${d.large ? ' pdash__dest-card--large' : ''}`}
              variants={itemVariants}
            >
              <div
                className="pdash__dest-bg"
                style={{ backgroundImage: `url(${d.photo})` }}
              />
              <div className="pdash__dest-overlay" />
              <div className="pdash__dest-body">
                <div className="pdash__dest-tag">{d.tag}</div>
                {d.large
                  ? <h3 className="pdash__dest-name--large">{d.name}</h3>
                  : <h4 className="pdash__dest-name">{d.name}</h4>
                }
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

    </div>
  );
}
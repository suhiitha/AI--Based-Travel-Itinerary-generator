import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AllCss/Homep.css";
import { motion } from "framer-motion";
import CinematicIntro from "./CinematicIntro";
import HeroSection from "./HeroSection";

import Footer from "./Footer";

const destinations = [
  { name: "Hampi", badge: "Heritage", district: "Ballari", days: "3–4 days", variant: "hampi", desc: "Ruins of the Vijayanagara Empire scattered across a surreal boulder landscape. A UNESCO World Heritage Site unlike anywhere else in India." },
  { name: "Gokarna", badge: "Coastal", district: "Uttara Kannada", days: "2–3 days", variant: "gokarna", desc: "Secluded beaches and ancient temples with none of Goa's crowds. The unhurried rhythm of coastal Karnataka at its most authentic." },
  { name: "Coorg", badge: "Nature", district: "Kodagu", days: "3–5 days", variant: "coorg", desc: "Mist-covered coffee estates, roaring waterfalls and the warmth of Kodava hospitality. India's most underrated hill escape." },
  { name: "Mysuru", badge: "Culture", district: "Mysuru", days: "2–3 days", variant: "mysuru", desc: "Palaces, sandalwood markets and the grandeur of Dasara — India's most celebrated festival. Royal Karnataka in full colour." },
];

function HomeP() {
  const navigate = useNavigate();
  const [navState, setNavState] = useState("transparent");

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      
      if (scrollY < vh * 5.8) {
        setNavState("transparent");
      } else if (scrollY >= vh * 5.8 && scrollY < vh * 6.5) {
        setNavState("glass");
      } else {
        setNavState("solid");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav className={`payana-nav-new ${navState}`}>
        <div className="payana-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Payana.</div>
        <div className="payana-nav-center">
          <span className="payana-nav-item" onClick={() => document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' })}>Destinations</span>
          <span className="payana-nav-item" onClick={() => document.getElementById('experiences')?.scrollIntoView({ behavior: 'smooth' })}>Experiences</span>
        </div>
        <div className="payana-nav-links">
          <button className="nav-btn-ghost" onClick={() => navigate("/Login")}>Sign In</button>
          <button className="nav-btn-primary" onClick={() => navigate("/Login")}>Plan My Trip</button>
        </div>
      </nav>

      <div className="payana-landing">
        <CinematicIntro />
        <HeroSection />

        <div className="payana-content" id="destinations" style={{ background: '#0a1628', position: 'relative', zIndex: 10, paddingTop: '80px', paddingBottom: '80px' }}>
          {/* ── DESTINATION CARDS ── */}
          <section className="payana-destinations">
            <div className="destinations-header">
              <span className="destinations-label">Explore Karnataka</span>
              <h2 className="destinations-title">Curated for every kind of <span className="italic-gold">traveller</span></h2>
            </div>
            
            <div className="payana-cards-row">
              {destinations.map((dest, i) => (
                <motion.div
                  className="payana-card"
                  key={dest.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.1,
                    ease: "easeOut",
                  }}
                >
                  <div className={`payana-card__image payana-card__image--${dest.variant}`}>
                    <span className="payana-card__badge">{dest.badge}</span>
                  </div>
                  <div className="payana-card__body">
                    <h3 className="payana-card__name">{dest.name}</h3>
                    <p className="payana-card__meta">
                      {dest.district} · {dest.days}
                    </p>
                    <p className="payana-card__desc">
                      {dest.desc}
                    </p>
                    <div className="payana-card__cta-wrap">
                      <span className="payana-card__cta">Plan this trip →</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── STATS ── */}
          <motion.section
            id="features"
            className="payana-stats"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="payana-stat">
              <div className="payana-stat__value">31</div>
              <div className="payana-stat__label">Districts covered</div>
              <div className="payana-stat__subtitle">Across Karnataka</div>
            </div>
            <div className="payana-stat">
              <div className="payana-stat__value">AI</div>
              <div className="payana-stat__label">Mood-based planning</div>
              <div className="payana-stat__subtitle">Powered by Claude</div>
            </div>
            <div className="payana-stat">
              <div className="payana-stat__value">∞</div>
              <div className="payana-stat__label">Routes possible</div>
              <div className="payana-stat__subtitle">No two trips alike</div>
            </div>
          </motion.section>
        </div>

        {/* ── FOOTER (Sibling to content) ── */}
        <Footer />
      </div>
    </>
  );
}

export default HomeP;
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';
import './HeroSection.css';

const HEADLINES = [
  { line1: "Discover", line2: "incredible destinations", align: "left" },
  { line1: "Explore",  line2: "hidden wonders",          align: "right" },
  { line1: "Travel",   line2: "without limits",           align: "left" },
  { line1: "Create",   line2: "unforgettable memories",   align: "right" },
  { line1: "AI powered", line2: "trip planning",          align: "left" },
  { line1: "Your journey", line2: "your story",           align: "right" },
];

export default function HeroSection() {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  
  const [currentHeadline, setCurrentHeadline] = useState(0);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.src = '/assets/new-hero.mp4';
      v.load();
      v.play().catch(() => setAutoplayBlocked(true));
    }
  }, []);

  // Timer-based headline cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeadline(prev => (prev + 1) % HEADLINES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="experiences" className="hero-section" style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        poster="/assets/hero-poster.jpg"
        className="hero-video"
      />
      <div className="hero-overlay" />

      {autoplayBlocked && (
        <div className="autoplay-blocked-overlay" onClick={() => videoRef.current.play().then(() => setAutoplayBlocked(false))}>
          <button>Tap to Play</button>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentHeadline}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className={`hero-text-container ${HEADLINES[currentHeadline].align}`}
        >
          <div className="hero-line1">{HEADLINES[currentHeadline].line1}</div>
          <div className="hero-line2">{HEADLINES[currentHeadline].line2}</div>
        </motion.div>
      </AnimatePresence>

      <div className="hero-ctas">
        <button className="cta-plan" onClick={() => navigate('/Login')}>
          Plan My Trip
        </button>
        <button className="cta-explore" onClick={() => document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' })}>
          Explore Destinations
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ y: { repeat: Infinity, duration: 1.6 }, opacity: { duration: 0.3 } }}
        className="scroll-indicator"
      >
        <FaChevronDown />
      </motion.div>
    </div>
  );
}

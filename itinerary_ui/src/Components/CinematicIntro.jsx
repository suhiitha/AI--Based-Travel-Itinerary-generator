import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';
import './CinematicIntro.css';

const SCENES = [
  { 
    headline: <>Some journeys begin with a <span className="italic-gold">dream</span></>, 
    label: "Payana",
    align: "left",
    showCTA: true
  },
  { headline: "Beyond the horizon", align: "right" },
  { headline: "Discover the unseen", align: "left" },
  { headline: "Where stories come alive", align: "right" },
  { headline: "Explore more, worry less", align: "left" }
];

const getScene = (frameIndex) => {
  if (frameIndex < 48)  return 0;
  if (frameIndex < 96)  return 1;
  if (frameIndex < 144) return 2;
  if (frameIndex < 192) return 3;
  return 4;
};

export default function CinematicIntro() {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const framesRef = useRef([]);
  
  const [ready, setReady] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);
  const [progress, setProgress] = useState(0);

  // Preload frames
  useEffect(() => {
    let loadedCount = 0;
    const totalFrames = 240;
    const frames = [];

    for (let i = 0; i < totalFrames; i++) {
      const img = new Image();
      const index = String(i + 1).padStart(3, '0');
      img.src = `/assets/ezgif/ezgif-frame-${index}.jpg`;
      const handleLoad = () => {
        loadedCount++;
        if (loadedCount === totalFrames) {
          framesRef.current = frames;
          setReady(true);
        }
      };
      img.onload = handleLoad;
      img.onerror = handleLoad;
      frames[i] = img;
    }
  }, []);

  const drawFrame = (frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = framesRef.current[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;
    const dx = (canvas.width - drawWidth) / 2;
    const dy = (canvas.height - drawHeight) / 2;

    ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
  };

  // Initial draw once ready
  useEffect(() => {
    if (ready) {
      drawFrame(0);
    }
  }, [ready]);

  // Handle scroll
  useEffect(() => {
    if (!ready) return;
    
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleScroll = () => {
      const rect = wrapper.getBoundingClientRect();
      const scrolled = -rect.top;
      const total = wrapper.offsetHeight - window.innerHeight;
      const prog = Math.max(0, Math.min(1, scrolled / total));
      setProgress(prog);

      const frameIndex = Math.floor(prog * 239);
      drawFrame(frameIndex);
      setCurrentScene(getScene(frameIndex));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount to handle initial load state
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [ready]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (ready) {
        const frameIndex = Math.floor(progress * 239);
        drawFrame(frameIndex);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [ready, progress]);

  return (
    <div ref={wrapperRef} className="cinematic-wrapper" style={{ height: '500vh', position: 'relative' }}>
      <div className="cinematic-sticky">
        <canvas ref={canvasRef} className="cinematic-canvas" />
        <div className="cinematic-overlay" />
        
        {!ready && (
          <div className="cinematic-loader">
            <h1 className="reveal-brand">PAYANA</h1>
          </div>
        )}

        {ready && (
          <>
            <AnimatePresence mode="wait">
              {currentScene >= 0 && currentScene < 5 && progress < 1 && (
                <motion.div
                  key={currentScene}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className={`scene-text-container ${SCENES[currentScene].align}`}
                >
                  {SCENES[currentScene].label && (
                    <div className="scene-label-row">
                      <span className="scene-label">{SCENES[currentScene].label}</span>
                      <div className="scene-label-rule" />
                    </div>
                  )}
                  
                  <h2 className="scene-headline">{SCENES[currentScene].headline}</h2>
                  
                  {SCENES[currentScene].location && (
                    <div className="scene-location">{SCENES[currentScene].location}</div>
                  )}

                  {SCENES[currentScene].showCTA && (
                    <div className="scene-cta-row">
                      <button className="btn-gold-filled" onClick={() => document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' })}>Plan My Trip</button>
                      <button className="btn-ghost-underline" onClick={() => document.getElementById('experiences')?.scrollIntoView({ behavior: 'smooth' })}>Explore Karnataka →</button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {progress < 1 && (
               <div className="brand-lockup">
                 <h3 className="brand-lockup-name">Payana.</h3>
                 <div className="brand-lockup-rule" />
                 <span className="brand-lockup-tag">AI Travel Planner</span>
               </div>
            )}
            
            {progress < 1 && (
               <div className="progress-dots">
                 {[0, 1, 2, 3, 4].map(idx => (
                   <div key={idx} className={`progress-dot ${currentScene === idx ? 'active' : 'inactive'}`} />
                 ))}
               </div>
            )}

            {/* Final Reveal Overlay at the end of the 500vh scroll */}
            {progress === 1 && (
              <div className="reveal-sequence">
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="reveal-brand"
                >
                  PAYANA
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="reveal-tagline"
                >
                  Plan less. Explore more.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, y: [0, 8, 0] }}
                  transition={{ opacity: { delay: 1, duration: 0.5 }, y: { repeat: Infinity, duration: 1.6 } }}
                  className="scroll-indicator"
                >
                  <FaChevronDown />
                </motion.div>
              </div>
            )}
            
            {/* Removed blackout-transition to prevent black gap before video */}
          </>
        )}
      </div>
    </div>
  );
}

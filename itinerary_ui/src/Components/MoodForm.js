import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import questionsData from "./questions";
import { motion, AnimatePresence } from "framer-motion";
import "./AllCss/MoodForm.css";
import ModernDropdown from "./ModernDropdown";

/* ─── Payana monogram avatar ─── */
const PAvatar = ({ size = 28 }) => (
  <div className="mf__bubble-avatar" style={{ width: size, height: size, minWidth: size }}>
    <span className="mf__bubble-avatar-mono">P</span>
  </div>
);

/* ─── SVG icons for Yes / No ─── */
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const TOTAL_QUESTIONS = 7; // approximate total mood questions

const MoodForm = () => {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  const [messages, setMessages] = useState([
    { text: "Hi! I'm your AI trip concierge. Let's find the perfect Karnataka journey for you.", sender: "bot" },
    { text: "Answer a few mood questions and I'll craft your personalised itinerary.", sender: "bot" },
    { type: "section-break", label: "Mood Analysis" },
  ]);

  const [phase, setPhase] = useState("initial");
  const [districts, setDistricts] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryScores, setCategoryScores] = useState({});
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [usedQuestions, setUsedQuestions] = useState({});
  const [identifiedMood, setIdentifiedMood] = useState(null);
  const [noCount, setNoCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await axiosInstance.get("/api/itinerary/districts");
        setDistricts(response.data || []);
      } catch {
        toast.error("Failed to fetch districts");
      }
    };
    fetchDistricts();
  }, []);

  useEffect(() => {
    if (phase === "questions" && currentCategory && !currentQuestion) {
      const q = pickRandomQuestion(currentCategory);
      if (q) {
        addBotMessageWithTyping(q);
        setCurrentQuestion(q);
      }
    }
  }, [phase, currentCategory, currentQuestion]);

  useEffect(() => {
    if (identifiedMood && selectedLocation && selectedDuration) {
      toast.success(`Great! You are in a ${identifiedMood} mood.`);
      setTimeout(() => {
        navigate(`/main/mcq-result?mood=${identifiedMood}&district=${selectedLocation}&days=${selectedDuration}`, {
          state: { district: selectedLocation, days: selectedDuration }
        });
      }, 2000);
    }
  }, [identifiedMood, navigate, selectedLocation, selectedDuration]);

  const addBotMessageWithTyping = (text) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { text, sender: "bot" }]);
    }, 700);
  };

  const pickRandomQuestion = (cat) => {
    const questions = questionsData[cat];
    const used = usedQuestions[cat] || [];
    const available = questions.filter(q => !used.includes(q));
    if (available.length === 0) return null;
    const picked = available[Math.floor(Math.random() * available.length)];
    setUsedQuestions(prev => ({ ...prev, [cat]: [...(prev[cat] || []), picked] }));
    return picked;
  };

  const handleLocationSubmit = () => {
    if (!selectedLocation) { toast.warning("Please select a location"); return; }
    setMessages(prev => [...prev, { text: selectedLocation, sender: "user" }]);
    addBotMessageWithTyping("How many days is your trip?");
    setPhase("duration");
  };

  const handleDurationSubmit = () => {
    if (!selectedDuration || selectedDuration < 1) { toast.warning("Please enter a valid duration"); return; }
    setMessages(prev => [...prev, { text: `${selectedDuration} days`, sender: "user" }]);
    const cats = Object.keys(questionsData);
    setCategories(cats);
    setCurrentCategory(cats[0]);
    setPhase("questions");
  };

  const handleResponse = (response) => {
    // Add a clean pill response — no "You said:" prefix
    setMessages(prev => [...prev, { text: response === "yes" ? "Yes" : "No", sender: "user" }]);
    setQuestionCount(prev => prev + 1);

    if (response === "no") {
      const newNoCount = noCount + 1;
      setNoCount(newNoCount);
      if (newNoCount >= 10) {
        toast.info("Redirecting to manual planner", { autoClose: 2000, onClose: () => navigate("/main/ItineraryDisplay") });
        return;
      }
      const catIndex = categories.indexOf(currentCategory);
      if (catIndex < categories.length - 1) {
        const nextCat = categories[catIndex + 1];
        setCurrentCategory(nextCat);
        setCurrentQuestion(null);
        const nextQ = pickRandomQuestion(nextCat);
        if (nextQ) {
          addBotMessageWithTyping(nextQ);
          setCurrentQuestion(nextQ);
        }
        return;
      }
    }

    if (response === "yes") {
      const newScores = { ...categoryScores, [currentCategory]: (categoryScores[currentCategory] || 0) + 1 };
      setCategoryScores(newScores);
      if (newScores[currentCategory] >= 4) {
        setIdentifiedMood(currentCategory);
        addBotMessageWithTyping("Perfect. Now, where would you like to go in Karnataka?");
        setPhase("location");
        return;
      }
    }

    const nextQ = pickRandomQuestion(currentCategory);
    if (nextQ) {
      addBotMessageWithTyping(nextQ);
      setCurrentQuestion(nextQ);
    } else {
      const catIndex = categories.indexOf(currentCategory);
      if (catIndex < categories.length - 1) {
        const nextCat = categories[catIndex + 1];
        setCurrentCategory(nextCat);
        setCurrentQuestion(null);
        const nextQ2 = pickRandomQuestion(nextCat);
        if (nextQ2) {
          addBotMessageWithTyping(nextQ2);
          setCurrentQuestion(nextQ2);
        }
      } else {
        if (!identifiedMood) {
          addBotMessageWithTyping("Where would you like to go in Karnataka?");
          setPhase("location");
        }
      }
    }
  };

  const startConversation = () => {
    const cats = Object.keys(questionsData);
    setCategories(cats);
    setCurrentCategory(cats[0]);
    setPhase("questions");
    const firstQuestion = pickRandomQuestion(cats[0]);
    if (firstQuestion) {
      addBotMessageWithTyping(firstQuestion);
      setCurrentQuestion(firstQuestion);
    }
  };

  const progressPct = Math.min((questionCount / TOTAL_QUESTIONS) * 100, 100);

  return (
    <div className="mf">
      <ToastContainer position="top-center" theme="dark"
        toastStyle={{ background: '#1A0F08', color: '#FAF6EE', border: '1px solid #B8860B' }} />

      {/* Loading overlay */}
      <AnimatePresence>
        {identifiedMood !== null && selectedLocation && selectedDuration && (
          <motion.div className="mf__overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}>
            <div className="mf__pulse-orb" />
            <div className="mf__overlay-text">
              Crafting your perfect Karnataka journey…
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mf__column">

        {/* ── PROGRESS BAR ── */}
        <div className="mf__progress-bar-track">
          <div className="mf__progress-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>

        {/* ── HEADER ── */}
        <div className="mf__header">
          <button className="mf__back-btn" onClick={() => navigate(-1)} aria-label="Go Back">
            <BackIcon />
          </button>
          <div className="mf__avatar">
            <span className="mf__avatar-monogram">P</span>
          </div>
          <div className="mf__header-text">
            <span className="mf__logo">Payana</span>
            <span className="mf__subtitle">AI Trip Concierge</span>
          </div>
          {phase !== "initial" && (
            <span className="mf__header-progress">
              {questionCount} of {TOTAL_QUESTIONS}
            </span>
          )}
        </div>

        {/* ── CHAT AREA ── */}
        <div className="mf__chat">
          {messages.map((m, i) => {
            if (m.type === "section-break") {
              return (
                <div key={i} className="mf__section-break">
                  <div className="mf__section-break-line" />
                  <span className="mf__section-break-label">{m.label}</span>
                  <div className="mf__section-break-line" />
                </div>
              );
            }
            return (
              <motion.div
                key={i}
                className={`mf__bubble-row mf__bubble-row--${m.sender}`}
                initial={{ opacity: 0, x: m.sender === "bot" ? -12 : 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {m.sender === "bot" && <PAvatar />}
                <div className={m.sender === "bot" ? "mf__bubble--bot" : "mf__bubble--user"}>
                  {m.typing ? (
                    <div className="mf__typing-dots">
                      <span /><span /><span />
                    </div>
                  ) : m.text}
                </div>
              </motion.div>
            );
          })}

          {/* Live typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                className="mf__bubble-row mf__bubble-row--bot"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
              >
                <PAvatar />
                <div className="mf__bubble--bot">
                  <div className="mf__typing-dots">
                    <span /><span /><span />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={chatEndRef} />
        </div>

        {/* ── INPUT FOOTER ── */}
        <div className="mf__footer">

          {phase === "initial" && (
            <motion.button className="mf__btn-gold" onClick={startConversation} whileTap={{ scale: 0.97 }}>
              Begin Your Journey →
            </motion.button>
          )}

          {phase === "location" && (
            <div>
              <span className="mf__footer-label">Where would you like to go?</span>
              <div style={{ marginBottom: "12px" }}>
                <ModernDropdown
                  options={districts}
                  value={selectedLocation}
                  onChange={setSelectedLocation}
                  placeholder="Select a district in Karnataka"
                  searchable={true}
                  direction="up"
                />
              </div>
              <motion.button className="mf__btn-gold" onClick={handleLocationSubmit} whileTap={{ scale: 0.97 }}>
                Confirm Destination →
              </motion.button>
            </div>
          )}

          {phase === "duration" && (
            <div>
              <span className="mf__footer-label">How many days?</span>
              <input
                type="number"
                className="mf__input"
                placeholder="e.g. 3"
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                min="1"
              />
              <motion.button className="mf__btn-gold" onClick={handleDurationSubmit} whileTap={{ scale: 0.97 }}>
                Reveal My Journey →
              </motion.button>
            </div>
          )}

          {phase === "questions" && currentQuestion && !identifiedMood && (
            <div className="mf__yn-row">
              <motion.button
                className="mf__btn-yes"
                onClick={() => handleResponse("yes")}
                whileTap={{ scale: 1.02 }}
              >
                <CheckIcon /> Yes
              </motion.button>
              <motion.button
                className="mf__btn-no"
                onClick={() => handleResponse("no")}
                whileTap={{ scale: 1.02 }}
              >
                <XIcon /> No
              </motion.button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default MoodForm;

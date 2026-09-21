import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import { UserContext } from '../App';
import RouteMapComponent from './RouteMapComponent';
import { motion, AnimatePresence } from 'framer-motion';
import './AllCss/MCQResult.css';

/* ─── SVG Icon Components ─── */
const CompassIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d4a843" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="rgba(212,168,67,0.25)" stroke="#d4a843" />
  </svg>
);

const MapPinIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const BookmarkIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
  </svg>
);

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const RouteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 000-7h-11a3.5 3.5 0 010-7H15" /><circle cx="18" cy="5" r="3" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

/* ─── Shorten long place names for display ─── */
const shortName = (name) => {
  if (!name) return '';
  // Remove parenthetical suffixes like "(near ... area)" or "(general)"
  const cleaned = name.replace(/\s*\([^)]*\)\s*/g, '').trim();
  // Truncate to 30 chars if still long
  return cleaned.length > 32 ? cleaned.substring(0, 30) + '…' : cleaned;
};

/* ─── Main Component ─── */
const MCQResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [places, setPlaces] = useState([]);
  const [groupedPlaces, setGroupedPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [userFeedbacks, setUserFeedbacks] = useState([]);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapPlaces, setMapPlaces] = useState([]);
  const [mapTitle, setMapTitle] = useState('');
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  // ── NULL GUARD — redirect if no state/params ──
  const params = new URLSearchParams(location.search);
  const hasState = location.state && (location.state.places || location.state.mood || location.state.district);
  const hasParams = params.get('mood') || params.get('district');

  useEffect(() => {
    if (!hasState && !hasParams) {
      toast.warning('Please generate an itinerary first.');
      navigate('/main', { replace: true });
    }
  }, [hasState, hasParams, navigate]);

  const { questions = [], answers = [], district, days, places: placesFromState, mood: moodFromState } = location.state || {};
  const mood = params.get('mood') || (Array.isArray(moodFromState) ? moodFromState[0] : moodFromState);
  const districtFromUrl = params.get('district') || district;
  const daysFromUrl = params.get('days') || days;

  // ── Initial data load ──
  useEffect(() => {
    if (!hasState && !hasParams) return;
    if (placesFromState && placesFromState.length > 0) {
      setPlaces(placesFromState);
      if (daysFromUrl) {
        const grouped = groupPlacesByDays(placesFromState, parseInt(daysFromUrl));
        setGroupedPlaces(grouped);
      }
      setShowRecommendations(true);
      toast.success("Itinerary Generated Successfully");
    } else if (mood && districtFromUrl) {
      generateItinerary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hasState && !hasParams) return null;

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const p1 = lat1 * Math.PI / 180;
    const p2 = lat2 * Math.PI / 180;
    const dp = (lat2 - lat1) * Math.PI / 180;
    const dl = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  };

  const sortPlacesByProximity = (placesArray) => {
    if (!placesArray || placesArray.length < 2) return placesArray;
    const sorted = [placesArray[0]];
    let remaining = [...placesArray.slice(1)];
    while (remaining.length > 0) {
      const last = sorted[sorted.length - 1];
      let nearestIdx = 0, minDist = Infinity;
      remaining.forEach((p, idx) => {
        const dist = calculateDistance(parseFloat(last.latitude), parseFloat(last.longitude), parseFloat(p.latitude), parseFloat(p.longitude));
        if (dist < minDist) { minDist = dist; nearestIdx = idx; }
      });
      sorted.push(remaining[nearestIdx]);
      remaining.splice(nearestIdx, 1);
    }
    return sorted;
  };

  const groupPlacesByDays = (placesArray, numDays) => {
    if (!placesArray || placesArray.length === 0) return [];
    const sorted = sortPlacesByProximity(placesArray);
    const total = sorted.length;
    let grouped = [], currentIdx = 0, dayCount = 0;
    const placesPerDay = Math.ceil(total / numDays);
    while (currentIdx < total && dayCount < numDays) {
      dayCount++;
      const remaining = total - currentIdx;
      const placesThisDay = Math.min(placesPerDay, remaining);
      if (placesThisDay <= 0) break;
      const dayPlaces = sorted.slice(currentIdx, currentIdx + placesThisDay).map((place, idx) => {
        if (dayCount === 1 && idx === 0) return { ...place, distance: 0 };
        if (idx === 0) {
          const prevDayLast = grouped[dayCount - 2]?.places?.[grouped[dayCount - 2]?.places?.length - 1];
          if (!prevDayLast) return { ...place, distance: 0 };
          return { ...place, distance: calculateDistance(parseFloat(prevDayLast.latitude), parseFloat(prevDayLast.longitude), parseFloat(place.latitude), parseFloat(place.longitude)) };
        }
        const prev = sorted[currentIdx + idx - 1];
        return { ...place, distance: calculateDistance(parseFloat(prev.latitude), parseFloat(prev.longitude), parseFloat(place.latitude), parseFloat(place.longitude)) };
      });
      grouped.push({ day: dayCount, places: dayPlaces });
      currentIdx += placesThisDay;
    }
    return grouped;
  };

  const generateItinerary = async () => {
    if (!mood) { toast.error("No mood identified to generate itinerary."); return; }
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/itinerary/filter?category=${mood}&district=${districtFromUrl || ''}`);
      const fetchedPlaces = response.data || [];
      setPlaces(fetchedPlaces);
      if (fetchedPlaces.length > 0 && daysFromUrl) {
        setGroupedPlaces(groupPlacesByDays(fetchedPlaces, parseInt(daysFromUrl)));
      }
      setShowRecommendations(true);
      toast.success("AI Itinerary Generated Successfully");
    } catch (error) {
      toast.error("Failed to fetch recommendations.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserFeedbacks = async () => {
    try {
      const response = await axiosInstance.get(`/api/trip-places/feedbacks?district=${districtFromUrl}&category=${mood}`);
      setUserFeedbacks(response.data || []);
      setShowFeedbackModal(true);
    } catch { toast.error('Failed to load user feedbacks'); }
  };

  const fetchEvents = async () => {
    if (!districtFromUrl) { toast.warning('No district selected to fetch events.'); return; }
    setEventsLoading(true);
    try {
      const response = await axiosInstance.get(`/api/events/bydistrict/${districtFromUrl}`);
      setEvents(response.data || []);
      setShowEventsModal(true);
    } catch { toast.error('Failed to load events'); }
    finally { setEventsLoading(false); }
  };

  const saveItinerary = async () => {
    if (!user || !user.useremail) { toast.error("Please login to save itinerary"); return; }
    if (places.length === 0) { toast.warning("No places to save"); return; }
    const placeIds = places.map(p => p.id);
    const payload = { user: user.useremail, placeids: JSON.stringify(placeIds), district: districtFromUrl, days: parseInt(daysFromUrl) || 3, category: mood };
    try {
      await axiosInstance.post('/api/trip-places/save', payload);
      toast.success('Itinerary saved successfully!');
    } catch { toast.error('Failed to save itinerary'); }
  };

  const createCustomItinerary = () => navigate('/main/ItineraryDisplay');

  return (
    <div className="mcqr">
      <ToastContainer position="top-center" />

      {/* ── LOADING ── */}
      {loading && (
        <div className="mcqr__loading">
          <motion.div className="mcqr__pulse-orb" animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} />
          <div className="mcqr__loading-text">Crafting your itinerary…</div>
        </div>
      )}

      {/* ── RESULTS ── */}
      {showRecommendations && groupedPlaces.length > 0 && (
        <div className="mcqr__page">

          {/* ══ HERO HEADER ══ */}
          <div className="mcqr__hero">
            {/* background image already set via CSS ::before — dynamic district overlay */}
            <div className="mcqr__hero-overlay" />

            {/* Back button inside hero */}
            <button className="mcqr__hero-back" onClick={() => navigate(-1)}>
              <ChevronLeftIcon /> Back
            </button>

            <div className="mcqr__hero-content">
              <h1 className="mcqr__hero-district">{districtFromUrl || 'Karnataka'}</h1>
              <p className="mcqr__hero-subtitle">ITINERARY</p>
              <div className="mcqr__hero-pills">
                {mood && <span className="mcqr__hero-pill">{mood}</span>}
                {daysFromUrl && <span className="mcqr__hero-pill">{daysFromUrl} days</span>}
              </div>
            </div>

            {/* ══ ACTION STRIP ══ */}
            <div className="mcqr__action-strip">
              {/* Primary */}
              <div className="mcqr__action-primary">
                <button className="mcqr__btn-save" onClick={saveItinerary}>
                  <BookmarkIcon /> Save Itinerary
                </button>
                <button className="mcqr__btn-events" onClick={fetchEvents}>
                  <MapPinIcon size={14} /> View Events
                </button>
              </div>
              {/* Secondary */}
              <div className="mcqr__action-secondary">
                <button className="mcqr__btn-text" onClick={fetchUserFeedbacks}>
                  <StarIcon /> Reviews
                </button>
                <button className="mcqr__btn-text" onClick={createCustomItinerary}>
                  <EditIcon /> Create Custom
                </button>
              </div>
            </div>
          </div>

          {/* ══ DAY TIMELINE ══ */}
          <div className="mcqr__inner">
            <div className="mcqr__timeline">
              {groupedPlaces.map((dayGroup, dayIdx) => (
                <motion.div
                  key={dayIdx}
                  className="mcqr__day"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: dayIdx * 0.15, ease: 'easeOut' }}
                >
                  {/* Day marker — numbered circle */}
                  <div className="mcqr__day-marker">
                    <div className="mcqr__day-circle">
                      <span className="mcqr__day-num">{dayGroup.day}</span>
                    </div>
                    <span className="mcqr__day-label">Day {dayGroup.day}</span>
                  </div>

                  {/* Day content — no border box, just cards + map btn */}
                  <div className="mcqr__day-body">
                    <div className="mcqr__places-row">
                      {dayGroup.places.map((place, idx) => (
                        <motion.div
                          key={idx}
                          className="mcqr__place-card"
                          whileHover={{ y: -6 }}
                          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        >
                          {/* Photo zone */}
                          <div className="mcqr__place-img">
                            {place.imageUrl ? (
                              <img
                                src={place.imageUrl}
                                alt={place.place}
                                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('mcqr__place-img--empty'); }}
                              />
                            ) : (
                              <div className="mcqr__place-img-empty-inner"><CompassIcon /></div>
                            )}
                            {/* Photo overlay gradient */}
                            <div className="mcqr__place-img-fade" />
                            {/* Distance badge — top-right of photo */}
                            {idx > 0 && place.distance > 0 && (
                              <span className="mcqr__dist-badge">
                                <RouteIcon /> {place.distance} km
                              </span>
                            )}
                          </div>

                          {/* Info zone */}
                          <div className="mcqr__place-info">
                            <h3 className="mcqr__place-name" title={place.place}>
                              {shortName(place.place)}
                            </h3>
                            <p className="mcqr__place-desc">
                              {place.description || 'A wonderful destination to explore.'}
                            </p>
                            <div className="mcqr__place-learn">
                              Learn more <ArrowIcon />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* View Route Button — full-width, elevated */}
                    <motion.button
                      className="mcqr__route-btn"
                      onClick={() => {
                        setMapPlaces(dayGroup.places);
                        setMapTitle(`Day ${dayGroup.day} Route`);
                        setShowMapModal(true);
                      }}
                      whileHover={{ backgroundColor: 'rgba(184,134,11,0.18)' }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <MapPinIcon size={15} /> View Day {dayGroup.day} Route →
                    </motion.button>
                  </div>

                  {/* Inter-day divider */}
                  {dayIdx < groupedPlaces.length - 1 && <div className="mcqr__day-divider" />}
                </motion.div>
              ))}
            </div>

            {/* ══ BOTTOM CTA STRIP ══ */}
            <div className="mcqr__cta-strip">
              <div className="mcqr__cta-copy">
                <p className="mcqr__cta-headline">Your {districtFromUrl} journey is ready</p>
                <p className="mcqr__cta-sub">Save it to access later or build a custom plan</p>
              </div>
              <div className="mcqr__cta-buttons">
                <button className="mcqr__cta-save" onClick={saveItinerary}>
                  <BookmarkIcon /> Save Itinerary
                </button>
                <button className="mcqr__cta-custom" onClick={createCustomItinerary}>
                  <EditIcon /> Create Custom
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PRE-RESULTS STATE ── */}
      {!showRecommendations && !loading && (
        <div className="mcqr__inner">
          <button className="mcqr__back-plain" onClick={() => navigate(-1)}>
            <ChevronLeftIcon /> Back
          </button>
          <motion.div className="mcqr__pre" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="mcqr__pre-heading">Your Journey Awaits</h2>
            <div className="mcqr__pills">
              {mood && <span className="mcqr__pill">{mood}</span>}
              {districtFromUrl && <span className="mcqr__pill">{districtFromUrl}</span>}
            </div>
            <div className="mcqr__pre-actions">
              <button className="mcqr__btn-events" onClick={fetchEvents}><MapPinIcon size={14} /> View Events</button>
              <button className="mcqr__btn-text" onClick={fetchUserFeedbacks}><StarIcon /> Reviews</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {showRecommendations && places.length === 0 && (
        <div className="mcqr__inner">
          <motion.div className="mcqr__empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mcqr__empty-icon"><CompassIcon /></div>
            <h3 className="mcqr__empty-heading">No destinations found</h3>
            <p className="mcqr__empty-text">We couldn't find recommendations for your selected mood and location.</p>
            <button className="mcqr__cta-save" onClick={createCustomItinerary}>Create Custom Itinerary</button>
          </motion.div>
        </div>
      )}

      {/* ── FEEDBACK MODAL ── */}
      <AnimatePresence>
        {showFeedbackModal && (
          <motion.div className="mcqr__overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFeedbackModal(false)}>
            <motion.div className="mcqr__modal mcqr__modal--feedback" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} transition={{ duration: 0.3 }} onClick={e => e.stopPropagation()}>
              <div className="mcqr__modal-header">
                <h3 className="mcqr__modal-title">Traveller Reviews</h3>
                <button className="mcqr__modal-close" onClick={() => setShowFeedbackModal(false)}>×</button>
              </div>
              <div className="mcqr__modal-body">
                {userFeedbacks.length > 0 ? userFeedbacks.map((fb, idx) => (
                  <div key={idx} className="mcqr__fb-card">
                    <div className="mcqr__fb-user">{fb.user}</div>
                    <div className="mcqr__fb-pills">
                      {fb.district && <span className="mcqr__fb-pill">{fb.district}</span>}
                      {fb.category && <span className="mcqr__fb-pill">{fb.category}</span>}
                    </div>
                    <p className="mcqr__fb-text">{fb.review || 'No review provided'}</p>
                  </div>
                )) : <div className="mcqr__fb-empty">No reviews yet</div>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EVENTS MODAL ── */}
      <AnimatePresence>
        {showEventsModal && (
          <motion.div className="mcqr__overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEventsModal(false)}>
            <motion.div className="mcqr__modal mcqr__modal--feedback" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} transition={{ duration: 0.3 }} onClick={e => e.stopPropagation()}>
              <div className="mcqr__modal-header">
                <h3 className="mcqr__modal-title">Events in {districtFromUrl}</h3>
                <button className="mcqr__modal-close" onClick={() => setShowEventsModal(false)}>×</button>
              </div>
              <div className="mcqr__modal-body">
                {eventsLoading ? <div className="mcqr__fb-empty">Loading events…</div>
                  : events.length > 0 ? events.map((evt, idx) => (
                    <div key={idx} className="mcqr__fb-card">
                      <div className="mcqr__fb-user"><CalendarIcon />{evt.district || 'Event'}</div>
                      <div className="mcqr__fb-pills">
                        {evt.eventDate && <span className="mcqr__fb-pill">{new Date(evt.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                      </div>
                      <p className="mcqr__fb-text">{evt.description || 'No description available'}</p>
                      {evt.locationUrl && <a href={evt.locationUrl} target="_blank" rel="noopener noreferrer" className="mcqr__btn-events" style={{ display: 'inline-flex', marginTop: 8, fontSize: '0.78rem', padding: '6px 14px' }}><MapPinIcon size={13} /> View Location</a>}
                    </div>
                  )) : <div className="mcqr__fb-empty">No events found in {districtFromUrl}</div>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAP MODAL ── */}
      <AnimatePresence>
        {showMapModal && (
          <motion.div className="mcqr__overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMapModal(false)}>
            <motion.div className="mcqr__modal mcqr__modal--map" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} transition={{ duration: 0.3 }} onClick={e => e.stopPropagation()}>
              <div className="mcqr__modal-header">
                <h3 className="mcqr__modal-title">{mapTitle}</h3>
                <button className="mcqr__modal-close" onClick={() => setShowMapModal(false)}>×</button>
              </div>
              <div className="mcqr__map-body">
                <RouteMapComponent places={mapPlaces} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MCQResult;

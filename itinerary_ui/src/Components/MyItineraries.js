import React, { useEffect, useState, useContext } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate, NavLink } from "react-router-dom";
import { UserContext } from "../App";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import "./AllCss/MyItineraries.css";
import ModernDropdown from "./ModernDropdown";


/* ─── SVG Icons ─── */
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
  </svg>
);
const CompassIcon = () => (
  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="1">
    <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88" fill="rgba(184,134,11,0.2)" stroke="#B8860B"/>
  </svg>
);
const StarFilled = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#B8860B" stroke="#B8860B" strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const StarEmpty = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="rgba(194,178,128,0.25)" strokeWidth="1.5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const MapPinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

/* ─── Main Component ─── */
function MyItineraries() {
  const { user } = useContext(UserContext);
  const [itineraries, setItineraries] = useState([]);
  const [viewData, setViewData]       = useState([]);
  const [statusData, setStatusData]   = useState({});
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const [showEventsModal, setShowEventsModal]       = useState(false);
  const [selectedItinerary, setSelectedItinerary]   = useState(null);
  const [feedback, setFeedback]           = useState("");
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);
  const [events, setEvents]   = useState([]);
  const [district, setDistrict] = useState("");
  const [rating, setRating]   = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const navigate = useNavigate();
  const [placeIds, setPlaceIds] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => { 
    if (user) {
      fetchItineraries(); 
    }
  }, [user]);

  const fetchItineraries = async () => {
    try {
      const response = await axiosInstance.get("/api/trip-places/all");
      const userItineraries = (response.data || []).filter(
        (it) => user && it.user === user.useremail
      );
      const places = (response.data || [])
        .map(it => JSON.parse(it.placeids || "[]")).flat();
      setPlaceIds(places);
      userItineraries.forEach((it) => {
        it.statusData = it.statusJson
          ? (() => { try { return JSON.parse(it.statusJson); } catch { return {}; } })()
          : {};
      });
      setItineraries(userItineraries);
    } catch { toast.error("Error fetching itineraries."); }
  };

  /* ─── Distance helpers ─── */
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371, toRad = x => x * Math.PI / 180;
    const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
    return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(2));
  }

  const sortPlacesByProximity = (places) => {
    if (!places || places.length < 2) return places;
    const sorted = [places[0]];
    let remaining = [...places.slice(1)];
    while (remaining.length > 0) {
      const last = sorted[sorted.length - 1];
      let ni = 0, minD = Infinity;
      remaining.forEach((p, i) => {
        const d = calculateDistance(+last.latitude, +last.longitude, +p.latitude, +p.longitude);
        if (d < minD) { minD = d; ni = i; }
      });
      sorted.push(remaining[ni]);
      remaining.splice(ni, 1);
    }
    return sorted;
  };

  const groupPlacesByDays = (places, days) => {
    if (!places?.length) return [];
    const sorted = sortPlacesByProximity(places);
    const ppd = days === 3 ? 3 : days === 2 ? 4 : 3;
    const grouped = [];
    let idx = 0, day = 0;
    while (idx < sorted.length && day < days) {
      day++;
      const count = Math.min(ppd, sorted.length - idx);
      if (count <= 0) break;
      const dayPlaces = sorted.slice(idx, idx + count).map((p, i) => {
        if (day === 1 && i === 0) return { ...p, distance: 0 };
        if (i === 0) {
          const prev = grouped[day-2]?.places?.at(-1);
          return { ...p, distance: prev ? calculateDistance(+prev.latitude, +prev.longitude, +p.latitude, +p.longitude) : 0 };
        }
        const prev = sorted[idx + i - 1];
        return { ...p, distance: calculateDistance(+prev.latitude, +prev.longitude, +p.latitude, +p.longitude) };
      });
      grouped.push({ day, places: dayPlaces });
      idx += count;
    }
    return grouped;
  };

  const fetchFilteredData = async (dist, days, pids, itinerary) => {
    try {
      const ids = typeof pids === "string" ? JSON.parse(pids) : pids;
      if (!Array.isArray(ids) || !ids.length) { toast.warn("No valid place IDs."); setViewData([]); return; }
      const res = await axiosInstance.get(`/api/itinerary/byIds?ids=${ids.join(',')}`);
      const valid = res.data.filter(p => !isNaN(+p.latitude) && !isNaN(+p.longitude));
      setViewData(groupPlacesByDays(valid, days));
      setSelectedItinerary(itinerary);
      setFeedback(itinerary.review || "");
      setRating(itinerary.rating || 0);
      setIsEditingFeedback(!itinerary.review);
      setStatusData(itinerary.statusData || {});
      setShowItineraryModal(true);
    } catch { toast.error("Failed to fetch itinerary data."); setViewData([]); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "";

  const generateMapUrl = (places) => {
    if (!places?.length) return "#";
    return `https://www.google.com/maps/dir/${places.map(p => encodeURIComponent(`${p.district || ''},${p.place || ''}`)).join('/')}`;
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this journey?")) return;
    try { await axiosInstance.delete(`/api/trip-places/delete/${id}`); toast.success("Journey deleted."); fetchItineraries(); }
    catch { toast.error("Error deleting journey."); }
  };

  const submitFeedback = async () => {
    if (!feedback.trim()) { toast.warn("Feedback cannot be empty."); return; }
    try {
      await axiosInstance.put(`/api/trip-places/updateview/${selectedItinerary.id}`, { review: feedback, rating }, { headers: { "Content-Type": "application/json" } });
      toast.success("Feedback submitted!"); setIsEditingFeedback(false); fetchItineraries();
    } catch { toast.error("Failed to submit feedback."); }
  };

  const handleStatusChange = async (placeId, newStatus) => {
    try {
      const updated = { ...statusData, [placeId]: newStatus };
      setStatusData(updated);
      await axiosInstance.put(`/api/trip-places/updatestatus/${selectedItinerary.id}`, updated);
      toast.success("Status updated!");
    } catch { toast.error("Failed to update status."); }
  };

  const calcCompletion = () => {
    if (!viewData?.length) return 0;
    const total = viewData.reduce((s, d) => s + d.places.length, 0);
    const visited = Object.values(statusData).filter(s => s === "Visited").length;
    return total ? Math.round((visited / total) * 100) : 0;
  };

  const handleShowEvents = async (districtName) => {
    try {
      const res = await axiosInstance.get(`/api/events/bydistrict/${encodeURIComponent(districtName)}`);
      setDistrict(districtName); setEvents(res.data || []); setShowEventsModal(true);
    } catch { toast.error("Error fetching events."); }
  };

  const handleRatingSubmit = async (newRating) => {
    try {
      await axiosInstance.put(`/api/trip-places/updateview/${selectedItinerary.id}`, { rating: newRating }, { headers: { "Content-Type": "application/json" } });
      toast.success("Rating updated!"); setRating(newRating); fetchItineraries();
    } catch { toast.error("Failed to update rating."); }
  };

  const renderStars = (forDisplay = false, displayRating = 0) => {
    const cur = forDisplay ? displayRating : (hoverRating || rating);
    const sz = forDisplay ? 13 : 22;
    return [1, 2, 3, 4, 5].map((star) => (
      <button key={star} className="myit__star-btn"
        onMouseEnter={forDisplay ? null : () => setHoverRating(star)}
        onMouseLeave={forDisplay ? null : () => setHoverRating(0)}
        onClick={forDisplay ? null : () => handleRatingSubmit(star)}
        style={{ cursor: forDisplay ? "default" : "pointer" }}>
        {cur >= star ? <StarFilled size={sz} /> : <StarEmpty size={sz} />}
      </button>
    ));
  };

  const isCardVisited = (it) => it.statusData && Object.values(it.statusData).some(s => s === "Visited");

  /* Derived stats */
  const totalDays = itineraries.reduce((s, it) => s + (Number(it.days) || 0), 0);
  const uniqueDistricts = new Set(itineraries.map(it => it.district).filter(Boolean)).size;
  const completedCount = itineraries.filter(isCardVisited).length;
  const completionPct = itineraries.length ? Math.round((completedCount / itineraries.length) * 100) : 0;

  /* Filter counts */
  const visitedCount   = itineraries.filter(isCardVisited).length;
  const unvisitedCount = itineraries.filter(it => !isCardVisited(it)).length;

  const filtered = itineraries.filter(it => {
    if (filter === "visited")   return isCardVisited(it);
    if (filter === "unvisited") return !isCardVisited(it);
    return true;
  });

  /* Subtitle */
  const subtitle = itineraries.length
    ? `${itineraries.length} ${itineraries.length === 1 ? "journey" : "journeys"} · ${totalDays} days across Karnataka`
    : "Your saved Karnataka itineraries";

  return (
    <div className="myit">
      <ToastContainer position="top-center" theme="dark"
        toastStyle={{ background: '#1A0F08', color: '#FAF6EE', border: '1px solid #B8860B' }} />
      <div className="myit__inner">

        {/* ── HEADER ── */}
        <div className="myit__header-animation-wrapper">
          <div className="myit__header-row">
            <h1 className="myit__heading">My Journeys</h1>
            <NavLink className="myit__new-btn" to="/Main/ItineraryDisplay">
              <PlusIcon /> New Journey
            </NavLink>
          </div>
          <p className="myit__subheading">{subtitle}</p>
          <hr className="myit__heading-rule" />
        </div>

        {/* ── STATS STRIP ── */}
        {itineraries.length > 0 && (
          <div className="myit__stats">
            {[
              { label: "Total Journeys",   value: itineraries.length },
              { label: "Days Planned",     value: totalDays },
              { label: "Districts",        value: uniqueDistricts },
              { label: "Completion",       value: `${completionPct}%` },
            ].map((s, i) => (
              <div key={i} className="myit__stat">
                <span className="myit__stat-value">{s.value}</span>
                <span className="myit__stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── FILTER TABS ── */}
        {itineraries.length > 0 && (
          <div className="myit__filters">
            {[
              { key: "all",       label: "All",       count: itineraries.length },
              { key: "visited",   label: "Visited",   count: visitedCount },
              { key: "unvisited", label: "Unvisited", count: unvisitedCount },
            ].map(f => (
              <button key={f.key}
                className={`myit__filter-pill${filter === f.key ? ' myit__filter-pill--active' : ''}`}
                onClick={() => setFilter(f.key)}>
                {f.label}
                <span className="myit__filter-count">({f.count})</span>
              </button>
            ))}
          </div>
        )}

        {/* ── CARD GRID ── */}
        {itineraries.length > 0 ? (
          <div className="myit__grid">

            {filtered.map((itinerary) => {
              const visited = isCardVisited(itinerary);
              return (
                <div
                  key={itinerary.id}
                  className={`myit__card${visited ? ' myit__card--visited' : ''}`}>



                  {/* Top row: status + delete */}
                  <div className="myit__card-top">
                    <span className={`myit__status-badge${visited ? ' myit__status-badge--visited' : ''}`}>
                      {visited ? "✓ Visited" : "Unvisited"}
                    </span>
                    <div className="myit__card-actions-top">
                      <button className="myit__delete-btn"
                        onClick={(e) => { e.stopPropagation(); handleDelete(itinerary.id); }}>
                        <TrashIcon />
                      </button>
                    </div>
                  </div>

                  {/* Bottom content */}
                  <div className="myit__card-body">
                    <span className="myit__card-mood">{itinerary.category || "Journey"}</span>
                    <h3 className="myit__card-district">{itinerary.district}</h3>
                    <p className="myit__card-meta">{itinerary.days} {itinerary.days === 1 ? "day" : "days"}</p>
                    <div className="myit__card-stars">
                      {renderStars(true, itinerary.rating || 0)}
                      <span className="myit__card-rating-text">
                        {itinerary.rating ? itinerary.rating.toFixed(1) : "Unrated"}
                      </span>
                    </div>
                    <hr className="myit__card-divider" />
                    <div className="myit__card-footer">
                      <div className="myit__card-footer-left">
                        <button className="myit__action-link"
                          onClick={() => fetchFilteredData(itinerary.district, itinerary.days, itinerary.placeids, itinerary)}>
                          View Itinerary →
                        </button>
                        <button className="myit__action-link myit__action-link--muted"
                          onClick={(e) => { e.stopPropagation(); handleShowEvents(itinerary.district); }}>
                          <MapPinIcon /> Events
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Placeholder card: Add New Journey */}
            {filtered.length % 3 !== 0 || filtered.length === 0 ? null : null}
            <NavLink className="myit__placeholder-card" to="/Main/ItineraryDisplay">
              <span className="myit__placeholder-icon">+</span>
              <span className="myit__placeholder-text">Plan a new journey</span>
            </NavLink>

          </div>
        ) : (
          /* Empty state */
          <div className="myit__empty">
            <div className="myit__empty-icon"><CompassIcon /></div>
            <h3 className="myit__empty-heading">No journeys saved yet</h3>
            <p className="myit__empty-text">Start planning your first Karnataka adventure.</p>
            <button className="myit__gold-btn" onClick={() => navigate('/Main/ItineraryDisplay')}>
              Start Planning →
            </button>
          </div>
        )}

        {/* Empty filter state */}
        {itineraries.length > 0 && filtered.length === 0 && (
          <div className="myit__empty">
            <div className="myit__empty-icon"><CompassIcon /></div>
            <h3 className="myit__empty-heading">
              {filter === "visited" ? "No visited journeys yet" : "No unvisited journeys"}
            </h3>
            <p className="myit__empty-text">
              {filter === "visited"
                ? "Complete a journey and mark places visited to see them here."
                : "All your journeys are completed!"}
            </p>
          </div>
        )}

      </div>

      {/* ── ITINERARY MODAL ── */}
      <AnimatePresence>
        {showItineraryModal && (
          <motion.div className="myit__overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowItineraryModal(false)}>
            <motion.div className="myit__modal"
              initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }} transition={{ duration: 0.25 }}
              onClick={e => e.stopPropagation()}>
              <div className="myit__modal-header">
                <h3 className="myit__modal-title">
                  {selectedItinerary?.district} — {selectedItinerary?.days} day itinerary
                </h3>
                <button className="myit__modal-close" onClick={() => setShowItineraryModal(false)}>×</button>
              </div>
              <div className="myit__modal-body">
                {viewData.length > 0 ? (
                  <>
                    <div className="myit__progress-wrap">
                      <div className="myit__progress-label">
                        <span>Completion</span>
                        <span>{calcCompletion()}% ({Object.values(statusData).filter(s=>s==="Visited").length}/{viewData.reduce((s,d)=>s+d.places.length,0)})</span>
                      </div>
                      <div className="myit__progress-track">
                        <div className="myit__progress-fill" style={{ width: `${calcCompletion()}%` }} />
                      </div>
                    </div>

                    <div className="myit__stars-section">
                      <span className="myit__stars-section-label">Rate:</span>
                      {renderStars()}
                      <span className="myit__stars-text">{rating ? `${rating} star${rating!==1?'s':''}` : "Click to rate"}</span>
                    </div>

                    {viewData.map((dayGroup, dayIdx) => (
                      <div key={dayIdx} className="myit__day-card">
                        <div className="myit__day-card-header">
                          <span className="myit__day-badge">Day {dayGroup.day}</span>
                          <h4 className="myit__day-title">Day {dayGroup.day} Itinerary</h4>
                        </div>
                        <div className="myit__day-card-body">
                          {dayGroup.places.map((place, idx) => (
                            <div key={idx} className="myit__place-row">
                              {place.imageUrl
                                ? <div className="myit__place-img-wrap"><img src={place.imageUrl} alt={place.place} onError={e=>{e.target.style.display='none'}}/></div>
                                : <div className="myit__place-img-empty"><CompassIcon /></div>}
                              <div className="myit__place-details">
                                <h5 className="myit__place-name">{place.place}</h5>
                                <p className="myit__place-desc">{place.description}</p>
                                {idx > 0 && <p className="myit__place-dist">↗ {place.distance} km from previous</p>}
                                <div className="myit__status-select-wrap">
                                  <ModernDropdown
                                    options={["Visited", "Not Visited"]}
                                    value={statusData[place.id] || ""}
                                    onChange={val => handleStatusChange(place.id, val)}
                                    placeholder="Select Status"
                                    searchable={false}
                                    grouped={false}
                                    direction="up"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                          <div className="myit__map-link">
                            <a href={generateMapUrl(dayGroup.places)} target="_blank" rel="noopener noreferrer" className="myit__ghost-btn">
                              <MapPinIcon /> View Map — Day {dayGroup.day}
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="myit__feedback-section">
                      <div className="myit__feedback-label">Your Notes</div>
                      <textarea className="myit__feedback-textarea" rows={3}
                        value={feedback} readOnly={!isEditingFeedback}
                        onChange={e => setFeedback(e.target.value)} />
                      {isEditingFeedback
                        ? <button className="myit__gold-btn" style={{ marginTop: 10 }} onClick={submitFeedback}>Submit Feedback</button>
                        : <button className="myit__ghost-btn" style={{ marginTop: 10 }} onClick={() => setIsEditingFeedback(true)}>✏️ Edit Notes</button>}
                    </div>
                  </>
                ) : (
                  <p style={{ color: 'rgba(194,178,128,0.4)' }}>No itinerary data available.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EVENTS MODAL ── */}
      <AnimatePresence>
        {showEventsModal && (
          <motion.div className="myit__overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowEventsModal(false)}>
            <motion.div className="myit__modal"
              initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }} transition={{ duration: 0.25 }}
              onClick={e => e.stopPropagation()}>
              <div className="myit__modal-header">
                <h3 className="myit__modal-title">Events in {district}</h3>
                <button className="myit__modal-close" onClick={() => setShowEventsModal(false)}>×</button>
              </div>
              <div className="myit__modal-body">
                {events.length > 0 ? events.map(event => (
                  <div key={event.id} className="myit__event-card">
                    <h4 className="myit__event-name">{event.eventname}</h4>
                    <p className="myit__event-meta"><strong>District:</strong> {event.district}</p>
                    <p className="myit__event-meta"><strong>Date:</strong> {formatDate(event.eventDate)}</p>
                    <p className="myit__event-desc">{event.description}</p>
                    {event.locationUrl && (
                      <a href={event.locationUrl} target="_blank" rel="noopener noreferrer" className="myit__event-link">View Location</a>
                    )}
                  </div>
                )) : (
                  <div className="myit__events-empty">No events found for {district}.</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MyItineraries;
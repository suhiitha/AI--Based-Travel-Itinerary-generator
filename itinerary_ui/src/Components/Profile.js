import React, { useContext, useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "./AllCss/Profile.css";
import { UserContext } from "../App";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../api/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FiMail, FiShield, FiCalendar, FiMapPin, FiCompass, FiSun,
  FiAward, FiEdit2, FiLogOut, FiMap
} from "react-icons/fi";

/* Explorer tier based on trip count */
function getExplorerTier(tripCount) {
  if (tripCount === 0) return "Aspiring Explorer";
  if (tripCount < 3)  return "Karnataka Wanderer";
  if (tripCount < 7)  return "Karnataka Explorer";
  return "Karnataka Veteran";
}

function Profile() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [stats, setStats]             = useState({ trips: 0, districts: 0, places: 0, days: 0 });
  const [recentTrip, setRecentTrip]   = useState(null);
  const [preferences, setPreferences] = useState({ district: null, category: null, tripType: null });

  /* Edit Profile state */
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName]   = useState("");

  /* Pull itinerary data to derive stats */
  useEffect(() => {
    if (!user) return;
    axiosInstance.get("/api/trip-places/all")
      .then(res => {
        const all = (res.data || []).filter(it => it.user === user.useremail);
        if (!all.length) return;

        // Trips count
        const trips = all.length;

        // Unique districts
        const districtSet = new Set(all.map(it => it.district).filter(Boolean));

        // Total days
        const totalDays = all.reduce((s, it) => s + (Number(it.days) || 0), 0);

        // Places count (from placeids arrays)
        const totalPlaces = all.reduce((s, it) => {
          try { return s + JSON.parse(it.placeids || "[]").length; } catch { return s; }
        }, 0);

        // Most recent
        const sorted = [...all].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setRecentTrip(sorted[0] || null);

        // Favourite district (most frequent)
        const districtFreq = {};
        all.forEach(it => { if (it.district) districtFreq[it.district] = (districtFreq[it.district] || 0) + 1; });
        const favDistrict = Object.entries(districtFreq).sort((a,b)=>b[1]-a[1])[0]?.[0] || null;

        // Favourite category
        const catFreq = {};
        all.forEach(it => { if (it.category) catFreq[it.category] = (catFreq[it.category] || 0) + 1; });
        const favCategory = Object.entries(catFreq).sort((a,b)=>b[1]-a[1])[0]?.[0] || null;

        // Favourite tripType
        const ttFreq = {};
        all.forEach(it => { if (it.tripType) ttFreq[it.tripType] = (ttFreq[it.tripType] || 0) + 1; });
        const favTripType = Object.entries(ttFreq).sort((a,b)=>b[1]-a[1])[0]?.[0] || null;

        setStats({ trips, districts: districtSet.size, places: totalPlaces, days: totalDays });
        setPreferences({ district: favDistrict, category: favCategory, tripType: favTripType });
      })
      .catch(() => {});
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const handleEditOpen = () => {
    setEditName(user.username);
    setIsEditing(true);
  };

  const handleEditSave = async () => {
    if (!editName.trim()) {
      toast.warn("Username cannot be empty");
      return;
    }
    
    try {
      const res = await axiosInstance.put(`/api/registor/update/${user.id}`, {
        username: editName.trim()
      });
      
      const updatedUser = { ...user, username: res.data.username };
      setUser(updatedUser);
      // App.js handles the localStorage sync via useEffect, so we're good
      
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    }
  };

  if (!user) {
    return (
      <div className="prof">
        <p className="prof__loading">Loading profile…</p>
      </div>
    );
  }

  const initial = user.username ? user.username.charAt(0).toUpperCase() : "?";
  const tier     = getExplorerTier(stats.trips);
  const tagline  = stats.trips > 0
    ? `${stats.trips} ${stats.trips === 1 ? "journey" : "journeys"} across Karnataka`
    : "Your first journey awaits";

  const STAT_BLOCKS = [
    { label: "Trips Planned",     value: stats.trips,     icon: <FiCalendar /> },
    { label: "Districts Explored",value: stats.districts, icon: <FiMapPin />   },
    { label: "Places Visited",    value: stats.places,    icon: <FiCompass />  },
    { label: "Days Travelled",    value: stats.days,      icon: <FiSun />      },
  ];

  return (
    <div className="prof">
      <motion.div
        className="prof__card"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
      >

        {/* ══════════════════════════════
            ZONE 1 — HERO IDENTITY BANNER
            ══════════════════════════════ */}
        <div className="prof__banner">
          <div className="prof__banner-overlay" />
        </div>

        {/* Avatar — sits over the banner/identity boundary */}
        <div className="prof__avatar-wrap">
          <div className="prof__avatar">
            <span className="prof__avatar-letter">{initial}</span>
          </div>
        </div>

        {/* Identity text — sits below overlapping avatar */}
        <div className="prof__identity">
          <h2 className="prof__name">{user.username}</h2>
          <div className="prof__tier-badge">
            <FiAward className="prof__tier-icon" />
            {tier}
          </div>
          <p className="prof__tagline">{tagline}</p>
        </div>

        {/* ══════════════════════════════
            ZONE 2 — TRAVEL STATS STRIP
            ══════════════════════════════ */}
        <div className="prof__stats">
          {STAT_BLOCKS.map((s, i) => (
            <div key={i} className="prof__stat">
              <span className="prof__stat-value">{s.value}</span>
              <span className="prof__stat-icon">{s.icon}</span>
              <span className="prof__stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════
            ZONE 3 — ACCOUNT + PREFERENCES + RECENT
            ══════════════════════════════ */}
        <div className="prof__body">

          {/* Account info */}
          <div className="prof__section">
            <p className="prof__section-label">Account</p>
            <div className="prof__info-row">
              <FiMail className="prof__row-icon" />
              <span className="prof__row-value">{user.useremail}</span>
            </div>
            <div className="prof__info-row">
              <FiShield className="prof__row-icon" />
              <span className="prof__row-value">Traveller</span>
            </div>
          </div>

          <hr className="prof__section-divider" />

          {/* Travel Preferences */}
          <div className="prof__section">
            <p className="prof__section-label">Travel Preferences</p>
            {preferences.district || preferences.category || preferences.tripType ? (
              <div className="prof__pref-tags">
                {preferences.district  && <span className="prof__tag">📍 {preferences.district}</span>}
                {preferences.category  && <span className="prof__tag">🏷 {preferences.category}</span>}
                {preferences.tripType  && <span className="prof__tag">🧭 {preferences.tripType}</span>}
              </div>
            ) : (
              <p className="prof__pref-empty">Start planning to unlock your travel profile</p>
            )}
          </div>

          <hr className="prof__section-divider" />

          {/* Recent Journey */}
          <div className="prof__section">
            <p className="prof__section-label">Last Journey</p>
            {recentTrip ? (
              <div className="prof__recent-card">
                <div className="prof__recent-info">
                  <span className="prof__recent-district">{recentTrip.district}</span>
                  <span className="prof__recent-meta">
                    {recentTrip.days} days · {recentTrip.category || "—"}
                  </span>
                </div>
                <NavLink className="prof__recent-link" to="/Main/my-itineraries">
                  View Journey <span className="prof__recent-arrow">→</span>
                </NavLink>
              </div>
            ) : (
              <NavLink className="prof__recent-empty-link" to="/Main/ItineraryDisplay">
                Your first journey awaits →
              </NavLink>
            )}
          </div>

        </div>

        {/* ══════════════════════════════
            ZONE 4 — ACTION ROW
            ══════════════════════════════ */}
        <div className="prof__actions">
          <div className="prof__action-left">
            <button className="prof__ghost-btn" onClick={handleEditOpen}>
              <FiEdit2 /> Edit Profile
            </button>
            <NavLink className="prof__ghost-btn" to="/Main/my-itineraries">
              <FiMap /> My Journeys
            </NavLink>
          </div>
          <button className="prof__logout-link" onClick={handleLogout}>
            <FiLogOut /> Sign out
          </button>
        </div>

      </motion.div>

      {/* ══════════════════════════════
          EDIT PROFILE MODAL
          ══════════════════════════════ */}
      <AnimatePresence>
        {isEditing && (
          <div className="prof__modal-overlay" onClick={() => setIsEditing(false)}>
            <motion.div 
              className="prof__modal"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="prof__modal-title">Edit Profile</h3>
              <p className="prof__modal-subtitle">Update your travel identity</p>
              
              <div className="prof__modal-field">
                <label>Username</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={e => setEditName(e.target.value)} 
                  placeholder="Enter your explorer name"
                />
              </div>

              <div className="prof__modal-actions">
                <button className="prof__modal-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                <button className="prof__modal-save" onClick={handleEditSave}>Save Changes</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <ToastContainer position="top-center" theme="dark" toastStyle={{ background: '#2C1A0E', color: '#FAF6EE', border: '1px solid #B8860B' }} />
    </div>
  );
}

export default Profile;

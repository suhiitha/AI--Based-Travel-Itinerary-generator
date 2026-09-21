import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import '../Components/AllCss/Admin.css';
import '../Components/AllCss/AdminFeedbacks.css';

// Reusable avatar color generator
const getAvatarColor = (name) => {
  return 'rgba(255, 255, 255, 0.05)';
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

function AdminFeedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setIsRefreshing(true);
      const response = await axiosInstance.get("/api/trip-places/all");
      // Only keep items that actually have a review
      const validFeedbacks = (response.data || []).filter(item => item.review != null && item.review.trim() !== "");
      setFeedbacks(validFeedbacks);
    } catch (error) {
      console.error("Failed to load feedbacks:", error);
      toast.error("Failed to load feedbacks.");
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const filteredFeedbacks = feedbacks.filter(item => {
    const query = searchQuery.toLowerCase();
    const userMatch = (item.user || "Anonymous").toLowerCase().includes(query);
    const districtMatch = (item.district || "").toLowerCase().includes(query);
    const categoryMatch = (item.category || "").toLowerCase().includes(query);
    const reviewMatch = (item.review || "").toLowerCase().includes(query);
    return userMatch || districtMatch || categoryMatch || reviewMatch;
  });

  return (
    <motion.div 
      className="adm-page-content adm-fb-page"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* 1. Header Section */}
      <motion.div className="adm-header-wrapper" variants={itemVariants}>
        <div className="adm-breadcrumb">Dashboard <span>/</span> User Feedbacks</div>
        <div className="adm-header">
          <div className="adm-header__left">
            <h1 className="adm-header__title">User Feedbacks</h1>
            <p className="adm-header__subtitle">Review and monitor user opinions and experiences.</p>
          </div>
          <div className="adm-header__right">
            <button className="adm-btn-outline" onClick={fetchFeedbacks} disabled={isRefreshing}>
              <svg className={isRefreshing ? "spin-icon" : ""} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
              {isRefreshing ? 'Refreshing...' : 'Refresh Feedbacks'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. Stats Bar */}
      <motion.div className="adm-fb__stats-row" variants={itemVariants}>
        <div className="adm-fb__stat-pill">
          <span className="adm-fb__stat-icon">💬</span>
          <strong>{feedbacks.length}</strong> Total Feedbacks
        </div>
        <div className="adm-fb__stat-pill">
          <span className="adm-fb__stat-icon">👤</span>
          <strong>{feedbacks.filter(f => f.user).length}</strong> Named Users
        </div>
        <div className="adm-fb__stat-pill">
          <span className="adm-fb__stat-icon">🕵️</span>
          <strong>{feedbacks.filter(f => !f.user).length}</strong> Anonymous
        </div>
      </motion.div>

      {/* 3. Search Bar */}
      <motion.div className="adm-toolbar-wrapper" variants={itemVariants}>
        <div className="adm-toolbar">
          <div className="adm-toolbar__search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              type="text" 
              placeholder="Search by user, district, category, or review content..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </motion.div>

      {/* 4. Feedback Grid */}
      <motion.div variants={itemVariants}>
        {loading ? (
          <div className="adm-fb__grid">
            {[1, 2, 3].map(n => (
              <div key={n} className="adm-skeleton-row" style={{ height: '200px' }}></div>
            ))}
          </div>
        ) : filteredFeedbacks.length > 0 ? (
          <div className="adm-fb__grid">
            {filteredFeedbacks.map((item, idx) => {
              const isAnon = !item.user;
              const displayName = isAnon ? 'Anonymous User' : item.user;
              const avatarLetter = isAnon ? '?' : displayName.charAt(0).toUpperCase();
              
              return (
                <div key={idx} className="adm-fb__card">
                  <div className="adm-fb__card-header">
                    <div 
                      className={`adm-fb__avatar ${isAnon ? 'adm-fb__avatar--anon' : ''}`} 
                      style={!isAnon ? { background: getAvatarColor(displayName) } : {}}
                    >
                      {avatarLetter}
                    </div>
                    <div className="adm-fb__user-info">
                      <h4 className="adm-fb__user-name">{displayName}</h4>
                      <p className="adm-fb__user-meta">User Feedback</p>
                    </div>
                  </div>
                  
                  <p className="adm-fb__review">"{item.review}"</p>
                  
                  <div className="adm-fb__tags">
                    {item.district && (
                      <span className="adm-fb__tag adm-fb__tag--district">{item.district}</span>
                    )}
                    {item.category && (
                      <span className="adm-fb__tag adm-fb__tag--category">{item.category}</span>
                    )}
                    {!item.district && !item.category && (
                      <span className="adm-fb__tag adm-fb__tag--district" style={{ background: 'rgba(255,255,255,0.05)', color: '#a1a1aa', borderColor: 'rgba(255,255,255,0.1)' }}>General App Feedback</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="adm-fb__empty">
            <svg className="adm-fb__empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <h3>No feedbacks found</h3>
            <p>We couldn't find any feedbacks matching your search criteria. Try adjusting your search query.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default AdminFeedbacks;

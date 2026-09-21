import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './AllCss/NotFound.css';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="nf">
      <div className="nf__orb--gold" />
      <div className="nf__orb--blue" />
      <div className="nf__watermark">404</div>

      <motion.div
        className="nf__content"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        <h1 className="nf__title">Page Not Found</h1>
        <p className="nf__subtitle">The destination you're looking for doesn't exist.</p>
        <motion.button
          className="nf__btn"
          onClick={() => navigate('/main')}
          whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(212, 168, 67, 0.25)' }}
          whileTap={{ scale: 0.97 }}
        >
          Back to Dashboard
        </motion.button>
      </motion.div>
    </div>
  );
}

export default NotFound;

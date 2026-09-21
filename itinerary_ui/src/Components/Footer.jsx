import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import './AllCss/Homep.css';

const Footer = () => {
  return (
    <footer className="payana-footer">
      <div className="payana-footer-top">
        <div className="footer-col brand-col">
          <div className="footer-brand-lockup">
            <h3 className="footer-logo">Payana.</h3>
            <p className="footer-tagline">AI Travel Planner</p>
          </div>
          <p className="footer-desc">Curated journeys designed by artificial intelligence, perfected by human wanderlust.</p>
          <div className="footer-socials">
            <a href="#" aria-label="Facebook"><FaFacebookF /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
          </div>
        </div>
        
        <div className="footer-col">
          <h4 className="footer-heading">Explore</h4>
          <div className="footer-rule"></div>
          <ul className="footer-links">
            <li><Link to="#destinations">Destinations</Link></li>
            <li><Link to="#experiences">Experiences</Link></li>
            <li><Link to="#routes">Curated Routes</Link></li>
            <li><Link to="#weekend">Weekend Escapes</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Product</h4>
          <div className="footer-rule"></div>
          <ul className="footer-links">
            <li><Link to="/Login">AI Planner</Link></li>
            <li><Link to="#pricing">Pricing</Link></li>
            <li><Link to="#features">Features</Link></li>
            <li><Link to="#reviews">Reviews</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Company</h4>
          <div className="footer-rule"></div>
          <ul className="footer-links">
            <li><Link to="#about">About Us</Link></li>
            <li><Link to="#careers">Careers</Link></li>
            <li><Link to="#press">Press</Link></li>
            <li><Link to="#contact">Contact</Link></li>
          </ul>
        </div>
      </div>

      <div className="payana-footer-bottom">
        <div className="footer-copyright">
          &copy; {new Date().getFullYear()} Payana. All rights reserved.
        </div>
        <div className="footer-legal">
          <Link to="#privacy">Privacy Policy</Link>
          <Link to="#terms">Terms of Service</Link>
        </div>
        <div className="footer-made-in">
          Made with <span className="gold-diamond">♦</span> in India
        </div>
      </div>
    </footer>
  );
};

export default Footer;

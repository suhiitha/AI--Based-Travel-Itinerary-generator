import React, { useContext, useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { UserContext } from '../App';
import './AllCss/Main.css';
import { FiHome, FiList, FiUser, FiMapPin, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

function Main() {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = () => {
    // Clear JWT token and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkClass = ({ isActive }) =>
    `pnav__link${isActive ? ' pnav__link--active' : ''}`;

  const navItems = (
    <>
      <NavLink className={linkClass} to="/Main" end onClick={() => setMenuOpen(false)}>
        <FiHome />
        Home
      </NavLink>
      <NavLink className={linkClass} to="ItineraryDisplay" onClick={() => setMenuOpen(false)}>
        <FiList />
        Itinerary
      </NavLink>
      <NavLink className={linkClass} to="Profile" onClick={() => setMenuOpen(false)}>
        <FiUser />
        Profile
      </NavLink>
      <NavLink className={linkClass} to="my-itineraries" onClick={() => setMenuOpen(false)}>
        <FiMapPin />
        My Journeys
      </NavLink>
      <button className="pnav__logout" onClick={() => { setMenuOpen(false); handleLogout(); }}>
        <FiLogOut />
        LogOut
      </button>
    </>
  );

  return (
    <div>
      <nav className={`pnav${scrolled ? ' pnav--scrolled' : ''}`}>
        <NavLink className="pnav__logo" to="/Main">Payana.</NavLink>

        {/* Desktop links */}
        <div className="pnav__links">{navItems}</div>

        {/* Hamburger */}
        <button className="pnav__hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      <div className={`pnav__mobile${menuOpen ? ' pnav__mobile--open' : ''}`}>
        {navItems}
      </div>

      {/* Page content with offset */}
      <div className="pnav__body">
        <Outlet />
      </div>
    </div>
  );
}

export default Main;

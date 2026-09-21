import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Components/AllCss/Admin.css';

function Admin() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    toast.success("Logging out...");
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const isActive = (path) => location.pathname.includes(path);

  return (
    <div className="adm">
      <div className="adm__content">
        
        {/* Mobile Sidebar Toggle */}
        <button className="adm__mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>

        {/* Sidebar */}
        <nav className={`adm__sidebar ${sidebarOpen ? 'adm__sidebar--open' : ''}`}>
          <div className="adm__sidebar-header">
            <Link to="/admin" className="adm__sidebar-brand">
              <div className="adm__sidebar-logo">P</div>
              <div className="adm__sidebar-brand-text">
                <span className="adm__sidebar-brand-name">Payana</span>
                <span className="adm__sidebar-brand-sub">admin</span>
              </div>
            </Link>
          </div>
          <div className="adm__sidebar-nav">
            <div className="adm__sidebar-group">MAIN</div>
            <Link to="/admin" className={`adm__sidebar-link${!location.pathname.includes('/admin/') && !location.pathname.includes('upditinerary') && !location.pathname.includes('viewitineraries') && !location.pathname.includes('updevents') && !location.pathname.includes('adminprofile') && !location.pathname.includes('manageusers') && !location.pathname.includes('feedbacks') ? ' adm__sidebar-link--active' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              <span>Dashboard</span>
            </Link>
            
            <div className="adm__sidebar-group" style={{ marginTop: '16px' }}>MANAGEMENT</div>
            <Link to="manageusers" className={`adm__sidebar-link${isActive('manageusers') ? ' adm__sidebar-link--active' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
              <span>Manage Users</span>
            </Link>
            <Link to="upditinerary" className={`adm__sidebar-link${isActive('upditinerary') ? ' adm__sidebar-link--active' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              <span>Create Itinerary</span>
            </Link>
            <Link to="viewitineraries" className={`adm__sidebar-link${isActive('viewitineraries') ? ' adm__sidebar-link--active' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <span>View All</span>
            </Link>
            <Link to="updevents" className={`adm__sidebar-link${isActive('updevents') ? ' adm__sidebar-link--active' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span>Events</span>
            </Link>

            <div className="adm__sidebar-group" style={{ marginTop: '16px' }}>COMMUNICATION</div>
            <Link to="feedbacks" className={`adm__sidebar-link${isActive('feedbacks') ? ' adm__sidebar-link--active' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              <span>Feedbacks</span>
            </Link>

            <div className="adm__sidebar-group" style={{ marginTop: '16px' }}>SYSTEM</div>
            <Link to="/" className="adm__sidebar-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              <span>Go to User Site</span>
            </Link>
            <Link to="adminprofile" className={`adm__sidebar-link${isActive('adminprofile') ? ' adm__sidebar-link--active' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>Profile</span>
            </Link>
          </div>

          <div className="adm__sidebar-bottom">
            <div className="adm__user-chip">
              <div className="adm__user-avatar">A</div>
              <div className="adm__user-info">
                <div className="adm__user-name">Administrator</div>
                <div className="adm__user-email">admin@payana.com</div>
              </div>
              <button className="adm__user-logout" onClick={handleLogout} title="Logout">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>
          </div>
        </nav>

        {/* Page Content Wrapper */}
        <div className="adm__page-wrapper">
          {/* Top Header Bar */}
          <header className="adm__topbar">
            <div className="adm__topbar-left">
              <span className="adm__breadcrumb" style={{ fontSize: '18px', fontWeight: '600' }}>
                Admin
              </span>
            </div>
            <div className="adm__topbar-right">
              <div className="adm__search-wrap">
                <svg className="adm__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" className="adm__search-input" placeholder="Search..." />
              </div>
              <button className="adm__bell-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                <span className="adm__bell-badge"></span>
              </button>
              <div className="adm__avatar-wrapper">
                <div className="adm__topbar-pill" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <div className="adm__topbar-avatar-circle">
                    AD
                    <span className="adm__topbar-status-dot"></span>
                  </div>
                  <div className="adm__topbar-user-info">
                    <span className="adm__topbar-name">admin</span>
                    <span className="adm__topbar-role">SUPER ADMIN</span>
                  </div>
                </div>
                {dropdownOpen && (
                  <div className="adm__avatar-dropdown">
                    <button className="adm__avatar-dropdown-item" onClick={() => { setDropdownOpen(false); navigate('/admin/adminprofile'); }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      Profile
                    </button>
                    <button className="adm__avatar-dropdown-item adm__avatar-dropdown-item--danger" onClick={handleLogout}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="adm__page">
            <Outlet />
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Admin;
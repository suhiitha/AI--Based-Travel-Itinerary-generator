import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { 
  FiMail, FiShield, FiCalendar, FiClock, 
  FiEdit2, FiKey, FiLogOut, FiLock, FiMonitor,
  FiMapPin, FiMap, FiX, FiEye, FiEyeOff
} from "react-icons/fi";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../Components/AllCss/Admin.css";

// Custom hook for animated count-up
const useCountUp = (end, duration = 1500) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    let animationFrame;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    if (end > 0) {
      animationFrame = requestAnimationFrame(step);
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
};

// Reusable Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="adm__fp-modal-overlay" onMouseDown={handleOutsideClick}>
      <div className="adm__fp-modal-content" ref={modalRef} onMouseDown={(e) => e.stopPropagation()}>
        <div className="adm__fp-modal-header">
          <h3>{title}</h3>
          <button className="adm__fp-modal-close" onClick={onClose}><FiX /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

function AdminProfile() {
  const [adminData, setAdminData] = useState(null);
  const [stats, setStats] = useState({ places: 0, districts: 0 });
  const navigate = useNavigate();

  const placesCount = useCountUp(stats.places);
  const districtsCount = useCountUp(stats.districts);

  // Modal States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({ fullName: '', email: '', phone: '' });

  // Password Form State
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [passError, setPassError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await axiosInstance.get("/api/admin/getdata");
        const data = response.data;
        if (Array.isArray(data) && data.length > 0) {
          setAdminData(data[0]);
          setEditForm({ 
            fullName: data[0].fullName || data[0].username.split('@')[0], 
            email: data[0].username, 
            phone: data[0].phone || '' 
          });
        } else {
          console.error("Invalid admin data format:", data);
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };

    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get("/api/trip-places/all");
        const places = response.data || [];
        const uniqueDistricts = new Set(places.map(p => p.district)).size;
        setStats({ places: places.length, districts: uniqueDistricts });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchAdminData();
    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate("/AdminLogin");
  };

  // Handlers for Edit Profile
  const handleEditSubmit = async () => {
    setIsLoading(true);
    try {
      await axiosInstance.put(`/api/admin/update/${adminData.id}`, {
        username: editForm.email,
        fullName: editForm.fullName,
        phone: editForm.phone
      });
      setAdminData({ ...adminData, username: editForm.email, fullName: editForm.fullName, phone: editForm.phone });
      toast.success("Profile updated successfully!");
      setIsEditOpen(false);
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers for Password Change
  const validatePasswordForm = () => {
    if (passForm.new.length > 0 && passForm.new.length < 8) {
      setPassError('New password must be at least 8 characters');
      return false;
    }
    if (passForm.new !== passForm.confirm) {
      setPassError('Passwords do not match');
      return false;
    }
    setPassError('');
    return passForm.current && passForm.new && passForm.confirm && passForm.new === passForm.confirm && passForm.new.length >= 8;
  };

  const handlePasswordSubmit = async () => {
    if (!validatePasswordForm()) return;
    
    setIsLoading(true);
    try {
      await axiosInstance.put(`/api/admin/change-password/${adminData.id}`, {
        currentPassword: passForm.current,
        newPassword: passForm.new
      });
      toast.success("Password changed successfully!");
      setIsPasswordOpen(false);
      setPassForm({ current: '', new: '', confirm: '' }); // reset
    } catch (error) {
      toast.error(error.response?.data || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePassVisibility = (field) => {
    setShowPass(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const closePasswordModal = () => {
    setIsPasswordOpen(false);
    setPassForm({ current: '', new: '', confirm: '' });
    setPassError('');
  };

  const initial = adminData?.username ? adminData.username.charAt(0).toUpperCase() : "?";
  const joinedDate = "Oct 12, 2023";
  const lastLogin = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " Today";

  const recentActivity = [
    { id: 1, type: 'add', text: 'Added place: Coorg Viewpoint', time: '2 hrs ago', icon: <FiMapPin /> },
    { id: 2, type: 'update', text: 'Updated district: Mysore', time: 'Yesterday', icon: <FiMap /> },
    { id: 3, type: 'add', text: 'Added place: Gokarna Beach', time: '3 days ago', icon: <FiMapPin /> },
  ];

  return (
    <div className="adm__fp-wrapper">
      <ToastContainer theme="dark" position="bottom-right" />
      <div className="adm__fp-background-glow"></div>

      <div className="adm__fp-container" style={{ paddingTop: '48px' }}>
        {/* Header Section (Avatar + Actions) */}
        <div className="adm__fp-header-section">
          <div className="adm__fp-avatar-group">
            <div className="adm__fp-avatar">
              {initial}
              <div className="adm__fp-status-dot" title="Online"></div>
            </div>
            {adminData && (
              <div className="adm__fp-name-info">
                <h1 className="adm__fp-name">{adminData.fullName || adminData.username.split('@')[0]}</h1>
                <div className="adm__fp-role-pill">Super Admin</div>
              </div>
            )}
          </div>

          <div className="adm__fp-header-actions">
            <button className="adm__fp-btn adm__fp-btn-outline" onClick={() => setIsEditOpen(true)}>
              <FiEdit2 /> Edit Profile
            </button>
            <button className="adm__fp-btn adm__fp-btn-outline" onClick={() => setIsPasswordOpen(true)}>
              <FiKey /> Password
            </button>
            <button className="adm__fp-btn adm__fp-btn-danger" onClick={handleLogout}>
              <FiLogOut /> Logout
            </button>
          </div>
        </div>

        {adminData ? (
          <div className="adm__fp-content-grid">
            {/* Left Column - Info & Security */}
            <div className="adm__fp-col-left">
              <h3 className="adm__fp-section-title">Profile Information</h3>
              <div className="adm__fp-info-list">
                <div className="adm__fp-info-row">
                  <div className="adm__fp-info-icon" style={{ color: '#60a5fa', background: 'rgba(96, 165, 250, 0.1)' }}>
                    <FiMail />
                  </div>
                  <div className="adm__fp-info-content">
                    <div className="adm__fp-info-label">Email Address</div>
                    <div className="adm__fp-info-value">{adminData.username}</div>
                  </div>
                </div>
                {adminData.phone && (
                  <div className="adm__fp-info-row">
                    <div className="adm__fp-info-icon" style={{ color: '#fca5a5', background: 'rgba(252, 165, 165, 0.1)' }}>
                      <FiMonitor />
                    </div>
                    <div className="adm__fp-info-content">
                      <div className="adm__fp-info-label">Phone Number</div>
                      <div className="adm__fp-info-value">{adminData.phone}</div>
                    </div>
                  </div>
                )}
                <div className="adm__fp-info-row">
                  <div className="adm__fp-info-icon" style={{ color: '#c084fc', background: 'rgba(192, 132, 252, 0.1)' }}>
                    <FiShield />
                  </div>
                  <div className="adm__fp-info-content">
                    <div className="adm__fp-info-label">Role</div>
                    <div className="adm__fp-info-value">Administrator</div>
                  </div>
                </div>
                <div className="adm__fp-info-row">
                  <div className="adm__fp-info-icon" style={{ color: '#34d399', background: 'rgba(52, 211, 153, 0.1)' }}>
                    <FiCalendar />
                  </div>
                  <div className="adm__fp-info-content">
                    <div className="adm__fp-info-label">Joined Date</div>
                    <div className="adm__fp-info-value">{joinedDate}</div>
                  </div>
                </div>
                <div className="adm__fp-info-row">
                  <div className="adm__fp-info-icon" style={{ color: '#f472b6', background: 'rgba(244, 114, 182, 0.1)' }}>
                    <FiClock />
                  </div>
                  <div className="adm__fp-info-content">
                    <div className="adm__fp-info-label">Last Login</div>
                    <div className="adm__fp-info-value">{lastLogin}</div>
                  </div>
                </div>
              </div>

              <h3 className="adm__fp-section-title" style={{ marginTop: '40px' }}>Security Settings</h3>
              <div className="adm__fp-security-box">
                <div className="adm__fp-sec-item">
                  <FiMonitor className="adm__fp-sec-icon" />
                  <div className="adm__fp-sec-text">
                    Last login from: <strong>Chrome, Mysuru, KA</strong>
                  </div>
                </div>
                <div className="adm__fp-sec-item">
                  <FiLock className="adm__fp-sec-icon" />
                  <div className="adm__fp-sec-text">
                    Account secured with: <strong>Email & Password</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Stats & Activity */}
            <div className="adm__fp-col-right">
              <h3 className="adm__fp-section-title">Recent Activity</h3>
              <div className="adm__fp-activity-feed">
                {recentActivity.map((act) => (
                  <div key={act.id} className="adm__fp-activity-item">
                    <div className="adm__fp-activity-icon">
                      {act.icon}
                    </div>
                    <div className="adm__fp-activity-content">
                      <div className="adm__fp-activity-text">{act.text}</div>
                      <div className="adm__fp-activity-time">{act.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="adm__fp-loading">Loading admin details...</div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Profile">
        <div className="adm__fp-modal-body">
          <div className="adm__fp-input-group">
            <label className="adm__fp-input-label">Full Name</label>
            <input 
              type="text" 
              className="adm__fp-input" 
              value={editForm.fullName} 
              onChange={e => setEditForm({...editForm, fullName: e.target.value})}
              placeholder="e.g. John Doe"
            />
          </div>
          <div className="adm__fp-input-group">
            <label className="adm__fp-input-label">Email Address</label>
            <input 
              type="email" 
              className="adm__fp-input" 
              value={editForm.email} 
              onChange={e => setEditForm({...editForm, email: e.target.value})}
            />
          </div>
          <div className="adm__fp-input-group">
            <label className="adm__fp-input-label">Phone Number (Optional)</label>
            <input 
              type="tel" 
              className="adm__fp-input" 
              value={editForm.phone} 
              onChange={e => setEditForm({...editForm, phone: e.target.value})}
              placeholder="+91 98765 43210"
            />
          </div>
        </div>
        <div className="adm__fp-modal-actions">
          <button className="adm__fp-cancel-btn" onClick={() => setIsEditOpen(false)} disabled={isLoading}>Cancel</button>
          <button className="adm__fp-save-btn" onClick={handleEditSubmit} disabled={isLoading || !editForm.email}>
            {isLoading && <div className="adm__fp-spinner"></div>}
            Save Changes
          </button>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={isPasswordOpen} onClose={closePasswordModal} title="Change Password">
        <div className="adm__fp-modal-body">
          <div className="adm__fp-input-group">
            <label className="adm__fp-input-label">Current Password</label>
            <input 
              type={showPass.current ? "text" : "password"} 
              className="adm__fp-input" 
              value={passForm.current}
              onChange={e => {
                setPassForm({...passForm, current: e.target.value});
                setPassError('');
              }}
              placeholder="Enter current password"
            />
            <button className="adm__fp-password-toggle" onClick={() => togglePassVisibility('current')}>
              {showPass.current ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          <div className="adm__fp-input-group">
            <label className="adm__fp-input-label">New Password</label>
            <input 
              type={showPass.new ? "text" : "password"} 
              className={`adm__fp-input ${passError.includes('8') ? 'error' : ''}`}
              value={passForm.new}
              onChange={e => {
                setPassForm({...passForm, new: e.target.value});
                setPassError('');
              }}
              placeholder="Minimum 8 characters"
            />
            <button className="adm__fp-password-toggle" onClick={() => togglePassVisibility('new')}>
              {showPass.new ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          <div className="adm__fp-input-group">
            <label className="adm__fp-input-label">Confirm New Password</label>
            <input 
              type={showPass.confirm ? "text" : "password"} 
              className={`adm__fp-input ${passError.includes('match') ? 'error' : ''}`}
              value={passForm.confirm}
              onChange={e => {
                setPassForm({...passForm, confirm: e.target.value});
                setPassError('');
              }}
              placeholder="Confirm new password"
            />
            <button className="adm__fp-password-toggle" onClick={() => togglePassVisibility('confirm')}>
              {showPass.confirm ? <FiEyeOff /> : <FiEye />}
            </button>
            {passError && <span className="adm__fp-error-text">{passError}</span>}
          </div>
        </div>
        <div className="adm__fp-modal-actions">
          <button className="adm__fp-cancel-btn" onClick={closePasswordModal} disabled={isLoading}>Cancel</button>
          <button 
            className="adm__fp-save-btn" 
            onClick={handlePasswordSubmit} 
            disabled={isLoading || !passForm.current || !passForm.new || !passForm.confirm}
          >
            {isLoading && <div className="adm__fp-spinner"></div>}
            Update Password
          </button>
        </div>
      </Modal>

    </div>
  );
}

export default AdminProfile;

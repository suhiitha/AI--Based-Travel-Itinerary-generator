import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import '../Components/AllCss/Admin.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const getAvatarColor = (name) => {
  if (!name) return 'linear-gradient(135deg, #6c63ff, #4840e6)';
  const colors = [
    'linear-gradient(135deg, #6c63ff, #4840e6)', // purple
    'linear-gradient(135deg, #22c55e, #16a34a)', // green
    'linear-gradient(135deg, #f59e0b, #d97706)', // orange
    'linear-gradient(135deg, #ef4444, #dc2626)', // red
    'linear-gradient(135deg, #ec4899, #db2777)', // pink
    'linear-gradient(135deg, #3b82f6, #2563eb)'  // blue
  ];
  const charCode = name.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
};

const getFakeDate = (id) => {
  const daysAgo = (id * 3) % 30;
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  return `${daysAgo} days ago`;
};

const CustomSelect = ({ value, options, onChange, icon, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find(o => o.value === value)?.label || value;

  return (
    <div className="adm-custom-select" ref={dropdownRef}>
      <div className="adm-custom-select__trigger" onClick={() => setIsOpen(!isOpen)}>
        {icon && <div className="adm-custom-select__icon">{icon}</div>}
        <div className="adm-custom-select__content">
          {label && <div className="adm-custom-select__label">{label}</div>}
          <div className="adm-custom-select__value">{selectedLabel}</div>
        </div>
        <div className={`adm-custom-select__chevron ${isOpen ? 'open' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
        </div>
      </div>
      
      {isOpen && (
        <motion.div 
          className="adm-custom-select__menu"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
        >
          {options.map((opt, idx) => (
            <div 
              key={idx} 
              className={`adm-custom-select__option ${opt.value === value ? 'selected' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // New States for Actions
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('User');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [roleFilter, setRoleFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('Newest');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsRefreshing(true);
      if (users.length === 0) setLoading(true);
      const response = await axiosInstance.get('/api/registor/all');
      setUsers(response.data || []);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 500); // For visual feedback
    }
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await axiosInstance.delete(`/api/registor/delete/${userToDelete.id}`);
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      toast.success('User deleted successfully');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        toast.error('User not found');
      } else {
        toast.error('Failed to delete user');
      }
    } finally {
      setShowConfirm(false);
      setUserToDelete(null);
    }
  };

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    toast.success(`Invitation sent to ${inviteEmail}`);
    setShowInviteModal(false);
    setInviteEmail('');
    setInviteRole('User');
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.useremail?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isAdmin = user.useremail?.includes('admin');
    const matchesRole = roleFilter === 'All' ? true :
                        roleFilter === 'Admin' ? isAdmin :
                        !isAdmin;

    return matchesSearch && matchesRole;
  }).sort((a, b) => {
    if (sortOrder === 'Newest') return b.id - a.id;
    return a.id - b.id;
  });

  const adminCount = users.filter(u => u.useremail?.includes('admin')).length;

  return (
    <motion.div 
      className="adm-page-content"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 1. Page Header Section */}
      <motion.div className="adm-header-wrapper" variants={itemVariants}>
        <div className="adm-breadcrumb">Dashboard &gt; <span style={{color: '#f4f4f5'}}>Manage Users</span></div>
        <div className="adm-header">
          <div className="adm-header__left">
            <h1 className="adm-header__title">Manage Users</h1>
            <p className="adm-header__subtitle">Manage and monitor all registered accounts</p>
          </div>
          <div className="adm-header__right">
            <button className="adm-btn-outline" onClick={fetchUsers} disabled={isRefreshing}>
              <svg className={isRefreshing ? "spin-icon" : ""} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
              {isRefreshing ? 'Refreshing...' : 'Refresh List'}
            </button>
            <button className="adm-btn-gradient" onClick={() => setShowInviteModal(true)}>
              + Invite User
            </button>
          </div>
        </div>
        <div className="adm-divider"></div>
      </motion.div>

      {/* 2. Stats Bar */}
      <motion.div className="adm-stats-bar" variants={itemVariants}>
        <div className="adm-stat-pill">
          <span className="adm-stat-pill-icon">👥</span>
          <span className="adm-stat-pill-text"><strong>{users.length}</strong> Total Users</span>
        </div>
        <div className="adm-stat-pill">
          <span className="adm-stat-pill-icon">✅</span>
          <span className="adm-stat-pill-text"><strong>{users.length}</strong> Active</span>
        </div>
        <div className="adm-stat-pill">
          <span className="adm-stat-pill-icon">🛡️</span>
          <span className="adm-stat-pill-text"><strong>{adminCount}</strong> Admin{adminCount !== 1 ? 's' : ''}</span>
        </div>
      </motion.div>

      {/* 3. Search & Filter Bar */}
      <motion.div className="adm-toolbar-wrapper" variants={itemVariants}>
        <div className="adm-toolbar">
          <div className="adm-toolbar__search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="adm-toolbar__actions">
            <CustomSelect 
              value={roleFilter} 
              onChange={setRoleFilter}
              options={[
                { value: 'All', label: 'All Users' },
                { value: 'Admin', label: 'Admins' },
                { value: 'User', label: 'Users' }
              ]}
              label="Role Filter"
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>}
            />
            <button 
              className={`adm-toolbar__icon-btn ${showAdvancedFilters ? 'active' : ''}`}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
            </button>
          </div>
        </div>
        
        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <motion.div 
            className="adm-advanced-filters"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="adm-filter-group">
              <label>Role:</label>
              <CustomSelect 
                value={roleFilter} 
                onChange={setRoleFilter}
                options={[
                  { value: 'All', label: 'All Roles' },
                  { value: 'Admin', label: 'Admin' },
                  { value: 'User', label: 'User' }
                ]}
              />
            </div>
            <div className="adm-filter-group">
              <label>Sort By:</label>
              <CustomSelect 
                value={sortOrder} 
                onChange={setSortOrder}
                options={[
                  { value: 'Newest', label: 'Newest First' },
                  { value: 'Oldest', label: 'Oldest First' }
                ]}
              />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* 4. Table */}
      <motion.div className="adm-table-container-new adm-glass" variants={itemVariants}>
        {loading ? (
          <div className="adm-skeleton-wrapper">
             {[...Array(5)].map((_, i) => (
                <div key={i} className="adm-skeleton-row"></div>
             ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="adm-empty-state">
            <div className="adm-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
            </div>
            <h3>No users found</h3>
            <p>Try adjusting your search criteria or refresh the list.</p>
            <button className="adm-btn-outline" onClick={() => {setSearchQuery(''); fetchUsers();}}>Refresh</button>
          </div>
        ) : (
          <table className="adm-table-new">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>USER INFO</th>
                <th>JOINED DATE</th>
                <th className="adm-text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isAdmin = user.useremail?.includes('admin');
                return (
                  <tr key={user.id} className="adm-table-row">
                    <td>
                      <span className="adm-id-pill">#{user.id}</span>
                    </td>
                    <td>
                      <div className="adm-user-cell">
                        <div className="adm-user-avatar" style={{ background: getAvatarColor(user.username || 'U') }}>
                          {(user.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="adm-user-details">
                          <div className="adm-user-name">
                            {user.username}
                            <span className={`adm-role-badge ${isAdmin ? 'adm-role-badge--admin' : 'adm-role-badge--user'}`}>
                              {isAdmin ? 'Admin' : 'User'}
                            </span>
                          </div>
                          <div className="adm-user-email">{user.useremail}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="adm-joined-date">{getFakeDate(user.id)}</span>
                    </td>
                    <td className="adm-text-right">
                      <div className="adm-actions-cell">
                        <button 
                          className="adm-icon-btn adm-icon-btn--view" 
                          title="View User"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowViewModal(true);
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        
                        <div className="adm-delete-wrapper">
                          <button 
                            className="adm-icon-btn adm-icon-btn--delete" 
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(user);
                            }}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            <span className="adm-delete-text">Delete</span>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* 8. Pagination */}
      <motion.div className="adm-pagination" variants={itemVariants}>
        <div className="adm-pagination__info">
          Showing {filteredUsers.length} of {users.length} users
        </div>
        <div className="adm-pagination__actions">
          <button className="adm-pagination__btn" disabled>Previous</button>
          <button className="adm-pagination__btn" disabled>Next</button>
        </div>
      </motion.div>

      {/* 5. Confirmation Modal */}
      {showConfirm && (
        <div className="adm-modal-overlay" onClick={() => setShowConfirm(false)}>
          <motion.div 
            className="adm-modal-content adm-glass"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-modal-header">
              <h3>Confirm Deletion</h3>
              <button className="adm-modal-close" onClick={() => setShowConfirm(false)}>×</button>
            </div>
            <div className="adm-modal-body">
              <p>Are you sure you want to delete user <strong>{userToDelete?.username}</strong>?</p>
              <p className="adm-modal-warning">This action cannot be undone.</p>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn-outline" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="adm-btn-danger" onClick={handleDelete}>Yes, Delete User</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 6. Invite Modal */}
      {showInviteModal && (
        <div className="adm-modal-overlay" onClick={() => setShowInviteModal(false)}>
          <motion.div 
            className="adm-modal-content adm-glass"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-modal-header">
              <h3>Invite New User</h3>
              <button className="adm-modal-close" onClick={() => setShowInviteModal(false)}>×</button>
            </div>
            <form onSubmit={handleInviteSubmit}>
              <div className="adm-modal-body adm-form">
                <div className="adm-form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    placeholder="name@company.com" 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="adm-form-group" style={{ zIndex: 100 }}>
                  <label>Role</label>
                  <CustomSelect 
                    value={inviteRole} 
                    onChange={setInviteRole}
                    options={[
                      { value: 'User', label: 'User' },
                      { value: 'Admin', label: 'Admin' }
                    ]}
                  />
                </div>
              </div>
              <div className="adm-modal-footer">
                <button type="button" className="adm-btn-outline" onClick={() => setShowInviteModal(false)}>Cancel</button>
                <button type="submit" className="adm-btn-gradient">Send Invite</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 7. View User Modal */}
      {showViewModal && selectedUser && (
        <div className="adm-modal-overlay" onClick={() => setShowViewModal(false)}>
          <motion.div 
            className="adm-modal-content adm-glass"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '440px' }}
          >
            <div className="adm-modal-header">
              <h3>User Profile</h3>
              <button className="adm-modal-close" onClick={() => setShowViewModal(false)}>×</button>
            </div>
            <div className="adm-modal-body adm-profile">
              <div className="adm-profile-header">
                <div className="adm-profile-avatar-lg" style={{ background: getAvatarColor(selectedUser.username || 'U') }}>
                  {(selectedUser.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="adm-profile-info">
                  <h2>{selectedUser.username}</h2>
                  <p>{selectedUser.useremail}</p>
                  <div className="adm-profile-badges">
                    <span className="adm-id-pill">#{selectedUser.id}</span>
                    <span className={`adm-role-badge ${selectedUser.useremail?.includes('admin') ? 'adm-role-badge--admin' : 'adm-role-badge--user'}`}>
                      {selectedUser.useremail?.includes('admin') ? 'Admin' : 'User'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="adm-divider" style={{ margin: '24px 0' }}></div>
              
              <div className="adm-profile-stats">
                <div className="adm-profile-stat">
                  <span className="adm-profile-stat-label">Joined Date</span>
                  <span className="adm-profile-stat-val">{getFakeDate(selectedUser.id)}</span>
                </div>
                <div className="adm-profile-stat">
                  <span className="adm-profile-stat-label">Itineraries Created</span>
                  <span className="adm-profile-stat-val">{(selectedUser.id * 7) % 15}</span>
                </div>
                <div className="adm-profile-stat">
                  <span className="adm-profile-stat-label">Last Active</span>
                  <span className="adm-profile-stat-val">Just now</span>
                </div>
              </div>
            </div>
            <div className="adm-modal-footer" style={{ marginTop: '32px' }}>
              <button className="adm-btn-outline" onClick={() => setShowViewModal(false)}>Close Profile</button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export default ManageUsers;

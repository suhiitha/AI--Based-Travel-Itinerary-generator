import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Sector
} from 'recharts';
import "../Components/AllCss/Admin.css";

const sparklineData1 = [{ v: 2 }, { v: 5 }, { v: 4 }, { v: 6 }, { v: 8 }, { v: 7 }, { v: 10 }];
const sparklineData2 = [{ v: 10 }, { v: 8 }, { v: 9 }, { v: 12 }, { v: 11 }, { v: 15 }, { v: 18 }];
const sparklineData3 = [{ v: 5 }, { v: 5 }, { v: 5 }, { v: 5 }, { v: 5 }, { v: 5 }, { v: 5 }];
const sparklineData4 = [{ v: 20 }, { v: 22 }, { v: 21 }, { v: 24 }, { v: 23 }, { v: 25 }, { v: 26 }];

const areaData7D = [
  { name: 'Mon', users: 12 },
  { name: 'Tue', users: 19 },
  { name: 'Wed', users: 15 },
  { name: 'Thu', users: 22 },
  { name: 'Fri', users: 30 },
  { name: 'Sat', users: 28 },
  { name: 'Sun', users: 35 },
];
const areaData30D = [
  { name: 'Week 1', users: 80 }, { name: 'Week 2', users: 120 }, { name: 'Week 3', users: 105 }, { name: 'Week 4', users: 150 }
];
const areaData90D = [
  { name: 'Month 1', users: 400 }, { name: 'Month 2', users: 550 }, { name: 'Month 3', users: 700 }
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const isUp = payload[0].value > 20; 
    return (
      <div className="adm-dash__custom-tooltip">
        <div className="adm-dash__tooltip-day">{label}</div>
        <div className="adm-dash__tooltip-data">
          <svg className="adm-dash__tooltip-icon" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Users: <span style={{ color: '#fff', fontWeight: 600 }}>{payload[0].value}</span>
          {isUp ? (
            <span className="adm-dash__tooltip-trend">↑</span>
          ) : (
            <span className="adm-dash__tooltip-trend down">↓</span>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const COLORS = ['#6c63ff', '#22c55e', '#f59e0b'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const chartContainerVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { delay: 0.2, type: 'spring', stiffness: 300, damping: 24 } }
};

const AnimatedCounter = ({ from = 0, to, duration = 0.8, as = "span", ...props }) => {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, to, { duration, ease: "easeOut" });
    return controls.stop;
  }, [count, to, duration]);

  const Component = motion[as] || motion.span;
  return <Component {...props}>{rounded}</Component>;
};

const getAvatarColor = (email) => {
  return "rgba(255, 255, 255, 0.05)";
};

const DonutCustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="adm-dash__custom-tooltip">
        <div className="adm-dash__tooltip-day" style={{ color: data.payload.fill }}>{data.name}</div>
        <div className="adm-dash__tooltip-data">
          {data.value} items
        </div>
      </div>
    );
  }
  return null;
};

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('7D');
  const [users, setusers] = useState([]);
  const [itinerary, setitinerary] = useState([]);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  const [userCountTo, setUserCountTo] = useState(0);
  const [itinCountTo, setItinCountTo] = useState(0);
  const [eventCountTo, setEventCountTo] = useState(0);

  useEffect(() => {
    axiosInstance.get("/api/registor/all")
      .then((response) => setusers(response.data))
      .catch((error) => console.error("Error fetching users:", error));
    axiosInstance.get("/api/trip-places/all")
      .then((response) => setitinerary(response.data))
      .catch((error) => console.error("Error fetching itineraries:", error));
    axiosInstance.get("/api/events/getevent")
      .then((response) => setEvents(response.data))
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  useEffect(() => {
    if (users.length > 0) setUserCountTo(users.length);
  }, [users]);

  useEffect(() => {
    if (itinerary.length > 0) setItinCountTo(itinerary.length);
  }, [itinerary]);

  useEffect(() => {
    if (events.length > 0) setEventCountTo(events.length);
  }, [events]);

  const [donutContext, setDonutContext] = useState('This Week');
  const [activeIndex, setActiveIndex] = useState(null);

  const feedbacksCount = itinerary.filter(i => i.review != null).length;
  
  const pieData = [
    { name: 'Itineraries', value: itinerary.length || 10, fill: 'url(#colorItin)', color: '#818cf8' },
    { name: 'Events', value: events.length || 5, fill: 'url(#colorEvents)', color: '#34d399' },
    { name: 'Feedbacks', value: feedbacksCount || 2, fill: 'url(#colorFeedbacks)', color: '#fbbf24' },
  ];

  const totalItemsTo = pieData.reduce((acc, curr) => acc + curr.value, 0);

  const recentActivity = [
    { id: 1, user: "admin@payana.com", action: "Created", destination: "Coorg", time: "2 hours ago", status: "Success" },
    { id: 2, user: "john@example.com", action: "Registered", destination: "-", time: "1 hour ago", status: "Success" },
    { id: 3, user: "admin@payana.com", action: "Updated", destination: "Mysore", time: "3 hours ago", status: "Pending" },
    { id: 4, user: "sarah.m@test.com", action: "Created", destination: "Gokarna", time: "5 hours ago", status: "Success" },
    { id: 5, user: "admin@payana.com", action: "Deleted", destination: "Udupi", time: "1 day ago", status: "Failed" },
  ];

  const getBadgeClass = (action) => {
    return "adm-badge--zinc";
  };

  const getStatusClass = (status) => {
    if (status === "Success") return "adm-status--success";
    if (status === "Pending") return "adm-status--pending";
    if (status === "Failed") return "adm-status--failed";
    return "adm-status--default";
  };

  return (
    <motion.div 
      className="adm-dash"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="adm-dash__header-row" variants={itemVariants}>
        <div>
          <h1 className="adm-dash__title">Overview</h1>
          <p className="adm-dash__subtitle">Monitor your platform metrics and activity</p>
        </div>
        <motion.button className="adm-dash__cta-btn" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/admin/upditinerary')}>
          + Create Itinerary
        </motion.button>
      </motion.div>

      <motion.div className="adm-dash__stats-row" variants={itemVariants}>
        <div className="adm-glass adm-dash__stat-card adm-dash__stat-card--blue">
          <div className="adm-dash__stat-header">
            <div className="adm-dash__stat-icon-wrapper blue-glow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div className="adm-dash__sparkline">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData1}>
                  <Line type="monotone" dataKey="v" stroke="#6c63ff" strokeWidth={2} dot={false} isAnimationActive={true} animationDuration={600} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="adm-dash__stat-info">
            <span className="adm-dash__stat-label">Registered Users</span>
            <div className="adm-dash__stat-number"><AnimatedCounter to={userCountTo} /></div>
          </div>
          <motion.div className="adm-dash__stat-footer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.4 }}>
            <span className="adm-dash__stat-trend adm-dash__stat-trend--up">↑ 12%</span>
            <span className="adm-dash__stat-period">vs last week</span>
          </motion.div>
        </div>

        <div className="adm-glass adm-dash__stat-card adm-dash__stat-card--green">
          <div className="adm-dash__stat-header">
            <div className="adm-dash__stat-icon-wrapper green-glow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div className="adm-dash__sparkline">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData2}>
                  <Line type="monotone" dataKey="v" stroke="#22c55e" strokeWidth={2} dot={false} isAnimationActive={true} animationDuration={600} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="adm-dash__stat-info">
            <span className="adm-dash__stat-label">Itineraries</span>
            <div className="adm-dash__stat-number"><AnimatedCounter to={itinCountTo} /></div>
          </div>
          <motion.div className="adm-dash__stat-footer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.4 }}>
            <span className="adm-dash__stat-trend adm-dash__stat-trend--up">↑ 8%</span>
            <span className="adm-dash__stat-period">vs last week</span>
          </motion.div>
        </div>

        <div className="adm-glass adm-dash__stat-card adm-dash__stat-card--orange">
          <div className="adm-dash__stat-header">
            <div className="adm-dash__stat-icon-wrapper orange-glow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div className="adm-dash__sparkline">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData3}>
                  <Line type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={true} animationDuration={600} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="adm-dash__stat-info">
            <span className="adm-dash__stat-label">Events Listed</span>
            <div className="adm-dash__stat-number"><AnimatedCounter to={eventCountTo} /></div>
          </div>
          <motion.div className="adm-dash__stat-footer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.4 }}>
            <span className="adm-dash__stat-trend adm-dash__stat-trend--flat">→ 0%</span>
            <span className="adm-dash__stat-period">vs last week</span>
          </motion.div>
        </div>

        <div className="adm-glass adm-dash__stat-card adm-dash__stat-card--red">
          <div className="adm-dash__stat-header">
            <div className="adm-dash__stat-icon-wrapper red-glow">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            </div>
            <div className="adm-dash__sparkline">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData4}>
                  <Line type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={true} animationDuration={600} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="adm-dash__stat-info">
            <span className="adm-dash__stat-label">Feedbacks</span>
            <div className="adm-dash__stat-number"><AnimatedCounter to={feedbacksCount} /></div>
          </div>
          <motion.div className="adm-dash__stat-footer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.4 }}>
            <span className="adm-dash__stat-trend adm-dash__stat-trend--up">↑ 2%</span>
            <span className="adm-dash__stat-period">vs last week</span>
          </motion.div>
        </div>
      </motion.div>

      <motion.div className="adm-dash__middle-section" variants={itemVariants}>
        <div className="adm-glass adm-dash__chart-container adm-dash__area-chart">
          <div className="adm-dash__chart-header">
            <div className="adm-dash__chart-title-wrap">
              <h3 className="adm-dash__chart-title-new">User Registrations</h3>
              <span className="adm-dash__chart-live-stat">↑ 35 this week · +12% vs last week</span>
            </div>
            <div className="adm-dash__chart-toggles">
              {['7D', '30D', '90D'].map((range) => (
                <button 
                  key={range}
                  className={`adm-dash__time-pill ${timeRange === range ? 'adm-dash__time-pill--active' : ''}`} 
                  onClick={() => setTimeRange(range)}
                >
                  {timeRange === range && (
                    <motion.div layoutId="activePill" className="adm-dash__time-pill-bg" />
                  )}
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AnimatePresence mode="wait">
                <motion.div
                  key={timeRange}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  style={{ width: '100%', height: '100%' }}
                >
                  <AreaChart data={timeRange === '7D' ? areaData7D : timeRange === '30D' ? areaData30D : areaData90D} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a1a1aa" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#a1a1aa" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorUsersShimmer" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e4e4e7" stopOpacity={0.3}/>
                        <stop offset="100%" stopColor="#e4e4e7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                    <YAxis orientation="left" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => (val === 0 ? '' : val)} tick={{ dx: 45, dy: -10, fill: '#71717a' }} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <RechartsTooltip 
                      content={<CustomTooltip />}
                      cursor={{ stroke: 'rgba(161, 161, 170, 0.4)', strokeWidth: 1, strokeDasharray: '3 3' }}
                    />
                    <Area type="monotone" dataKey="users" stroke="#a1a1aa" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsers)" animationDuration={1200} isAnimationActive={true} activeDot={{ r: 8, stroke: '#a1a1aa', strokeWidth: 2, fill: '#fff', className: 'adm-dash__custom-dot' }} />
                    <Area type="monotone" dataKey="users" stroke="none" fillOpacity={0.4} fill="url(#colorUsersShimmer)" animationDuration={1200} isAnimationActive={true} />
                  </AreaChart>
                </motion.div>
              </AnimatePresence>
            </ResponsiveContainer>
          </div>
          <div className="adm-dash__chart-footer">
            <div className="adm-dash__footer-stat">
              <span className="adm-dash__footer-label">Peak Day</span>
              <span className="adm-dash__footer-value">Sunday (35)</span>
            </div>
            <div className="adm-dash__footer-divider"></div>
            <div className="adm-dash__footer-stat">
              <span className="adm-dash__footer-label">Lowest Day</span>
              <span className="adm-dash__footer-value">Monday (12)</span>
            </div>
            <div className="adm-dash__footer-divider"></div>
            <div className="adm-dash__footer-stat">
              <span className="adm-dash__footer-label">Weekly Avg</span>
              <span className="adm-dash__footer-value">22/day</span>
            </div>
          </div>
        </div>

        <div className="adm-glass adm-dash__donut-chart">
          <div className="adm-dash__donut-header">
            <div className="adm-dash__chart-title-wrap">
              <h3 className="adm-dash__chart-title-new">Content Breakdown</h3>
              <span className="adm-dash__chart-live-stat" style={{ color: '#71717a' }}>Across all districts</span>
            </div>
            <div className="adm-dash__chart-toggles">
              <button className={`adm-dash__time-pill ${donutContext === 'This Week' ? 'adm-dash__time-pill--active' : ''}`} onClick={() => setDonutContext('This Week')}>This Week</button>
              <button className={`adm-dash__time-pill ${donutContext === 'All Time' ? 'adm-dash__time-pill--active' : ''}`} onClick={() => setDonutContext('All Time')}>All Time</button>
            </div>
          </div>
          <div className="adm-dash__donut-body">
            <div className="adm-dash__donut-chart-svg">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <linearGradient id="colorItin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8"/>
                      <stop offset="100%" stopColor="#6366f1"/>
                    </linearGradient>
                    <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399"/>
                      <stop offset="100%" stopColor="#10b981"/>
                    </linearGradient>
                    <linearGradient id="colorFeedbacks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fbbf24"/>
                      <stop offset="100%" stopColor="#f59e0b"/>
                    </linearGradient>
                    <pattern id="concentric" width="40" height="40" patternUnits="userSpaceOnUse" x="50%" y="50%" patternTransform="translate(-20, -20)">
                      <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      <circle cx="20" cy="20" r="10" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <circle cx="50%" cy="50%" r="55" fill="url(#concentric)" />
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                    isAnimationActive={true}
                    animationDuration={1500}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} opacity={activeIndex === null || activeIndex === index ? 1 : 0.6} />
                    ))}
                  </Pie>
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                    <tspan x="50%" dy="-5" fontSize="32" fontWeight="700" fill="#fff">
                      {activeIndex !== null ? pieData[activeIndex].value : <AnimatedCounter as="tspan" to={totalItemsTo} duration={1.2} />}
                    </tspan>
                    <tspan x="50%" dy="20" fontSize="11" fill="#71717a">
                      {activeIndex !== null ? pieData[activeIndex].name : "Total Items"}
                    </tspan>
                  </text>
                  <RechartsTooltip content={<DonutCustomTooltip />} cursor={false} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="adm-dash__donut-legend">
              {pieData.map((entry, index) => {
                const percent = Math.round((entry.value / totalItemsTo) * 100) || 0;
                return (
                  <div key={index} className="adm-dash__legend-item" onMouseEnter={() => setActiveIndex(index)} onMouseLeave={() => setActiveIndex(null)}>
                    <div className="adm-dash__legend-item-header">
                      <div className="adm-dash__legend-item-left">
                        <div className="adm-dash__legend-swatch" style={{ background: entry.fill }}></div>
                        <span className="adm-dash__legend-name">{entry.name}</span>
                      </div>
                      <span className="adm-dash__legend-count">{entry.value}</span>
                    </div>
                    <div className="adm-dash__progress-track">
                      <motion.div 
                        className="adm-dash__progress-fill" 
                        initial={{ width: "0%" }} 
                        animate={{ width: `${percent}%` }} 
                        transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                        style={{ background: entry.fill }}
                      />
                    </div>
                    <span className="adm-dash__legend-percent">{percent}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="adm-dash__quick-actions-stacked" variants={itemVariants}>
        <div className="adm-glass adm-dash__qa-banner" onClick={() => navigate('/admin/manageusers')}>
          <div className="adm-dash__qa-banner-left">
            <div className="adm-dash__qa-banner-icon bg-indigo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
            <div>
              <div className="adm-dash__qa-banner-title">Manage Users</div>
              <div className="adm-dash__qa-banner-desc">View, edit, and delete user accounts</div>
            </div>
          </div>
          <div className="adm-dash__qa-banner-arrow">&rarr;</div>
        </div>
        
        <div className="adm-glass adm-dash__qa-banner" onClick={() => navigate('/admin/viewitineraries')}>
          <div className="adm-dash__qa-banner-left">
            <div className="adm-dash__qa-banner-icon bg-green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </div>
            <div>
              <div className="adm-dash__qa-banner-title">Manage Itineraries</div>
              <div className="adm-dash__qa-banner-desc">Create or update travel plans</div>
            </div>
          </div>
          <div className="adm-dash__qa-banner-arrow">&rarr;</div>
        </div>

        <div className="adm-glass adm-dash__qa-banner" onClick={() => navigate('/admin/feedbacks')}>
          <div className="adm-dash__qa-banner-left">
            <div className="adm-dash__qa-banner-icon bg-orange">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            </div>
            <div>
              <div className="adm-dash__qa-banner-title">Review Feedbacks</div>
              <div className="adm-dash__qa-banner-desc">Read user reviews and ratings</div>
            </div>
          </div>
          <div className="adm-dash__qa-banner-arrow">&rarr;</div>
        </div>
      </motion.div>

      <motion.div className="adm-dash__recent" variants={itemVariants}>
        <h3 className="adm-dash__recent-title">Recent Activity</h3>
        <div className="adm-glass adm-dash__table-wrapper">
          <table className="adm-dash__table">
            <thead>
              <tr>
                <th>USER</th>
                <th>ACTION</th>
                <th>DESTINATION</th>
                <th>STATUS</th>
                <th>TIME</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((activity, index) => (
                <motion.tr 
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <td>
                    <div className="adm-dash__table-user">
                      <div className="adm-dash__table-avatar" style={{ background: getAvatarColor(activity.user) }}>
                        {activity.user.charAt(0).toUpperCase()}
                      </div>
                      <span>{activity.user}</span>
                    </div>
                  </td>
                  <td>
                    <motion.span 
                      initial={{ scale: 0.5 }} 
                      whileInView={{ scale: 1 }} 
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                      className={`adm-badge ${getBadgeClass(activity.action)}`}
                    >
                      {activity.action}
                    </motion.span>
                  </td>
                  <td className="adm-dash__table-dest">{activity.destination}</td>
                  <td>
                    <span className={`adm-status ${getStatusClass(activity.status)}`}>
                      <span className="adm-status-dot"></span>
                      {activity.status}
                    </span>
                  </td>
                  <td className="adm-dash__table-time">{activity.time}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default AdminDashboard;

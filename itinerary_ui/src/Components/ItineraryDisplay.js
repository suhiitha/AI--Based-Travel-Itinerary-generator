import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import "./AllCss/MCQPage.css";
import { ToastContainer, toast } from "react-toastify";
import { motion } from "framer-motion";
import ModernDropdown from "./ModernDropdown";
import {
  FiMapPin,
  FiUsers,
  FiGrid,
  FiCompass,
  FiDollarSign,
  FiCalendar,
} from "react-icons/fi";

/* Contextual icon per field */
const FIELD_ICONS = {
  district:   FiMapPin,
  travelWith: FiUsers,
  category:   FiGrid,
  tripType:   FiCompass,
  budget:     FiDollarSign,
};

const FIELDS = [
  { name: "district",   label: "District",       type: "select" },
  { name: "travelWith", label: "Travel With",    type: "select" },
  { name: "category",   label: "Category",       type: "select" },
  { name: "tripType",   label: "Trip Type",      type: "select" },
  { name: "budget",     label: "Budget",         type: "select" },
  { name: "duration",   label: "Duration (Days)", type: "number" },
];

const REQUIRED_FIELDS = ["district", "travelWith", "category", "tripType", "budget", "duration"];

const ItineraryDisplay = () => {
  const navigate = useNavigate();

  const [districts,   setDistricts]   = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [tripTypes,   setTripTypes]   = useState([]);
  const [formData, setFormData] = useState({
    district:   "",
    travelWith: "",
    category:   "",
    tripType:   "",
    budget:     "",
    duration:   "",
  });

  /* Gold progress bar: 0–100 based on filled fields */
  const progressPct = useMemo(() => {
    const filled = REQUIRED_FIELDS.filter(k => formData[k] !== "").length;
    return Math.round((filled / REQUIRED_FIELDS.length) * 100);
  }, [formData]);

  useEffect(() => {
    axiosInstance
      .get("/api/itinerary/districts")
      .then(res => setDistricts(res.data))
      .catch(() => {});
  }, []);

  const fetchCategories = async (district, travelWith) => {
    try {
      const res = await axiosInstance.get(`/api/admin/categories?district=${district}`);
      let arr = res.data;
      if (travelWith === "Kids" && !arr.includes("Entertainment")) arr.push("Entertainment");
      if (travelWith === "Adults" && !arr.includes("Cultural")) arr.push("Cultural");
      if (travelWith === "Both") {
        if (!arr.includes("Entertainment")) arr.push("Entertainment");
        if (!arr.includes("Cultural")) arr.push("Cultural");
      }
      setCategories(arr);
    } catch {}
  };

  const fetchTripTypes = async (district, category) => {
    try {
      const res = await axiosInstance.get(
        `/api/admin/tripTypes?district=${district}&category=${category}`
      );
      setTripTypes(res.data);
    } catch {}
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "district")   fetchCategories(value, formData.travelWith);
    if (name === "travelWith") fetchCategories(formData.district, value);
    if (name === "category")   fetchTripTypes(formData.district, value);
  };

  const handleDropdownChange = (name, value) => {
    handleChange({ target: { name, value } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/api/mcq/classifyMood", formData);
      const { mood, places } = res.data;
      if (!places || !places.length) {
        toast.error("No recommendations found. Try different inputs.");
        return;
      }
      navigate("/Main/mcq-result", {
        state: {
          mood:     Array.isArray(mood) ? mood : [mood],
          district: formData.district,
          days:     formData.duration,
          places,
        },
      });
    } catch {
      toast.warning("Something went wrong. Please try again.");
    }
  };

  const getOptionsList = (name) => {
    switch (name) {
      case "district":   return districts;
      case "travelWith": return ["Kids", "Adults", "Both", "None"];
      case "category":   return categories;
      case "tripType":   return tripTypes;
      case "budget":     return ["Low", "Medium", "High"];
      default:           return [];
    }
  };

  const PLACEHOLDERS = {
    district:   "Select District",
    travelWith: "Traveling with…",
    category:   "Select Category",
    tripType:   "Select Trip Type",
    budget:     "Select Budget",
  };

  return (
    <div className="itd">
      {/* Gold completion progress bar */}
      <div className="itd__progress-track">
        <div className="itd__progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <ToastContainer position="top-right" autoClose={3000} />

      <motion.div
        className="itd__card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        <h1 className="itd__heading">Plan Your Journey</h1>
        <p className="itd__sub">Every great journey begins with a single choice</p>
        <hr className="itd__divider" />

        <form onSubmit={handleSubmit}>
          <div className="itd__grid">
            {FIELDS.map((f, idx) => (
              <motion.div
                key={f.name}
                className="itd__field"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07, duration: 0.38, ease: "easeOut" }}
              >
                <label className="itd__label">{f.label}</label>

                {f.type === "select" ? (
                  <ModernDropdown
                    options={getOptionsList(f.name)}
                    value={formData[f.name]}
                    onChange={(val) => handleDropdownChange(f.name, val)}
                    placeholder={PLACEHOLDERS[f.name]}
                    searchable={f.name === "district"}
                    icon={FIELD_ICONS[f.name]}
                    grouped={f.name !== "budget" && f.name !== "travelWith"}
                    direction={(f.name === "budget" || f.name === "tripType") ? "up" : "down"}
                  />
                ) : (
                  <div className="itd__input-wrapper">
                    <FiCalendar className="itd__field-icon" />
                    <input
                      className="itd__input"
                      type="number"
                      name={f.name}
                      value={formData[f.name]}
                      onChange={handleChange}
                      placeholder="e.g. 3 days"
                      min="1"
                      max="14"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <motion.button
            className="itd__submit"
            type="submit"
            whileTap={{ scale: 0.98 }}
          >
            Get My Itinerary <span className="arrow">→</span>
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default ItineraryDisplay;

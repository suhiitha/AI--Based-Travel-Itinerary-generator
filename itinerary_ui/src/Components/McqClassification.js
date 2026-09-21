import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import { motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";
import "./AllCss/McqClassification.css";

const McqClassification = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [districts, setDistricts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    category: "",
    district: "",
    travelWith: "",
    tripType: "",
    budget: "",
    duration: "3"
  });

  // Fetch districts and categories on load
  useEffect(() => {
    axiosInstance.get("/api/itinerary/districts")
      .then(response => setDistricts(response.data || []))
      .catch(() => toast.error("Failed to load districts"));

    axiosInstance.get("/api/admin/categories")
      .then(response => setCategories(response.data || []))
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  const questions = [
    { id: 1, text: "What kind of trip do you prefer?", field: "category", options: categories.length > 0 ? categories : ["Relaxing", "Adventurous", "Cultural", "Spiritual", "Romantic", "Social & Fun"] },
    { id: 2, text: "Where do you want to go?", field: "district", options: districts },
    { id: 3, text: "Who are you traveling with?", field: "travelWith", options: ["Kids", "Adults", "Both", "Solo"] },
    { id: 4, text: "What's your budget?", field: "budget", options: ["Low", "Medium", "High"] },
  ];

  const handleAnswerChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category) {
      toast.warning("Please select a trip type");
      return;
    }
    if (!formData.district) {
      toast.warning("Please select a district");
      return;
    }

    try {
      const response = await axiosInstance.post("/api/mcq/classifyMood", formData);
      const { mood, places } = response.data;

      if (!places || places.length === 0) {
        toast.error("No recommendations found for your selection. Try different options.");
        return;
      }

      toast.success("Recommendations found! Redirecting...");

      // Navigate to MCQ Result with the places
      setTimeout(() => {
        navigate("/Main/mcq-result", {
          state: {
            mood: Array.isArray(mood) ? mood : [mood],
            district: formData.district,
            days: formData.duration || "3",
            places: places
          }
        });
      }, 1000);

    } catch (error) {
      console.error("Error fetching recommendation:", error);
      toast.error("Failed to get recommendation. Please try again.");
    }
  };

  /* Framer-motion stagger variants */
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.15 }
    }
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } }
  };

  return (
    <div className="mcqc">
      <ToastContainer position="top-center" autoClose={3000} />

      <motion.div
        className="mcqc__card"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
      >
        <h2 className="mcqc__heading">Plan Your Trip</h2>
        <p className="mcqc__subheading">Tell us your preferences, we'll craft the perfect itinerary</p>

        <hr className="mcqc__divider" />

        <motion.form
          onSubmit={handleSubmit}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {questions.map((q) => (
            <motion.div key={q.id} className="mcqc__field" variants={fieldVariants}>
              <label className="mcqc__label">{q.text}</label>
              <select
                className="mcqc__select"
                value={formData[q.field] || ""}
                onChange={(e) => handleAnswerChange(q.field, e.target.value)}
              >
                <option value="">Select an option</option>
                {q.options.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>
            </motion.div>
          ))}

          <motion.div className="mcqc__field" variants={fieldVariants}>
            <label className="mcqc__label">How many days?</label>
            <input
              type="number"
              className="mcqc__input"
              value={formData.duration}
              onChange={(e) => handleAnswerChange("duration", e.target.value)}
              min="1"
              max="14"
            />
          </motion.div>

          <motion.button
            type="submit"
            className="mcqc__submit"
            variants={fieldVariants}
            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(212, 168, 67, 0.25)' }}
            whileTap={{ scale: 0.98 }}
          >
            🎯 Get Recommendation
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default McqClassification;

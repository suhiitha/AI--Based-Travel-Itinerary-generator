import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import "../Components/AllCss/Admin.css";
import "../Components/AllCss/UpdItineraryForm.css";
import "../Components/AllCss/ModernDropdown.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiMapPin, FiAlignLeft, FiUsers, FiTag, FiMap, FiUploadCloud, FiPlus, FiSave, FiChevronDown, FiCrosshair, FiX, FiCheck } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const UpdSelect = ({ icon: Icon, label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="upd-form__input-wrapper" ref={dropdownRef} onClick={() => setIsOpen(!isOpen)} style={{ cursor: "pointer", zIndex: isOpen ? 10 : 1 }}>
      <Icon className="upd-form__icon" style={{ color: isOpen ? 'rgba(255, 255, 255, 0.8)' : '#888' }} />
      <div className={`upd-form__input`} style={{ display: 'flex', alignItems: 'center' }}>
        {value ? value.charAt(0).toUpperCase() + value.slice(1) : ""}
      </div>
      <label className="upd-form__label" style={{ top: value || isOpen ? '6px' : '18px', fontSize: value || isOpen ? '11px' : '14px', color: isOpen ? 'rgba(255, 255, 255, 0.8)' : (value ? '#a0a0a0' : '#888') }}>
        {label}
      </label>
      <FiChevronDown className="upd-form__chevron" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="modern-dropdown__menu"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ width: '100%', top: 'calc(100% + 8px)', position: 'absolute' }}
          >
            <div className="modern-dropdown__list">
              {options.map((opt, idx) => {
                const optValue = opt.toLowerCase();
                const isSelected = optValue === value;
                return (
                  <div
                    key={idx}
                    className={`modern-dropdown__item ${isSelected ? "modern-dropdown__item--selected" : ""}`}
                    onClick={(e) => { e.stopPropagation(); onChange({ target: { name: label === "Trip With" ? "tripWith" : "category", value: optValue } }); setIsOpen(false); }}
                  >
                    <span>{opt}</span>
                    {isSelected && <FiCheck className="modern-dropdown__checkmark" />}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function UpdItinerary() {
  const [formData, setFormData] = useState({ id: null, district: "", place: "", latitude: "", longitude: "", description: "", tripWith: "", category: "", imageUrl: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [tripTypes, setTripTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchDropdownData(); fetchItineraries(); }, []);

  const fetchDropdownData = async () => {
    try {
      const tripRes = await axiosInstance.get("/api/admin/tripTypes");
      const categoryRes = await axiosInstance.get("/api/admin/categories");
      setTripTypes(tripRes.data); setCategories(categoryRes.data);
    } catch (error) { toast.error("Error fetching dropdown data:", error); }
  };

  const fetchItineraries = async () => {
    try { const response = await axiosInstance.get("/api/itinerary/all"); setItineraries(response.data); }
    catch (error) { toast.error("Error fetching itineraries:", error); }
  };

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

  const compressImage = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width, height = img.height;
          if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
      };
    });
  };

  const handleMedia = async (e) => {
    let file = e.target.files[0];
    if (!file) return;
    try {
      const compressedBase64 = await compressImage(file, 800, 0.7);
      setFormData({ ...formData, imageUrl: compressedBase64 }); setSelectedFile(file.name);
    } catch (error) {
      console.error("Image compression error:", error);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => { setFormData({ ...formData, imageUrl: reader.result }); setSelectedFile(file.name); };
    }
  };

  const handleRemoveMedia = () => {
    setFormData({ ...formData, imageUrl: "" });
    setSelectedFile(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEdit = (itinerary) => {
    setFormData({ id: itinerary.id, district: itinerary.district, place: itinerary.place, description: itinerary.description, tripWith: itinerary.tripWith, category: itinerary.category, latitude: itinerary.latitude || "", longitude: itinerary.longitude || "", imageUrl: itinerary.imageUrl });
    setSelectedFile(null); // Just editing URL, we can display image from URL
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this itinerary?")) {
      try { await axiosInstance.delete(`/api/itinerary/delete/${id}`); toast.success("Itinerary deleted successfully!"); fetchItineraries(); }
      catch (error) { console.error("Error deleting itinerary:", error); toast.error("Failed to delete itinerary. Please try again."); }
    }
  };

  const trimFormData = (data) => ({ ...data, district: data.district.trim(), place: data.place.trim(), description: data.description.trim(), tripWith: data.tripWith.trim().toLowerCase(), category: data.category.trim().toLowerCase(), latitude: String(data.latitude || "").trim(), longitude: String(data.longitude || "").trim() });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const trimmedData = trimFormData(formData);
      const updatedFormData = { ...trimmedData, tripWith: trimmedData.tripWith.toLowerCase(), category: trimmedData.category.toLowerCase() };
      if (isEditing) { await axiosInstance.put(`/api/itinerary/update/${formData.id}`, updatedFormData); toast.success("Itinerary updated successfully!"); }
      else { await axiosInstance.post("/api/itinerary/add", updatedFormData); toast.success("Itinerary added successfully!"); }
      resetForm(); fetchItineraries();
    } catch (error) { console.error("Error submitting itinerary:", error); toast.error("Error submitting itinerary. Please try again."); }
  };

  const resetForm = () => { setFormData({ id: null, district: "", place: "", description: "", tripWith: "", latitude: "", longitude: "", category: "", imageUrl: "" }); setSelectedFile(null); setIsEditing(false); if(fileInputRef.current) fileInputRef.current.value = ""; };

  const handleAutoDetect = () => {
    if (navigator.geolocation) {
      toast.info("Fetching coordinates...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          });
          toast.success("Coordinates updated!");
        },
        (error) => {
          toast.error("Error fetching location: " + error.message);
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div>
      {/* Form card */}
      <div className="upd-form__card">
        <div className="upd-form__header">
          <h1 className="upd-form__title">{isEditing ? 'Update Place' : 'Add New Place'}</h1>
          <p className="upd-form__subtitle">Fill in the details below</p>
          <div className="upd-form__divider"></div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Location Info */}
          <div className="upd-form__section">
            <div className="upd-form__section-title">Location Info</div>
            <div className="upd-form__field-group">
              <div className="upd-form__input-wrapper">
                <FiMapPin className="upd-form__icon" />
                <input className="upd-form__input" type="text" name="district" placeholder=" " value={formData.district} onChange={handleChange} required id="f-district" />
                <label className="upd-form__label" htmlFor="f-district">District Name</label>
              </div>
              <div className="upd-form__input-wrapper">
                <FiMapPin className="upd-form__icon" />
                <input className="upd-form__input" type="text" name="place" placeholder=" " value={formData.place} onChange={handleChange} required id="f-place" />
                <label className="upd-form__label" htmlFor="f-place">Place Name</label>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="upd-form__section">
            <div className="upd-form__section-title">Details</div>
            <div className="upd-form__field-group">
              <div className="upd-form__input-wrapper">
                <FiAlignLeft className="upd-form__icon" />
                <input className="upd-form__input" type="text" name="description" placeholder=" " value={formData.description} onChange={handleChange} required id="f-desc" />
                <label className="upd-form__label" htmlFor="f-desc">Description</label>
              </div>
              <div className="upd-form__row">
                <UpdSelect 
                  icon={FiUsers} 
                  label="Trip With" 
                  options={tripTypes} 
                  value={formData.tripWith} 
                  onChange={handleChange} 
                />
                <UpdSelect 
                  icon={FiTag} 
                  label="Select Category" 
                  options={categories} 
                  value={formData.category} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="upd-form__section">
            <div className="upd-form__section-title">Media</div>
            {formData.imageUrl ? (
              <div className="upd-form__preview">
                <img src={formData.imageUrl} alt="Preview" className="upd-form__preview-img" />
                <div className="upd-form__preview-info">
                  <p className="upd-form__preview-name">{selectedFile || "Current Image"}</p>
                </div>
                <button type="button" className="upd-form__preview-remove" onClick={handleRemoveMedia}><FiX /></button>
              </div>
            ) : (
              <div className="upd-form__upload-zone">
                <FiUploadCloud className="upd-form__upload-icon" />
                <p className="upd-form__upload-text">Drag & drop or click to browse</p>
                <p className="upd-form__upload-subtext">JPG, PNG or WEBP (Max 5MB)</p>
                <input className="upd-form__file-input" type="file" accept="image/*" onChange={handleMedia} required={!isEditing} ref={fileInputRef} />
              </div>
            )}
          </div>

          {/* Coordinates */}
          <div className="upd-form__section">
            <div className="upd-form__section-title">Coordinates</div>
            <div className="upd-form__coords-row">
              <div className="upd-form__input-wrapper">
                <FiMap className="upd-form__icon" />
                <input className="upd-form__input" type="text" name="latitude" placeholder=" " value={formData.latitude} onChange={handleChange} id="f-lat" />
                <label className="upd-form__label" htmlFor="f-lat">Latitude</label>
              </div>
              <div className="upd-form__input-wrapper">
                <FiMap className="upd-form__icon" />
                <input className="upd-form__input" type="text" name="longitude" placeholder=" " value={formData.longitude} onChange={handleChange} id="f-lon" />
                <label className="upd-form__label" htmlFor="f-lon">Longitude</label>
              </div>
              <button type="button" className="upd-form__auto-detect" onClick={handleAutoDetect}>
                <FiCrosshair /> Auto-detect
              </button>
            </div>
          </div>

          <button className="upd-form__submit" type="submit">
            {isEditing ? <FiSave /> : <FiPlus />}
            {isEditing ? "Update Place" : "Add Place"}
          </button>
          {isEditing && <button type="button" className="upd-form__cancel" onClick={resetForm}>Cancel</button>}
        </form>
      </div>

      {/* Table */}
      <div className="adm__card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="adm__table">
          <thead>
            <tr><th>District</th><th>Place</th><th>Trip With</th><th>Category</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {itineraries.map((itinerary) => (
              <tr key={itinerary.id}>
                <td>{itinerary.district}</td>
                <td>{itinerary.place}</td>
                <td>{itinerary.tripWith}</td>
                <td>{itinerary.category}</td>
                <td>
                  <div className="adm__table-actions">
                    <button className="adm__btn-amber" onClick={() => handleEdit(itinerary)}>Edit</button>
                    <button className="adm__btn-red" onClick={() => handleDelete(itinerary.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default UpdItinerary;
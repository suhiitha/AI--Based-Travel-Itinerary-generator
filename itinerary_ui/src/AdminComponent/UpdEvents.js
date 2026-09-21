import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import "../Components/AllCss/Admin.css";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import ModernDropdown from "../Components/ModernDropdown";

function UpdEvents() {
  const [isEditing, setIsEditing] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [description, setDescription] = useState("");
  const [locationUrl, setLocationUrl] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [editId, setEditId] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => { fetchDistricts(); fetchEvents(); }, []);

  const fetchDistricts = () => {
    axiosInstance.get("/api/itinerary/districts").then(res => setDistricts(res.data)).catch(() => toast.error("Failed to load districts."));
  };
  const fetchEvents = () => {
    axiosInstance.get("/api/events/getevent").then(res => setEvents(res.data)).catch(() => toast.error("Failed to load events."));
  };

  const handleSubmit = () => {
    const eventData = { district: selectedDistrict, description, locationUrl, eventDate: eventDate ? new Date(eventDate).toISOString() : null };
    axiosInstance.post("/api/events/events", eventData).then(() => { toast.success("Event added successfully!"); fetchEvents(); resetForm(); }).catch(() => toast.error("Failed to add event."));
  };

  const handleUpdate = () => {
    const updatedEvent = { district: selectedDistrict, description, locationUrl, eventDate: eventDate ? new Date(eventDate).toISOString() : null };
    axiosInstance.put(`/api/events/update/${editId}`, updatedEvent).then(() => { toast.success("Event updated successfully!"); fetchEvents(); resetForm(); setIsEditing(false); }).catch(() => toast.error("Failed to update event."));
  };

  const handleEditClick = (event) => {
    setIsEditing(true); setEditId(event.id); setSelectedDistrict(event.district); setDescription(event.description); setLocationUrl(event.locationUrl);
    if (event.eventDate) { const date = new Date(event.eventDate); setEventDate(date.toISOString().slice(0, 16)); } else { setEventDate(""); }
  };

  const handleDeleteClick = (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this event?");
    if (confirmed) {
      axiosInstance.delete(`/api/events/delete/${id}`).then(() => { toast.success("Event deleted successfully!"); fetchEvents(); }).catch((err) => { console.error("Delete error:", err); toast.error("Failed to delete event."); });
    }
  };

  const resetForm = () => { setSelectedDistrict(""); setDescription(""); setLocationUrl(""); setEventDate(""); setEditId(null); };

  return (
    <div>
      <h1 className="adm__title">Manage Events</h1>
      <hr className="adm__rule" />
      <p className="adm__subtitle">Add, edit, and remove district events</p>

      <div className="adm__row">
        {/* Form */}
        <div className="adm__col-form">
          <div className="adm__card">
            <div style={{ marginBottom: "16px" }}>
              <ModernDropdown
                options={districts}
                value={selectedDistrict}
                onChange={setSelectedDistrict}
                placeholder="Select District"
                searchable={true}
              />
            </div>
            <input className="adm__input" type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <input className="adm__input" type="url" placeholder="Location URL" value={locationUrl} onChange={(e) => setLocationUrl(e.target.value)} />
            <input className="adm__input" type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            <div className="adm__form-actions">
              {!isEditing ? (
                <button className="adm__btn-gold" onClick={handleSubmit}>Add Event</button>
              ) : (
                <>
                  <button className="adm__btn-ghost" onClick={handleUpdate}>Update</button>
                  <button className="adm__btn-muted" onClick={() => { resetForm(); setIsEditing(false); }}>Cancel</button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="adm__col-table">
          <div className="adm__card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="adm__table">
              <thead>
                <tr><th>District</th><th>Description</th><th>Location</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id}>
                    <td>{event.district}</td>
                    <td>{event.description}</td>
                    <td><a href={event.locationUrl} target="_blank" rel="noopener noreferrer">View</a></td>
                    <td>{event.eventDate ? new Date(event.eventDate).toLocaleString() : "N/A"}</td>
                    <td>
                      <div className="adm__table-actions">
                        <button className="adm__btn-amber" onClick={() => handleEditClick(event)}>Edit</button>
                        <button className="adm__btn-red" onClick={() => handleDeleteClick(event.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2000} pauseOnHover />
    </div>
  );
}

export default UpdEvents;

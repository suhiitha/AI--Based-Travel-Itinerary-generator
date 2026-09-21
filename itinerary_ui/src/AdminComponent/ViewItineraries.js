import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import "../Components/AllCss/Admin.css";

function ViewItineraries() {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchItineraries(); }, []);

  const fetchItineraries = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/itinerary/all");
      setItineraries(response.data); setError(null);
    } catch (err) {
      console.error("Error fetching itineraries:", err);
      setError("Failed to load itineraries. Please try again later.");
    } finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="adm__loading">
        <div className="adm__pulse" />
        <div className="adm__loading-text">Loading itineraries...</div>
      </div>
    );
  }

  if (error) {
    return <div className="adm__error">{error}</div>;
  }

  return (
    <div>
      <h1 className="adm__title">All Stored Itineraries</h1>
      <hr className="adm__rule" />
      <p className="adm__subtitle">Showing {itineraries.length} places in the database</p>

      {itineraries.length === 0 ? (
        <div className="adm__card" style={{ textAlign: 'center', padding: '40px 24px', color: 'rgba(255,255,255,0.4)' }}>
          No itineraries found in the database.
        </div>
      ) : (
        <div className="adm__grid">
          {itineraries.map((item, index) => (
            <div key={item.id || index} className="adm__vi-card">
              <div className="adm__vi-img">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.place}
                    loading="lazy"
                    onError={(e) => {
                      if (!e.target.dataset.error) {
                        e.target.dataset.error = "true";
                        e.target.style.display = 'none';
                      }
                    }}
                  />
                ) : (
                  <span className="adm__vi-img-empty">{item.place?.substring(0, 15) || 'No Image'}</span>
                )}
              </div>
              <div className="adm__vi-body">
                <h3 className="adm__vi-name">{item.place}</h3>
                <div className="adm__vi-meta">
                  <strong>District:</strong> {item.district}<br />
                  <strong>Category:</strong> {item.category}<br />
                  <strong>Trip With:</strong> {item.tripWith}<br />
                  <strong>Coords:</strong> {item.latitude}, {item.longitude}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ViewItineraries;
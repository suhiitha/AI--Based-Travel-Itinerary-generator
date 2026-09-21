import React, { useMemo } from "react";
import "./AllCss/RouteMapComponent.css";

/**
 * RouteMapComponent - Displays an embedded Google Map with places
 * Uses Google Maps Embed API (free, no API key required for basic embed)
 * and provides links to full Google Maps for directions
 */
const RouteMapComponent = ({ places }) => {
  // Process places to extract valid locations
  const locations = useMemo(() => {
    if (!places) return [];

    return places
      .map(place => {
        if (place.latitude && place.longitude) {
          return {
            lat: parseFloat(place.latitude),
            lng: parseFloat(place.longitude),
            name: place.place || "Unknown Place",
            district: place.district || "",
            id: place.id
          };
        }
        return null;
      })
      .filter(coord => coord && !isNaN(coord.lat) && !isNaN(coord.lng));
  }, [places]);


  // Generate Google Maps directions URL (opens in new tab - no API key needed)
  const generateDirectionsUrl = () => {
    if (locations.length === 0) return "#";

    if (locations.length === 1) {
      // Single location - just show on map
      return `https://www.google.com/maps/search/?api=1&query=${locations[0].lat},${locations[0].lng}`;
    }

    // Multiple locations - create directions URL
    const origin = `${locations[0].lat},${locations[0].lng}`;
    const destination = `${locations[locations.length - 1].lat},${locations[locations.length - 1].lng}`;

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;

    // Add waypoints if more than 2 locations
    if (locations.length > 2) {
      const waypoints = locations.slice(1, -1)
        .map(loc => `${loc.lat},${loc.lng}`)
        .join('|');
      url += `&waypoints=${waypoints}`;
    }

    url += `&travelmode=driving`;
    return url;
  };

  // Generate static map URL (no API key required for basic view)
  const generateStaticMapUrl = () => {
    if (locations.length === 0) return null;

    // Use OpenStreetMap embed as it's free
    const bbox = calculateBoundingBox();
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.minLng}%2C${bbox.minLat}%2C${bbox.maxLng}%2C${bbox.maxLat}&layer=mapnik`;
  };

  const calculateBoundingBox = () => {
    if (locations.length === 0) {
      return { minLat: 12.9, maxLat: 13.0, minLng: 77.5, maxLng: 77.7 };
    }

    const lats = locations.map(l => l.lat);
    const lngs = locations.map(l => l.lng);

    const padding = 0.05; // Add some padding around the markers
    return {
      minLat: Math.min(...lats) - padding,
      maxLat: Math.max(...lats) + padding,
      minLng: Math.min(...lngs) - padding,
      maxLng: Math.max(...lngs) + padding
    };
  };

  if (locations.length === 0) {
    return (
      <div className="rmap">
        <div className="rmap__empty">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4a843" strokeWidth="2" style={{marginRight: 8, verticalAlign: 'middle'}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>No map data available for these locations.
        </div>
      </div>
    );
  }

  return (
    <div className="rmap">
      {/* Embedded OpenStreetMap View */}
      <div className="rmap__iframe-wrap">
        <iframe
          title="Trip Route Map"
          scrolling="no"
          src={generateStaticMapUrl()}
        />
      </div>

      {/* Places List */}
      <h6 className="rmap__locations-heading">
        Locations ({locations.length} places)
      </h6>
      <ul className="rmap__list">
        {locations.map((loc, idx) => (
          <li key={loc.id || idx} className="rmap__list-item">
            <div>
              <div className="rmap__place-name">{loc.name}</div>
              <div className="rmap__place-district">{loc.district}</div>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rmap__map-link"
              title="View on Google Maps"
            >
              📍
            </a>
          </li>
        ))}
      </ul>

      {/* Action Buttons */}
      <div className="rmap__actions">
        <a
          href={generateDirectionsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="rmap__action-link"
        >
          🗺️ Open Full Route in Google Maps
        </a>
        {locations.length > 1 && (
          <a
            href={`https://www.google.com/maps/dir/${locations.map(l => `${l.lat},${l.lng}`).join('/')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rmap__action-link"
          >
            🚗 Get Driving Directions
          </a>
        )}
      </div>
    </div>
  );
};

export default RouteMapComponent;

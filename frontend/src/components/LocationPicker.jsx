import React, { useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LocationPicker.css';

const indiaCenter = [20.5937, 78.9629];

const clampLatitude = (lat) => Math.max(-90, Math.min(90, lat));

const normalizeLongitude = (lng) => {
  const wrapped = ((lng + 180) % 360 + 360) % 360 - 180;
  return wrapped;
};

const markerIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapClickHandler = ({ onSelect }) => {
  useMapEvents({
    click(event) {
      onSelect(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
};

const LocationPicker = ({ setLatitude, setLongitude }) => {
  const [position, setPosition] = useState(indiaCenter);

  const handleSelect = (lat, lng) => {
    const safeLat = clampLatitude(lat);
    const safeLng = normalizeLongitude(lng);
    const nextPosition = [Number(safeLat.toFixed(4)), Number(safeLng.toFixed(4))];
    setPosition(nextPosition);
    setLatitude(nextPosition[0]);
    setLongitude(nextPosition[1]);
  };

  const marker = useMemo(() => position, [position]);

  return (
    <div className="location-picker-shell">
      <div className="location-picker-header">
        <div>
          <h3>Map Location Picker</h3>
          <p>Click anywhere on the map to select your farm location.</p>
        </div>
        <div className="location-picker-coords">
          <span>India view</span>
        </div>
      </div>

      <MapContainer
        center={indiaCenter}
        zoom={5}
        scrollWheelZoom
        className="location-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onSelect={handleSelect} />
        <Marker position={marker} icon={markerIcon} />
      </MapContainer>
    </div>
  );
};

export default LocationPicker;

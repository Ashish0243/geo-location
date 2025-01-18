import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

const Map = ({ location }) => {
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
        // Initialize the map only once
        if (!mapRef.current) {
            mapRef.current = L.map("map-container", {
                zoomControl: true, // Enable zoom controls
                minZoom: 5, // Set minimum zoom level
                maxZoom: 18, // Set maximum zoom level
                zoomSnap: 0.5, // Allow smoother zoom steps
                zoomDelta: 1, // Adjust zoom sensitivity
            }).setView([0, 0], 13);

            // Add a tile layer to the map
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(mapRef.current);
        }

        // Update the map and marker when location changes
        if (location) {
            const { latitude, longitude } = location;

            // Set map view to new location
            mapRef.current.setView([latitude, longitude], 15);

            // Add or update the marker
            if (markerRef.current) {
                markerRef.current.setLatLng([latitude, longitude]);
            } else {
                markerRef.current = L.marker([latitude, longitude])
                    .addTo(mapRef.current)
                    .bindPopup('You are here')
                    .openPopup();
            }
        }
    }, [location]);

    return (
        <div>
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                crossOrigin=""
            />
            <div id="map-container" style={{ height: '100vh', width: '100%' }} />
        </div>
    );
};

export default Map;

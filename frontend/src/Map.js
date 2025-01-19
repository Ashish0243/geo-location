import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

const MapComponent = ({ location, accuracy, otherUsers }) => {
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const accuracyCircleRef = useRef(null);
    const otherMarkersRef = useRef(new Map());

    useEffect(() => {
        // Initialize the map only once
        if (!mapRef.current) {
            mapRef.current = L.map("map-container", {
                zoomControl: true,
                minZoom: 2,
                maxZoom:20,
                zoomSnap: 0.5,
                zoomDelta: 1,
                zoom:18,
            }).setView([0, 0], 16);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(mapRef.current);
        }

        // Update current user's marker and accuracy circle
        if (location) {
            const { latitude, longitude } = location;
            mapRef.current.setView([latitude, longitude], 15);

            if (markerRef.current) {
                markerRef.current.setLatLng([latitude, longitude]);
            } else {
                markerRef.current = L.marker([latitude, longitude])
                    .addTo(mapRef.current)
                    .bindPopup('You are here')
                    .openPopup();
            }

            if (accuracy) {
                if (accuracyCircleRef.current) {
                    accuracyCircleRef.current.setLatLng([latitude, longitude])
                        .setRadius(accuracy);
                } else {
                    accuracyCircleRef.current = L.circle([latitude, longitude], {
                        radius: accuracy,
                        color: 'blue',
                        fillColor: '#3388ff',
                        fillOpacity: 0.2
                    }).addTo(mapRef.current);
                }
            }
        }

        // Update other users' markers
        otherUsers.forEach(user => {
            const { userId, latitude, longitude } = user;
            if (otherMarkersRef.current.has(userId)) {
                otherMarkersRef.current.get(userId).setLatLng([latitude, longitude]);
            } else {
                const marker = L.marker([latitude, longitude])
                    .addTo(mapRef.current)
                    .bindPopup(`User ${userId}`);
                otherMarkersRef.current.set(userId, marker);
            }
        });

        // Remove markers for disconnected users
        otherMarkersRef.current.forEach((marker, userId) => {
            if (!otherUsers.find(user => user.userId === userId)) {
                marker.remove();
                otherMarkersRef.current.delete(userId);
            }
        });
    }, [location, accuracy, otherUsers]);

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

export default MapComponent;

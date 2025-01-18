import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import MapComponent from './Map';

const App = () => {
    const [location, setLocation] = useState(null);
    const [accuracy, setAccuracy] = useState(null);
    const [otherUsers, setOtherUsers] = useState(new Map());
    const socketRef = useRef(null);

    useEffect(() => {
        // Initialize socket connection
        socketRef.current = io('http://localhost:5000');

        // Handle initial locations of existing users
        socketRef.current.on('initial-locations', (locations) => {
            const usersMap = new Map();
            locations.forEach(loc => {
                if (loc.userId !== socketRef.current.id) {
                    usersMap.set(loc.userId, loc);
                }
            });
            setOtherUsers(usersMap);
        });

        // Handle location updates from other users
        socketRef.current.on('location-update', (data) => {
            if (data.userId !== socketRef.current.id) {
                setOtherUsers(prev => new Map(prev.set(data.userId, data)));
            }
        });

        // Handle user disconnections
        socketRef.current.on('user-disconnected', (userId) => {
            setOtherUsers(prev => {
                const newMap = new Map(prev);
                newMap.delete(userId);
                return newMap;
            });
        });

        // Start watching current user's location
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude, accuracy } = position.coords;
                    const locationData = {
                        latitude,
                        longitude,
                        accuracy
                    };
                    
                    setLocation(locationData);
                    setAccuracy(accuracy);
                    
                    // Emit location to server
                    socketRef.current.emit('location-update', locationData);
                    
                    console.log(`Current accuracy: ${Math.round(accuracy)} meters`);
                },
                (error) => console.error('Location error:', error),
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );

            return () => {
                navigator.geolocation.clearWatch(watchId);
                socketRef.current.disconnect();
            };
        }
    }, []);

    return (
        <div>
            <h1>Real-Time Map</h1>
            {accuracy && (
                <div>
                    Current Accuracy: {Math.round(accuracy)} meters
                </div>
            )}
            <MapComponent 
                location={location} 
                accuracy={accuracy} 
                otherUsers={Array.from(otherUsers.values())}
            />
        </div>
    );
};

export default App;

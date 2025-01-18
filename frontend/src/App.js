import React, { useCallback, useState, useEffect } from 'react';
import io from 'socket.io-client';
import Map from './Map'; // Your map component

const App = () => {
    const [location, setLocation] = useState(null);
    const socket = io('http://localhost:5000'); // Connect to your backend

    const handleLocationUpdate = useCallback((newLocation) => {
        console.log('Location update received from server:', newLocation);
        setLocation(newLocation);
    }, []);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    console.log('Initial location fetched:', { latitude, longitude });
                    setLocation({ latitude, longitude });

                    // Optionally emit location to server
                    socket.emit('location-update', { latitude, longitude });
                },
                (error) => {
                    console.error('Error fetching location:', error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }

        socket.on('location-update', handleLocationUpdate);

        return () => {
            socket.disconnect();
        };
    }, [socket, handleLocationUpdate]);

    return (
        <div>
            <h1>Real-Time Map</h1>
            <Map location={location} />
        </div>
    );
};

export default App;

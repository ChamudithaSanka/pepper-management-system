import React, { useRef, useState, useEffect } from 'react';

const GoogleMapSelector = ({ onLocationSelect, initialLocation }) => {
    const mapRef = useRef(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [address, setAddress] = useState('');

    useEffect(() => {
        loadMap();
    }, []);

    const loadMap = async () => {
        try {
            const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
            if (!apiKey) {
                console.error('Google Maps API key not found');
                return;
            }
            
            // Load Google Maps script if not already loaded
            if (!window.google) {
                await loadGoogleScript(apiKey);
            }
            
            // Default location (Colombo, Sri Lanka)
            const defaultLat = 6.9271;
            const defaultLng = 79.8612;
            const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: defaultLat, lng: defaultLng },
                zoom: 15,
            });
            
            // Add marker
            const marker = new window.google.maps.Marker({
                position: { lat: defaultLat, lng: defaultLng },
                map: map,
                draggable: true,
            });
            
            // Set initial location
            setSelectedLocation({ latitude: defaultLat, longitude: defaultLng });
            setAddress(`${defaultLat.toFixed(6)}, ${defaultLng.toFixed(6)}`);
            
            // Handle marker drag
            marker.addListener('dragend', (event) => {
                const lat = event.latLng.lat();
                const lng = event.latLng.lng();
                setSelectedLocation({ latitude: lat, longitude: lng });
                setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            });
            
            // Handle map click
            map.addListener('click', (event) => {
                const lat = event.latLng.lat();
                const lng = event.latLng.lng();
                marker.setPosition({ lat, lng });
                setSelectedLocation({ latitude: lat, longitude: lng });
                setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            });
            
        } catch (error) {
            console.error('Error loading map:', error);
        }
    };

    const loadGoogleScript = (apiKey) => {
        return new Promise((resolve, reject) => {
            if (window.google && window.google.maps) {
                resolve();
                return;
            }
            
            const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
            if (existingScript) {
                const checkGoogle = setInterval(() => {
                    if (window.google && window.google.maps) {
                        clearInterval(checkGoogle);
                        resolve();
                    }
                }, 100);
                return;
            }
            
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Google Maps'));
            document.head.appendChild(script);
        });
    };

    const confirmLocation = () => {
        if (selectedLocation) {
            onLocationSelect({
                ...selectedLocation,
                address: address
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="text-sm text-gray-400">
                Click on the map or drag the marker to select delivery location
            </div>

            <div 
                ref={mapRef} 
                className="h-96 w-full rounded-lg border border-green-600 bg-gray-800"
            />

            {selectedLocation && (
                <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="text-sm font-medium mb-2">Selected Location:</div>
                    <div className="text-green-400">{address}</div>
                </div>
            )}

            {selectedLocation && (
                <button
                    onClick={confirmLocation}
                    className="w-full bg-green-600 hover:bg-green-700 text-black font-medium py-3 rounded transition-colors"
                >
                    Confirm Location
                </button>
            )}
        </div>
    );
};

export default GoogleMapSelector;
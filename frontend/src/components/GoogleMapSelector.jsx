import React, { useRef, useState, useEffect } from 'react';

const GoogleMapSelector = ({ onLocationSelect, initialLocation, address }) => {
    const mapRef = useRef(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [currentAddress, setCurrentAddress] = useState('');

    useEffect(() => {
        loadMap();
    }, []);

    // Respond to initialLocation changes (lat/lng provided externally)
    useEffect(() => {
        if (!initialLocation || !window.google || !window.google.maps) return;
        const { latitude, longitude } = initialLocation;
        if (typeof latitude === 'number' && typeof longitude === 'number') {
            const lat = latitude;
            const lng = longitude;
            if (window.mapInstance) {
                window.mapInstance.setCenter({ lat, lng });
            }
            if (window.markerInstance) {
                window.markerInstance.setPosition({ lat, lng });
            }
            setSelectedLocation({ latitude: lat, longitude: lng });
        }
    }, [initialLocation?.latitude, initialLocation?.longitude]);

    // Handle address prop changes - forward geocoding
    useEffect(() => {
        if (address && address.trim() && window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ 
                address: address + ', Sri Lanka',
                componentRestrictions: { country: 'LK' }
            }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const location = results[0].geometry.location;
                    const lat = location.lat();
                    const lng = location.lng();
                    
                    // Update map center and marker
                    if (window.mapInstance) {
                        window.mapInstance.setCenter({ lat, lng });
                        if (window.markerInstance) {
                            window.markerInstance.setPosition({ lat, lng });
                        }
                    }
                    
                    // Update state
                    setSelectedLocation({ latitude: lat, longitude: lng });
                    setCurrentAddress(results[0].formatted_address);
                }
            });
        }
    }, [address]);

    const loadMap = async () => {
        try {
            // Assume script is loaded by parent using LoadScript
            if (!window.google || !window.google.maps) return;
            
            // Default location (Colombo, Sri Lanka)
            const defaultLat = 6.9271;
            const defaultLng = 79.8612;
            const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: defaultLat, lng: defaultLng },
                zoom: 15,
            });
            
            // Store map instance globally for access in useEffect
            window.mapInstance = map;
            
            // Add marker
            const marker = new window.google.maps.Marker({
                position: { lat: defaultLat, lng: defaultLng },
                map: map,
                draggable: true,
            });
            
            // Store marker instance globally for access in useEffect
            window.markerInstance = marker;
            
            // Set initial location (use provided initialLocation if available)
            const initLat = (initialLocation && typeof initialLocation.latitude === 'number') ? initialLocation.latitude : defaultLat;
            const initLng = (initialLocation && typeof initialLocation.longitude === 'number') ? initialLocation.longitude : defaultLng;
            map.setCenter({ lat: initLat, lng: initLng });
            marker.setPosition({ lat: initLat, lng: initLng });
            setSelectedLocation({ latitude: initLat, longitude: initLng });
            setCurrentAddress(`${initLat.toFixed(6)}, ${initLng.toFixed(6)}`);
            
            // Handle marker drag
            marker.addListener('dragend', (event) => {
                const lat = event.latLng.lat();
                const lng = event.latLng.lng();
                setSelectedLocation({ latitude: lat, longitude: lng });
                
                // Get address from coordinates using reverse geocoding
                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        const address = results[0].formatted_address;
                        setCurrentAddress(address);
                        // Automatically save the location
                        onLocationSelect({
                            latitude: lat,
                            longitude: lng,
                            address: address
                        });
                    } else {
                        const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                        setCurrentAddress(address);
                        onLocationSelect({
                            latitude: lat,
                            longitude: lng,
                            address: address
                        });
                    }
                });
            });
            
            // Handle map click
            map.addListener('click', (event) => {
                const lat = event.latLng.lat();
                const lng = event.latLng.lng();
                marker.setPosition({ lat, lng });
                setSelectedLocation({ latitude: lat, longitude: lng });
                
                // Get address from coordinates using reverse geocoding
                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        const address = results[0].formatted_address;
                        setCurrentAddress(address);
                        // Automatically save the location
                        onLocationSelect({
                            latitude: lat,
                            longitude: lng,
                            address: address
                        });
                    } else {
                        const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                        setCurrentAddress(address);
                        onLocationSelect({
                            latitude: lat,
                            longitude: lng,
                            address: address
                        });
                    }
                });
            });
            
        } catch (error) {
            console.error('Error loading map:', error);
        }
    };



    return (
        <div className="space-y-4">
            <div className="text-sm text-gray-600">
                Click on the map or drag the marker to select delivery location
            </div>

            <div 
                ref={mapRef} 
                className="h-96 w-full rounded-lg border border-gray-200 bg-gray-100"
            />

            {selectedLocation && (
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                    <div className="text-sm font-medium mb-2 text-gray-900">Selected Location:</div>
                    <div className="text-gray-700">{currentAddress}</div>
                </div>
            )}
        </div>
    );
};

export default GoogleMapSelector;
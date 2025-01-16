import React, { useState, useEffect } from 'react';
import { getUserLocation } from "./quick_search";
import { getMapInstance, getUIInstance } from "./map";

export const PinpointLocation = () => {
    const [isActive, setIsActive] = useState(false);
    const [currentMarker, setCurrentMarker] = useState(null);
    const [currentBubble, setCurrentBubble] = useState(null);

    const cleanupLocation = () => {
        const mapInstance = getMapInstance();
        const ui = getUIInstance();
        
        if (currentMarker) {
            mapInstance.map.removeObject(currentMarker);
            setCurrentMarker(null);
        }
        if (currentBubble) {
            ui.removeBubble(currentBubble);
            setCurrentBubble(null);
        }
        setIsActive(false);
    };

    useEffect(() => {
        const mapInstance = getMapInstance();
        if (!mapInstance?.map) return;

        const handleMapInteraction = () => {
            if (isActive) {
                cleanupLocation();
            }
        };

        // Add single event listener for map view changes
        mapInstance.map.addEventListener('drag', handleMapInteraction)

        const handleGlobalClick = (event) => {
            // If the click is not on our location button and we're active, cleanup
            if (!event.target.closest('.location-pin-button') && isActive) {
                cleanupLocation();
            }
        };

        document.addEventListener('click', handleGlobalClick);



        return () => {
            if (mapInstance?.map) {
                mapInstance.map.removeEventListener('drag', handleMapInteraction);
            }
            document.removeEventListener('click', handleGlobalClick);
        };
    }, [isActive]);

    const handleLocationClick = async () => {
        try {
            const mapInstance = getMapInstance();
            const ui = getUIInstance();

            if (!mapInstance?.map || !ui) {
                console.error("Map or UI not initialized");
                return;
            }

            if (!isActive) {
                const user_location = await getUserLocation();

                const svgMarkup = `
                <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="9" cy="9" r="8" fill="#1b468d" stroke="white" stroke-width="1" />
                </svg>
                `;

                const dotIcon = new H.map.Icon(svgMarkup);
                const marker = new H.map.Marker(
                    {lat: user_location.lat, lng: user_location.lng},
                    {icon: dotIcon}
                );

                const bubble = new H.ui.InfoBubble(
                    {lat: user_location.lat, lng: user_location.lng},
                    {content: 'Current Location'}
                );

                mapInstance.map.addObject(marker);
                ui.addBubble(bubble);
                mapInstance.map.setCenter({lat: user_location.lat, lng: user_location.lng});
                mapInstance.map.setZoom(15);

                setCurrentMarker(marker);
                setCurrentBubble(bubble);
            } else {
                cleanupLocation();
            }

            setIsActive(!isActive);
        } catch (error) {
            console.error("Error handling location:", error);
        }
    };
    
    return (
        <button 
          onClick={handleLocationClick}
          className="location-pin-button"
        >
          <div className={`location-pin-inner ${isActive ? 'active' : ''}`} />
        </button>
    );
};

export default PinpointLocation;
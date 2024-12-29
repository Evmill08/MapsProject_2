// quick_search.js
import { apikey } from "./credentials";
import { getCategoryCode } from "./categories";
import { loadMapApi, initializeMap, getMapInstance, getUIInstance } from "./map";
import { handleRouteService } from "./route_service";


const getCategory = (place) => {
    return [getCategoryCode(place)];
};

export const getUserLocation = async () => {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Error getting location: ", error.message);
                    reject(error);
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
            reject(new Error("Geolocation not supported"));
        }
    });
};

const makeApiCall = async (place_code, user_location) => {
    const url = `https://browse.search.hereapi.com/v1/browse?at=${user_location.lat},${user_location.lng}&categories=${place_code}&limit=10&apikey=${apikey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.items.map((item) => ({
            name: item.title,
            position: { lat: item.position.lat, lng: item.position.lng },
            address: item.address?.label || 'Address not available',
            distance: item.distance 
        }));
    } catch (error) {
        console.error("API call failed for category code", place_code, ":", error);
        return [];
    }
};

const makeMultipleApiCalls = async (place_codes, user_location) => {
    // Handle both single string and array of codes
    const codes = Array.isArray(place_codes) ? place_codes : [place_codes];
    
    try {
        // Make all API calls concurrently
        const resultsArrays = await Promise.all(
            codes.map(code => makeApiCall(code, user_location))
        );

        // Merge all results and remove duplicates based on name and position
        const uniqueResults = resultsArrays
            .flat()
            .reduce((acc, current) => {
                const key = `${current.name}-${current.position.lat}-${current.position.lng}`;
                if (!acc.has(key)) {
                    acc.set(key, current);
                }
                return acc;
            }, new Map());

        // Convert back to array and sort by distance
        return Array.from(uniqueResults.values())
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 20); // Limit to top 20 closest results
    } catch (error) {
        console.error("Error making multiple API calls:", error);
        return [];
    }
};

const addMarkersToMap = (locations) => {
    const mapInstance = getMapInstance();
    const ui = getUIInstance();
    
    if (!mapInstance.map || !ui) {
        console.error("Map or UI not initialized. Cannot add markers.");
        return;
    }

    // Create default icon for markers
    const svgMarkup = `<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2" fill="#4A90E2"/>
    </svg>`;
    const icon = new H.map.Icon(svgMarkup);

    // Remove existing markers and bubbles
    mapInstance.map.removeObjects(mapInstance.map.getObjects());
    ui.getBubbles().forEach(bubble => ui.removeBubble(bubble));

    // Add new markers with labels
    const group = new H.map.Group();

    locations.forEach((location) => {
        const marker = new H.map.Marker(location.position, { icon });
    
        // Create formatted content for info bubble
        const content = `
            <div class="marker-content">
                <b class="marker-title">${location.name}</b>
                <p class="marker-address">${location.address}</p>
                <p class="marker-distance">${(location.distance / 1000).toFixed(1)} km away</p>
                <button onclick="window.handleDirectionsClick(${location.position.lat}, ${location.position.lng})" class="marker-button">
                    Get Directions
                </button>
            </div>
        `;
    
        marker.setData(content);
        group.addObject(marker);
    });

    // Add event listener to the group
    group.addEventListener('tap', (evt) => {
        const marker = evt.target;
        const position = marker.getGeometry();
        const content = marker.getData();
        
        const bubble = new H.ui.InfoBubble(position, {
            content: content
        });
        
        // Remove existing bubbles before showing new one
        ui.getBubbles().forEach(b => ui.removeBubble(b));
        ui.addBubble(bubble);
    });

    mapInstance.map.addObject(group);

    // Adjust viewport to show all markers
    if (locations.length > 0) {
        mapInstance.map.getViewModel().setLookAtData({
            bounds: group.getBoundingBox()
        });
    }
};

window.handleDirectionsClick = async (lat, lng) => {
    try {
        const userLocation = await getUserLocation();
        const destination = { lat, lng };
        
        // Get map instance and clear existing objects
        const mapInstance = getMapInstance();
        if (mapInstance?.map) {
            mapInstance.map.removeObjects(mapInstance.map.getObjects());
            
            // Clear any existing info bubbles
            const ui = getUIInstance();
            if (ui) {
                ui.getBubbles().forEach(bubble => ui.removeBubble(bubble));
            }
        }
        
        await handleRouteService(destination, userLocation);
    } catch (error) {
        console.error("Error getting directions:", error);
    }
};


let debounceTimer;
export const handleQuickButtonPressed = async (event) => {
    clearTimeout(debounceTimer);
    const buttonText = event.target.innerText;
    console.log("Quick Search Button: ", buttonText);

    debounceTimer = setTimeout(async () => {
        try {
            // Get or initialize map first
            let mapInstance = getMapInstance();
            if (!mapInstance.map) {
                console.log("Initializing Map...");
                await loadMapApi();
                mapInstance = initializeMap();
                if (!mapInstance.map) {
                    console.error("Initialization of Map Failed.");
                    return;
                }
            }

            const place_codes = getCategory(buttonText);
            if (!place_codes) {
                console.error("Invalid category code.");
                return;
            }

            const user_location = await getUserLocation();
            const results = await makeMultipleApiCalls(place_codes, user_location);
            
            if (!results || results.length === 0) {
                console.error("No results returned from API.");
                return;
            }

            addMarkersToMap(results);
        } catch (error) {
            console.error("Error handling quick search: ", error);
        }
    }, 300);
};
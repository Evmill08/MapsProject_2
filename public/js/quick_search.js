// quick_search.js
import { apikey } from "./credentials";
import { loadMapApi, initializeMap, getMapInstance, getUIInstance } from "./map";

let map;

const getCategory = (place) => {
    const categories = {
        Restaurants: ["100-1000-0000", "100-1100-0000"],
        Hotels: ["500-5000-0000", "500-5100-0000"],
        Parks: ["550-5510-0000", "550-5520-0000"],
        Museums: "300-3100-0000",
        Shopping: ["600-6900-0000", "600-6000-0061", "600-6000-0062","600-6000-0063", "600-6300-0064"]
    };
    return categories[place] || null;
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
    const map = getMapInstance();
    const ui = getUIInstance();
    
    if (!map || !ui) {
        console.error("Map or UI not initialized. Cannot add markers.");
        return;
    }

    // Create default icon for markers
    const svgMarkup = `<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2" fill="#4A90E2"/>
    </svg>`;
    const icon = new H.map.Icon(svgMarkup);

    // Remove existing markers and bubbles
    map.removeObjects(map.getObjects());
    ui.getBubbles().forEach(bubble => ui.removeBubble(bubble));

    // Add new markers with labels
    const group = new H.map.Group();

    locations.forEach((location) => {
        const marker = new H.map.Marker(location.position, { icon });
        
        // Create formatted content for info bubble
        const content = `
            <div style="padding: 8px; font-family: Arial, sans-serif; max-width: 200px;">
                <b style="font-size: 16px; color: #333;">${location.name}</b>
                <p style="margin: 5px 0; font-size: 14px; color: #666;">${location.address}</p>
                <p style="margin: 5px 0; font-size: 14px; color: #666;">${(location.distance / 1000).toFixed(1)} km away</p>
                <button 
                    style="
                        background-color: #4A90E2; 
                        color: white; 
                        border: none; 
                        padding: 8px 12px; 
                        border-radius: 4px; 
                        cursor: pointer; 
                        font-size: 14px;
                        text-align: center;
                    "
                    id="get-directions-${location.position.lat}-${location.position.lng}"
                >
                    Get Directions
                </button>
            </div>
        `;
        
        marker.setData(content);
        group.addObject(marker);

        const buttonId = `get-directions-${location.position.lat}-${location.position.lng}`;
        document.getElementById(buttonId)?.addEventListener('click', () => getDirections(location.position));
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

    map.addObject(group);

    // Adjust viewport to show all markers
    if (locations.length > 0) {
        map.getViewModel().setLookAtData({
            bounds: group.getBoundingBox()
        });
    }
};

// For testing
function getDirections(coords){
    alert('Providing directions to: ' + coords.lat + ',' + coords.lng);
    console.log('Providing directions to: ', coords);
}

let debounceTimer;
export const handleQuickButtonPressed = async (event) => {
    clearTimeout(debounceTimer);
    const buttonText = event.target.innerText;
    console.log("Quick Search Button: ", buttonText);

    debounceTimer = setTimeout(async () => {
        try {
            // Get or initialize map first
            let map = getMapInstance();
            if (!map) {
                console.log("Initializing Map...");
                await loadMapApi();
                map = initializeMap();
                if (!map) {
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
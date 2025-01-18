// direct_search.js
import { apikey } from "./credentials";
import { getCategoryCode } from "./categories";
import { loadMapApi, initializeMap, getMapInstance, getUIInstance } from "./map";
import { handleRouteService } from "./route_service";


/*
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
*/

const addMarkersToMap = (address, position) => {
    const mapInstance = getMapInstance();
    const ui = getUIInstance();

    if (!mapInstance.map || !ui) {
        console.error("Map or UI not initialized. Cannot add markers.");
        return;
    }

    // Validate position object
    if (!position || typeof position.latitude === 'undefined' || typeof position.longitude === 'undefined') {
        console.error("Invalid position object:", position);
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

    // Create coordinates, ensuring numbers are used
    const lat = parseFloat(position.latitude);
    const lng = parseFloat(position.longitude);
    
    // Additional validation for parsed coordinates
    if (isNaN(lat) || isNaN(lng)) {
        console.error("Invalid coordinates after parsing:", { lat, lng });
        return;
    }

    const coordinates = new H.geo.Point(lat, lng);
    const marker = new H.map.Marker(coordinates, { icon });

    // Create simplified content for info bubble since we don't have name, address, or distance 
    console.log("Address", address);
    const content = `
        <div class="marker-content">
            <b class="marker-title">${address}</b>
            <button onclick="window.handleDirectionsClick(${lat}, ${lng})" class="marker-button">
                Get Directions
            </button>
        </div>
    `;

    marker.setData(content);
    group.addObject(marker);

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

    // Instead of adjusting viewport, just center the map at the marker position
    mapInstance.map.setCenter(coordinates);
};

const makeDirectApiCall = async (address) => {
    const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(address)}&apikey=${apikey}`;
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        // Ensure the API returned at least one result
        if (data.items && data.items.length > 0) {
            const location = data.items[0].position; // Get the first location
            return {
                latitude: location.lat,
                longitude: location.lng,
            };
        } else {
            throw new Error("Address not found.");
        }
    } catch (error) {
        console.error("An error occurred:", error);
        throw error; // Re-throw the error so the caller can handle it
    }
};


let debounceTimer;
export const direct_search = async (uinput) => {
    console.log(uinput);
    //uinput.title will be the address
    const address = uinput.title

    clearTimeout(debounceTimer);
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

            const results = await makeDirectApiCall(address);

            if (!results || results.length === 0) {
                console.error("No results returned from API.");
                return;
            }

            console.log("Results: ", results)
            addMarkersToMap(address, results);
        } catch (error) {
            console.error("Error handling direct search: ", error);
        }
    }, 300);
};
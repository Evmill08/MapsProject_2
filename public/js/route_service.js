import { apikey } from "./credentials";
import { getUserLocation } from "./quick_search";
import { loadMapApi, initializeMap, getMapInstance, getUIInstance } from "./map";


function addRouteShapeToMap(route) {
    const mapInstance = getMapInstance();

    if (!mapInstance?.map){
        console.error("Map not initialized. Cannot add route shape.");
        return;
    }


    route.sections.forEach((section) => {
        let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);

        let polyline = new H.map.Polyline(linestring, {
            style: {
                lineWidth: 4,
                strokeColor: 'rgba(0, 128, 255, 0.7)',
            },
        });

        mapInstance.map.addObject(polyline);
        mapInstance.map.getViewModel().setLookAtData({
            bounds: polyline.getBoundingBox(),
        });
    });
}

function addManueversToMap(route) {
    const mapInstance = getMapInstance();
    const ui = getUIInstance();

    if (!mapInstance?.map || !ui){
        console.error("Map or UI not initialized. Cannot add maneuvers.");
        return;
    }

    var svgMarkup =
    '<svg width="18" height="18" ' +
    'xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="8" cy="8" r="8" ' +
    'fill="#1b468d" stroke="white" stroke-width="1" />' +
    "</svg>";

    const dotIcon = new H.map.Icon(svgMarkup, { anchor: { x: 8, y: 8 } });
    const group = new H.map.Group();

    route.sections.forEach((section) => {
        let poly = H.geo.LineString.fromFlexiblePolyline(
            section.polyline
        ).getLatLngAltArray();

        let actions = section.actions;

        actions.forEach(action => {
            var marker = new H.map.Marker({lat: poly[action.offset * 3], lng: poly[action.offset * 3 + 1]}, {icon: dotIcon});

            marker.setData(action.instruction);
            group.addObject(marker);
        });
    });

    group.addEventListener('tap', (evt) => {
        const marker = evt.target;
        const position = marker.getGeometry();
        const content = marker.getData();

        const bubble = new H.ui.InfoBubble(position, {content: content});

        ui.getBubbles().forEach(b => ui.removeBubble(b));
        ui.addBubble(bubble);
    });

    mapInstance.map.addObject(group);
}

function addIncidentsToMap(route) {
    const mapInstance = getMapInstance();

    if (!mapInstance?.map) {
        console.error("Map not initialized. Cannot add incidents.");
        return;
    }

    // Create an icon for incidents with bright red color
    const incidentIcon = new H.map.Icon(`
        <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#FF0000" stroke="white" stroke-width="2"/>
            <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">!</text>
        </svg>
    `, { anchor: { x: 12, y: 12 } });

    const incidentsGroup = new H.map.Group();

    route.sections.forEach((section) => {
        // Skip if no incidents or spans
        if (!section.incidents || !section.spans) {
            return;
        }

        // Get polyline coordinates
        let poly = H.geo.LineString.fromFlexiblePolyline(
            section.polyline
        ).getLatLngAltArray();

        // Process spans that contain incidents
        section.spans.forEach(span => {
            if (!span.incidents || !span.incidents.length) {
                return;
            }

            // Get location from polyline using span offset
            const lat = poly[span.offset * 3];
            const lng = poly[span.offset * 3 + 1];

            if (typeof lat === 'undefined' || typeof lng === 'undefined') {
                console.warn(`Invalid coordinates at offset ${span.offset}`);
                return;
            }

            // Create a marker for each incident in the span
            span.incidents.forEach(incidentIndex => {
                const incident = section.incidents[incidentIndex];
                
                if (!incident) {
                    console.warn(`No incident data found for index ${incidentIndex}`);
                    return;
                }

                const marker = new H.map.Marker(
                    { lat, lng },
                    { icon: incidentIcon }
                );

                // Add incident details to marker
                marker.incidentDetails = {
                    type: incident.type || 'Traffic Incident',
                    description: incident.description || 'Traffic incident reported',
                    criticality: incident.criticality || 'unknown',
                    category: incident.category,
                    startTime: incident.startTime,
                    endTime: incident.endTime
                };

                incidentsGroup.addObject(marker);
                console.log("Added incident marker:", { lat, lng, incident });
            });
        });
    });

    // Add click listener for incidents
    incidentsGroup.addEventListener('tap', (evt) => {
        const marker = evt.target;
        const incident = marker.incidentDetails;
        
        // Create info bubble content
        const bubbleContent = `
            <div style="padding: 10px; max-width: 200px;">
                <strong style="color: #FF0000;">Traffic Incident</strong><br>
                <hr style="margin: 5px 0;">
                <strong>Type:</strong> ${incident.type}<br>
                <strong>Description:</strong> ${incident.description}<br>
                ${incident.criticality !== 'unknown' ? `<strong>Criticality:</strong> ${incident.criticality}<br>` : ''}
                ${incident.category ? `<strong>Category:</strong> ${incident.category}<br>` : ''}
                ${incident.startTime ? `<strong>Start:</strong> ${new Date(incident.startTime).toLocaleString()}<br>` : ''}
                ${incident.endTime ? `<strong>End:</strong> ${new Date(incident.endTime).toLocaleString()}` : ''}
            </div>
        `;

        const bubble = new H.ui.InfoBubble(marker.getGeometry(), {
            content: bubbleContent
        });

        const ui = getUIInstance();
        if (!ui) {
            console.error("UI not initialized.");
            return;
        }

        // Clear any existing bubbles before adding new one
        ui.getBubbles().forEach(b => ui.removeBubble(b));
        ui.addBubble(bubble);
    });

    mapInstance.map.addObject(incidentsGroup);
}

function toMMSS(duration) {
    return (
        Math.floor(duration / 60) + " minutes " + (duration % 60) + " seconds."
    );
}

function locationFormat(user_location){
    if (!user_location || typeof user_location.lat === 'undefined' || typeof user_location.lng === 'undefined'){
        return null;
    }
    var formatted_loc = `${user_location.lat},${user_location.lng}`
    return formatted_loc;
}

const calculateRouteFromAtoB = async (platform, dest, origin) => {

    console.log("Running Route Service", {platform, dest, origin});

    try{
        if (!platform) {
            throw new Error("Platform not initialized!");
        }

        const user_location = origin || await getUserLocation();
        console.log("User Location: ", user_location);

        const formattedOrigin = locationFormat(user_location);
        const formattedDest = locationFormat(dest);

        if (!formattedDest || !formattedOrigin){
            throw new Error("Invalid origin or destination coordinates");
        }

        console.log("Formatted coordinates:", { origin: formattedOrigin, destination: formattedDest });

        const router = platform.getRoutingService(null, 8);
        const routeRequestParams = {
            routingMode: "fast",
            transportMode: "car",
            origin: formattedOrigin,
            destination: formattedDest,
            spans: 'incidents',
            return: "polyline,turnByTurnActions,actions,instructions,travelSummary,incidents",
            incidentTypes: 'all'
        };

        return new Promise((resolve, reject) => {
            router.calculateRoute(routeRequestParams,
                (result) => onSuccess(result, resolve),
                (error) => onError(error, reject)
            );
        });
    } catch (error) {
        console.error("Error calculating route:", error);
        throw error;
    }
}


function onSuccess(result, resolve) {
    try {
        if (result.routes && result.routes.length > 0) {
            console.log("Full route data:", JSON.stringify(result.routes[0], null, 2));
            console.log("Route calculated successfully:", result);
            const route = result.routes[0];
            addRouteShapeToMap(route);
            addManueversToMap(route);
            addIncidentsToMap(route);
            resolve?.(route);
        } else {
            const error = new Error("No routes found");
            console.error(error);
            throw error;
        }
    } catch (error) {
        console.error("Error processing route:", error);
        throw error;
    }
}


function onError(error, reject) {
    console.error("Routing error:", error);
    alert("Error calculating route: " + error.message);
    reject?.(error);
}

export const handleRouteService = async (dest, origin) => {
    try {
        const mapInstance = getMapInstance();

        if (!mapInstance?.map || !mapInstance?.platform){
            console.error("Map not initialized yet.");
            return;
        }

        await calculateRouteFromAtoB(mapInstance.platform, dest, origin)
    } catch (error){
        console.error("Error Calculating Routes");
    } 
}

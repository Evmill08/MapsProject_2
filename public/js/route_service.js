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

    if (!mapInstance?.map){
        console.error("Map not initialized. Cannot add maneuvers.");
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
            var marker = new H.map.Marker(
                {
                    lat: poly[action.offset * 3],
                    lng: poly[action.offset * 3 + 1],
                },
                {icon: dotIcon}
            );
            marker.instruction = action.instruction;
            group.addObject(marker);
        });
    });
            

    group.addEventListener(
        "tap",
        function(evt) {
            mapInstance.map.setCenter(evt.target.getGeometry());
            openBubble(evt.target.getGeometry(), evt.target.instruction);
        },
        false
    );

    mapInstance.map.addObject(group);
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
            return: "polyline,turnByTurnActions,actions,instructions,travelSummary",
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
            console.log("Route calculated successfully:", result);
            const route = result.routes[0];
            addRouteShapeToMap(route);
            addManueversToMap(route);
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
    // TODO: pass in coords for dest and origin
    dest = {lat: 42.33820, lng: -71.02918};
    origin = {lat: 39.57681, lng: -76.06998};
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

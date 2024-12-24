import { apikey } from "./credentials";

let map = null;
let ui = null;

// Function to initialize the map
export const initializeMap = () => {

  if (map){
    return map;
  }

  // Initialize the HERE Platform with the JS API key
  const platform = new H.service.Platform({
    apikey: apikey, 
  });

  // Create default map layers
  const defaultLayers = platform.createDefaultLayers();
  const overviewLayers = platform.createDefaultLayers();

  // Get the map container element
  const mapContainer = document.getElementById("mainPageBody").querySelector("#mapContainer");


  // Ensure the container exists before initializing the map
  if (mapContainer) {
    map = new H.Map(
      mapContainer,
      defaultLayers.vector.normal.map, // Initial base layer
      {
        zoom: 10, 
        center: { lat: 39.6, lng: -76.1 }, 
      }
    );

    // Initialize the UI components for the map
    ui = H.ui.UI.createDefault(map, defaultLayers);

    // The behavior variable implements default interactions for pan/zoom (also on mobile touch environments).
    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

    // Enable dynamic resizing of the map, based on the current size of the enclosing container
    window.addEventListener('resize', () => map.getViewPort().resize());

    // Add the overview control after map initialization
    const overviewMap = new H.ui.Overview(overviewLayers.raster.satellite.map, {
      //Set the control position and the map size and zoom parameters with respect to the map's viewport
      alignment: H.ui.LayoutAlignment.LEFT_BOTTOM,
      zoomDelta: 6,
      scaleX: 5,
      scaleY: 6
    });

    const zoomRectangle = new H.ui.ZoomRectangle({
      alignment: H.ui.LayoutAlignment.RIGHT_BOTTOM
    });

    function createMarkerIcon(color) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32">
        <path d="M12 0C6.48 0 2 4.48 2 10c0 5.057 3.333 14.5 10 22 6.667-7.5 10-16.943 10-22 0-5.52-4.48-10-10-10zm0 14c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" 
        fill="${color}" stroke="#FFFFFF"/>
      </svg>`;
    }

    // Define the colors for the icons
    const startColor = "#00008B";
    const stopoverColor = "#8AC9C9";
    const splitColor = "#A2EDE7";
    const endColor = "#990000";

    // Create the icons with respective colors
    const startIcon = new H.map.Icon(createMarkerIcon(startColor));
    const stopoverIcon = new H.map.Icon(createMarkerIcon(stopoverColor));
    const endIcon = new H.map.Icon(createMarkerIcon(endColor));
    const splitIcon = new H.map.Icon(createMarkerIcon(splitColor));

    // Create the DistanceMeasurement control
    const distanceMeasurementTool = new H.ui.DistanceMeasurement({
      startIcon: startIcon,
      stopoverIcon: stopoverIcon,
      endIcon: endIcon,
      splitIcon: splitIcon,
      lineStyle: {
        strokeColor: "rgba(95, 229, 218, 0.5)",
        lineWidth: 6
      },
      alignment: H.ui.LayoutAlignment.RIGHT_BOTTOM
    });


    // Now, add the overview control to the UI
    ui.addControl('overview', overviewMap);
    ui.addControl('rectangle', zoomRectangle);
    ui.addControl("distancemeasurement", distanceMeasurementTool);
    ui.setUnitSystem(H.ui.UnitSystem.IMPERIAL);
  }

  return map;
};

export const getMapInstance = () => map;
export const getUIInstance = () => ui;

// Dynamically load the HERE API scripts
export const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.type = "text/javascript";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const loadScriptWithRetry = async (src, retries = 5) => {
  try {
    await loadScript(src);
  } catch (error) {
    if (retries > 0 && error.message.includes('429')) {
      console.warn("Rate limit exceeded. Retrying in 1 second...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      return loadScriptWithRetry(src, retries - 1);
    } else {
      console.error("Error loading script:", error);
      throw error;
    }
  }
};

// Load the HERE Maps API and initialize the map
export const loadMapApi = async () => {
  try {
    // Load HERE Maps API scripts
    await loadScriptWithRetry("https://js.api.here.com/v3/3.1/mapsjs-core.js");
    await loadScriptWithRetry("https://js.api.here.com/v3/3.1/mapsjs-service.js");
    await loadScriptWithRetry("https://js.api.here.com/v3/3.1/mapsjs-ui.js");
    await loadScriptWithRetry("https://js.api.here.com/v3/3.1/mapsjs-mapevents.js");

    // Load the CSS file for the map UI
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://js.api.here.com/v3/3.1/mapsjs-ui.css";
    document.head.appendChild(link);

    // Once the scripts and CSS are loaded, initialize the map
    initializeMap();
  } catch (error) {
    console.error("Error loading HERE Maps API:", error);
  }
};

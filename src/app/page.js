"use client";

import { useEffect, useState } from "react";
import { handleQuickButtonPressed } from "../../public/js/quick_search";
import Head from "next/head";
import { initializeMap, loadMapApi, getMapInstance } from "../../public/js/map";
import '../../styles/MainPage.css'
import { MapSearch } from "../../public/js/map_search";
import {handleRouteService } from "../../public/js/route_service";

export default function Home() {
  const {
    query,
    suggestions,
    isLoading,
    showSuggestions,
    handleInputChange,
    handleSuggestionClick,
    setShowSuggestions
  } = MapSearch();

  const [mapError, setMapError] = useState(null);

  const handleEnterKeyDown = (event) => {
    if (event.key == "Enter"){
      event.preventDefault();
      setShowSuggestions(false);
    }
  }

  
  const handleTestRoute = async () => {
    try {
      const mapInstance = getMapInstance();
      console.log("Map instance:", mapInstance);
      
      if (!mapInstance?.map || !mapInstance?.platform) {
          setMapError("Map is not yet initialized. Please wait a moment and try again.");
          return;
      }

      await calculateRouteFromAtoB(
          mapInstance.platform,
          { lat: 39.58956, lng: -76.06569 },
          { lat: 39.577, lng: -76.07 }
      );
    } catch (error) {
        console.error("Route test error:", error);
        setMapError(`Error calculating route: ${error.message}`);
    }
  };

  useEffect(() => {
    loadMapApi();
  }, []); 

  return (
    <>
      <Head>
        <title>Maps Project</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta charSet="UTF-8" />
      </Head>

      <div className="mainPageBody" id="mainPageBody">
        <div className="mainPageHeader">
          <h1>Maps Project</h1>
        </div>
      
        <div className="mapContainer" id="mapContainer"></div>

        {mapError && (
          <div className="error-message" style={{ color: 'red', padding: '10px' }}>
            {mapError}
          </div>
        )}

        <div className="searchBox" id="searchBox">
          <form id="searchForm" onSubmit={(e) => e.preventDefault()}>
            <div className="searchBar">
              <textarea
                className="textarea"
                placeholder="Search our Map..."
                value={query}
                onChange={handleInputChange}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onFocus={() => {
                  if (query.trim()){
                    setShowSuggestions(true);
                  }
                }}
                onKeyDown={handleEnterKeyDown}
              ></textarea>
              <button 
                type="submit" 
                className="SearchButton" 
                onClick={() => {
                  if (suggestions.length > 0) {
                    handleSuggestionClick(suggestions[0]);
                  }
                }}
              >
                Search
              </button>
            </div>
          </form>

          {showSuggestions && (
            <div className="suggestions-container">
              {isLoading ? (
                <div className="suggestion-item">Loading...</div>
              ) : suggestions.length > 0 ? (
                suggestions.map((suggestion) => (
                  <div 
                    key={suggestion.id} 
                    className="suggestion-item" 
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="suggestion-title">{suggestion.title}</div>
                    <div className="suggestion-address">{suggestion.address?.label}</div>
                  </div>
                ))
              ) : (
                <div className="suggestion-item">No Results</div>
              )}
            </div>
          )}
        </div>

        <ul className="quickButtonBox">
          <li><button type="button" className="restaurantButton" onClick={handleQuickButtonPressed}>Restaurants</button></li>
          <li><button type="button" className="hotelButton" onClick={handleQuickButtonPressed}>Hotels</button></li>
          <li><button type="button" className="parkButton" onClick={handleQuickButtonPressed}>Parks</button></li>
          <li><button type="button" className="museumButton" onClick={handleQuickButtonPressed}>Museums</button></li>
          <li><button type="button" className="shoppingButton" onClick={handleQuickButtonPressed}>Shopping</button></li>
          <li><button type="button" className="testRouteButton" onClick={handleRouteService}>Test Route</button></li>
        </ul>
      </div>
    </>
  );
}

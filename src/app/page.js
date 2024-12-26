"use client";

import { useEffect, useState } from "react";
import { handleQuickButtonPressed } from "../../public/js/quick_search";
import Head from "next/head";
import { loadMapApi } from "../../public/js/map";
import '../../styles/MainPage.css'
import { MapSearch } from "../../public/js/map_search";

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

  const handleEnterKeyDown = (event) => {
    if (event.key == "Enter"){
      event.preventDefault();
    }
  }

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

      <body className="mainPageBody" id="mainPageBody">
        <div className="mainPageHeader">
          <h1>Maps Project</h1>
        </div>
      
        <div className="mapContainer" id="mapContainer"></div>

        <div className="searchBox" id="searchBox">
          <form id="searchForm" onSubmit={(e) => e.preventDefault()}>
            <div className="searchBar">
              <textarea
                className="textarea"
                placeholder="Search our Map..."
                value={query}
                onChange={handleInputChange}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onFocus={() => query && setShowSuggestions(true)}
                onKeyDown={handleEnterKeyDown}
              ></textarea>
              <button type="submit" className="SearchButton" onClick={handleSearchSubmit}>Search</button>
            </div>
          </form>

          {showSuggestions && (suggestions.length > 0 || isLoading) && (
            <div className="suggestions-container">
              {isLoading ? (
                <div className="suggestion-item">Loading...</div>
              ) : (
                suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="suggestion-item" onClick={() => handleSuggestionClick(suggestion)}>
                    <div className="suggestion-title">{suggestion.title}</div>
                    <div className="suggestion-address">{suggestion.address?.label}</div>
                  </div>
                ))
              )}
            </div>
              
          )}
        </div>

        <ul className="quickButtonBox">
          <li><button type="submit" className="restaurantButton" onClick={(e) => handleQuickButtonPressed(e)}>Restaurants</button></li>
          <li><button type="submit" className="hotelButton" onClick={(e) => handleQuickButtonPressed(e)}>Hotels</button></li>
          <li><button type="submit" className="parkButton" onClick={(e) => handleQuickButtonPressed(e)}>Parks</button></li>
          <li><button type="submit" className="museumButton" onClick={(e) => handleQuickButtonPressed(e)}>Museums</button></li>
          <li><button type="submit" className="shoppingButton" onClick={(e) => handleQuickButtonPressed(e)}>Shopping</button></li>
        </ul>
      </body>
    </>
  );
}


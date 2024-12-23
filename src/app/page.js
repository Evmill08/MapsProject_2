"use client";

import { useEffect, useState } from "react";

import Head from "next/head";
import { loadMapApi } from "../../public/js/map";
import '../../styles/MainPage.css'

export default function Home() {
  // Place holder stuff, we will abstract this into a different file and handle it there
  const [searchQuery, setSearchQuery] = useState("")
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value)
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    console.log("Search Query:", searchQuery);
  };

  const handleEnterKeyDown = (event) => {
    if (event.key == "Enter"){
      event.preventDefault();
    }
  }

  const handleQuickButtonPressed = (event) => {
    console.log(event.target.innerText);
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

      <body className="mainPageBody" id="mainPageBody">
        <div className="mainPageHeader">
          <h1>Maps Project</h1>
        </div>
      
        <div className="mapContainer" id="mapContainer"></div>

        <div className="searchBox" id="searchBox">
          <form id="searchForm" onSubmit={handleSearchSubmit}>
            <div className="searchBar">
              <textarea
                className="textarea"
                placeholder="Search our Map..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleEnterKeyDown}
              ></textarea>
              <button type="submit" className="SearchButton" onClick={handleSearchSubmit}>Search</button>
            </div>
          </form>
        </div>

        <ul className="quickButtonBox">
          <li><button type="submit" className="restaurantButton" onClick={handleQuickButtonPressed}>Restaurants</button></li>
          <li><button type="submit" className="hotelButton" onClick={handleQuickButtonPressed}>Hotels</button></li>
          <li><button type="submit" className="parkButton" onClick={handleQuickButtonPressed}>Parks</button></li>
          <li><button type="submit" className="museumButton" onClick={handleQuickButtonPressed}>Museums</button></li>
          <li><button type="submit" className="historyButton" onClick={handleQuickButtonPressed}>History</button></li>
        </ul>
      </body>
    </>
  );
}


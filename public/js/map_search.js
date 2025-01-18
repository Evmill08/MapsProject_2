import { apikey } from "./credentials";
import { getUserLocation } from "./quick_search";
import { useState, useCallback, useEffect } from 'react';
import { direct_search } from './direct_search';

export const MapSearch = () => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
      const fetchLocation = async () => {
        try {
          const location = await getUserLocation();
          setUserLocation(location);
        } catch (error) {
          console.error("Error getting user location: ", error);
        }
      };

      fetchLocation();
    }, []);


    const fetchSuggestions = useCallback(async (searchQuery) => {
        if (!searchQuery.trim()) {
            setSuggestions([]);
            return;
        }

        const url = `https://autosuggest.search.hereapi.com/v1/autosuggest` +
          `?at=${userLocation.lat},${userLocation.lng}` +
          `&limit=5` +
          `&q=${encodeURIComponent(searchQuery)}` +
          `&apiKey=${apikey}`;

        setIsLoading(true);
        try {
            const response = await fetch(url);
            if (!response.ok){
              throw new Error("HTTP Error. Status: ", response.status);
            }
            const data = await response.json();
            setSuggestions(data.items || []);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    }, [userLocation]);

    const handleInputChange = (event) => {
        const value = event.target.value;
        setQuery(value);
        
        if (value.trim()) {
            setShowSuggestions(true);
            const timeoutId = setTimeout(() => {
                fetchSuggestions(value);
            }, 300);
            return () => clearTimeout(timeoutId);
        } else {
            setShowSuggestions(false);
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion.title);
        setSuggestions([]);
        setShowSuggestions(false);
        //where we make the call to the direct_search function to place the marker
        direct_search(suggestion);
    };

    return {
        query,
        suggestions,
        isLoading,
        showSuggestions,
        handleInputChange,
        handleSuggestionClick,
        setShowSuggestions,
        userLocation
    };
};









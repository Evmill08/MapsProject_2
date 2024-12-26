import { apikey } from "./credentials";
import { getUserLocation } from "./quick_search";
import React, {useState} from 'react';

export const MapSearch = ({onLocationSelection}) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const fetchSuggestions = async (searchQuery) => {
        if (!searchQuery.trim()) {
          setSuggestions([]);
          return;
        }
    
        setIsLoading(true);
        try {
          const response = await fetch(
            `https://autosuggest.search.hereapi.com/v1/autosuggest?q=${encodeURIComponent(searchQuery)}&apiKey=${apikey}&limit=5`
          );
          const data = await response.json();
          setSuggestions(data.items || []);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      };

      const handleInputChange = (event) => {
        const value = event.target.value;
        setQuery(value);
        setShowSuggestions(true);
    
        const timeoutId = setTimeout(() => {
          fetchSuggestions(value);
        }, 300);
    
        return () => clearTimeout(timeoutId);
      };

      const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion.title);
        setSuggestions([]);
        setShowSuggestions(false);
        if (onLocationSelect) {
          onLocationSelect({
            title: suggestion.title,
            lat: suggestion.position?.lat,
            lng: suggestion.position?.lng
          });
        }
      };

      return {
        query,
        suggestions,
        isLoading,
        showSuggestions,
        handleInputChange,
        handleSuggestionClick,
        setShowSuggestions
      };
}









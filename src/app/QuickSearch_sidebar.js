import React from "react";
import { handleQuickButtonPressed } from "../../public/js/quick_search";
import { categoryData } from "../../public/js/categories";
const QuickSearchSidebar = ({isOpen, onClose}) => {
  const handleButtonClick = (displayName) => {
    // Create a mock event object that matches what the original function expects
    const mockEvent = {
      target: {
        innerText: displayName
      }
    };
    handleQuickButtonPressed(mockEvent);
  };

  return (
    <div className={`quick-search-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2 className="text-xl font-semibold">Quick Search</h2>
        <button 
          onClick={onClose}
          className="close-button"
          aria-label="Close sidebar"
        >
          ×
        </button>
      </div>
      
      <div className="sidebar-content">
        {Object.entries(categoryData).map(([categoryName, items]) => (
          <div key={categoryName} className="category-section">
            <h3 className="category-title">{categoryName}</h3>
            <div className="button-grid">
              {Object.entries(items).map(([displayName, code]) => (
                <button
                  key={code}
                  className="quick-search-button"
                  onClick={() => handleButtonClick(displayName)}
                >
                  {displayName}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickSearchSidebar;
// SearchContext.jsx
// React context for managing search query state globally (alternative to Zustand)
import { createContext, useContext, useState } from 'react';

const SearchContext = createContext();

// Provider component to wrap app and provide search state
export function SearchProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </SearchContext.Provider>
  );
}

// Custom hook to use search context
export function useSearch() {
  return useContext(SearchContext);
}

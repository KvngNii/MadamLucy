import { createContext, useContext, useMemo, useState } from 'react';
import { DEFAULT_FLAVOR_ID, flavors, getFlavor } from '../data/flavors.js';

const FlavorContext = createContext(null);

export function FlavorProvider({ children }) {
  const [activeFlavorId, setActiveFlavorId] = useState(DEFAULT_FLAVOR_ID);

  const value = useMemo(
    () => ({
      flavors,
      activeFlavorId,
      activeFlavor: getFlavor(activeFlavorId),
      setActiveFlavorId,
    }),
    [activeFlavorId]
  );

  return (
    <FlavorContext.Provider value={value}>{children}</FlavorContext.Provider>
  );
}

export function useFlavor() {
  const ctx = useContext(FlavorContext);
  if (!ctx) {
    throw new Error('useFlavor must be used within a FlavorProvider');
  }
  return ctx;
}

"use client";

import { Court, VenueWithCourts } from "@/lib/db/schema";
import { createContext, useContext, useMemo, useState } from "react";

type CourtContextType = {
  selectedVenue: VenueWithCourts | null;
  setSelectedVenue: (venue: VenueWithCourts | null) => void;
  selectedCourt: Court | null;
  setSelectedCourt: (court: Court | null) => void;
};

const defaultContextValue: CourtContextType = {
  selectedVenue: null,
  setSelectedVenue: () => {},
  selectedCourt: null,
  setSelectedCourt: () => {},
};

export const CourtContext =
  createContext<CourtContextType>(defaultContextValue);

export function CourtProvider({ children }: { children: React.ReactNode }) {
  const [selectedVenue, setSelectedVenue] = useState<VenueWithCourts | null>(
    null
  );
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);

  const value = useMemo(
    () => ({
      selectedVenue,
      setSelectedVenue,
      selectedCourt,
      setSelectedCourt,
    }),
    [selectedVenue, selectedCourt]
  );

  return (
    <CourtContext.Provider value={value}>{children}</CourtContext.Provider>
  );
}

export function useCourtContext() {
  const context = useContext(CourtContext);
  if (!context) {
    throw new Error("useCourtContext must be used within a CourtProvider");
  }
  return context;
}

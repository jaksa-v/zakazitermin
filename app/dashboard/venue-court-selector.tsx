"use client";

import * as React from "react";
import { Court, VenueWithCourts } from "@/lib/db/schema";
import { useCourtContext } from "./court-context";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

type VenueCourtSelectorProps = {
  venues: VenueWithCourts[];
};

export default function VenueCourtSelector({
  venues,
}: VenueCourtSelectorProps) {
  const { setSelectedVenue, setSelectedCourt } = useCourtContext();
  const [localSelectedVenue, setLocalSelectedVenue] =
    useState<VenueWithCourts | null>(null);
  const [localSelectedCourt, setLocalSelectedCourt] = useState<Court | null>(null);

  // Initialize venue and court on mount
  useEffect(() => {
    if (venues.length > 0) {
      const initialVenue = venues[0];
      const initialCourt = initialVenue.courts[0] || null;
      setLocalSelectedVenue(initialVenue);
      setLocalSelectedCourt(initialCourt);
    }
  }, [venues]);

  useEffect(() => {
    setSelectedVenue(localSelectedVenue);
    setSelectedCourt(localSelectedCourt);
  }, [
    localSelectedVenue,
    localSelectedCourt,
    setSelectedVenue,
    setSelectedCourt,
  ]);

  // Update selected court when venue changes
  const handleVenueChange = (value: string) => {
    const venue = venues.find((v) => String(v.id) === value);
    setLocalSelectedVenue(venue || null);
    if (venue) {
      setLocalSelectedCourt(venue.courts[0] || null);
    }
  };

  const handleCourtChange = (value: string) => {
    if (!localSelectedVenue) return;
    const court = localSelectedVenue.courts.find(
      (c) => String(c.id) === value
    );
    setLocalSelectedCourt(court || null);
  };

  if (venues.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No venues available
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Select
        value={String(localSelectedVenue?.id || "")}
        onValueChange={handleVenueChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select venue" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {venues.map((venue) => (
              <SelectItem key={venue.id} value={String(venue.id)}>
                {venue.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        value={String(localSelectedCourt?.id || "")}
        onValueChange={handleCourtChange}
        disabled={!localSelectedVenue || localSelectedVenue.courts.length === 0}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select court" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {localSelectedVenue?.courts.map((court) => (
              <SelectItem key={court.id} value={String(court.id)}>
                {court.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

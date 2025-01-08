"use client";

import { useCourtContext } from "./court-context";
import ReservationList from "@/components/reservation-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { ReservationWithCourt } from "@/lib/db/schema";

export default function CourtReservations() {
  const { selectedCourt } = useCourtContext();
  const [reservations, setReservations] = useState<{
    upcoming: ReservationWithCourt[];
    past: ReservationWithCourt[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReservations() {
      if (!selectedCourt) {
        setReservations(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/courts/${selectedCourt.id}/reservations`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch reservations");
        }
        const data = await response.json();
        setReservations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setReservations(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReservations();
  }, [selectedCourt]);

  // Return null on first render to avoid hydration mismatch
  if (!selectedCourt) {
    return null;
  }

  // Only show loading after initial render
  if (isLoading) {
    return (
      <div className="text-muted-foreground text-center py-8">
        Loading reservations...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-muted-foreground text-center py-8">{error}</div>
    );
  }

  if (!reservations) {
    return null;
  }

  return (
    <Tabs defaultValue="upcoming" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        <TabsTrigger value="past">Past</TabsTrigger>
      </TabsList>
      <TabsContent value="upcoming">
        <ReservationList reservations={reservations.upcoming} />
      </TabsContent>
      <TabsContent value="past">
        <ReservationList reservations={reservations.past} />
      </TabsContent>
    </Tabs>
  );
}

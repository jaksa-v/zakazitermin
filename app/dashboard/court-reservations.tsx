"use client";

import { useCourtContext } from "./court-context";
import ReservationList from "@/components/reservation-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCourtReservations } from "@/hooks/use-court-reservations";
import { Loader2 } from "lucide-react";

export default function CourtReservations() {
  const { selectedCourt } = useCourtContext();
  const { reservations, isLoading, error } =
    useCourtReservations(selectedCourt);

  if (!selectedCourt) {
    return null;
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
        {isLoading ? (
          <div className="text-muted-foreground text-center py-6 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ReservationList reservations={reservations.upcoming} />
        )}
      </TabsContent>
      <TabsContent value="past">
        {isLoading ? (
          <div className="text-muted-foreground text-center py-6 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ReservationList reservations={reservations.past} />
        )}
      </TabsContent>
    </Tabs>
  );
}

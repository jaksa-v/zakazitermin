"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ReservationWithCourt } from "@/lib/db/schema";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ReservationList({
  reservations,
  upcoming,
}: {
  reservations: ReservationWithCourt[];
  upcoming?: boolean;
}) {
  return (
    <div className="space-y-4">
      {reservations.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No reservations found
        </p>
      ) : (
        reservations.map((reservation) => (
          <Card key={reservation.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">
                    {format(new Date(reservation.startTime), "PPP")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(reservation.startTime), "p")} -{" "}
                    {format(new Date(reservation.endTime), "p")}
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Court:</span>{" "}
                      <span className="font-semibold">
                        {reservation.court.name}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Price:</span> $
                      {reservation.totalPrice.toFixed(2)}
                    </p>
                    <div className="text-sm">
                      <span className="font-medium">Status:</span>{" "}
                      <Badge
                        variant={
                          reservation.status === "confirmed"
                            ? "default"
                            : reservation.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {reservation.status.toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
                {upcoming && (
                  <Button
                    variant="outline"
                    // TODO: Implement cancelReservation action
                    onClick={() => {}}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

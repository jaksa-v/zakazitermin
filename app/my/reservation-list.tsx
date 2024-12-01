"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ReservationWithCourt } from "@/lib/db/schema";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cancelReservation } from "@/app/(reservations)/actions";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { ActionState } from "@/lib/actionHelpers";
import { useState } from "react";
import { CancelReservationModal } from "./cancel-reservation-modal";

export default function ReservationList({
  reservations,
  upcoming,
}: {
  reservations: ReservationWithCourt[];
  upcoming?: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    cancelReservation,
    { error: "" }
  );

  const [selectedReservation, setSelectedReservation] =
    useState<ReservationWithCourt | null>(null);

  // Handle form state changes
  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
      setSelectedReservation(null);
    } else if (state.success) {
      toast.success(state.success);
      setSelectedReservation(null);
    }
  }, [state]);

  const handleCancelClick = (reservation: ReservationWithCourt) => {
    setSelectedReservation(reservation);
  };

  return (
    <>
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
                  {upcoming && reservation.status !== "cancelled" && (
                    <Button
                      variant="outline"
                      onClick={() => handleCancelClick(reservation)}
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

      {selectedReservation && (
        <>
          <CancelReservationModal
            open={!!selectedReservation}
            onOpenChange={(open) => !open && setSelectedReservation(null)}
            onConfirm={() => {
              const form = document.getElementById("cancelForm") as HTMLFormElement;
              form.requestSubmit();
            }}
            reservation={selectedReservation}
            loading={pending}
          />
          <form
            id="cancelForm"
            action={formAction}
            className="hidden"
          >
            <input
              type="hidden"
              name="reservationId"
              value={selectedReservation.id}
            />
          </form>
        </>
      )}
    </>
  );
}

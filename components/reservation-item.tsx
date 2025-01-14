"use client";

import { ReservationWithCourt } from "@/lib/db/schema";
import { format } from "date-fns";

export function ReservationItem({ reservation }: { reservation: ReservationWithCourt }) {
  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">
            {format(new Date(reservation.startTime), "PPP")}
          </p>
          <p className="text-sm text-muted-foreground">
            {format(new Date(reservation.startTime), "p")} -{" "}
            {format(new Date(reservation.endTime), "p")}
          </p>
        </div>
      </div>
    </div>
  );
}

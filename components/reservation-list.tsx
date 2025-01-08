import { ReservationWithCourt } from "@/lib/db/schema";
import { format } from "date-fns";

interface ReservationListProps {
  reservations: ReservationWithCourt[];
}

export default function ReservationList({
  reservations,
}: ReservationListProps) {
  if (!reservations.length) {
    return (
      <div className="text-muted-foreground text-center py-6">
        No reservations found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reservations.map((reservation) => (
        <div
          key={reservation.id}
          className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
        >
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
      ))}
    </div>
  );
}

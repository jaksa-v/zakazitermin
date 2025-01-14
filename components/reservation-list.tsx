import { ReservationWithCourt } from "@/lib/db/schema";
import { ReservationItem } from "./reservation-item";

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
        <ReservationItem key={reservation.id} reservation={reservation} />
      ))}
    </div>
  );
}

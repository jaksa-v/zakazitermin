import { useEffect, useState } from "react";
import { ReservationWithCourt } from "@/lib/db/schema";
import { Court } from "@/lib/db/schema";

interface UseCourtReservationsReturn {
  reservations: {
    upcoming: ReservationWithCourt[];
    past: ReservationWithCourt[];
  } | null;
  isLoading: boolean;
  error: string | null;
}

export function useCourtReservations(selectedCourt: Court | null): UseCourtReservationsReturn {
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

  return { reservations, isLoading, error };
}

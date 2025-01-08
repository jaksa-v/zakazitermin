import useSWR from "swr";
import { ReservationWithCourt } from "@/lib/db/schema";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface CourtReservations {
  upcoming: ReservationWithCourt[];
  past: ReservationWithCourt[];
}

export function useCourtReservations(courtId: number | null) {
  const { data, error, isLoading } = useSWR<CourtReservations>(
    courtId ? `/api/courts/${courtId}/reservations` : null,
    fetcher
  );

  return {
    reservations: data,
    isLoading,
    isError: error,
  };
}

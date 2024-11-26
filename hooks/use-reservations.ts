import useSWR from "swr";
import { Reservation } from "@/lib/db/schema";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useReservations(courtId: number | null) {
  const { data, error, isLoading } = useSWR<Reservation[]>(
    courtId ? `/api/reservations?courtId=${courtId}` : null,
    fetcher
  );

  return {
    reservations: data,
    isLoading,
    isError: error,
  };
}

"use client";

import { FC, useState, useMemo, useEffect } from "react";
import {
  format,
  addMinutes,
  parse,
  isBefore,
  addDays,
  startOfToday,
} from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Court, VenueWithCourts } from "@/lib/db/schema";
import { createReservation } from "@/app/(reservations)/actions";
import { useActionState } from "react";
import { toast } from "sonner";
import { ActionState } from "@/lib/actionHelpers";
import { Loader2 } from "lucide-react";
import { useReservations } from "@/hooks/use-reservations";
import { useRouter } from "next/navigation";

interface ReservationFormProps {
  court: Court;
  venue: VenueWithCourts;
}

const ReservationForm: FC<ReservationFormProps> = ({ court, venue }) => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createReservation,
    { error: "" }
  );

  // Fetch reservations for the selected court
  const { reservations, isLoading: isLoadingReservations } = useReservations(
    court.id
  );

  // Handle form state changes
  useEffect(() => {
    if (state.error) {
      if (state.error === "User is not authenticated") {
        toast.error("Please sign in to make a reservation");
      } else {
        toast.error(state.error);
      }
    }
  }, [state, router]);

  // Get operating hours for the selected day
  const timeSlots = useMemo(() => {
    const dayOfWeek = selectedDate.getDay();
    const todayHours = venue.operatingHours.find(
      (h) => h.dayOfWeek === dayOfWeek
    );

    if (!todayHours) return [];

    const slots: string[] = [];
    const startTime = parse(todayHours.openTime, "HH:mm", selectedDate);
    const endTime = parse(todayHours.closeTime, "HH:mm", selectedDate);

    let currentSlot = startTime;
    while (isBefore(currentSlot, endTime)) {
      slots.push(format(currentSlot, "HH:mm"));
      currentSlot = addMinutes(currentSlot, 60);
    }

    return slots;
  }, [selectedDate, venue.operatingHours]);

  // Check if a time slot is reserved or in the past
  const isTimeSlotReserved = (time: string) => {
    const now = new Date();
    const slotDate = new Date(selectedDate);
    const [hour] = time.split(":");
    slotDate.setHours(parseInt(hour), 0, 0, 0);

    if (slotDate <= now) {
      return true;
    }

    return reservations?.some((reservation) => {
      const reservationDate = new Date(reservation.startTime);
      return (
        format(reservationDate, "yyyy-MM-dd") ===
          format(selectedDate, "yyyy-MM-dd") &&
        format(reservationDate, "HH:mm") === time
      );
    });
  };

  const handleTimeClick = (time: string) => {
    if (isTimeSlotReserved(time)) return;

    setSelectedTimes((prev) => {
      if (prev.includes(time)) {
        return prev.filter((t) => t !== time);
      } else {
        const timeValue = parseInt(time.split(":")[0]);
        const hasAdjacentSlot = prev.some((t) => {
          const existingTime = parseInt(t.split(":")[0]);
          return Math.abs(existingTime - timeValue) === 1;
        });

        if (prev.length === 0 || hasAdjacentSlot) {
          const newTimes = [...prev, time].sort();
          const isConsecutive = newTimes.every((t, i) => {
            if (i === 0) return true;
            const curr = parseInt(t.split(":")[0]);
            const prev = parseInt(newTimes[i - 1].split(":")[0]);
            return curr - prev === 1;
          });
          return isConsecutive ? newTimes : prev;
        }
        return prev;
      }
    });
  };

  const today = startOfToday();
  const oneMonthFromNow = addDays(today, 30);

  return (
    <Card className="p-6 w-full mx-auto">
      <form action={formAction} className="flex flex-col gap-y-4">
        <input type="hidden" name="courtId" value={court.id} />
        <input type="hidden" name="date" value={selectedDate.toISOString()} />
        <input
          type="hidden"
          name="times"
          value={JSON.stringify(selectedTimes)}
        />

        <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-6 lg:space-y-0">
          <div className="lg:w-1/2">
            <label className="text-sm font-medium mb-2 block">
              Select Date
            </label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                  setSelectedTimes([]);
                }
              }}
              disabled={{ before: today, after: oneMonthFromNow }}
              className="rounded-md border mx-auto"
              weekStartsOn={1}
            />
          </div>

          <div className="lg:w-1/2">
            <label className="text-sm font-medium mb-2 block">
              Select Hours
            </label>
            {isLoadingReservations ? (
              <div className="text-center text-muted-foreground py-4">
                <Loader2 className="animate-spin h-5 w-5 mx-auto mb-2" />
                Loading available time slots...
              </div>
            ) : timeSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {timeSlots.map((time) => {
                  const isReserved = isTimeSlotReserved(time);
                  return (
                    <Button
                      key={time}
                      type="button"
                      variant={
                        selectedTimes.includes(time) ? "default" : "outline"
                      }
                      disabled={isReserved}
                      onClick={() => handleTimeClick(time)}
                      className={`${
                        isReserved
                          ? "bg-muted text-muted-foreground cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {time}
                    </Button>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No time slots available for selected date
              </p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={selectedTimes.length === 0 || pending}
          className="w-40 self-end"
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Reserve ${selectedTimes.length} hour${
              selectedTimes.length === 1 ? "" : "s"
            }`
          )}
        </Button>
      </form>
    </Card>
  );
};

export default ReservationForm;

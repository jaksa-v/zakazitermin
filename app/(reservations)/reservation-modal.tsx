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
import Modal from "@/components/modal";
import { Court, VenueWithCourts } from "@/lib/db/schema";
import { createReservation } from "@/app/(reservations)/actions";
import { useActionState } from "react";
import { toast } from "sonner";
import { ActionState } from "@/lib/actionHelpers";
import { Loader2 } from "lucide-react";
import { useReservations } from "@/hooks/use-reservations";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

interface ReservationModalProps {
  court: Court;
  venue: VenueWithCourts;
  onClose: () => void;
}

const ReservationModal: FC<ReservationModalProps> = ({
  court,
  venue,
  onClose,
}) => {
  const { userId, isLoaded } = useAuth();
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
    } else if (state.success) {
      toast.success(state.success);
      onClose();
    }
  }, [state, onClose]);

  // Get operating hours for the selected day
  const timeSlots = useMemo(() => {
    const dayOfWeek = selectedDate.getDay(); // 0-6 for Sunday-Saturday
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
      currentSlot = addMinutes(currentSlot, 60); // 1-hour slots
    }

    return slots;
  }, [selectedDate, venue.operatingHours]);

  // Check if a time slot is reserved or in the past
  const isTimeSlotReserved = (time: string) => {
    // Check if the slot is in the past
    const now = new Date();
    const slotDate = new Date(selectedDate);
    const [hour] = time.split(":");
    slotDate.setHours(parseInt(hour), 0, 0, 0);

    if (slotDate <= now) {
      return true;
    }

    // Check if the slot is reserved
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
    // Don't allow selecting reserved slots
    if (isTimeSlotReserved(time)) return;

    setSelectedTimes((prev) => {
      if (prev.includes(time)) {
        // Remove time if already selected
        return prev.filter((t) => t !== time);
      } else {
        // Add time if it's adjacent to existing selections
        const timeValue = parseInt(time.split(":")[0]);
        const hasAdjacentSlot = prev.some((t) => {
          const existingTime = parseInt(t.split(":")[0]);
          return Math.abs(existingTime - timeValue) === 1;
        });

        if (prev.length === 0 || hasAdjacentSlot) {
          const newTimes = [...prev, time].sort();
          // Ensure times are consecutive
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
    <Modal onClose={onClose}>
      <Card className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Reserve {court.name}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form action={formAction}>
          <input type="hidden" name="courtId" value={court.id} />
          <input type="hidden" name="date" value={selectedDate.toISOString()} />
          <input
            type="hidden"
            name="times"
            value={JSON.stringify(selectedTimes)}
          />

          <div className="flex flex-col space-y-4">
            <div className="flex flex-col items-start">
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
                className="rounded-md border"
                weekStartsOn={1}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Hours
              </label>
              {isLoadingReservations ? (
                <div className="text-center text-muted-foreground py-4 rounded-md">
                  <Loader2 className="animate-spin h-5 w-5 mx-auto mb-2" />
                  Loading available time slots...
                </div>
              ) : timeSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots.map((time) => {
                    const isReserved = isTimeSlotReserved(time);
                    return (
                      <Button
                        key={time}
                        type="button"
                        variant={
                          isReserved
                            ? "ghost"
                            : selectedTimes.includes(time)
                            ? "default"
                            : "outline"
                        }
                        className={`w-full ${
                          isReserved
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : ""
                        }`}
                        onClick={() => handleTimeClick(time)}
                        disabled={isReserved}
                      >
                        {time}
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4 rounded-md">
                  No available time slots for this day
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t mt-4">
            <div className="text-sm">
              <p className="font-medium whitespace-nowrap">
                ${court.basePrice * selectedTimes.length}/total
              </p>
              <p className="text-muted-foreground">
                Selected: {format(selectedDate, "MMM d")}{" "}
                {selectedTimes.length > 0 ? (
                  <>
                    {selectedTimes.length} hour
                    {selectedTimes.length > 1 ? "s" : ""}
                    <span className="ml-2">({selectedTimes.join(" - ")})</span>
                  </>
                ) : (
                  "No hours selected"
                )}
              </p>
            </div>
            <div className="ml-auto flex space-x-2 shrink-0">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {userId && isLoaded ? (
                <Button
                  type="submit"
                  disabled={selectedTimes.length === 0 || pending}
                >
                  {pending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Reserving...
                    </>
                  ) : (
                    `Reserve for $${court.basePrice * selectedTimes.length}`
                  )}
                </Button>
              ) : (
                <Button asChild>
                  <Link
                    href={`/sign-in?redirect=${encodeURIComponent(
                      window.location.pathname
                    )}`}
                  >
                    Sign in to reserve
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </form>
      </Card>
    </Modal>
  );
};

export default ReservationModal;

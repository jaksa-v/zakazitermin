"use client";

import { FC, useState, useMemo } from "react";
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
import Modal from "@/components/ui/modal";
import { Court, VenueWithCourts } from "@/lib/db/schema";

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);

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

  const handleTimeClick = (time: string) => {
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

  const handleReservation = () => {
    if (selectedTimes.length === 0) return;
    console.log(
      "Reserving court",
      court.id,
      "for",
      selectedDate,
      "times:",
      selectedTimes
    );
    onClose();
  };

  const today = startOfToday();
  const oneMonthFromNow = addDays(today, 30);

  return (
    <Modal onClose={onClose}>
      <Card className="bg-white p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Reserve {court.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

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
            {timeSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={
                      selectedTimes.includes(time) ? "default" : "outline"
                    }
                    className="w-full"
                    onClick={() => handleTimeClick(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4 bg-gray-50 rounded-md">
                No available time slots for this day
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t">
          <div className="text-sm">
            <p className="font-medium whitespace-nowrap">
              ${court.basePrice * selectedTimes.length}/total
            </p>
            {selectedTimes.length > 0 && (
              <p className="text-gray-600">
                Selected: {format(selectedDate, "MMM d")} {selectedTimes.length}{" "}
                hour{selectedTimes.length > 1 ? "s" : ""} (
                {selectedTimes.join(" - ")})
              </p>
            )}
          </div>
          <div className="ml-auto flex space-x-2 shrink-0">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={selectedTimes.length === 0}
              onClick={handleReservation}
            >
              Reserve
            </Button>
          </div>
        </div>
      </Card>
    </Modal>
  );
};

export default ReservationModal;

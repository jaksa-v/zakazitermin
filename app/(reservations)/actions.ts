"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { reservations } from "@/lib/db/schema";
import { validatedActionWithUser } from "@/lib/actionHelpers";
import { eq, and, or, lte, gt, lt, gte } from "drizzle-orm";

const reservationSchema = z.object({
  courtId: z.coerce.number().int(),
  date: z.string(),
  times: z.string().transform((str) => JSON.parse(str) as string[]),
});

export const createReservation = validatedActionWithUser(
  reservationSchema,
  async (data, formData, user) => {
    try {
      const { courtId, date, times } = data;

      // Convert times array and date into start and end timestamps
      const [firstTime] = times;
      const [lastTime] = times.slice(-1);

      const startTime = new Date(date);
      const [startHour] = firstTime.split(":");
      startTime.setHours(parseInt(startHour), 0, 0, 0);

      const endTime = new Date(date);
      const [endHour] = lastTime.split(":");
      endTime.setHours(parseInt(endHour) + 1, 0, 0, 0);

      // Check for existing reservations in the time slot
      const existingReservations = await db
        .select()
        .from(reservations)
        .where(
          and(
            eq(reservations.courtId, courtId),
            or(
              // New reservation starts during an existing reservation
              and(
                lte(reservations.startTime, startTime),
                gt(reservations.endTime, startTime)
              ),
              // New reservation ends during an existing reservation
              and(
                lt(reservations.startTime, endTime),
                gte(reservations.endTime, endTime)
              ),
              // Existing reservation is completely within new reservation
              and(
                gte(reservations.startTime, startTime),
                lte(reservations.endTime, endTime)
              )
            ),
            eq(reservations.status, "confirmed")
          )
        );

      if (existingReservations.length > 0) {
        return { error: "Time slot is already reserved" };
      }

      // Calculate total price (1 hour per time slot)
      // TODO: Calculate real price
      const totalPrice = times.length * 10;

      // Create the reservation
      const [reservation] = await db
        .insert(reservations)
        .values({
          userId: user.id,
          courtId,
          startTime,
          endTime,
          totalPrice,
          status: "confirmed",
          paymentStatus: "unpaid",
        })
        .returning();

      return { success: "Reservation created successfully", reservation };
    } catch (error) {
      console.error("Error creating reservation:", error);
      return { error: "Failed to create reservation" };
    }
  }
);

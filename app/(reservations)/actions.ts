"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { courts, reservations } from "@/lib/db/schema";
import { validatedActionWithUser } from "@/lib/actionHelpers";
import { eq, and, or, lte, gt, lt, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const reservationSchema = z.object({
  courtId: z.coerce.number().int(),
  date: z.string(),
  times: z.string().transform((str) => JSON.parse(str) as string[]),
});

export const createReservation = validatedActionWithUser(
  reservationSchema,
  async (data, _formData, user) => {
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

    const [court, existingReservations] = await Promise.all([
      db
        .select()
        .from(courts)
        .where(eq(courts.id, courtId))
        .then((results) => results[0]),
      db
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
        ),
    ]);

    if (!court) {
      return { error: "Court not found" };
    }

    if (existingReservations.length > 0) {
      return { error: "Time slot is already reserved" };
    }

    // Calculate total price (1 hour per time slot)
    const totalPrice = times.length * court.basePrice;

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

    if (reservation) {
      revalidatePath("/my");
      redirect("/my");
      // return { success: "Reservation created!", reservation };
    } else {
      return { error: "Error creating reservation" };
    }
  }
);

const cancelReservationSchema = z.object({
  reservationId: z.coerce.number().int(),
});

export const cancelReservation = validatedActionWithUser(
  cancelReservationSchema,
  async (data, _formData, user) => {
    try {
      const { reservationId } = data;

      // Find the reservation
      const [reservation] = await db
        .select()
        .from(reservations)
        .where(
          and(
            eq(reservations.id, reservationId),
            eq(reservations.userId, user.id)
          )
        );

      if (!reservation) {
        return { error: "Reservation not found" };
      }

      if (reservation.status === "cancelled") {
        return { error: "Reservation is already cancelled" };
      }

      // Check if the reservation is in the past
      if (new Date(reservation.startTime) <= new Date()) {
        return { error: "Cannot cancel past reservations" };
      }

      // Update the reservation status
      const [updatedReservation] = await db
        .update(reservations)
        .set({
          status: "cancelled",
        })
        .where(eq(reservations.id, reservationId))
        .returning();

      revalidatePath("/my");

      return {
        success: "Reservation cancelled successfully",
        reservation: updatedReservation,
      };
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      return { error: "Failed to cancel reservation" };
    }
  }
);

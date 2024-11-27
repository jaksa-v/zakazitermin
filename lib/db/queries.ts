import { and, eq, gte, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from ".";
import { verifyToken } from "../auth/session";
import { reservations, users } from "./schema";
import { startOfToday } from "date-fns";

export async function getUser() {
  const sessionCookie = (await cookies()).get("session");
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== "number"
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getVenuesWithCourts() {
  // get venues along with their courts and operating hours
  const venuesWithCourts = await db.query.venues.findMany({
    with: {
      courts: {
        with: {
          sport: true,
        },
      },
      operatingHours: true,
    },
  });

  return venuesWithCourts;
}

export async function getSports() {
  return db.query.sports.findMany();
}

export async function getUpcomingReservations(courtId: number) {
  const today = startOfToday();

  const upcomingReservations = await db.query.reservations.findMany({
    where: and(
      eq(reservations.courtId, courtId),
      gte(reservations.startTime, today)
    ),
  });

  return upcomingReservations;
}

export async function getUserReservations(userId: number) {
  const now = new Date();

  const userReservations = await db
    .select()
    .from(reservations)
    .where(eq(reservations.userId, userId))
    .orderBy(reservations.startTime);

  const upcoming = userReservations.filter(
    (reservation) => reservation.startTime > now
  );
  const past = userReservations.filter(
    (reservation) => reservation.startTime <= now
  );

  return { upcoming, past };
}

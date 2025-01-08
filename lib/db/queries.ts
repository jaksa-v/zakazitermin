import { and, eq, gte } from "drizzle-orm";
import { db } from ".";
import { reservations, venues } from "./schema";
import { startOfToday } from "date-fns";

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

export async function getUserReservations(userId: string) {
  const now = new Date();

  const userReservations = await db.query.reservations.findMany({
    with: {
      court: true,
    },
    where: eq(reservations.userId, userId),
    orderBy: (reservations, { asc }) => asc(reservations.startTime),
  });

  const upcoming = userReservations.filter(
    (reservation) => reservation.startTime > now
  );
  const past = userReservations.filter(
    (reservation) => reservation.startTime <= now
  );

  return { upcoming, past };
}

export async function getCourtReservations(courtId: number) {
  const now = new Date();

  const courtReservations = await db.query.reservations.findMany({
    with: {
      court: true,
    },
    where: eq(reservations.courtId, courtId),
    orderBy: (reservations, { asc }) => asc(reservations.startTime),
  });

  const upcoming = courtReservations.filter(
    (reservation) => reservation.startTime > now
  );
  const past = courtReservations.filter(
    (reservation) => reservation.startTime <= now
  );

  return { upcoming, past };
}

export async function getOrganizationVenuesWithCourts(orgId: string) {
  const venuesWithCourts = await db.query.venues.findMany({
    with: {
      courts: {
        with: {
          sport: true,
        },
      },
      operatingHours: true,
    },
    where: eq(venues.ownerId, orgId),
  });

  return venuesWithCourts;
}

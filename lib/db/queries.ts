import { cache } from "react";
import { and, eq, gte } from "drizzle-orm";
import { db } from ".";
import { reservations, venues } from "./schema";
import { startOfToday } from "date-fns";
import { unstable_cacheTag as cacheTag } from "next/cache";

export const getVenuesWithCourts = cache(async () => {
  "use cache";
  cacheTag("venues");
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
});

export const getSports = cache(async () => {
  "use cache";
  cacheTag("sports");
  return db.query.sports.findMany();
});

export const getUpcomingReservations = cache(async (courtId: number) => {
  const today = startOfToday();

  const upcomingReservations = await db.query.reservations.findMany({
    where: and(
      eq(reservations.courtId, courtId),
      gte(reservations.startTime, today)
    ),
  });

  return upcomingReservations;
});

export const getUserReservations = cache(async (userId: string) => {
  const now = startOfToday();

  const userReservations = await db.query.reservations.findMany({
    with: {
      court: true,
    },
    where: eq(reservations.userId, userId),
  });

  const upcoming = userReservations.filter(
    (reservation) => reservation.startTime > now
  );
  const past = userReservations.filter(
    (reservation) => reservation.startTime <= now
  );

  return { upcoming, past };
});

export const getCourtReservations = cache(async (courtId: number) => {
  const now = startOfToday();

  const courtReservations = await db.query.reservations.findMany({
    with: {
      court: true,
    },
    where: eq(reservations.courtId, courtId),
  });

  const upcoming = courtReservations.filter(
    (reservation) => reservation.startTime > now
  );
  const past = courtReservations.filter(
    (reservation) => reservation.startTime <= now
  );

  return { upcoming, past };
});

export const getOrganizationVenuesWithCourts = cache(async (orgId: string) => {
  "use cache";
  cacheTag("organization", orgId);
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
});

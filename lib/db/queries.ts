import { and, eq, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from ".";
import { verifyToken } from "../auth/session";
import { users } from "./schema";

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

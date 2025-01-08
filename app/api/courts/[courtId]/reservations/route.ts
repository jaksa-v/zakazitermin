import { db } from "@/lib/db";
import { eq, and, gte, lt } from "drizzle-orm";
import { reservations } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function GET(request: Request, props: { params: Promise<{ courtId: string }> }) {
  const params = await props.params;
  try {
    const courtId = parseInt(params.courtId);
    const now = new Date();

    // Get upcoming reservations
    const upcoming = await db
      .select()
      .from(reservations)
      .where(
        and(eq(reservations.courtId, courtId), gte(reservations.startTime, now))
      )
      .orderBy(reservations.startTime);

    // Get past reservations
    const past = await db
      .select()
      .from(reservations)
      .where(
        and(eq(reservations.courtId, courtId), lt(reservations.startTime, now))
      )
      .orderBy(reservations.startTime);

    return NextResponse.json({
      upcoming,
      past,
    });
  } catch (error) {
    console.error("Error fetching court reservations:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}

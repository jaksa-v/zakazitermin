import { NextResponse } from "next/server";
import { getUpcomingReservations } from "@/lib/db/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courtId = searchParams.get("courtId");

  if (!courtId) {
    return NextResponse.json(
      { error: "Court ID is required" },
      { status: 400 }
    );
  }

  try {
    const reservations = await getUpcomingReservations(Number(courtId));
    return NextResponse.json(reservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}

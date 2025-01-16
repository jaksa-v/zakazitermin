import { db } from "@/lib/db";
import { courts, venues } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import ReservationForm from "./reservation-form";
import BackButton from "./back-button";
import { Suspense } from "react";

type SearchParams = Promise<{ [key: string]: string | undefined }>;

export default function ReservePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <section className="sm:py-4">
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">
        <Suspense fallback={<div>Loading...</div>}>
          <ReserveContent searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  );
}

async function ReserveContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { courtId, venueId } = await searchParams;

  if (!courtId || !venueId) {
    notFound();
  }

  const [court, venue] = await Promise.all([
    db.query.courts.findFirst({
      where: eq(courts.id, parseInt(courtId)),
    }),
    db.query.venues.findFirst({
      where: eq(venues.id, parseInt(venueId)),
      with: {
        operatingHours: true,
        courts: true,
      },
    }),
  ]);

  if (!court || !venue) {
    notFound();
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="my-3 sm:my-4 text-xl sm:text-2xl font-bold">
          Reserve {court.name}
        </h1>
        <BackButton />
      </div>
      <ReservationForm court={court} venue={venue} />
    </>
  );
}

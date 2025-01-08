import { getOrganizationVenuesWithCourts } from "@/lib/db/queries";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import VenueCourtSelector from "./venue-court-selector";
import { CourtProvider } from "./court-context";
import CourtReservations from "./court-reservations";
import { Suspense } from "react";

export default async function DashboardPage() {
  const { orgId } = await auth();

  if (!orgId) {
    return redirect("/");
  }

  const venues = await getOrganizationVenuesWithCourts(orgId);

  return (
    <CourtProvider>
      <div className="w-full max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 sm:py-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="my-3 sm:my-4 text-xl sm:text-2xl font-bold">
            Dashboard
          </h1>
          <VenueCourtSelector venues={venues} />
        </div>
        <Suspense
          fallback={
            <div className="text-muted-foreground text-center py-8">
              Loading reservations...
            </div>
          }
        >
          <CourtReservations />
        </Suspense>
      </div>
    </CourtProvider>
  );
}

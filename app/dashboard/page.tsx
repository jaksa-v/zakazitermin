import { getOrganizationVenuesWithCourts } from "@/lib/db/queries";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import VenueCourtSelector from "./venue-court-selector";
import { CourtProvider } from "./court-context";
import CourtReservations from "./court-reservations";
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <CourtProvider>
      <div className="w-full max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Suspense fallback={<div>Loading dashboard...</div>}>
          <DashboardContent />
        </Suspense>
      </div>
    </CourtProvider>
  );
}

async function DashboardContent() {
  const { orgId } = await auth();

  if (!orgId) {
    return redirect("/");
  }

  const venues = await getOrganizationVenuesWithCourts(orgId);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-8 mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
        <div className="w-full sm:w-auto">
          <VenueCourtSelector venues={venues} />
        </div>
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
    </>
  );
}

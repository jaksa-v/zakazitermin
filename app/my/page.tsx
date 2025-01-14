import { getUserReservations } from "@/lib/db/queries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import ReservationList from "@/components/reservation-list";
import { Suspense } from "react";

export default async function MyReservationsPage() {
  return (
    <div className="w-full max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 sm:py-4">
      <h1 className="my-3 sm:my-4 text-xl sm:text-2xl font-bold">
        My Reservations
      </h1>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="upcoming" className="flex-1">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1">
            Past
          </TabsTrigger>
        </TabsList>

        <Suspense fallback={<Loading />}>
          <ReservationTabsContent />
        </Suspense>
      </Tabs>
    </div>
  );
}

async function ReservationTabsContent() {
  const { userId } = await auth();

  // In case the user signs out while on the page.
  if (!userId) {
    redirect("/");
  }

  const { upcoming, past } = await getUserReservations(userId);

  return (
    <>
      <TabsContent value="upcoming" className="mt-6">
        <ReservationList reservations={upcoming} />
      </TabsContent>

      <TabsContent value="past" className="mt-6">
        <ReservationList reservations={past} />
      </TabsContent>
    </>
  );
}

function Loading() {
  return (
    <div className="mt-6 space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-4 animate-pulse">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-5 w-32 bg-muted rounded" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

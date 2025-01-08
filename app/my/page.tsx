import { getUserReservations } from "@/lib/db/queries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import ReservationList from "@/components/reservation-list";

export default async function MyReservationsPage() {
  const { userId } = await auth();

  // In case the user signs out while on the page.
  if (!userId) {
    redirect("/");
  }

  const { upcoming, past } = await getUserReservations(userId);

  return (
    <div className="w-full max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 sm:py-4">
      <h1 className="my-3 sm:my-4 text-xl sm:text-2xl font-bold">
        My Reservations
      </h1>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="upcoming" className="flex-1">
            Upcoming ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1">
            Past ({past.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          <ReservationList reservations={upcoming} />
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <ReservationList reservations={past} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

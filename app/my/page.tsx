import { getUserReservations } from "@/lib/db/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { type Reservation } from "@/lib/db/schema";

export default async function MyReservationsPage() {
  const { userId } = await auth();

  // In case the user signs out while on the page.
  if (!userId) {
    redirect("/");
  }

  const { upcoming, past } = await getUserReservations(userId);

  const ReservationList = ({ reservations }: { reservations: Reservation[] }) => (
    <div className="space-y-4">
      {reservations.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No reservations found
        </p>
      ) : (
        reservations.map((reservation) => (
          <Card key={reservation.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">
                    {format(new Date(reservation.startTime), "PPP")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(reservation.startTime), "p")} -{" "}
                    {format(new Date(reservation.endTime), "p")}
                  </p>
                </div>
                {/* {new Date(reservation.startTime) > new Date() && (
                  <button
                    className="text-sm text-destructive hover:underline"
                    // TODO: Implement cancelReservation action
                    onClick={() => {}}
                  >
                    Cancel
                  </button>
                )} */}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="w-full max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

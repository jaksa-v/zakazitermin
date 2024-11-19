import { getSports, getVenuesWithCourts } from "@/lib/db/queries";
import VenueBrowser from "./venue-browser";

export default async function FindPage() {
  const venues = await getVenuesWithCourts();
  const sports = await getSports();

  return (
    <main>
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <VenueBrowser venues={venues} sports={sports} />
        </div>
      </section>
    </main>
  );
}

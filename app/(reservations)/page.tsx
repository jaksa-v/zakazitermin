import { getSports, getVenuesWithCourts } from "@/lib/db/queries";
import VenueBrowser from "./venue-browser";

export default async function Home() {
  const [venues, sports] = await Promise.all([
    getVenuesWithCourts(),
    getSports(),
  ]);

  return (
    <section className="sm:py-4">
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8">
        <VenueBrowser venues={venues} sports={sports} />
      </div>
    </section>
  );
}

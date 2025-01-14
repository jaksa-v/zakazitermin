import { getSports, getVenuesWithCourts } from "@/lib/db/queries";
import VenueBrowser from "./venue-browser";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

export default async function Home() {
  return (
    <section className="sm:py-4">
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="my-3 sm:my-4 text-xl sm:text-2xl font-bold">
          Browse Venues
        </h1>
        <Suspense fallback={<Loading />}>
          <Venues />
        </Suspense>
      </div>
    </section>
  );
}

async function Venues() {
  const { orgId } = await auth();

  if (orgId) {
    throw redirect("/dashboard");
  }

  const [venues, sports] = await Promise.all([
    getVenuesWithCourts(),
    getSports(),
  ]);

  return <VenueBrowser venues={venues} sports={sports} />;
}

function Loading() {
  return (
    <div className="py-32 flex items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
    </div>
  );
}

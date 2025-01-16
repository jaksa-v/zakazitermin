import { Suspense } from "react";
import { OrganizationProfile } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  return (
    <div className="flex items-center justify-center my-3 sm:my-10">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[500px]">
            Loading...
          </div>
        }
      >
        <Dashboard />
      </Suspense>
    </div>
  );
}

async function Dashboard() {
  const { orgId } = await auth();

  if (!orgId) {
    return null;
  }

  return <OrganizationProfile />;
}

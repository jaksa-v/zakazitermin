import { OrganizationProfile } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { orgId } = await auth();

  if (!orgId) {
    return null;
  }

  return (
    <div className="flex items-center justify-center my-3 sm:my-10">
      <OrganizationProfile />
    </div>
  );
}

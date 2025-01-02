import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { orgId } = await auth();

  return (
    <div className="w-full max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 sm:py-4">
      <h1 className="my-3 sm:my-4 text-xl sm:text-2xl font-bold">
        Dashboard {orgId}
      </h1>
    </div>
  );
}

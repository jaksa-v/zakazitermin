import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <SignIn />
    </Suspense>
  );
}

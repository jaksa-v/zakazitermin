import { Suspense } from "react";
import SignUpForm from "./sign-up-form";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
}

"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CircleIcon, Loader2 } from "lucide-react";
import { signIn, signUp } from "./actions";
import { ActionState } from "@/lib/auth/middleware";

export function Login({ mode = "signin" }: { mode?: "signin" | "signup" }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const priceId = searchParams.get("priceId");
  const inviteId = searchParams.get("inviteId");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === "signin" ? signIn : signUp,
    { error: "" }
  );

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-8 sm:py-12">
      <div className="max-w-screen-lg mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center">
            <CircleIcon className="h-12 w-12 text-purple-500" />
          </div>
          <h2 className="mt-6 text-center text-2xl sm:text-3xl font-bold">
            {mode === "signin" ? "Sign in to your account" : "Create your account"}
          </h2>

          <div className="mt-8">
            <div className="bg-white shadow-sm rounded-lg border p-6 sm:p-8">
              <form className="space-y-4 sm:space-y-6" action={formAction}>
                <input type="hidden" name="redirect" value={redirect || ""} />
                <input type="hidden" name="priceId" value={priceId || ""} />
                <input type="hidden" name="inviteId" value={inviteId || ""} />
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="mt-1.5">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      maxLength={50}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="mt-1.5">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete={
                        mode === "signin" ? "current-password" : "new-password"
                      }
                      required
                      minLength={8}
                      maxLength={100}
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                {state?.error && (
                  <div className="text-red-500 text-sm">{state.error}</div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={pending}
                >
                  {pending ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Loading...
                    </>
                  ) : mode === "signin" ? (
                    "Sign in"
                  ) : (
                    "Sign up"
                  )}
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      {mode === "signin"
                        ? "New to our platform?"
                        : "Already have an account?"}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href={`${mode === "signin" ? "/sign-up" : "/sign-in"}${
                      redirect ? `?redirect=${redirect}` : ""
                    }${priceId ? `&priceId=${priceId}` : ""}`}
                    className="w-full inline-flex justify-center items-center px-4 py-2.5 border rounded-md text-sm font-medium bg-white hover:bg-gray-50 border-gray-200"
                  >
                    {mode === "signin"
                      ? "Create an account"
                      : "Sign in to existing account"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

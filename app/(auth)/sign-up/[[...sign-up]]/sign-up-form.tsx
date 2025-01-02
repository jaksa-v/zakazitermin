"use client";

import { SignUp } from "@clerk/nextjs";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function SignUpForm() {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <>
      <div className="flex items-center gap-x-4">
        <Switch
          id="admin"
          className="flex items-center gap-2"
          checked={isAdmin}
          onCheckedChange={setIsAdmin}
        />
        <Label htmlFor="admin" className="cursor-pointer">
          Sign up as Venue Owner
        </Label>
      </div>
      <SignUp forceRedirectUrl={isAdmin ? "/create-organization" : undefined} />
    </>
  );
}

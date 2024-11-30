"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navigation = [
  { name: "Browse", href: "/" },
  { name: "My reservations", href: "/my" },
];

function MobileNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="lg:hidden">
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader className="mb-3 flex gap-2">
          <SheetTitle className="">
            <Link href="/" className="flex justify-center" onClick={() => setOpen(false)}>
              <Image
                src="/logo.png"
                alt="Zakazitermin"
                width={64}
                height={64}
              />
            </Link>
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col">
          {navigation.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              asChild
              className={cn(
                pathname === item.href && "bg-secondary",
                "text-foreground text-base"
              )}
              onClick={() => setOpen(false)}
            >
              <Link href={item.href}>{item.name}</Link>
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DesktopNavigation() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:flex items-center">
      {navigation.map((item) => (
        <Button
          key={item.href}
          variant="link"
          asChild
          className={cn(
            pathname === item.href && "underline underline-offset-4",
            "text-foreground text-base"
          )}
        >
          <Link href={item.href}>{item.name}</Link>
        </Button>
      ))}
    </div>
  );
}

export default function Header() {
  return (
    <header className="max-w-screen-lg w-full mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4 sm:py-0">
      <div className="flex items-center gap-4">
        <MobileNavigation />
        <Link href="/" className="hidden lg:block">
          <Image src="/logo.png" alt="Zakazitermin" width={64} height={64} />
        </Link>
        <DesktopNavigation />
      </div>
      <div className="flex items-center gap-4">
        <ModeToggle />
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="redirect">
            <button className="flex items-center gap-2">
              <span>Sign in</span>
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </header>
  );
}
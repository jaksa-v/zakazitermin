"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";

function MobileNavigation() {
  return (
    <Link href="/" className="lg:hidden">
      <Image
        src="/logo.png"
        alt="Zakazitermin"
        width={48}
        height={48}
        priority={true}
      />
    </Link>
  );
}

function DesktopNavigation({
  navigation,
}: {
  navigation: { name: string; href: string; icon: string }[];
}) {
  const pathname = usePathname();

  return (
    <div className="hidden lg:flex items-center">
      {navigation.map((item) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Icon = (Icons as any)[
          item.icon
            .split("-")
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join("")
        ];

        return (
          <Button
            key={item.href}
            variant="link"
            asChild
            className={cn(
              pathname === item.href && "underline underline-offset-4",
              "text-foreground text-base"
            )}
          >
            <Link href={item.href} className="flex items-center gap-2">
              {Icon && <Icon className="h-4 w-4" />}
              {item.name}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}

export default function Header({
  navigation,
}: {
  navigation: { name: string; href: string; icon: string }[];
}) {
  const pathname = usePathname();
  const authRoutes = ["/sign-in", "/sign-up"];

  if (authRoutes.includes(pathname)) return null;

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b py-1">
      <div className="max-w-screen-lg w-full mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <MobileNavigation />
          <Link href="/" className="hidden lg:block">
            <Image src="/logo.png" alt="Zakazitermin" width={64} height={64} />
          </Link>
          <DesktopNavigation navigation={navigation} />
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
      </div>
    </header>
  );
}

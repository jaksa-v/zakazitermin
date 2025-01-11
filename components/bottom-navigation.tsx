"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";

export default function BottomNavigation({
  navigation,
}: {
  navigation: { name: string; href: string; icon: string }[];
}) {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t lg:hidden pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <nav className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
        {navigation.map((item) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const Icon = (Icons as any)[
            item.icon
              .split("-")
              .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
              .join("")
          ];
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-16 h-full",
                "transition-colors duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              {Icon && <Icon className="h-5 w-5" />}
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

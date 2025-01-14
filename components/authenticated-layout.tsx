import { auth } from "@clerk/nextjs/server";
import Header from "./header";
import BottomNavigation from "./bottom-navigation";

export async function AuthenticatedLayout() {
  const { orgId } = await auth();

  const navigation = [
    { name: "Browse", href: "/", icon: "home" },
    { name: "Reservations", href: "/my", icon: "calendar" },
  ];

  const protectedNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: "layout-dashboard" },
    { name: "My Team", href: "/team", icon: "users" },
  ];

  return (
    <>
      <Header navigation={orgId ? protectedNavigation : navigation} />
      <BottomNavigation navigation={orgId ? protectedNavigation : navigation} />
    </>
  );
}

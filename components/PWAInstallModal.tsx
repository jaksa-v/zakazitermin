"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { subscribeUser } from "@/app/notification-test/actions";
import { Bell } from "lucide-react";
import type { PushSubscription as WebPushSubscription } from "web-push";
import { SignedIn } from "@clerk/nextjs";

function getPWAInstructions() {
  if (typeof window === "undefined") return "";

  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
    return 'To install this app on your iOS device:\n1. Tap the Share button\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to confirm';
  } else if (userAgent.includes("android")) {
    return 'To install this app on your Android device:\n1. Tap the menu icon (three dots)\n2. Tap "Add to Home screen"\n3. Tap "Add" to confirm';
  } else {
    return "To install this app on your device:\n1. Look for the install icon in your browser's address bar\n2. Click it and follow the prompts to install";
  }
}

export function PWAInstallModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Don't show if already in standalone mode (PWA)
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(display-mode: standalone)").matches
    ) {
      return;
    }

    const hasSeenModal = localStorage.getItem("pwa-install-seen");
    if (!hasSeenModal) {
      setIsOpen(true);
    }

    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    ) {
      setIsSupported(true);
    }
  }, []);

  const handleClose = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      localStorage.setItem("pwa-install-seen", "true");
    }
    setIsOpen(false);
  };

  const handleEnableNotifications = async () => {
    try {
      setLoading(true);
      const registration = await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        const sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });

        const webPushSub = JSON.parse(
          JSON.stringify(sub)
        ) as WebPushSubscription;
        await subscribeUser(webPushSub);
        setSubscription(sub);
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignedIn>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Install Our App</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <DialogDescription className="text-muted-foreground text-justify">
              For the best experience, we recommend installing our app on your
              device and enable notifications.
            </DialogDescription>
            <div className="bg-muted p-4 rounded-lg whitespace-pre-line">
              {getPWAInstructions()}
            </div>
            {isSupported && !subscription && (
              <div className="bg-muted p-4 rounded-lg flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-medium mb-1">
                    Important - Enable Notifications
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Get notified about schedule updates and reminders by enabling
                    push notifications
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleEnableNotifications}
                  disabled={loading}
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => handleClose(true)}>
              Don&apos;t show again
            </Button>
            <Button onClick={() => handleClose(false)}>Okay</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SignedIn>
  );
}

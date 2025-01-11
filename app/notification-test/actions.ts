"use server";

import webpush, { PushSubscription } from "web-push";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { notifications, pushSubscriptions } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";

webpush.setVapidDetails(
  "mailto:jaksa.vlahovic1@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function subscribeUser(sub: PushSubscription) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  await db.insert(pushSubscriptions).values({
    userId,
    endpoint: sub.endpoint,
    p256dh: sub.keys.p256dh,
    auth: sub.keys.auth,
  });

  return { success: true };
}

export async function unsubscribeUser(endpoint: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  await db
    .delete(pushSubscriptions)
    .where(eq(pushSubscriptions.endpoint, endpoint));

  return { success: true };
}

export async function sendNotification(message: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Create notification record
  await db.insert(notifications).values({
    userId,
    title: "Test Notification",
    body: message,
    icon: "/icon.png",
  });

  // Get all subscriptions for the user
  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));

  if (subs.length === 0) {
    throw new Error("No subscriptions available");
  }

  const errors: Error[] = [];

  // Send to all subscriptions
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        JSON.stringify({
          title: "Test Notification",
          body: message,
          icon: "/icon.png",
        })
      );
    } catch (error) {
      console.error("Error sending push notification:", error);
      errors.push(error as Error);

      // If the subscription is invalid, remove it
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any).statusCode === 410) {
        await db
          .delete(pushSubscriptions)
          .where(eq(pushSubscriptions.endpoint, sub.endpoint));
      }
    }
  }

  // If all sends failed, return error
  if (errors.length === subs.length) {
    return { success: false, error: "Failed to send notifications" };
  }

  return { success: true };
}

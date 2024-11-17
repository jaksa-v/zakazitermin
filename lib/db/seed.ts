import { db } from "./index";
import {
  users,
  sports,
  venues,
  courts,
  operatingHours,
  reservations,
} from "./schema";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await db.run(sql`DELETE FROM reservations`);
  await db.run(sql`DELETE FROM operating_hours`);
  await db.run(sql`DELETE FROM courts`);
  await db.run(sql`DELETE FROM venues`);
  await db.run(sql`DELETE FROM sports`);
  await db.run(sql`DELETE FROM users`);

  // Seed users
  console.log("Seeding users...");
  const [user1, user2] = await db
    .insert(users)
    .values([
      {
        email: "john@example.com",
        name: "John Doe",
        passwordHash:
          "$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNek4B5fHCb8JIjAGcy", // "password123"
        createdAt: new Date(),
        deletedAt: null,
      },
      {
        email: "jane@example.com",
        name: "Jane Smith",
        passwordHash:
          "$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNek4B5fHCb8JIjAGcy", // "password123"
        createdAt: new Date(),
        deletedAt: null,
      },
    ])
    .returning();

  // Seed sports
  console.log("Seeding sports...");
  const [soccer, basketball, tennis] = await db
    .insert(sports)
    .values([
      {
        name: "Soccer",
        description: "Football/Soccer field for 5-a-side or 11-a-side games",
      },
      {
        name: "Basketball",
        description: "Full-size basketball court",
      },
      {
        name: "Tennis",
        description: "Tennis court suitable for singles or doubles",
      },
    ])
    .returning();

  // Seed venues
  console.log("Seeding venues...");
  const [sportCenter1, sportCenter2] = await db
    .insert(venues)
    .values([
      {
        name: "Downtown Sports Center",
        address: "123 Main St",
        city: "New York",
        phoneNumber: "(555) 123-4567",
        description: "Modern sports facility in the heart of downtown",
        amenitiesJson: JSON.stringify([
          "parking",
          "showers",
          "lockers",
          "cafe",
        ]),
        coordinatesJson: JSON.stringify({ lat: 40.7128, lng: -74.006 }),
      },
      {
        name: "Westside Sports Complex",
        address: "456 West Ave",
        city: "New York",
        phoneNumber: "(555) 987-6543",
        description:
          "Spacious sports complex with indoor and outdoor facilities",
        amenitiesJson: JSON.stringify([
          "parking",
          "showers",
          "lockers",
          "pro shop",
          "restaurant",
        ]),
        coordinatesJson: JSON.stringify({ lat: 40.7549, lng: -73.984 }),
      },
    ])
    .returning();

  // Seed courts
  console.log("Seeding courts...");
  const courtsData = await db
    .insert(courts)
    .values([
      {
        venueId: sportCenter1.id,
        sportId: soccer.id,
        name: "Soccer Field 1",
        isIndoor: false,
        basePrice: 80.0,
        description: "Outdoor soccer field with artificial turf",
      },
      {
        venueId: sportCenter1.id,
        sportId: basketball.id,
        name: "Basketball Court 1",
        isIndoor: true,
        basePrice: 40.0,
        description: "Indoor basketball court with wooden flooring",
      },
      {
        venueId: sportCenter1.id,
        sportId: tennis.id,
        name: "Tennis Court 1",
        isIndoor: false,
        basePrice: 30.0,
        description: "Outdoor hard tennis court",
      },
      {
        venueId: sportCenter2.id,
        sportId: soccer.id,
        name: "Soccer Field A",
        isIndoor: true,
        basePrice: 100.0,
        description: "Indoor soccer field with premium artificial turf",
      },
      {
        venueId: sportCenter2.id,
        sportId: tennis.id,
        name: "Tennis Court A",
        isIndoor: true,
        basePrice: 45.0,
        description: "Indoor tennis court with premium surface",
      },
    ])
    .returning();

  // Seed operating hours (for both venues, Mon-Sun)
  console.log("Seeding operating hours...");
  const operatingHoursData = [];
  for (const venue of [sportCenter1, sportCenter2]) {
    for (let day = 0; day < 7; day++) {
      operatingHoursData.push({
        venueId: venue.id,
        dayOfWeek: day,
        openTime: "08:00",
        closeTime: "22:00",
      });
    }
  }
  await db.insert(operatingHours).values(operatingHoursData);

  // Add a few sample reservations
  console.log("Adding sample reservations...");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await db.insert(reservations).values([
    {
      userId: user1.id,
      courtId: courtsData[0].id,
      startTime: new Date(today.getTime() + 15 * 60 * 60 * 1000), // 3 PM today
      endTime: new Date(today.getTime() + 17 * 60 * 60 * 1000), // 5 PM today
      totalPrice: 160.0, // 2 hours * $80
      status: "confirmed",
      paymentStatus: "paid",
      createdAt: new Date(),
    },
    {
      userId: user2.id,
      courtId: courtsData[2].id,
      startTime: new Date(
        today.getTime() + 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000
      ), // 10 AM tomorrow
      endTime: new Date(
        today.getTime() + 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000
      ), // 12 PM tomorrow
      totalPrice: 60.0, // 2 hours * $30
      status: "confirmed",
      paymentStatus: "paid",
      createdAt: new Date(),
    },
  ]);

  console.log("✅ Seeding complete!");
}

// Run the seed function
seed()
  .catch((e) => {
    console.error("❌ Seeding failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });

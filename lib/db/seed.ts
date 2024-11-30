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
  const [user1] = await db
    .insert(users)
    .values([
      {
        id: "user_2pUHull96dOEuzvXHSEeoLZURY1",
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
        description: "",
      },
      {
        name: "Basketball",
        description: "",
      },
      {
        name: "Tennis",
        description: "",
      },
    ])
    .returning();

  // Seed venues
  console.log("Seeding venues...");
  const [sportCenter1, sportCenter2, sportCenter3, sportCenter4] = await db
    .insert(venues)
    .values([
      {
        name: "Dadex",
        address: "Masline",
        city: "Podgorica",
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
        name: "Stampar Tereni",
        address: "Blok V",
        city: "Podgorica",
        phoneNumber: "(555) 987-6543",
        description:
          "Spacious sports complex with indoor and outdoor facilities",
        amenitiesJson: JSON.stringify(["parking", "AC", "cafe"]),
        coordinatesJson: JSON.stringify({ lat: 40.7549, lng: -73.984 }),
      },
      {
        name: "Sutjeska Tereni",
        address: "Preko Morace",
        city: "Podgorica",
        phoneNumber: "(555) 987-6543",
        description: "Spacious soccer terrains with outdoor facilities",
        amenitiesJson: JSON.stringify(["parking", "cafe"]),
        coordinatesJson: JSON.stringify({ lat: 40.7549, lng: -73.984 }),
      },
      {
        name: "Toloska Tereni",
        address: "Tolosi",
        city: "Podgorica",
        phoneNumber: "(555) 987-6543",
        description: "Spacious basketball courts with outdoor facilities",
        amenitiesJson: JSON.stringify([
          "parking",
          "cafe",
          "running trail",
          "calisthenics",
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
        name: "Soccer Field",
        isIndoor: true,
        basePrice: 12.0,
        description: "Indoor soccer field with artificial turf",
      },
      {
        venueId: sportCenter1.id,
        sportId: tennis.id,
        name: "Tennis Court 1",
        isIndoor: true,
        basePrice: 8.0,
        description: "Indoor hard tennis court",
      },
      {
        venueId: sportCenter1.id,
        sportId: tennis.id,
        name: "Tennis Court 2",
        isIndoor: true,
        basePrice: 8.0,
        description: "Indoor hard tennis court",
      },
      {
        venueId: sportCenter2.id,
        sportId: soccer.id,
        name: "Soccer Field",
        isIndoor: true,
        basePrice: 15.0,
        description: "Indoor soccer field with premium artificial turf",
      },
      {
        venueId: sportCenter2.id,
        sportId: basketball.id,
        name: "Basketball Court 1",
        isIndoor: true,
        basePrice: 12.0,
        description: "Halfcourt indoor basketball court",
      },
      {
        venueId: sportCenter2.id,
        sportId: basketball.id,
        name: "Basketball Court 2",
        isIndoor: true,
        basePrice: 12.0,
        description: "Halfcourt indoor basketball court",
      },
      {
        venueId: sportCenter3.id,
        sportId: soccer.id,
        name: "Soccer Field",
        isIndoor: false,
        basePrice: 12.0,
        description: "Outdoor soccer field with artificial turf",
      },
      {
        venueId: sportCenter4.id,
        sportId: basketball.id,
        name: "Basketball Court 1",
        isIndoor: false,
        basePrice: 12.0,
        description: "Halfcourt outdoor basketball court",
      },
      {
        venueId: sportCenter4.id,
        sportId: basketball.id,
        name: "Basketball Court 2",
        isIndoor: false,
        basePrice: 12.0,
        description: "Halfcourt outdoor basketball court",
      },
    ])
    .returning();

  // Seed operating hours (for both venues, Mon-Sun)
  console.log("Seeding operating hours...");
  const operatingHoursData = [];
  for (const venue of [
    sportCenter1,
    sportCenter2,
    sportCenter3,
    sportCenter4,
  ]) {
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
      userId: user1.id,
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

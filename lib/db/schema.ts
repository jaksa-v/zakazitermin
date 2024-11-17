import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { z } from "zod";

// Users table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

// Sports types
export const sports = sqliteTable("sports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  description: text("description"),
});

// Venues table
export const venues = sqliteTable("venues", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  phoneNumber: text("phone_number"),
  description: text("description"),
  amenitiesJson: text("amenities").notNull().$type<string>(),
  coordinatesJson: text("coordinates").notNull().$type<string>(),
});

// Courts/fields table
export const courts = sqliteTable("courts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  venueId: integer("venue_id")
    .notNull()
    .references(() => venues.id),
  sportId: integer("sport_id")
    .notNull()
    .references(() => sports.id),
  name: text("name").notNull(),
  isIndoor: integer("is_indoor", { mode: "boolean" }).default(false),
  basePrice: real("base_price").notNull(), // Price per hour
  description: text("description"),
});

// Operating hours
export const operatingHours = sqliteTable("operating_hours", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  venueId: integer("venue_id")
    .notNull()
    .references(() => venues.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 for Sunday-Saturday
  openTime: text("open_time").notNull(), // Store as HH:mm
  closeTime: text("close_time").notNull(), // Store as HH:mm
});

// Reservations (previously bookings)
export const reservations = sqliteTable("reservations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  courtId: integer("court_id")
    .notNull()
    .references(() => courts.id),
  startTime: integer("start_time", { mode: "timestamp" }).notNull(),
  endTime: integer("end_time", { mode: "timestamp" }).notNull(),
  totalPrice: real("total_price").notNull(),
  status: text("status", { enum: ["pending", "confirmed", "cancelled"] })
    .notNull()
    .default("pending"),
  paymentStatus: text("payment_status", {
    enum: ["unpaid", "paid", "refunded"],
  })
    .notNull()
    .default("unpaid"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`
  ),
  notes: text("notes"),
});

// Relations
export const venueRelations = relations(venues, ({ many }) => ({
  courts: many(courts),
  operatingHours: many(operatingHours),
}));

export const courtRelations = relations(courts, ({ one, many }) => ({
  venue: one(venues, {
    fields: [courts.venueId],
    references: [venues.id],
  }),
  sport: one(sports, {
    fields: [courts.sportId],
    references: [sports.id],
  }),
  reservations: many(reservations),
}));

export const reservationRelations = relations(reservations, ({ one }) => ({
  user: one(users, {
    fields: [reservations.userId],
    references: [users.id],
  }),
  court: one(courts, {
    fields: [reservations.courtId],
    references: [courts.id],
  }),
}));

// Helper types
export const VenueAmenities = z.array(z.string());
export type VenueAmenities = z.infer<typeof VenueAmenities>;

export const VenueCoordinates = z.object({
  lat: z.number(),
  lng: z.number(),
});
export type VenueCoordinates = z.infer<typeof VenueCoordinates>;

// Types for your application code
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Venue = typeof venues.$inferSelect;
export type NewVenue = typeof venues.$inferInsert;

export type Court = typeof courts.$inferSelect;
export type NewCourt = typeof courts.$inferInsert;

export type Reservation = typeof reservations.$inferSelect;
export type NewReservation = typeof reservations.$inferInsert;

// Utility function to check if a time slot overlaps with existing reservations
// export async function isTimeSlotAvailable(
//   db,
//   courtId: number,
//   startTime: Date,
//   endTime: Date
// ): Promise<boolean> {
//   const overlappingReservations = await db.select()
//     .from(reservations)
//     .where(sql`
//       court_id = ${courtId}
//       AND status != 'cancelled'
//       AND (
//         (start_time < ${endTime.getTime()} AND end_time > ${startTime.getTime()})
//       )
//     `);

//   return overlappingReservations.length === 0;
// }

// Utility function to calculate price for a time slot
// export function calculatePrice(
//   basePrice: number,
//   startTime: Date,
//   endTime: Date
// ): number {
//   const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
//   const isPeakHour = startTime.getHours() >= 17 || [0, 6].includes(startTime.getDay());
//   const priceMultiplier = isPeakHour ? 1.2 : 1;
//   return basePrice * hours * priceMultiplier;
// }

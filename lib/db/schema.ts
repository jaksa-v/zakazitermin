import {
  sqliteTable,
  text,
  integer,
  real,
  index,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { z } from "zod";

// Sports types
export const sports = sqliteTable("sports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  description: text("description"),
});

// Venues table
export const venues = sqliteTable(
  "venues",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    address: text("address").notNull(),
    city: text("city").notNull(),
    phoneNumber: text("phone_number"),
    description: text("description"),
    amenitiesJson: text("amenities").notNull().$type<string>(),
    coordinatesJson: text("coordinates").notNull().$type<string>(),
    ownerId: text("owner_id").notNull(), // Clerk user ID of the venue owner
  },
  (table) => {
    return {
      ownerIdx: index("ownerIdx").on(table.ownerId),
    };
  }
);

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

// Reservations
export const reservations = sqliteTable(
  "reservations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull(),
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
  },
  (table) => {
    return {
      userIdx: index("userIdx").on(table.userId),
    };
  }
);

// Push notifications
export const pushSubscriptions = sqliteTable(
  "push_subscriptions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull(),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(
      sql`CURRENT_TIMESTAMP`
    ),
  },
  (table) => {
    return {
      userIdx: index("push_sub_userIdx").on(table.userId),
      endpointIdx: index("endpointIdx").on(table.endpoint),
    };
  }
);

export const notifications = sqliteTable(
  "notifications",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    icon: text("icon"),
    sent: integer("sent", { mode: "boolean" }).default(false),
    createdAt: integer("created_at", { mode: "timestamp" }).default(
      sql`CURRENT_TIMESTAMP`
    ),
  },
  (table) => {
    return {
      userIdx: index("notification_userIdx").on(table.userId),
    };
  }
);

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

export const operatingHoursRelations = relations(operatingHours, ({ one }) => ({
  venue: one(venues, {
    fields: [operatingHours.venueId],
    references: [venues.id],
  }),
}));

export const reservationRelations = relations(reservations, ({ one }) => ({
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
export type Venue = typeof venues.$inferSelect;
export type NewVenue = typeof venues.$inferInsert;

export type Court = typeof courts.$inferSelect;
export type NewCourt = typeof courts.$inferInsert;

export type VenueWithCourts = typeof venues.$inferSelect & {
  courts: (typeof courts.$inferSelect)[];
  operatingHours: (typeof operatingHours.$inferSelect)[];
};

export type Sport = typeof sports.$inferSelect;
export type NewSport = typeof sports.$inferInsert;

export type Reservation = typeof reservations.$inferSelect;
export type NewReservation = typeof reservations.$inferInsert;

export type ReservationWithCourt = typeof reservations.$inferSelect & {
  court: typeof courts.$inferSelect;
};

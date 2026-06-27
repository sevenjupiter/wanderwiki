import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean, decimal } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const itineraries = mysqlTable("itineraries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  destination: varchar("destination", { length: 255 }).notNull(),
  country: varchar("country", { length: 100 }),
  coverImageUrl: text("coverImageUrl"),
  description: text("description"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  duration: int("duration"), // in days
  travelStyle: varchar("travelStyle", { length: 50 }), // solo, couple, family, group
  isPublic: boolean("isPublic").default(false).notNull(),
  shareToken: varchar("shareToken", { length: 64 }),
  totalBudget: decimal("totalBudget", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  status: mysqlEnum("status", ["draft", "planning", "active", "completed"]).default("draft").notNull(),
  optimizedRoute: json("optimizedRoute"), // stores the optimized order
  viewCount: int("viewCount").default(0),
  likeCount: int("likeCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const stops = mysqlTable("stops", {
  id: int("id").autoincrement().primaryKey(),
  itineraryId: int("itineraryId").notNull(),
  dayNumber: int("dayNumber").notNull(),
  orderIndex: int("orderIndex").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["must-see", "must-do", "must-try", "must-eat"]).notNull(),
  address: text("address"),
  lat: decimal("lat", { precision: 10, scale: 7 }),
  lng: decimal("lng", { precision: 10, scale: 7 }),
  placeId: varchar("placeId", { length: 255 }),
  startTime: varchar("startTime", { length: 10 }), // HH:MM format
  endTime: varchar("endTime", { length: 10 }),
  duration: int("duration"), // minutes
  travelTimeFromPrev: int("travelTimeFromPrev"), // minutes
  travelDistanceFromPrev: decimal("travelDistanceFromPrev", { precision: 10, scale: 2 }), // km
  cost: decimal("cost", { precision: 10, scale: 2 }),
  costCategory: mysqlEnum("costCategory", ["accommodation", "transport", "food", "activities", "shopping", "other"]),
  stopDate: varchar("stopDate", { length: 10 }), // YYYY-MM-DD format
  notes: text("notes"),
  tips: text("tips"),
  rating: decimal("rating", { precision: 2, scale: 1 }),
  imageUrl: text("imageUrl"),
  bookingUrl: text("bookingUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const budgetItems = mysqlTable("budgetItems", {
  id: int("id").autoincrement().primaryKey(),
  itineraryId: int("itineraryId").notNull(),
  category: mysqlEnum("category", ["accommodation", "transport", "food", "activities", "shopping", "other"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD"),
  dayNumber: int("dayNumber"),
  notes: text("notes"),
  bookingUrl: text("bookingUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const communityTips = mysqlTable("communityTips", {
  id: int("id").autoincrement().primaryKey(),
  stopId: int("stopId"),
  itineraryId: int("itineraryId"),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  tipType: mysqlEnum("tipType", ["tip", "warning", "recommendation", "hidden-gem"]).default("tip").notNull(),
  upvotes: int("upvotes").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const itineraryLikes = mysqlTable("itineraryLikes", {
  id: int("id").autoincrement().primaryKey(),
  itineraryId: int("itineraryId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Itinerary = typeof itineraries.$inferSelect;
export type InsertItinerary = typeof itineraries.$inferInsert;
export type Stop = typeof stops.$inferSelect;
export type InsertStop = typeof stops.$inferInsert;
export type BudgetItem = typeof budgetItems.$inferSelect;
export type InsertBudgetItem = typeof budgetItems.$inferInsert;
export type CommunityTip = typeof communityTips.$inferSelect;
export type InsertCommunityTip = typeof communityTips.$inferInsert;

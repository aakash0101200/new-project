import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  userType: text("user_type", { enum: ["worker", "customer"] }).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workers = pgTable("workers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  workingStatus: text("working_status", { enum: ["employed", "unemployed", "student"] }).notNull(),
  location: text("location").notNull(),
  services: json("services").notNull().$type<string[]>(),
  experience: integer("experience").notNull(),
  availability: json("availability").notNull().$type<{
    days: string[];
    timeSlots: { start: string; end: string }[];
  }>(),
  about: text("about"),
  certifications: json("certifications").notNull().$type<string[]>(),
  rating: integer("rating"),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => users.id),
  workerId: integer("worker_id").references(() => workers.id),
  serviceType: text("service_type").notNull(),
  date: timestamp("date").notNull(),
  status: text("status", { enum: ["pending", "confirmed", "completed", "cancelled"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertWorkerSchema = createInsertSchema(workers).omit({ id: true, rating: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type Worker = typeof workers.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertWorker = z.infer<typeof insertWorkerSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export const serviceCategories = [
  "Cooking",
  "Cleaning",
  "Plumbing",
  "Electrical Work",
  "Repairs",
  "Gardening",
  "Painting",
  "Moving Help",
] as const;

export const availableDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const timeSlots = [
  { start: "09:00", end: "12:00" },
  { start: "12:00", end: "15:00" },
  { start: "15:00", end: "18:00" },
  { start: "18:00", end: "21:00" },
] as const;

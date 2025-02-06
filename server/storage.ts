import { User, Worker, Booking, InsertUser, InsertWorker, InsertBooking } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users, workers, bookings } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getWorker(id: number): Promise<Worker | undefined>;
  getWorkerByUserId(userId: number): Promise<Worker | undefined>;
  createWorker(worker: InsertWorker): Promise<Worker>;
  updateWorker(id: number, worker: Partial<Worker>): Promise<Worker>;
  listWorkers(): Promise<Worker[]>;

  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingsByCustomerId(customerId: number): Promise<Booking[]>;
  getBookingsByWorkerId(workerId: number): Promise<Booking[]>;
  updateBooking(id: number, status: Booking["status"]): Promise<Booking>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
      tableName: 'session'
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error getting user by id:", error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error("Error getting user by username:", error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async getWorker(id: number): Promise<Worker | undefined> {
    const [worker] = await db.select().from(workers).where(eq(workers.id, id));
    return worker;
  }

  async getWorkerByUserId(userId: number): Promise<Worker | undefined> {
    const [worker] = await db.select().from(workers).where(eq(workers.userId, userId));
    return worker;
  }

  async createWorker(worker: InsertWorker): Promise<Worker> {
    const [newWorker] = await db.insert(workers).values(worker).returning();
    return newWorker;
  }

  async updateWorker(id: number, update: Partial<Worker>): Promise<Worker> {
    const [worker] = await db
      .update(workers)
      .set(update)
      .where(eq(workers.id, id))
      .returning();
    if (!worker) throw new Error("Worker not found");
    return worker;
  }

  async listWorkers(): Promise<Worker[]> {
    return db.select().from(workers);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async getBookingsByCustomerId(customerId: number): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.customerId, customerId));
  }

  async getBookingsByWorkerId(workerId: number): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.workerId, workerId));
  }

  async updateBooking(id: number, status: Booking["status"]): Promise<Booking> {
    const [booking] = await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    if (!booking) throw new Error("Booking not found");
    return booking;
  }
}

export const storage = new DatabaseStorage();

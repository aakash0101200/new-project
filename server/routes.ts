import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertWorkerSchema, insertBookingSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Worker routes
  app.post("/api/workers", async (req, res) => {
    const parsed = insertWorkerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const worker = await storage.createWorker(parsed.data);
    res.status(201).json(worker);
  });

  app.get("/api/workers", async (req, res) => {
    const workers = await storage.listWorkers();
    res.json(workers);
  });

  app.get("/api/workers/:id", async (req, res) => {
    const worker = await storage.getWorker(parseInt(req.params.id));
    if (!worker) return res.status(404).send("Worker not found");
    res.json(worker);
  });

  app.patch("/api/workers/:id", async (req, res) => {
    try {
      const worker = await storage.updateWorker(parseInt(req.params.id), req.body);
      res.json(worker);
    } catch (error) {
      res.status(404).send((error as Error).message);
    }
  });

  // Booking routes
  app.post("/api/bookings", async (req, res) => {
    const parsed = insertBookingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const booking = await storage.createBooking(parsed.data);
    res.status(201).json(booking);
  });

  app.get("/api/bookings/customer", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const bookings = await storage.getBookingsByCustomerId(req.user.id);
    res.json(bookings);
  });

  app.get("/api/bookings/worker", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const worker = await storage.getWorkerByUserId(req.user.id);
    if (!worker) return res.status(404).send("Worker profile not found");
    
    const bookings = await storage.getBookingsByWorkerId(worker.id);
    res.json(bookings);
  });

  app.patch("/api/bookings/:id/status", async (req, res) => {
    const { status } = req.body;
    if (!status) return res.status(400).send("Status is required");

    try {
      const booking = await storage.updateBooking(parseInt(req.params.id), status);
      res.json(booking);
    } catch (error) {
      res.status(404).send((error as Error).message);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

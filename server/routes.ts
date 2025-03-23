import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      // Validate the request body against the user schema
      const validUserData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUid(validUserData.uid);
      
      if (existingUser) {
        // If user exists, just return the existing user
        return res.status(200).json(existingUser);
      }
      
      // Create new user
      const newUser = await storage.createUser(validUserData);
      res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid input data", 
          errors: error.errors 
        });
      }
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Notes API routes will be added later
  
  const httpServer = createServer(app);
  return httpServer;
}

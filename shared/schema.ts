import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  uid: text("uid").notNull().unique(),
});

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull().default("blue"),
  userId: text("user_id").notNull(),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  userId: text("user_id").notNull(),
  isFavorite: boolean("is_favorite").default(false),
  isArchived: boolean("is_archived").default(false),
});

export const noteTags = pgTable("note_tags", {
  id: serial("id").primaryKey(),
  noteId: integer("note_id").notNull(),
  tagId: integer("tag_id").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  displayName: true,
  photoURL: true,
  uid: true,
});

export const insertTagSchema = createInsertSchema(tags).pick({
  name: true,
  color: true,
  userId: true,
});

export const insertNoteSchema = createInsertSchema(notes).pick({
  title: true,
  content: true,
  userId: true,
  isFavorite: true,
  isArchived: true,
});

export const insertNoteTagSchema = createInsertSchema(noteTags).pick({
  noteId: true,
  tagId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTag = z.infer<typeof insertTagSchema>;
export type Tag = typeof tags.$inferSelect;

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

export type InsertNoteTag = z.infer<typeof insertNoteTagSchema>;
export type NoteTag = typeof noteTags.$inferSelect;

import { int, text, sqliteTable, integer } from "drizzle-orm/sqlite-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = sqliteTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(new Date()),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).notNull().default(new Date()),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Menu items table for the e-commerce catalog
 */
export const menuItems = sqliteTable("menuItems", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // Price in cents to avoid decimal issues
  imageUrl: text("imageUrl"),
  category: text("category"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(new Date()),
});

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = typeof menuItems.$inferInsert;

/**
 * Cart items table for user shopping carts
 */
export const cartItems = sqliteTable("cartItems", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  menuItemId: integer("menuItemId").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(new Date()),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

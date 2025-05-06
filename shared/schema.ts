import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const prompts = pgTable("prompts", {
  id: text("id").primaryKey(),
  prompt: text("prompt").notNull(),
  language: text("language").notNull().default("Any Language"),
  response: text("response").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  userId: text("user_id").references(() => users.id),
});

export const history = pgTable("history", {
  id: serial("id").primaryKey(),
  promptId: text("prompt_id").references(() => prompts.id).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  userId: text("user_id").references(() => users.id),
});

export const gitConnections = pgTable("git_connections", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  provider: text("provider").notNull(),
  token: text("token").notNull(),
  connectedAt: timestamp("connected_at").defaultNow().notNull(),
});

// Define relations
export const promptsRelations = relations(prompts, ({ one }) => ({
  user: one(users, {
    fields: [prompts.userId],
    references: [users.id],
  }),
}));

export const historyRelations = relations(history, ({ one }) => ({
  prompt: one(prompts, {
    fields: [history.promptId],
    references: [prompts.id],
  }),
  user: one(users, {
    fields: [history.userId],
    references: [users.id],
  }),
}));

export const gitConnectionsRelations = relations(gitConnections, ({ one }) => ({
  user: one(users, {
    fields: [gitConnections.userId],
    references: [users.id],
  }),
}));

// Create schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const insertPromptSchema = createInsertSchema(prompts);
export const insertHistorySchema = createInsertSchema(history);
export const insertGitConnectionSchema = createInsertSchema(gitConnections);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type InsertHistory = z.infer<typeof insertHistorySchema>;
export type InsertGitConnection = z.infer<typeof insertGitConnectionSchema>;

export type User = typeof users.$inferSelect;
export type Prompt = typeof prompts.$inferSelect;
export type History = typeof history.$inferSelect;
export type GitConnection = typeof gitConnections.$inferSelect;

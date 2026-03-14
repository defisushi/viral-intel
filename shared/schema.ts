import { pgTable, text, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Topics the user wants to monitor
export const topics = pgTable("topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  keywords: text("keywords").array().notNull(),
  enabled: boolean("enabled").notNull().default(true),
});

export const insertTopicSchema = createInsertSchema(topics).omit({ id: true });
export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type Topic = typeof topics.$inferSelect;

// Viral posts found by the monitoring system
export const viralPosts = pgTable("viral_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topicId: varchar("topic_id").notNull(),
  platform: text("platform").notNull(),
  creator: text("creator").notNull(),
  hook: text("hook").notNull(),
  description: text("description").notNull(),
  whyViral: text("why_viral").notNull(),
  url: text("url"),
  reportDate: text("report_date").notNull(),
});

export const insertViralPostSchema = createInsertSchema(viralPosts).omit({ id: true });
export type InsertViralPost = z.infer<typeof insertViralPostSchema>;
export type ViralPost = typeof viralPosts.$inferSelect;

// Pattern analysis per topic per report
export const patterns = pgTable("patterns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topicId: varchar("topic_id").notNull(),
  reportDate: text("report_date").notNull(),
  hookFormulas: text("hook_formulas").array().notNull(),
  emotionalTriggers: text("emotional_triggers").array().notNull(),
  dominantFormats: text("dominant_formats").array().notNull(),
  painPoints: text("pain_points").array().notNull(),
});

export const insertPatternSchema = createInsertSchema(patterns).omit({ id: true });
export type InsertPattern = z.infer<typeof insertPatternSchema>;
export type Pattern = typeof patterns.$inferSelect;

// Content frameworks / templates
export const frameworks = pgTable("frameworks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topicId: varchar("topic_id").notNull(),
  reportDate: text("report_date").notNull(),
  hookTemplate: text("hook_template").notNull(),
  format: text("format").notNull(),
  platform: text("platform").notNull(),
  example: text("example").notNull(),
});

export const insertFrameworkSchema = createInsertSchema(frameworks).omit({ id: true });
export type InsertFramework = z.infer<typeof insertFrameworkSchema>;
export type Framework = typeof frameworks.$inferSelect;

// Daily report metadata
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull().unique(),
  newTrends: text("new_trends").array(),
  fadingTrends: text("fading_trends").array(),
});

export const insertReportSchema = createInsertSchema(reports).omit({ id: true });
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTopicSchema, insertViralPostSchema, insertPatternSchema, insertFrameworkSchema, insertReportSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === TOPICS ===
  app.get("/api/topics", async (_req, res) => {
    const topics = await storage.getTopics();
    res.json(topics);
  });

  app.post("/api/topics", async (req, res) => {
    const parsed = insertTopicSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const topic = await storage.createTopic(parsed.data);
    res.status(201).json(topic);
  });

  app.patch("/api/topics/:id", async (req, res) => {
    const updated = await storage.updateTopic(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Topic not found" });
    res.json(updated);
  });

  app.delete("/api/topics/:id", async (req, res) => {
    const deleted = await storage.deleteTopic(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Topic not found" });
    res.status(204).send();
  });

  // === VIRAL POSTS ===
  app.get("/api/posts", async (req, res) => {
    const { date, topicId } = req.query;
    const posts = await storage.getViralPosts(date as string, topicId as string);
    res.json(posts);
  });

  app.post("/api/posts", async (req, res) => {
    const parsed = insertViralPostSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const post = await storage.createViralPost(parsed.data);
    res.status(201).json(post);
  });

  // === PATTERNS ===
  app.get("/api/patterns", async (req, res) => {
    const { date, topicId } = req.query;
    const patterns = await storage.getPatterns(date as string, topicId as string);
    res.json(patterns);
  });

  app.post("/api/patterns", async (req, res) => {
    const parsed = insertPatternSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const pattern = await storage.createPattern(parsed.data);
    res.status(201).json(pattern);
  });

  // === FRAMEWORKS ===
  app.get("/api/frameworks", async (req, res) => {
    const { date, topicId } = req.query;
    const frameworks = await storage.getFrameworks(date as string, topicId as string);
    res.json(frameworks);
  });

  app.post("/api/frameworks", async (req, res) => {
    const parsed = insertFrameworkSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const fw = await storage.createFramework(parsed.data);
    res.status(201).json(fw);
  });

  // === REPORTS ===
  app.get("/api/reports", async (_req, res) => {
    const reports = await storage.getReports();
    res.json(reports);
  });

  app.get("/api/reports/:date", async (req, res) => {
    const report = await storage.getReport(req.params.date);
    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json(report);
  });

  app.post("/api/reports", async (req, res) => {
    const parsed = insertReportSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const report = await storage.createReport(parsed.data);
    res.status(201).json(report);
  });

  // === CONFIG SYNC (for cron job) ===
  app.get("/api/config", async (_req, res) => {
    const topics = await storage.getTopics();
    const enabled = topics.filter(t => t.enabled);
    res.json({
      topics: enabled.map(t => ({ id: t.id, name: t.name, keywords: t.keywords })),
      platforms: ["X/Twitter", "TikTok", "Instagram", "YouTube"],
      telegram_chat_id: "1892355983",
    });
  });

  return httpServer;
}

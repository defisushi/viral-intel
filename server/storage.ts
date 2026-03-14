import {
  type Topic, type InsertTopic,
  type ViralPost, type InsertViralPost,
  type Pattern, type InsertPattern,
  type Framework, type InsertFramework,
  type Report, type InsertReport,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Topics
  getTopics(): Promise<Topic[]>;
  getTopic(id: string): Promise<Topic | undefined>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  updateTopic(id: string, topic: Partial<InsertTopic>): Promise<Topic | undefined>;
  deleteTopic(id: string): Promise<boolean>;

  // Viral Posts
  getViralPosts(reportDate?: string, topicId?: string): Promise<ViralPost[]>;
  createViralPost(post: InsertViralPost): Promise<ViralPost>;

  // Patterns
  getPatterns(reportDate?: string, topicId?: string): Promise<Pattern[]>;
  createPattern(pattern: InsertPattern): Promise<Pattern>;

  // Frameworks
  getFrameworks(reportDate?: string, topicId?: string): Promise<Framework[]>;
  createFramework(framework: InsertFramework): Promise<Framework>;

  // Reports
  getReports(): Promise<Report[]>;
  getReport(date: string): Promise<Report | undefined>;
  createReport(report: InsertReport): Promise<Report>;
}

export class MemStorage implements IStorage {
  private topics: Map<string, Topic> = new Map();
  private viralPosts: Map<string, ViralPost> = new Map();
  private patterns: Map<string, Pattern> = new Map();
  private frameworks: Map<string, Framework> = new Map();
  private reports: Map<string, Report> = new Map();

  constructor() {
    // Seed with the user's existing topics
    const seedTopics: InsertTopic[] = [
      { name: "Guinea Pigs & Pets", keywords: ["guinea pig", "guinea pigs", "cavy", "pet care", "small pets", "guinea pig care tips"], enabled: true },
      { name: "Gen Z Work & Corporate Culture", keywords: ["gen z workplace", "gen z corporate", "quiet quitting", "work life balance gen z", "corporate cringe", "office culture"], enabled: true },
      { name: "AI Tools & Products", keywords: ["AI tools", "AI productivity", "ChatGPT", "Claude AI", "AI workflow", "AI automation", "best AI tools"], enabled: true },
    ];
    for (const t of seedTopics) {
      const id = randomUUID();
      this.topics.set(id, { id, ...t, enabled: t.enabled ?? true });
    }
  }

  // Topics
  async getTopics(): Promise<Topic[]> {
    return Array.from(this.topics.values());
  }
  async getTopic(id: string): Promise<Topic | undefined> {
    return this.topics.get(id);
  }
  async createTopic(t: InsertTopic): Promise<Topic> {
    const id = randomUUID();
    const topic: Topic = { id, name: t.name, keywords: t.keywords, enabled: t.enabled ?? true };
    this.topics.set(id, topic);
    return topic;
  }
  async updateTopic(id: string, updates: Partial<InsertTopic>): Promise<Topic | undefined> {
    const existing = this.topics.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.topics.set(id, updated);
    return updated;
  }
  async deleteTopic(id: string): Promise<boolean> {
    return this.topics.delete(id);
  }

  // Viral Posts
  async getViralPosts(reportDate?: string, topicId?: string): Promise<ViralPost[]> {
    let posts = Array.from(this.viralPosts.values());
    if (reportDate) posts = posts.filter(p => p.reportDate === reportDate);
    if (topicId) posts = posts.filter(p => p.topicId === topicId);
    return posts;
  }
  async createViralPost(p: InsertViralPost): Promise<ViralPost> {
    const id = randomUUID();
    const post: ViralPost = { id, ...p, url: p.url ?? null };
    this.viralPosts.set(id, post);
    return post;
  }

  // Patterns
  async getPatterns(reportDate?: string, topicId?: string): Promise<Pattern[]> {
    let pats = Array.from(this.patterns.values());
    if (reportDate) pats = pats.filter(p => p.reportDate === reportDate);
    if (topicId) pats = pats.filter(p => p.topicId === topicId);
    return pats;
  }
  async createPattern(p: InsertPattern): Promise<Pattern> {
    const id = randomUUID();
    const pattern: Pattern = { id, ...p };
    this.patterns.set(id, pattern);
    return pattern;
  }

  // Frameworks
  async getFrameworks(reportDate?: string, topicId?: string): Promise<Framework[]> {
    let fws = Array.from(this.frameworks.values());
    if (reportDate) fws = fws.filter(f => f.reportDate === reportDate);
    if (topicId) fws = fws.filter(f => f.topicId === topicId);
    return fws;
  }
  async createFramework(f: InsertFramework): Promise<Framework> {
    const id = randomUUID();
    const fw: Framework = { id, ...f };
    this.frameworks.set(id, fw);
    return fw;
  }

  // Reports
  async getReports(): Promise<Report[]> {
    return Array.from(this.reports.values()).sort((a, b) => b.date.localeCompare(a.date));
  }
  async getReport(date: string): Promise<Report | undefined> {
    return Array.from(this.reports.values()).find(r => r.date === date);
  }
  async createReport(r: InsertReport): Promise<Report> {
    const id = randomUUID();
    const report: Report = { id, ...r, newTrends: r.newTrends ?? null, fadingTrends: r.fadingTrends ?? null };
    this.reports.set(id, report);
    return report;
  }
}

export const storage = new MemStorage();

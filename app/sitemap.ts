import { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://inclusions.zone";

const routes: { url: string; lastModified?: string; changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"; priority?: number }[] = [
  { url: "/", changeFrequency: "weekly", priority: 1 },
  { url: "/events", changeFrequency: "weekly", priority: 0.9 },
  { url: "/djs", changeFrequency: "weekly", priority: 0.9 },
  { url: "/dance-crew", changeFrequency: "monthly", priority: 0.9 },
  { url: "/rueckblick", changeFrequency: "monthly", priority: 0.8 },
  { url: "/ueber-uns", changeFrequency: "monthly", priority: 0.8 },
  { url: "/faq", changeFrequency: "monthly", priority: 0.8 },
  { url: "/spenden", changeFrequency: "monthly", priority: 0.8 },
  { url: "/medien", changeFrequency: "monthly", priority: 0.7 },
  { url: "/anmeldung", changeFrequency: "monthly", priority: 0.8 },
  { url: "/anmeldung/vip", changeFrequency: "weekly", priority: 0.9 },
  { url: "/newsletter", changeFrequency: "monthly", priority: 0.7 },
  { url: "/ki-innovator", changeFrequency: "monthly", priority: 0.7 },
  { url: "/vision", changeFrequency: "yearly", priority: 0.6 },
  { url: "/community", changeFrequency: "monthly", priority: 0.7 },
  { url: "/booking", changeFrequency: "monthly", priority: 0.8 },
  { url: "/rechtliches", changeFrequency: "yearly", priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({
    url: `${baseUrl}${r.url}`,
    lastModified: r.lastModified || new Date().toISOString(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}

import { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://inclusions.zone";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] },
      { userAgent: "Googlebot", allow: "/", disallow: ["/admin/", "/api/"] },
      // GEO: Explizit erlauben für KI-Suchmaschinen (ChatGPT, Perplexity, etc.)
      { userAgent: "GPTBot", allow: "/", disallow: ["/admin/", "/api/"] },
      { userAgent: "Claude-Web", allow: "/", disallow: ["/admin/", "/api/"] },
      { userAgent: "PerplexityBot", allow: "/", disallow: ["/admin/", "/api/"] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

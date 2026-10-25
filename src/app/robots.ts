
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = "https://dgstudy.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/admin"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}

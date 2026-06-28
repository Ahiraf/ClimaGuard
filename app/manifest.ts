import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ClimaGuard — Child Climate Safety",
    short_name: "ClimaGuard",
    description: "AI-powered real-time climate risk alerts and health guidance for children in UNICEF high-risk countries.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: "#16a34a",
    orientation: "portrait",
    categories: ["health", "weather", "education"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
    screenshots: [],
    shortcuts: [
      {
        name: "Risk Dashboard",
        url: "/dashboard",
        description: "Check climate risk for your child",
      },
      {
        name: "Health Advisor",
        url: "/health",
        description: "Get health guidance for climate symptoms",
      },
    ],
  };
}

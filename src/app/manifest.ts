import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "YS CAPITAL | Institutional Wealth Intelligence",
    short_name: "YS Portfolio",
    description:
      "India's premier integrated wealth distributor & portfolio tracker. Manage Mutual Funds, Equities, Bonds, and Family Wealth with real-time AMFI NAV tracking.",
    start_url: "/",
    display: "standalone",
    background_color: "#030c1e",
    theme_color: "#0047AB",
    icons: [
      {
        src: "/ys_logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/ys_logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

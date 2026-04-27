import { 
  Sun, Laptop, Palette, Trees, Sparkles, Cloud, Gem, 
  Coffee, Leaf, Moon as MidnightIcon, Terminal, 
  Gamepad2, Zap, Rocket, Ghost, Heart, Droplets, Book, 
  Sunrise, Sunset, Share2, Twitter, Layout, MessageSquare,
  Flame, Candy, Filter, Brush, MoonStar, Star, Microscope
} from "lucide-react";

export type ThemeMode =
  | "default"
  | "system"
  | "amber-minimal"
  | "amethyst-haze"
  | "bold-tech"
  | "bubblegum"
  | "caffeine"
  | "candyland"
  | "catppuccin"
  | "claude"
  | "claymorphism"
  | "clean-slate"
  | "cosmic-night"
  | "cyberpunk"
  | "darkmatter"
  | "doom-64"
  | "elegant-luxury"
  | "graphite"
  | "kodama-grove"
  | "midnight-bloom"
  | "mocha-mousse"
  | "modern-minimal"
  | "moneydial"
  | "mono"
  | "nature"
  | "neo-brutalism"
  | "northern-lights"
  | "notebook"
  | "ocean-breeze"
  | "pastel-dreams"
  | "perpetuity"
  | "quantum-rose"
  | "retro-arcade"
  | "sage-garden"
  | "soft-pop"
  | "solar-dusk"
  | "starry-night"
  | "sunset-horizon"
  | "supabase"
  | "t3-chat"
  | "tangerine"
  | "twitter"
  | "vercel"
  | "vintage-paper"
  | "violet-bloom";

export interface ThemeOption {
  value: ThemeMode;
  label: string;
  icon: any;
  description?: string;
  colors?: {
    primary: string;
    background: string;
    card: string;
  };
}

export const ALL_THEMES: ThemeOption[] = [
  { value: "default", label: "Default", icon: Sparkles, colors: { primary: "oklch(0.205 0 0)", background: "oklch(1 0 0)", card: "oklch(1 0 0)" } },
  { value: "system", label: "System", icon: Laptop, colors: { primary: "oklch(0.205 0 0)", background: "oklch(1 0 0)", card: "oklch(1 0 0)" } },
  { value: "amber-minimal", label: "Amber Minimal", icon: Sun, colors: { primary: "oklch(0.7686 0.1647 70.0804)", background: "oklch(1 0 0)", card: "oklch(1 0 0)" } },
  { value: "amethyst-haze", label: "Amethyst Haze", icon: Gem, colors: { primary: "oklch(0.6104 0.0767 299.7335)", background: "oklch(0.9777 0.0041 301.4256)", card: "oklch(1 0 0)" } },
  { value: "bold-tech", label: "Bold Tech", icon: Terminal, colors: { primary: "oklch(0.6056 0.2189 292.7172)", background: "oklch(1 0 0)", card: "oklch(1 0 0)" } },
  { value: "bubblegum", label: "Bubblegum", icon: Heart, colors: { primary: "oklch(0.6209 0.1801 348.1385)", background: "oklch(0.9399 0.0203 345.6985)", card: "oklch(1 0 0)" } },
  { value: "caffeine", label: "Caffeine", icon: Coffee, colors: { primary: "oklch(0.4341 0.0392 41.9938)", background: "oklch(0.9821 0 0)", card: "oklch(0.9911 0 0)" } },
  { value: "candyland", label: "Candyland", icon: Candy, colors: { primary: "oklch(0.8677 0.0735 7.0855)", background: "oklch(0.9809 0.0025 228.7836)", card: "oklch(1 0 0)" } },
  { value: "catppuccin", label: "Catppuccin", icon: Ghost, colors: { primary: "oklch(0.5547 0.2503 297.0156)", background: "oklch(0.9578 0.0058 264.5321)", card: "oklch(1 0 0)" } },
  { value: "claude", label: "Claude", icon: Cloud, colors: { primary: "oklch(0.6171 0.1375 39.0427)", background: "oklch(0.9818 0.0054 95.0986)", card: "oklch(0.9818 0.0054 95.0986)" } },
  { value: "claymorphism", label: "Claymorphism", icon: Brush, colors: { primary: "oklch(0.5854 0.2041 277.1173)", background: "oklch(0.9232 0.0026 48.7171)", card: "oklch(0.9699 0.0013 106.4238)" } },
  { value: "clean-slate", label: "Clean Slate", icon: Filter, colors: { primary: "oklch(0.5854 0.2041 277.1173)", background: "oklch(0.9842 0.0034 247.8575)", card: "oklch(1 0 0)" } },
  { value: "cosmic-night", label: "Cosmic Night", icon: Rocket, colors: { primary: "oklch(0.5417 0.1790 288.0332)", background: "oklch(0.9730 0.0133 286.1503)", card: "oklch(1 0 0)" } },
  { value: "cyberpunk", label: "Cyberpunk", icon: Zap, colors: { primary: "oklch(0.6726 0.2904 341.4084)", background: "oklch(0.9816 0.0017 247.8390)", card: "oklch(1 0 0)" } },
  { value: "darkmatter", label: "Darkmatter", icon: MoonStar, colors: { primary: "oklch(0.6716 0.1368 48.5130)", background: "oklch(1 0 0)", card: "oklch(1 0 0)" } },
  { value: "doom-64", label: "Doom 64", icon: Gamepad2, colors: { primary: "oklch(0.48 0.24 264)", background: "oklch(0.15 0 0)", card: "oklch(0.2 0 0)" } },
  { value: "elegant-luxury", label: "Elegant Luxury", icon: Gem, colors: { primary: "oklch(0.85 0.01 70)", background: "oklch(0.98 0 0)", card: "oklch(1 0 0)" } },
  { value: "graphite", label: "Graphite", icon: Microscope, colors: { primary: "oklch(0.4 0 0)", background: "oklch(0.95 0 0)", card: "oklch(1 0 0)" } },
  { value: "kodama-grove", label: "Kodama Grove", icon: Trees, colors: { primary: "oklch(0.6 0.15 150)", background: "oklch(0.97 0.01 100)", card: "oklch(1 0 0)" } },
  { value: "midnight-bloom", label: "Midnight Bloom", icon: MidnightIcon, colors: { primary: "oklch(0.5 0.2 280)", background: "oklch(0.15 0.05 280)", card: "oklch(0.2 0.05 280)" } },
  { value: "mocha-mousse", label: "Mocha Mousse", icon: Coffee, colors: { primary: "oklch(0.6 0.05 50)", background: "oklch(0.98 0.01 50)", card: "oklch(1 0 0)" } },
  { value: "modern-minimal", label: "Modern Minimal", icon: Layout, colors: { primary: "oklch(0.2 0 0)", background: "oklch(1 0 0)", card: "oklch(1 0 0)" } },
  { value: "moneydial", label: "Moneydial", icon: Sunrise, colors: { primary: "oklch(0.65 0.15 40)", background: "oklch(0.98 0.05 40)", card: "oklch(1 0 0)" } },
  { value: "mono", label: "Mono", icon: Terminal, colors: { primary: "oklch(0.15 0 0)", background: "oklch(1 0 0)", card: "oklch(1 0 0)" } },
  { value: "nature", label: "Nature", icon: Leaf, colors: { primary: "oklch(0.6 0.15 140)", background: "oklch(0.98 0.02 120)", card: "oklch(1 0 0)" } },
  { value: "neo-brutalism", label: "Neo Brutalism", icon: Zap, colors: { primary: "oklch(0.7 0.3 80)", background: "oklch(0.95 0 0)", card: "oklch(1 0 0)" } },
  { value: "northern-lights", label: "Northern Lights", icon: Sparkles, colors: { primary: "oklch(0.7 0.2 180)", background: "oklch(0.15 0.1 240)", card: "oklch(0.2 0.1 240)" } },
  { value: "notebook", label: "Notebook", icon: Book, colors: { primary: "oklch(0.5 0.05 90)", background: "oklch(0.99 0.02 90)", card: "oklch(1 0 0)" } },
  { value: "ocean-breeze", label: "Ocean Breeze", icon: Droplets, colors: { primary: "oklch(0.6 0.15 220)", background: "oklch(0.98 0.02 200)", card: "oklch(1 0 0)" } },
  { value: "pastel-dreams", label: "Pastel Dreams", icon: Cloud, colors: { primary: "oklch(0.8 0.1 300)", background: "oklch(0.98 0.05 320)", card: "oklch(1 0 0)" } },
  { value: "perpetuity", label: "Perpetuity", icon: Star, colors: { primary: "oklch(0.75 0.1 260)", background: "oklch(0.98 0.01 260)", card: "oklch(1 0 0)" } },
  { value: "quantum-rose", label: "Quantum Rose", icon: Gem, colors: { primary: "oklch(0.6 0.2 340)", background: "oklch(0.98 0.01 340)", card: "oklch(1 0 0)" } },
  { value: "retro-arcade", label: "Retro Arcade", icon: Gamepad2, colors: { primary: "oklch(0.6 0.25 20)", background: "oklch(0.15 0 0)", card: "oklch(0.2 0 0)" } },
  { value: "sage-garden", label: "Sage Garden", icon: Trees, colors: { primary: "oklch(0.55 0.1 140)", background: "oklch(0.98 0.02 140)", card: "oklch(1 0 0)" } },
  { value: "soft-pop", label: "Soft Pop", icon: Sparkles, colors: { primary: "oklch(0.75 0.15 300)", background: "oklch(0.98 0.05 320)", card: "oklch(1 0 0)" } },
  { value: "solar-dusk", label: "Solar Dusk", icon: Sunset, colors: { primary: "oklch(0.65 0.15 40)", background: "oklch(0.2 0.05 40)", card: "oklch(0.25 0.05 40)" } },
  { value: "starry-night", label: "Starry Night", icon: MoonStar, colors: { primary: "oklch(0.7 0.15 260)", background: "oklch(0.15 0.1 260)", card: "oklch(0.2 0.1 260)" } },
  { value: "sunset-horizon", label: "Sunset Horizon", icon: Sunrise, colors: { primary: "oklch(0.7 0.2 30)", background: "oklch(0.98 0.05 40)", card: "oklch(1 0 0)" } },
  { value: "supabase", label: "Supabase", icon: Flame, colors: { primary: "oklch(0.7 0.2 150)", background: "oklch(0.15 0.01 160)", card: "oklch(0.2 0.01 160)" } },
  { value: "t3-chat", label: "T3 Chat", icon: MessageSquare, colors: { primary: "oklch(0.6 0.2 280)", background: "oklch(0.17 0.05 280)", card: "oklch(0.2 0.05 280)" } },
  { value: "tangerine", label: "Tangerine", icon: Sun, colors: { primary: "oklch(0.75 0.2 50)", background: "oklch(0.99 0.02 50)", card: "oklch(1 0 0)" } },
  { value: "twitter", label: "Twitter", icon: Twitter, colors: { primary: "oklch(0.6 0.15 240)", background: "oklch(1 0 0)", card: "oklch(1 0 0)" } },
  { value: "vercel", label: "Vercel", icon: Share2, colors: { primary: "oklch(0.15 0 0)", background: "oklch(1 0 0)", card: "oklch(1 0 0)" } },
  { value: "vintage-paper", label: "Vintage Paper", icon: Palette, colors: { primary: "oklch(0.5 0.05 60)", background: "oklch(0.96 0.03 70)", card: "oklch(0.98 0.03 70)" } },
  { value: "violet-bloom", label: "Violet Bloom", icon: Sparkles, colors: { primary: "oklch(0.65 0.2 300)", background: "oklch(0.98 0.05 320)", card: "oklch(1 0 0)" } },
];

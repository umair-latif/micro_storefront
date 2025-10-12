// --- 1. Define Theme Presets (New file or at the top of StorefrontSettings.tsx) ---

// Extend the existing StorefrontConfig to include the new background properties
export type FullThemePreset = Omit<StorefrontConfig, 'cta_visibility' | 'sort'> & {
    // Ensuring the theme object always has the new background structure
    theme: NonNullable<StorefrontConfig['theme']> & {
        background: {
            type: 'color' | 'gradient' | 'image' | 'none';
            value: string;
        }
    }
};

export const PREDEFINED_THEMES: { name: string; preset: FullThemePreset }[] = [
    {
        name: "Stellar Blue",
        preset: {
            sort: "newest", // Added for completeness
            theme: { variant: "clean", palette: { accent: "#3B82F6", preset: "default", primary: "#1E3A8A" }, background: { type: "color", value: "#F8FAFC" } },
            display_mode: "grid",
            landing_page: "products",
            show_categories: true
        }
    },
    {
        name: "Sunrise Pop",
        preset: {
            sort: "newest",
            theme: { variant: "bold", palette: { accent: "#F97316", preset: "vibrant", primary: "#B91C1C" }, background: { type: "gradient", value: "linear-gradient(to top right, #FEF3C7, #FDBA74)" } },
            display_mode: "grid",
            landing_page: "products",
            show_categories: false
        }
    },
    {
        name: "Zen Garden",
        preset: {
            sort: "newest",
            theme: { variant: "minimal", palette: { accent: "#059669", preset: "monochrome", primary: "#333333" }, background: { type: "color", value: "#FFFFFF" } },
            display_mode: "list",
            landing_page: "categories",
            show_categories: true
        }
    },
    {
        name: "Midnight Muse",
        preset: {
            sort: "newest",
            theme: { variant: "clean", palette: { accent: "#8B5CF6", preset: "dark", primary: "#F3F4F6" }, background: { type: "color", value: "#111827" } },
            display_mode: "grid_2",
            landing_page: "products",
            show_categories: false
        }
    },
    {
        name: "Vibrant Links",
        preset: {
            sort: "newest",
            theme: { variant: "bold", palette: { accent: "#EC4899", preset: "vibrant", primary: "#F43F5E" }, background: { type: "gradient", value: "radial-gradient(circle at top right, #FBCFE8 0%, #F43F5E 100%)" } },
            display_mode: "links",
            landing_page: "business_card",
            show_categories: false
        }
    },
    {
        name: "Classic Paper",
        preset: {
            sort: "newest",
            theme: { variant: "minimal", palette: { accent: "#4B5563", preset: "light", primary: "#1F2937" }, background: { type: "color", value: "#F3F4F6" } },
            display_mode: "list",
            landing_page: "products",
            show_categories: true
        }
    },
    {
        name: "Neon Grid",
        preset: {
            sort: "newest",
            theme: { variant: "bold", palette: { accent: "#06B6D4", preset: "ocean", primary: "#F3F4F6" }, background: { type: "color", value: "#0F172A" } },
            display_mode: "grid_3",
            landing_page: "products",
            show_categories: false
        }
    },
    {
        name: "Sepia Tone",
        preset: {
            sort: "newest",
            theme: { variant: "minimal", palette: { accent: "#92400E", preset: "light", primary: "#333333" }, background: { type: "color", value: "#FAF0E6" } },
            display_mode: "grid",
            landing_page: "products",
            show_categories: false
        }
    },
    {
        name: "Image Focus",
        preset: {
            sort: "newest",
            theme: { variant: "clean", palette: { accent: "#D97706", preset: "default", primary: "#374151" }, background: { type: "image", value: "/images/default-texture-subtle.jpg" } },
            display_mode: "grid_1",
            landing_page: "products",
            show_categories: false
        }
    },
    {
        name: "Simple Store",
        preset: {
            sort: "newest",
            theme: { variant: "minimal", palette: { accent: "#10B981", preset: "light", primary: "#333333" }, background: { type: "color", value: "#F5F5F5" } },
            display_mode: "grid",
            landing_page: "products",
            show_categories: true
        }
    }
];
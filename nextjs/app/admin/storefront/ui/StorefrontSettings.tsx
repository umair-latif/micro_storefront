"use client";

import { useEffect, useMemo, useState, useTransition, CSSProperties } from "react"; // 👈 Import CSSProperties
import type { StorefrontConfig, StorefrontDisplayMode } from "@/lib/types"; 
import { DEFAULT_STOREFRONT_CONFIG } from "@/lib/defaults"; 
import { createClient } from "@/lib/supabase-client";
import { CheckCircle2, Loader2, Maximize2 } from "lucide-react";


// --- 1. CONFIGURATION DATA (PRESETS) ---

// Extended type for full theme definition (must align with lib/types.ts)
export type FullThemePreset = Omit<StorefrontConfig, 'cta_visibility'> & {
    theme: NonNullable<StorefrontConfig['theme']> & {
        background: {
            type: 'color' | 'gradient' | 'image' | 'none';
            value: string;
        }
    }
};

// 10 Predefined Themes (These are simplified and treated as complete theme definitions)
export const PREDEFINED_THEMES: { name: string; preset: FullThemePreset }[] = [
    {
        name: "Stellar Blue",
        // variant: clean, but custom colors and a solid background
        preset: {
            sort: "newest",
            theme: { variant: "clean", palette: { accent: "#3B82F6", preset: "default", primary: "#1E3A8A" }, background: { type: "color", value: "#F8FAFC" } },
            display_mode: "grid", landing_page: "products", show_categories: true
        }
    },
    {
        name: "Sunrise Pop",
        // variant: bold, custom colors, gradient background
        preset: {
            sort: "newest",
            theme: { variant: "bold", palette: { accent: "#F97316", preset: "vibrant", primary: "#B91C1C" }, background: { type: "gradient", value: "linear-gradient(to top right, #FEF3C7, #FDBA74)" } },
            display_mode: "grid", landing_page: "products", show_categories: false
        }
    },
    {
        name: "Zen Garden",
        // variant: minimal, custom colors, solid background
        preset: {
            sort: "newest",
            theme: { variant: "minimal", palette: { accent: "#059669", preset: "monochrome", primary: "#333333" }, background: { type: "color", value: "#FFFFFF" } },
            display_mode: "list", landing_page: "categories", show_categories: true
        }
    },
    {
        name: "Midnight Muse",
        // variant: clean, custom colors, dark solid background
        preset: {
            sort: "newest",
            theme: { variant: "clean", palette: { accent: "#8B5CF6", preset: "dark", primary: "#F3F4F6" }, background: { type: "color", value: "#111827" } },
            display_mode: "grid_2", landing_page: "products", show_categories: false
        }
    },
    {
        name: "Vibrant Links",
        // variant: bold, custom colors, radial gradient
        preset: {
            sort: "newest",
            theme: { variant: "bold", palette: { accent: "#EC4899", preset: "vibrant", primary: "#F43F5E" }, background: { type: "gradient", value: "radial-gradient(circle at top right, #FBCFE8 0%, #F43F5E 100%)" } },
            display_mode: "links", landing_page: "hero-only", show_categories: false
        }
    },
    {
        name: "Classic Paper",
        // variant: minimal, custom colors, light solid background
        preset: {
            sort: "newest",
            theme: { variant: "minimal", palette: { accent: "#4B5563", preset: "light", primary: "#1F2937" }, background: { type: "color", value: "#F3F4F6" } },
            display_mode: "list", landing_page: "products", show_categories: true
        }
    },
    {
        name: "Neon Grid",
        // variant: bold, uses the 'ocean' preset, dark solid background
        preset: {
            sort: "newest",
            theme: { variant: "bold", palette: { accent: "#06B6D4", preset: "ocean", primary: "#F3F4F6" }, background: { type: "color", value: "#0F172A" } },
            display_mode: "grid_3", landing_page: "products", show_categories: false
        }
    },
    {
        name: "Sepia Tone",
        // variant: minimal, custom colors, light solid background
        preset: {
            sort: "newest",
            theme: { variant: "minimal", palette: { accent: "#92400E", preset: "light", primary: "#333333" }, background: { type: "color", value: "#FAF0E6" } },
            display_mode: "grid", landing_page: "products", show_categories: false
        }
    },
    {
        name: "Image Focus",
        // variant: clean, custom colors, image background
        preset: {
            sort: "newest",
            theme: { variant: "clean", palette: { accent: "#D97706", preset: "default", primary: "#374151" }, background: { type: "image", value: "/images/default-texture-subtle.jpg" } },
            display_mode: "grid_1", landing_page: "products", show_categories: false
        }
    },
    {
        name: "Simple Store",
        // variant: minimal, custom colors, light solid background
        preset: {
            sort: "newest",
            theme: { variant: "minimal", palette: { accent: "#10B981", preset: "light", primary: "#333333" }, background: { type: "color", value: "#F5F5F5" } },
            display_mode: "grid", landing_page: "products", show_categories: true
        }
    }
];

const CLEAN_PRESETS = ["default", "warm", "cool"];
const MINIMAL_PRESETS = ["light", "dark"];
const BOLD_PRESETS = ["sunset", "ocean", "forest", "custom"];

function readable(label: string) {
    return label.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}


// --- 2. THEME SELECTOR COMPONENTS (Internal) ---

type ThemeSelectorProps = {
    currentConfig: StorefrontConfig;
    onSelectTheme: (config: StorefrontConfig) => void;
};

// Utility function to check if a preset roughly matches the current config
const isThemeActive = (current: StorefrontConfig, presetConfig: StorefrontConfig) => {
    // Check key theme indicators for a match
    return (
        current.display_mode === presetConfig.display_mode &&
        current.theme?.variant === presetConfig.theme?.variant &&
        current.theme?.palette?.accent === presetConfig.theme?.palette?.accent
    );
};

// Simplified Theme Card to visually represent a preset
const ThemeCard = ({ name, config, currentConfig, onSelectTheme }: {
    name: string;
    config: StorefrontConfig;
    currentConfig: StorefrontConfig;
    onSelectTheme: (config: StorefrontConfig) => void;
}) => {
    const isActive = isThemeActive(currentConfig, config);
    
    // Use the theme's defined colors for the preview
    const accentColor = config.theme?.palette?.accent || '#3B82F6';
    const primaryColor = config.theme?.palette?.primary || '#1E3A8A';
    
    // 💥 FIX APPLIED HERE: Use CSSProperties for the style object
    let bgStyle: CSSProperties = { backgroundColor: '#F8FAFC' }; 
    
    // Handle background types for the preview
    if (config.theme?.background?.type === 'color' && config.theme.background.value) {
        bgStyle = { backgroundColor: config.theme.background.value };
    } else if (config.theme?.background?.type === 'gradient' && config.theme.background.value) {
        // This assignment is now valid
        bgStyle = { backgroundImage: config.theme.background.value };
    }
    
    const buttonBg = isActive ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-900 hover:bg-neutral-100';
    const borderClass = isActive ? 'ring-2 ring-offset-2 ring-neutral-900' : 'border-black/10 hover:border-black/30';
    
    return (
        <div className={`relative flex flex-col rounded-2xl border ${borderClass} shadow-lg overflow-hidden transition-all duration-200`}>
            {isActive && (
                <div className="absolute top-3 right-3 p-1 rounded-full bg-emerald-500 text-white z-10">
                    <CheckCircle2 className="h-5 w-5" />
                </div>
            )}
            
            {/* Mockup Preview Area */}
            <div 
                className="relative flex flex-col items-center justify-center p-6 h-36" 
                style={bgStyle} // Use dynamic style for color/gradient
            >
                {config.theme?.background?.type === 'image' && config.theme.background.value && (
                    <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${config.theme.background.value})` }} />
                )}
                
                <h4 className="text-lg font-bold z-10" style={{ color: primaryColor }}>{name}</h4>
                <div 
                    className="mt-2 w-2/3 h-8 rounded-full text-center flex items-center justify-center text-sm font-medium z-10" 
                    style={{ backgroundColor: accentColor, color: '#FFFFFF' }}
                >
                    CTA Button
                </div>
                <p className="mt-1 text-xs text-neutral-500 z-10">View: {readable(config.display_mode as string)}</p>
            </div>
            
            <div className="p-4 flex flex-col gap-2">
                <button
                    onClick={() => onSelectTheme(config)}
                    className={`w-full py-2 rounded-xl border text-sm font-medium ${buttonBg}`}
                >
                    {isActive ? "Theme Applied" : "Select Theme"}
                </button>
            </div>
        </div>
    );
};


function ThemeSelector({ currentConfig, onSelectTheme }: ThemeSelectorProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PREDEFINED_THEMES.map(theme => (
                <ThemeCard 
                    key={theme.name}
                    name={theme.name}
                    config={theme.preset as StorefrontConfig} 
                    currentConfig={currentConfig}
                    onSelectTheme={onSelectTheme}
                />
            ))}
        </div>
    );
}

// --- 3. MAIN COMPONENT (StorefrontSettings) ---

function Section({ title, children, description }: { title: string; description?: string; children: React.ReactNode }) {
    return (
        <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <div className="mb-3">
                <h2 className="text-base font-semibold">{title}</h2>
                {description && <p className="text-sm text-neutral-600">{description}</p>}
            </div>
            {children}
        </section>
    );
}

export default function StorefrontSettings({
    profileId,
    slug,
    initialConfig,
}: {
    profileId: string;
    slug: string;
    initialConfig: StorefrontConfig;
}) {
    const supabase = useMemo(() => createClient(), []);
    const [saving, startSaving] = useTransition();
    const [savedAt, setSavedAt] = useState<number | null>(null);
    const [config, setConfig] = useState<StorefrontConfig>(initialConfig ?? DEFAULT_STOREFRONT_CONFIG);
    const [activeTab, setActiveTab] = useState<'themes' | 'custom'>('themes'); 

    useEffect(() => {
        setConfig(initialConfig ?? DEFAULT_STOREFRONT_CONFIG);
    }, [initialConfig]);

    async function save(next: StorefrontConfig) {
        startSaving(async () => {
            setConfig(next);
            const { error } = await supabase
                .from("profiles")
                .update({ storefront_config: next })
                .eq("id", profileId);
            if (!error) setSavedAt(Date.now());
        });
    }

    // Function to handle changes for any top-level key (Layout/View)
    function onChange<K extends keyof StorefrontConfig>(key: K, value: StorefrontConfig[K]) {
        const next = { ...config, [key]: value } as StorefrontConfig;
        void save(next);
    }
    
    // REFACTORED onSelectTheme FUNCTION: Directly applies the preset config.
    function onSelectTheme(presetConfig: StorefrontConfig) {
        const nextConfig: StorefrontConfig = {
            ...config,
            ...presetConfig, // Apply all theme-related properties (theme, display_mode, landing_page, etc.)
            // Preserve existing user settings for these common items
            cta_visibility: config.cta_visibility ?? presetConfig.cta_visibility,
            sort: config.sort ?? presetConfig.sort,
        };
        void save(nextConfig);
    }

    // Function for setting individual theme properties (used in the Custom tab)
    function setTheme(next: Partial<NonNullable<StorefrontConfig["theme"]>>) {
        const currentTheme = config.theme || {};
        const merged: StorefrontConfig = {
            ...config,
            theme: {
                // Merge top-level theme properties (variant)
                variant: next.variant ?? currentTheme.variant ?? "clean",
                
                // Merge palette properties
                palette: {
                    preset: next.palette?.preset ?? currentTheme.palette?.preset ?? "default",
                    primary: next.palette?.primary ?? currentTheme.palette?.primary ?? null,
                    accent: next.palette?.accent ?? currentTheme.palette?.accent ?? null,
                },
                // Merge background properties
                background: {
                    type: next.background?.type ?? currentTheme.background?.type ?? 'color',
                    value: next.background?.value ?? currentTheme.background?.value ?? '#FFFFFF'
                }
            },
        };
        void save(merged);
    }

    function presetOptionsFor(variant: string) {
        if (variant === "minimal") return MINIMAL_PRESETS;
        if (variant === "bold") return BOLD_PRESETS;
        return CLEAN_PRESETS;
    }

    const tabClass = (tab: 'themes' | 'custom') => 
        `px-4 py-2 text-sm font-medium rounded-t-xl transition-colors ${
            activeTab === tab 
                ? 'bg-white border-t border-x border-black/10 text-neutral-900 z-10 relative' 
                : 'bg-neutral-100 border-b border-black/10 text-neutral-600 hover:bg-neutral-200'
        }`;
    
    const landingOptions = [
        { value: "products", label: "Products" },
        { value: "categories", label: "Categories" },
        { value: "hero-only", label: "Business Card" },
    ] as const;


    // --- RENDER FUNCTION START ---
    return (
        <div className="flex flex-col gap-4">
            {/* TAB NAVIGATION */}
            <div className="flex -mb-px">
                <button className={tabClass('themes')} onClick={() => setActiveTab('themes')}>
                    Predefined Themes
                </button>
                <button className={tabClass('custom')} onClick={() => setActiveTab('custom')}>
                    Advanced Customization
                </button>
            </div>
            
            {/* CONTENT AREA: Theme Selector or Custom Controls */}
            <div className="p-4 bg-white border border-black/10 rounded-2xl shadow-sm">
                
                {activeTab === 'themes' ? (
                    // --- THEME SELECTOR TAB ---
                    <ThemeSelector currentConfig={config} onSelectTheme={onSelectTheme} />
                ) : (
                    // --- CUSTOM CONTROLS TAB ---
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {/* LEFT COLUMN: Controls */}
                        <div className="space-y-4">
                            
                            {/* Theme Section (Extended) */}
                            <Section title="Theme & Color" description="Pick a layout style (variant) and customize the colors">
                                {/* Variant selector */}
                                <div className="mb-3 grid grid-cols-3 gap-2">
                                    {(["clean", "bold", "minimal"] as const).map((v) => (
                                        <button
                                            key={v}
                                            // Reset palette when changing variant to avoid mismatch
                                            onClick={() => setTheme({ variant: v, palette: { preset: "default" } })}
                                            className={`rounded-xl border px-3 py-2 text-sm capitalize ${
                                                (config.theme?.variant ?? "clean") === v
                                                    ? "border-neutral-900 bg-neutral-900 text-white"
                                                    : "border-black/10 bg-white hover:bg-neutral-50"
                                            }`}
                                        >
                                            {readable(v)}
                                        </button>
                                    ))}
                                </div>
                                
                                {/* Palette preset & Custom colors */}
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    <label className="block">
                                        <span className="text-sm font-medium">Palette Preset</span>
                                        <select
                                            className="mt-1 w-full rounded-xl border border-black/10 bg-white p-2 text-sm"
                                            value={config.theme?.palette?.preset ?? "default"}
                                            onChange={(e) =>
                                                setTheme({ palette: { preset: e.target.value || "default" } })
                                            }
                                        >
                                            {presetOptionsFor(config.theme?.variant ?? "clean").map((p) => (
                                                <option key={p} value={p}>{readable(p)}</option>
                                            ))}
                                        </select>
                                    </label>

                                    {/* Show overrides if variant is 'bold' OR if preset is 'custom' OR if colors are already set */}
                                    {((config.theme?.variant === "bold" || config.theme?.palette?.preset === "custom") ||
                                      (config.theme?.palette?.primary || config.theme?.palette?.accent)) && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <label className="block">
                                                <span className="text-sm font-medium">Primary (hex)</span>
                                                <input
                                                    className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
                                                    placeholder="#1E3A8A"
                                                    value={config.theme?.palette?.primary ?? ""}
                                                    onChange={(e) =>
                                                        setTheme({ palette: { primary: e.target.value || null } })
                                                    }
                                                />
                                            </label>
                                            <label className="block">
                                                <span className="text-sm font-medium">Accent (hex)</span>
                                                <input
                                                    className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
                                                    placeholder="#3B82F6"
                                                    value={config.theme?.palette?.accent ?? ""}
                                                    onChange={(e) =>
                                                        setTheme({ palette: { accent: e.target.value || null } })
                                                    }
                                                />
                                            </label>
                                        </div>
                                    )}
                                </div>
                                
                                {/* --- Background Section --- */}
                                <div className="mt-4 border-t pt-4">
                                    <span className="text-sm font-medium block mb-1">Background</span>
                                    <div className="grid grid-cols-2 gap-2">
                                        {/* Background Type Selector */}
                                        <select
                                            className="w-full rounded-xl border border-black/10 bg-white p-2 text-sm"
                                            value={config.theme?.background?.type ?? 'color'}
                                            onChange={(e) => 
                                                setTheme({ 
                                                    background: { 
                                                        type: e.target.value as any, 
                                                        value: config.theme?.background?.value || '' 
                                                    } 
                                                })
                                            }
                                        >
                                            <option value="color">Solid Color</option>
                                            <option value="gradient">Gradient CSS</option>
                                            <option value="image">Image URL</option>
                                            <option value="none">None (Transparent)</option>
                                        </select>

                                        {/* Background Value Input */}
                                        <input
                                            className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
                                            placeholder={config.theme?.background?.type === 'image' ? 'URL' : '#ffffff or linear-gradient(...) '}
                                            value={config.theme?.background?.value ?? ''}
                                            onChange={(e) => 
                                                setTheme({ 
                                                    background: { 
                                                        type: config.theme?.background?.type as any ?? 'color', 
                                                        value: e.target.value || null 
                                                    } 
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <p className="mt-2 text-xs text-neutral-600">
                                    <b>Clean</b> and <b>Minimal</b> use hardcoded neutral palettes, but can be overridden by setting custom Primary/Accent. <b>Bold</b> prioritizes custom colors.
                                </p>
                            </Section>

                            {/* View Mode Section */}
                            <Section title="View Mode" description="Choose how products render on your public page">
                                <div className="grid grid-cols-3 gap-2">
                                    {(["grid", "links", "list", "grid_1", "grid_2", "grid_3"] as StorefrontDisplayMode[]).map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => onChange("display_mode", mode)}
                                            className={`rounded-xl border px-3 py-2 text-sm capitalize ${
                                                config.display_mode === mode ? "border-neutral-900 bg-neutral-900 text-white" : "border-black/10 bg-white hover:bg-neutral-50"
                                            }`}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </Section>
                            
                            {/* Landing Page Section */}
                            <Section
                                title="Landing Page"
                                description="Choose what visitors see first on your storefront"
                            >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                    {landingOptions.map((opt) => {
                                        const current = (config.landing_page ?? "products") as "products" | "categories" | "hero-only";
                                        return (
                                            <label key={opt.value} className="inline-flex items-center gap-2 text-sm">
                                                <input
                                                    type="radio"
                                                    name="landing_page"
                                                    value={opt.value}
                                                    checked={current === opt.value}
                                                    onChange={() => onChange("landing_page", opt.value)}
                                                />
                                                <span>{opt.label}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                                <p className="mt-2 text-xs text-neutral-600">
                                    <strong>Products:</strong> hero + products.{" "}
                                    <strong>Categories:</strong> hero + category directory.{" "}
                                    <strong>Business Card:</strong> full-screen hero with avatar, socials & CTAs.
                                </p>
                            </Section>

                            {/* Categories Section */}
                            <Section title="Categories" description="Show categories as scrollable chips below the header">
                                <label className="inline-flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={config.show_categories}
                                        onChange={(e) => onChange("show_categories", e.currentTarget.checked)}
                                        className="h-4 w-4 rounded border-black/20"
                                    />
                                    Show categories
                                </label>
                            </Section>

                            {/* Sorting Section */}
                            <Section title="Sorting" description="How products are ordered by default">
                                <select
                                    value={config.sort}
                                    onChange={(e) => onChange("sort", e.currentTarget.value as any)}
                                    className="w-full rounded-xl border border-black/10 bg-white p-2 text-sm"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="price_asc">Price ↑</option>
                                    <option value="price_desc">Price ↓</option>
                                    <option value="manual">Manual</option>
                                </select>
                            </Section>

                            {/* CTAs Section */}
                            <Section title="CTAs" description="Choose which CTAs are visible by default">
                                <div className="grid grid-cols-2 gap-2">
                                    {(["instagram", "whatsapp", "custom1", "custom2"] as const).map((key) => (
                                        <label key={key} className="inline-flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={!!config.cta_visibility?.[key]}
                                                onChange={(e) => {
                                                    const next = {
                                                        ...config,
                                                        cta_visibility: { ...config.cta_visibility, [key]: e.currentTarget.checked },
                                                    };
                                                    void save(next);
                                                }}
                                                className="h-4 w-4 rounded border-black/20"
                                            />
                                            {key}
                                        </label>
                                    ))}
                                </div>
                            </Section>
                        </div>

                        {/* RIGHT COLUMN: Live Preview */}
                        <div className="sticky top-4 h-full">
                            <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                                <div className="mb-3">
                                    <div className="text-sm font-medium">Live Preview</div>
                                    <div className="text-xs text-neutral-600">/{slug}</div>
                                </div>
                                
                                {/* Simplified Preview based on display_mode */}
                                {config.display_mode === "grid" && (
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                        {[...Array(6)].map((_, i) => (
                                            <div key={i} className="aspect-square rounded-xl bg-neutral-100" />
                                        ))}
                                    </div>
                                )}
                                {config.display_mode === "links" && (
                                    <div className="space-y-2">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm shadow-sm">Example link {i + 1}</div>
                                        ))}
                                    </div>
                                )}
                                {config.display_mode === "list" && (
                                    <div className="space-y-3">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="flex gap-3 rounded-xl border border-black/10 bg-white p-3 shadow-sm">
                                                <div className="h-20 w-20 rounded-lg bg-neutral-100" />
                                                <div className="flex-1 space-y-1">
                                                    <div className="h-4 w-1/2 rounded bg-neutral-100" />
                                                    <div className="h-3 w-1/3 rounded bg-neutral-100" />
                                                    <div className="flex gap-2 pt-2">
                                                        <div className="h-8 w-20 rounded-lg bg-neutral-100" />
                                                        <div className="h-8 w-24 rounded-lg bg-neutral-100" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {(config.display_mode === "grid_1" || config.display_mode === "grid_2" || config.display_mode === "grid_3") && (
                                     <div className={`grid gap-3 ${config.display_mode === 'grid_1' ? 'grid-cols-1' : config.display_mode === 'grid_2' ? 'grid-cols-2' : 'grid-cols-3 gap-0'}`}>
                                        {[...Array(6)].map((_, i) => (
                                            <div key={i} className="aspect-square rounded-xl bg-neutral-100" />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Global Footer Actions */}
            <div className="flex items-center justify-between p-4 bg-white border border-black/10 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                    {saving ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                        </>
                    ) : savedAt ? (
                        <>
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Saved at {new Date(savedAt).toLocaleTimeString()}
                        </>
                    ) : (
                        <span>Changes autosave</span>
                    )}
                </div>
                <a 
                    href={`/${slug}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700"
                >
                    <Maximize2 className="h-4 w-4" /> Preview Storefront
                </a>
            </div>
        </div>
    );
}
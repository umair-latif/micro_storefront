export type StorefrontConfig = {
  theme?: { radius?: string; palette?: { bg?: string; surface?: string; text?: string; muted?: string; accent?: string } };
  default_view?: "grid" | "list" | "links";
};
export type SocialsConfig = Record<string, string>;
export type Category = { id: string; name: string; slug: string; position?: number | null };
export type Product = {
  id: string;
  title: string;
  price?: string | null;
  thumb_url?: string | null;
  caption?: string | null;
  visible: boolean | null;
  category_id?: string | null;
  cta_label?: string | null;
  cta_url?: string | null;
  position?: number | null;
};

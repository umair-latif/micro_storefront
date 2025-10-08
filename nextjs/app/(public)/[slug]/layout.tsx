import SiteFooter from "@/components/site/SiteFooter";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SiteFooter />
    </>
  );
}

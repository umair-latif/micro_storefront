// app/(public)/layout.tsx
export const metadata = {
  title: "Public | Micro Storefront",
  description: "Public storefront pages",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-layout">
      {children}
    </div>
  );
}

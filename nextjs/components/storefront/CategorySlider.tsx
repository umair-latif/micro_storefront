"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Category = { id: string; name: string; position?: number | null };

export default function CategorySlider({
  categories,
  activeId,
  basePath,
  theme,
}: {
  categories: Category[];
  activeId: string;
  basePath: string;
  theme: any;
}) {
  const search = useSearchParams();
  const view = search.get("view");

  return (
    <div className="sticky top-0 z-10 -mx-4 mb-4 border-b border-black/5 bg-white/70 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {categories.map((c) => {
          const isActive = String(c.id) === String(activeId);
          const href = `${basePath}?cat=${c.id}${view ? `&view=${view}` : ""}`;
          return (
            <Link key={c.id} href={href} className={`${theme.chip} ${isActive ? "ring-2 ring-black/10" : ""}`}>
              {c.name}
            </Link>
          );
        })}
        <div className="ml-auto flex items-center gap-1 text-sm">
          <ViewToggle basePath={basePath} />
        </div>
      </div>
    </div>
  );
}

function ViewToggle({ basePath }: { basePath: string }) {
  const search = useSearchParams();
  const cat = search.get("cat") ?? "all";
  const view = search.get("view") ?? "grid";
  const views: ("grid" | "list" | "links")[] = ["grid", "list", "links"];
  return (
    <div className="flex gap-1">
      {views.map((v) => (
        <a key={v} href={`${basePath}?cat=${cat}&view=${v}`} className={`rounded-full px-3 py-1 text-sm ${view === v ? "bg-black/10" : "bg-black/5 hover:bg-black/10"}`}>
          {v}
        </a>
      ))}
    </div>
  );
}

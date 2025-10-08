"use client";
import Image from "next/image";
import Link from "next/link";
import { type Category } from "@/lib/types";

export default function CategoryCard({ cat, basePath, theme }: { cat: Category; basePath: string; theme: any }) {
  const href = `${basePath}?cat=${cat.id}`;
  return (
    <Link href={href} className={`${theme.card} overflow-hidden p-3 hover:shadow-md`}>
      <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden rounded-xl bg-black/5">
        {cat.cover_img ? <Image src={cat.cover_img} alt={cat.name} fill className="object-cover" /> : null}
      </div>      
      <div className="text-base font-medium" style={{ color: theme.text }}>{cat.name}</div>
    </Link>
  );
}

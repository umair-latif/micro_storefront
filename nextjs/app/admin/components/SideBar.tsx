"use client";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { LayoutGrid, ShoppingBag, FolderKanban, Palette, LogOut } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { signOutServer } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase-client";


const nav = [
{ href: "/admin/profile", label: "Store Profile", icon: LayoutGrid },
{ href: "/admin/categories", label: "Categories", icon: FolderKanban },
{ href: "/admin/products", label: "Products", icon: ShoppingBag },
{ href: "/admin/storefront", label: "Storefront", icon: Palette },
];


export default function Sidebar({ variant = "desktop" }: { variant?: "desktop" | "drawer" }) {
const pathname = usePathname();
const search = useSearchParams();
const store = search.get("store");
const [pending, start] = useTransition();
const supabase = useMemo(() => createClient(), []);
const [isAuthed, setIsAuthed] = useState(false);


useEffect(() => {
let mounted = true;
supabase.auth.getUser().then(({ data }) => mounted && setIsAuthed(!!data.user));
const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
if (!mounted) return;
setIsAuthed(!!session?.user);
});
return () => { mounted = false; sub?.subscription?.unsubscribe?.(); };
}, [supabase]);


async function handleLogout() {
if (pending) return;
await supabase.auth.signOut();
start(async () => { await signOutServer("/admin/(auth)/login?m=logged_out"); });
}


const containerClass = variant === "desktop" ? "hidden lg:block" : "block lg:hidden pt-16";


if (!isAuthed || !store) return null; // 🔒 require auth AND a selected store


return (
<nav className={containerClass}>
<ul className="space-y-1 pb-5 border-b border-black/10">
{nav.map((item) => {
const Icon = item.icon;
const active = pathname.startsWith(item.href);
return (
<li key={item.href}>
<Link
href={`${item.href}?store=${store}`}
className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ring-1 ring-transparent hover:bg-neutral-50 hover:ring-black/5 ${active ? 'bg-neutral-900 text-white hover:bg-neutral-900 hover:ring-black/0' : ''}`}
>
<Icon className="h-4 w-4" /> {item.label}
</Link>
</li>
);
})}
</ul>
<button type="button" onClick={handleLogout} disabled={pending} className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-8 py-2 mt-5 text-sm font-medium text-white shadow-sm hover:bg-neutral-800 hover:cursor-pointer">
<LogOut className="h-4 w-4" />
{pending ? "Logging out…" : "Logout"}
</button>
</nav>
);
}

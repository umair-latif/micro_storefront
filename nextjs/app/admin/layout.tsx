// app/admin/layout.tsx
export const dynamic = 'force-dynamic';
import type { ReactNode } from 'react';
import BrandBar from './components/BrandBar';
import Sidebar from './components/SideBar';
import { DrawerProvider, Drawer } from './components/DrawerProvider';
import { createSupabaseServerClient } from '@/lib/supabase-server';


export default async function AdminLayout({ children }: { children: ReactNode }) {
const supabase = createSupabaseServerClient();
const { data: { user } } = await supabase.auth.getUser();
const isAuthed = !!user;


return (
<div className="min-h-screen bg-neutral-50 text-neutral-900">
<DrawerProvider>
{isAuthed && <BrandBar />}


{/* Mobile drawer (only when authed) */}
{isAuthed && (
<Drawer>
<Sidebar variant="drawer" />
</Drawer>
)}


<div className="mx-auto max-w-7xl px-3 sm:px-4">
<div className={`grid grid-cols-1 gap-4 py-4 ${isAuthed ? 'lg:grid-cols-[240px_1fr]' : ''}`}>
{/* Desktop sidebar */}
{isAuthed && (
<aside className="lg:sticky lg:top-4 lg:h-[calc(100vh-5rem)]">
<Sidebar variant="desktop" />
</aside>
)}


<main className="min-w-0 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
{children}
</main>
</div>
</div>
</DrawerProvider>
</div>
);
}
